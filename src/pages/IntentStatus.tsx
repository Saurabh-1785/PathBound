import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { IntentStatus as IntentStatusType, Currency } from '../types';
import { checkTransactionStatus } from '../services/stellar';
import { getIntentStatus as getMonitoringStatus } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { CurrencyIcon } from '../components/CurrencySelector';

interface StoredIntent {
    id: string;
    amount: string;
    sourceCurrency: Currency;
    destCurrency: Currency;
    minRate: string;
    timeWindow: number;
    status: IntentStatusType | 'monitoring';
    createdAt: number;
    expiresAt: number;
    transactionHash?: string;
    finalRate?: string;
    publicKey?: string;
    signedXdr?: string;
    currentRate?: number;
    lastChecked?: number;
}

export default function IntentStatus() {
    const { id } = useParams<{ id: string }>();
    const [intent, setIntent] = useState<StoredIntent | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [currentMarketRate, setCurrentMarketRate] = useState<number | null>(null);
    const { publicKey } = useWallet();

    // Load intent from storage
    useEffect(() => {
        if (!id) return;
        const stored = sessionStorage.getItem(`intent_${id}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            setIntent(parsed);
        }
    }, [id]);

    // Check monitoring service status or transaction status
    useEffect(() => {
        const checkStatus = async () => {
            if (!intent) return;

            // If it's being monitored, check the monitoring service
            if (intent.status === 'monitoring') {
                setIsCheckingStatus(true);
                try {
                    const status = await getMonitoringStatus(intent.id);
                    if (status) {
                        setCurrentMarketRate(status.currentRate);

                        // Update local storage with new status
                        if (status.status !== 'pending') {
                            const updatedIntent = {
                                ...intent,
                                status: status.status as IntentStatusType,
                                transactionHash: status.transactionHash,
                                currentRate: status.currentRate ?? undefined,
                                lastChecked: status.lastChecked ?? undefined,
                            };
                            setIntent(updatedIntent);
                            sessionStorage.setItem(`intent_${id}`, JSON.stringify(updatedIntent));
                        } else {
                            // Update current rate in storage
                            const updatedIntent = {
                                ...intent,
                                currentRate: status.currentRate ?? undefined,
                                lastChecked: status.lastChecked ?? undefined,
                            };
                            setIntent(updatedIntent);
                            sessionStorage.setItem(`intent_${id}`, JSON.stringify(updatedIntent));
                        }
                    }
                } catch (error) {
                    console.error('Error checking monitoring status:', error);
                } finally {
                    setIsCheckingStatus(false);
                }
            }
            // If there's a transaction hash, check the network
            else if (intent.transactionHash && intent.status === 'pending') {
                setIsCheckingStatus(true);
                try {
                    const result = await checkTransactionStatus(intent.transactionHash);

                    if (result.status === 'executed') {
                        const updatedIntent = {
                            ...intent,
                            status: 'executed' as IntentStatusType,
                            finalRate: intent.minRate,
                        };
                        setIntent(updatedIntent);
                        sessionStorage.setItem(`intent_${id}`, JSON.stringify(updatedIntent));
                    } else if (result.status === 'failed') {
                        const updatedIntent = {
                            ...intent,
                            status: 'expired' as IntentStatusType,
                        };
                        setIntent(updatedIntent);
                        sessionStorage.setItem(`intent_${id}`, JSON.stringify(updatedIntent));
                    }
                } catch (error) {
                    console.error('Error checking status:', error);
                } finally {
                    setIsCheckingStatus(false);
                }
            }
        };

        // Check immediately
        checkStatus();

        // Then poll every 5 seconds if pending/monitoring
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [intent?.transactionHash, intent?.status, id]);

    // Countdown timer
    useEffect(() => {
        if (!intent || intent.status !== 'pending') return;

        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = intent.expiresAt - now;

            if (remaining <= 0) {
                setTimeLeft('Expired');
                const updatedIntent = { ...intent, status: 'expired' as IntentStatusType };
                setIntent(updatedIntent);
                sessionStorage.setItem(`intent_${id}`, JSON.stringify(updatedIntent));
            } else {
                const hours = Math.floor(remaining / 3600000);
                const mins = Math.floor((remaining % 3600000) / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                setTimeLeft(`${hours}h ${mins}m ${secs}s remaining`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [intent, id]);

    // Handle cancel intent
    const handleCancelIntent = async () => {
        if (!intent || intent.status !== 'pending') return;

        setIsCancelling(true);
        try {
            // Mark as cancelled in local storage
            const updatedIntent = {
                ...intent,
                status: 'cancelled' as IntentStatusType,
            };
            setIntent(updatedIntent);
            sessionStorage.setItem(`intent_${id}`, JSON.stringify(updatedIntent));
            setShowCancelModal(false);
        } catch (error) {
            console.error('Error cancelling intent:', error);
        } finally {
            setIsCancelling(false);
        }
    };

    if (!intent) {
        return (
            <div className="min-h-screen py-12 px-6 flex items-center justify-center">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="py-8">
                        <svg className="w-16 h-16 text-pb-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-pb-text-primary mb-2">Intent Not Found</h2>
                        <p className="text-pb-text-secondary mb-6">This intent may have expired or doesn't exist.</p>
                        <Link to="/create"><Button>Create New Intent</Button></Link>
                    </CardContent>
                </Card>
            </div>
        );
    }
    const stellarExpertLink = intent.transactionHash
        ? `https://stellar.expert/explorer/testnet/tx/${intent.transactionHash}`
        : null;

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Status Header */}
                <div className="text-center mb-8">
                    <StatusBadge status={intent.status} size="lg" />

                    {isCheckingStatus && (intent.status === 'pending' || intent.status === 'monitoring') && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-pb-text-muted">
                            <div className="animate-spin w-3 h-3 border border-pb-accent-primary border-t-transparent rounded-full" />
                            {intent.status === 'monitoring' ? 'Checking market rate...' : 'Checking transaction status...'}
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-pb-text-primary mt-4 mb-2">
                        {intent.status === 'executed' && '🎉 Exchange Successful!'}
                        {intent.status === 'monitoring' && '📡 Monitoring Market Rate'}
                        {intent.status === 'pending' && '⏳ Transaction Submitted'}
                        {intent.status === 'expired' && '⏰ Intent Expired Safely'}
                        {intent.status === 'cancelled' && '🚫 Intent Cancelled'}
                    </h1>
                    <p className="text-pb-text-secondary">
                        {intent.status === 'executed' && 'Your currency was exchanged on the Stellar network.'}
                        {intent.status === 'monitoring' && 'Waiting for market rate to reach your target. Transaction will auto-submit.'}
                        {intent.status === 'pending' && 'Your transaction is being processed by the Stellar network.'}
                        {intent.status === 'expired' && 'The time window passed without execution. Your funds are safe.'}
                        {intent.status === 'cancelled' && 'You cancelled this intent. Your funds remain in your wallet.'}
                    </p>
                </div>

                {/* Live Rate Display for Monitoring */}
                {intent.status === 'monitoring' && (
                    <Card className="bg-pb-accent-primary/5 border-pb-accent-primary/30">
                        <CardContent className="py-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-pb-text-muted mb-1">Current Rate</p>
                                    <p className="font-mono text-xl text-pb-accent-primary">
                                        {currentMarketRate ? currentMarketRate.toFixed(4) : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-pb-text-muted mb-1">Your Target</p>
                                    <p className="font-mono text-xl text-pb-status-success">
                                        {intent.minRate}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-pb-text-muted mb-1">Difference</p>
                                    <p className={`font-mono text-xl ${currentMarketRate && currentMarketRate >= parseFloat(intent.minRate)
                                        ? 'text-pb-status-success'
                                        : 'text-pb-status-warning'
                                        }`}>
                                        {currentMarketRate
                                            ? `${((currentMarketRate - parseFloat(intent.minRate)) / parseFloat(intent.minRate) * 100).toFixed(2)}%`
                                            : '—'
                                        }
                                    </p>
                                </div>
                            </div>
                            {intent.lastChecked && (
                                <p className="text-xs text-pb-text-muted text-center mt-3">
                                    Last checked: {new Date(intent.lastChecked).toLocaleTimeString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Exchange Summary */}
                <Card glow={intent.status === 'executed'}>
                    <CardContent className="py-6">
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <div className="mb-1 flex justify-center"><CurrencyIcon code={intent.sourceCurrency.code} className="w-8 h-8" /></div>
                                <div className="font-mono text-xl text-pb-text-primary">
                                    {parseFloat(intent.amount).toLocaleString()} {intent.sourceCurrency.code}
                                </div>
                                <div className="text-xs text-pb-text-muted">{intent.sourceCurrency.name}</div>
                            </div>
                            <svg className="w-6 h-6 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="text-center">
                                <div className="mb-1 flex justify-center"><CurrencyIcon code={intent.destCurrency.code} className="w-8 h-8" /></div>
                                <div className="font-mono text-xl text-pb-text-primary">{intent.destCurrency.code}</div>
                                <div className="text-xs text-pb-text-muted">{intent.destCurrency.name}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Details */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Transaction Details</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-pb-border-subtle">
                            <span className="text-pb-text-secondary">Minimum Rate</span>
                            <span className="font-mono text-pb-text-primary">{intent.minRate}</span>
                        </div>

                        {intent.status === 'executed' && intent.finalRate && (
                            <div className="flex justify-between py-2 border-b border-pb-border-subtle">
                                <span className="text-pb-text-secondary">Final Rate</span>
                                <span className="font-mono text-pb-status-success">{intent.finalRate}</span>
                            </div>
                        )}

                        <div className="flex justify-between py-2 border-b border-pb-border-subtle">
                            <span className="text-pb-text-secondary">Created</span>
                            <span className="text-pb-text-primary">{new Date(intent.createdAt).toLocaleString()}</span>
                        </div>

                        {intent.status === 'pending' && (
                            <div className="flex justify-between py-2 border-b border-pb-border-subtle">
                                <span className="text-pb-text-secondary">Time Remaining</span>
                                <span className="font-mono text-pb-status-warning">{timeLeft}</span>
                            </div>
                        )}

                        {intent.transactionHash && (
                            <div className="py-2 border-b border-pb-border-subtle">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-pb-text-secondary">Transaction Hash</span>
                                </div>
                                <code className="block font-mono text-xs text-pb-accent-primary bg-pb-bg-tertiary px-3 py-2 rounded break-all">
                                    {intent.transactionHash}
                                </code>
                            </div>
                        )}

                        {/* External Links */}
                        {intent.transactionHash && (
                            <div className="flex gap-2 pt-2">
                                {stellarExpertLink && (
                                    <a
                                        href={stellarExpertLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-pb-bg-tertiary border border-pb-border-default hover:border-pb-accent-primary transition-colors text-sm text-pb-text-secondary hover:text-pb-text-primary"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        View on Stellar Expert
                                    </a>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Safety Notice for Expired */}
                {intent.status === 'expired' && (
                    <Card className="bg-pb-status-success/5 border-pb-status-success/20">
                        <CardContent className="py-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-pb-status-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div className="text-sm">
                                    <div className="font-medium text-pb-status-success mb-1">Your funds are safe</div>
                                    <p className="text-pb-text-secondary">
                                        No conversion occurred. Your {intent.sourceCurrency.code} remains in your wallet.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Success Notice */}
                {intent.status === 'executed' && (
                    <Card className="bg-pb-status-success/5 border-pb-status-success/20">
                        <CardContent className="py-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-pb-status-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <div className="text-sm">
                                    <div className="font-medium text-pb-status-success mb-1">Transaction Confirmed</div>
                                    <p className="text-pb-text-secondary">
                                        Your path payment was executed successfully on the Stellar network.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Cancel Button for Pending Intents */}
                {intent.status === 'pending' && publicKey === intent.publicKey && (
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="font-medium text-amber-400 mb-1">Want to cancel?</div>
                                    <p className="text-pb-text-secondary">You can cancel this intent. Your funds will remain safe.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelModal(true)}
                                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                                >
                                    Cancel Intent
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle className="text-amber-400">Cancel Intent?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-pb-text-secondary">
                                    Are you sure you want to cancel this intent? The transaction will not be executed even if conditions are met later.
                                </p>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <div className="text-green-400 text-sm font-medium">Your funds are safe</div>
                                    <div className="text-green-300/80 text-xs">No funds will be moved. Your {intent.sourceCurrency.code} remains in your wallet.</div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">
                                        Keep Active
                                    </Button>
                                    <Button
                                        onClick={handleCancelIntent}
                                        disabled={isCancelling}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600"
                                    >
                                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Link to="/create" className="flex-1">
                        <Button variant="secondary" className="w-full">Create New Intent</Button>
                    </Link>
                    <Link to="/" className="flex-1">
                        <Button variant="ghost" className="w-full">Back to Home</Button>
                    </Link>
                </div>

                {/* Network Badge */}
                <div className="text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pb-bg-tertiary text-xs text-pb-text-muted">
                        🧪 Stellar Testnet
                    </span>
                </div>
            </div>
        </div>
    );
}
