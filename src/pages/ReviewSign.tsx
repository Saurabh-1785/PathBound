import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TransactionPreview from '../components/TransactionPreview';
import { useWallet } from '../context/WalletContext';
import { Currency, TransactionEnvelope } from '../types';
import {
    buildPathPaymentTransaction,
    NETWORK_PASSPHRASE,
    formatPublicKey
} from '../services/stellar';
import { submitIntent, checkServiceHealth } from '../services/api';

interface PendingIntent {
    amount: string;
    sourceCurrency: Currency;
    destCurrency: Currency;
    minRate: string;
    timeWindow: number;
    destinationAddress?: string;
    isImmediateTransfer?: boolean;
    currentMarketRate?: number | null;
}


export default function ReviewSign() {
    const navigate = useNavigate();
    const { publicKey, isConnected, connect, signTx } = useWallet();

    const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null);
    const [transactionEnvelope, setTransactionEnvelope] = useState<TransactionEnvelope | null>(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [monitoringAvailable, setMonitoringAvailable] = useState<boolean | null>(null);

    // Check if monitoring service is available
    useEffect(() => {
        checkServiceHealth().then(setMonitoringAvailable);
    }, []);

    // Load pending intent from session storage
    useEffect(() => {
        const stored = sessionStorage.getItem('pendingIntent');
        if (!stored) {
            navigate('/create');
            return;
        }
        const intent: PendingIntent = JSON.parse(stored);
        setPendingIntent(intent);
    }, [navigate]);

    // Build transaction when wallet is connected and intent is loaded
    useEffect(() => {
        const buildTransaction = async () => {
            if (!pendingIntent || !publicKey || !isConnected) return;

            setIsBuilding(true);
            setError(null);

            try {
                const envelope = await buildPathPaymentTransaction(
                    publicKey,
                    pendingIntent.sourceCurrency,
                    pendingIntent.destCurrency,
                    pendingIntent.amount,
                    pendingIntent.minRate,
                    pendingIntent.timeWindow,
                    pendingIntent.destinationAddress || publicKey
                );
                setTransactionEnvelope(envelope);
            } catch (err: unknown) {
                console.error('Error building transaction:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to build transaction';
                setError(errorMessage);
            } finally {
                setIsBuilding(false);
            }
        };

        buildTransaction();
    }, [pendingIntent, publicKey, isConnected]);

    const handleSign = async () => {
        if (!transactionEnvelope || !publicKey || !pendingIntent) return;

        setIsSigning(true);
        setError(null);

        try {
            // Sign with Freighter
            const signedXdr = await signTx(transactionEnvelope.xdr, NETWORK_PASSPHRASE);

            setIsSubmitting(true);

            const intentId = `intent_${Date.now()}`;
            const expiresAt = Date.now() + pendingIntent.timeWindow * 1000;

            // Store in session storage regardless
            const signedIntent: {
                id: string;
                status: string;
                createdAt: number;
                expiresAt: number;
                signedXdr: string;
                publicKey: string;
                transactionHash?: string;
                error?: string;
                [key: string]: unknown;
            } = {
                ...pendingIntent,
                id: intentId,
                status: monitoringAvailable ? 'monitoring' : 'pending',
                createdAt: Date.now(),
                expiresAt: expiresAt,
                signedXdr: signedXdr,
                publicKey: publicKey,
            };

            sessionStorage.setItem(`intent_${intentId}`, JSON.stringify(signedIntent));

            // Try to submit to monitoring service if available
            if (monitoringAvailable) {
                const result = await submitIntent({
                    id: intentId,
                    signedXdr: signedXdr,
                    sourceCurrency: pendingIntent.sourceCurrency.code,
                    destCurrency: pendingIntent.destCurrency.code,
                    sourceAmount: pendingIntent.amount,
                    targetRate: pendingIntent.minRate,
                    expiresAt: expiresAt,
                    publicKey: publicKey,
                    isImmediateTransfer: pendingIntent.isImmediateTransfer || false,
                });

                if (result.success) {
                    // Check if it was an immediate execution
                    if (result.immediateExecution && result.transactionHash) {
                        signedIntent.status = 'executed';
                        signedIntent.transactionHash = result.transactionHash;
                        console.log('⚡ Immediate transfer executed:', result.transactionHash);
                    } else {
                        signedIntent.status = 'monitoring';
                    }
                    sessionStorage.setItem(`intent_${intentId}`, JSON.stringify(signedIntent));
                } else {
                    console.warn('Failed to submit to monitoring service:', result.error);
                    // Update status to indicate failure or no monitoring
                    signedIntent.status = result.immediateExecution ? 'failed' : 'pending';
                    signedIntent.error = result.error;
                    sessionStorage.setItem(`intent_${intentId}`, JSON.stringify(signedIntent));
                }
            }

            sessionStorage.removeItem('pendingIntent');
            navigate(`/status/${intentId}`);

        } catch (err: unknown) {
            console.error('Error signing:', err);
            const errorMessage = err instanceof Error ? err.message : 'Signing failed';
            setError(errorMessage);
        } finally {
            setIsSigning(false);
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (!pendingIntent) {
        return (
            <div className="min-h-screen py-12 px-6 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-pb-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const flags: Record<string, string> = {
        USD: '🇺🇸', EUR: '🇪🇺', INR: '🇮🇳', PHP: '🇵🇭', NGN: '🇳🇬', GBP: '🇬🇧',
        XLM: '⭐', USDC: '💵', EURC: '💶'
    };

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-pb-text-primary mb-3">Review & Sign</h1>
                    <p className="text-pb-text-secondary">
                        Review your transaction before signing with Freighter.
                    </p>
                </div>

                {/* Exchange Intent Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Your Exchange Intent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-8 py-6">
                            <div className="text-center">
                                <div className="text-3xl mb-2">{flags[pendingIntent.sourceCurrency.code] || '🌐'}</div>
                                <div className="font-mono text-2xl text-pb-text-primary">
                                    {parseFloat(pendingIntent.amount).toLocaleString()} {pendingIntent.sourceCurrency.code}
                                </div>
                                <div className="text-sm text-pb-text-muted">{pendingIntent.sourceCurrency.name}</div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-8 h-8 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <div className="text-xs text-pb-text-muted">
                                    @ <span className="font-mono text-pb-accent-primary">{pendingIntent.minRate}</span> {pendingIntent.destCurrency.code}/{pendingIntent.sourceCurrency.code}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl mb-2">{flags[pendingIntent.destCurrency.code] || '🌐'}</div>
                                <div className="font-mono text-2xl text-pb-status-success">
                                    ≥{(parseFloat(pendingIntent.amount) * parseFloat(pendingIntent.minRate)).toLocaleString(undefined, { maximumFractionDigits: 4 })} {pendingIntent.destCurrency.code}
                                </div>
                                <div className="text-sm text-pb-text-muted">{pendingIntent.destCurrency.name}</div>
                            </div>
                        </div>

                        {/* Warning if output seems too low */}
                        {parseFloat(pendingIntent.amount) * parseFloat(pendingIntent.minRate) < parseFloat(pendingIntent.amount) * 0.01 && (
                            <div className="mt-4 bg-pb-status-error/10 border border-pb-status-error/30 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-6 h-6 text-pb-status-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-pb-status-error">Warning: Very Low Output!</p>
                                        <p className="text-sm text-pb-text-secondary mt-1">
                                            You're sending {parseFloat(pendingIntent.amount).toLocaleString()} {pendingIntent.sourceCurrency.code} but will only receive ~{(parseFloat(pendingIntent.amount) * parseFloat(pendingIntent.minRate)).toFixed(4)} {pendingIntent.destCurrency.code}.
                                            <br />
                                            <strong>Check if you entered the rate correctly.</strong> Rate should be in {pendingIntent.destCurrency.code}/{pendingIntent.sourceCurrency.code} format.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Transaction Preview */}
                {isBuilding ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-pb-accent-primary border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-pb-text-muted">Building transaction...</p>
                        </CardContent>
                    </Card>
                ) : transactionEnvelope ? (
                    <TransactionPreview envelope={transactionEnvelope} />
                ) : null}

                {/* Error Display */}
                {error && (
                    <Card className="bg-pb-status-error/10 border-pb-status-error/30">
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-pb-status-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-pb-status-error">Transaction Failed</p>
                                    <p className="text-sm text-pb-text-secondary mt-1">{error}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recipient Info */}
                <Card className="bg-pb-bg-tertiary/50">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-pb-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm text-pb-text-secondary">Recipient</span>
                            </div>
                            <div className="text-right">
                                <code className="font-mono text-sm text-pb-text-primary">
                                    {pendingIntent.destinationAddress
                                        ? formatPublicKey(pendingIntent.destinationAddress)
                                        : formatPublicKey(publicKey || '')}
                                </code>
                                {(!pendingIntent.destinationAddress || pendingIntent.destinationAddress === publicKey) && (
                                    <span className="ml-2 text-xs text-pb-text-muted">(You)</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* How It Works Notice */}
                <Card className={`${pendingIntent.isImmediateTransfer ? 'bg-pb-accent-primary/5 border-pb-accent-primary/30' : 'bg-pb-status-success/5 border-pb-status-success/30'}`}>
                    <CardContent className="py-4">
                        <div className="flex gap-3">
                            {pendingIntent.isImmediateTransfer ? (
                                <svg className="w-5 h-5 text-pb-accent-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-pb-status-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <div className="text-sm">
                                <p className={`font-medium ${pendingIntent.isImmediateTransfer ? 'text-pb-accent-primary' : 'text-pb-status-success'}`}>
                                    {pendingIntent.isImmediateTransfer ? '⚡ Instant Transfer' : 'How This Works'}
                                </p>
                                {pendingIntent.isImmediateTransfer ? (
                                    <ul className="text-pb-text-secondary mt-2 space-y-1 text-xs">
                                        <li>• <strong>Immediate Execution</strong> - Your transfer will be executed immediately at the current market rate</li>
                                        <li>• <strong>No Waiting</strong> - Transaction is submitted right after you sign</li>
                                        <li>• <strong>Rate: {pendingIntent.minRate}</strong> - You'll receive at least this rate or the transaction fails safely</li>
                                    </ul>
                                ) : (
                                    <ul className="text-pb-text-secondary mt-2 space-y-1 text-xs">
                                        <li>• <strong>Sign & Monitor</strong> - After signing, our service starts monitoring the market rate</li>
                                        <li>• <strong>Auto-Submit</strong> - When the rate reaches your target ({pendingIntent.minRate}), transaction is submitted automatically</li>
                                        <li>• <strong>Time-bounded</strong> - Valid for {pendingIntent.timeWindow >= 86400
                                            ? `${Math.floor(pendingIntent.timeWindow / 86400)} day(s)`
                                            : `${Math.floor(pendingIntent.timeWindow / 3600)} hour(s)`}</li>
                                        <li>• <strong>Safe expiry</strong> - If rate isn't met before expiry, your funds stay safe</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Section */}
                <Card glow>
                    <CardContent className="py-6">
                        {!isConnected ? (
                            <div className="text-center space-y-4">
                                <p className="text-pb-text-secondary text-sm">Connect your Freighter wallet to sign the transaction</p>
                                <Button onClick={connect}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Connect Freighter
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Connected Wallet Info */}
                                <div className="flex items-center justify-center gap-2 text-sm text-pb-text-secondary">
                                    <span className="w-2 h-2 rounded-full bg-pb-status-success" />
                                    <span>Signing with: </span>
                                    <code className="font-mono text-pb-accent-primary bg-pb-bg-tertiary px-2 py-1 rounded">
                                        {formatPublicKey(publicKey || '')}
                                    </code>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => navigate('/create')}
                                        disabled={isSigning || isSubmitting}
                                    >
                                        ← Back to Edit
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleSign}
                                        isLoading={isSigning || isSubmitting}
                                        disabled={!transactionEnvelope || isBuilding}
                                    >
                                        {isSigning ? (
                                            'Signing with Freighter...'
                                        ) : isSubmitting ? (
                                            'Submitting to Stellar...'
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Sign & Submit
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Info */}
                                <p className="text-xs text-center text-pb-text-muted mt-2">
                                    Freighter will prompt you to approve this transaction
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Testnet Notice */}
                <div className="text-center">
                    <p className="text-xs text-pb-text-muted">
                        🧪 Stellar Testnet • Real transactions with test tokens
                    </p>
                </div>
            </div>
        </div>
    );
}
