import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { useWallet } from '../context/WalletContext';
import { IntentStatus, Currency } from '../types';
import { CurrencyIcon } from '../components/CurrencySelector';

interface StoredIntent {
    id: string;
    amount: string;
    sourceCurrency: Currency;
    destCurrency: Currency;
    minRate: string;
    timeWindow: number;
    status: IntentStatus;
    createdAt: number;
    expiresAt: number;
    transactionHash?: string;
    finalRate?: string;
    publicKey?: string;
}

export default function History() {
    const { publicKey, isConnected } = useWallet();
    const [intents, setIntents] = useState<StoredIntent[]>([]);

    // Load all intents from sessionStorage
    useEffect(() => {
        const loadIntents = () => {
            const allIntents: StoredIntent[] = [];

            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key?.startsWith('intent_')) {
                    try {
                        const data = sessionStorage.getItem(key);
                        if (data) {
                            const intent = JSON.parse(data) as StoredIntent;
                            // Only show intents for the connected wallet
                            if (!publicKey || intent.publicKey === publicKey) {
                                allIntents.push(intent);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing intent:', e);
                    }
                }
            }

            // Sort by createdAt descending (newest first)
            allIntents.sort((a, b) => b.createdAt - a.createdAt);
            setIntents(allIntents);
        };

        loadIntents();

        // Refresh when storage changes
        window.addEventListener('storage', loadIntents);
        return () => window.removeEventListener('storage', loadIntents);
    }, [publicKey]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusStats = () => {
        const stats = { pending: 0, executed: 0, expired: 0, cancelled: 0 };
        intents.forEach(intent => {
            stats[intent.status as keyof typeof stats]++;
        });
        return stats;
    };

    const stats = getStatusStats();

    if (!isConnected) {
        return (
            <div className="min-h-screen py-12 px-6 flex items-center justify-center">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="py-12">
                        <svg className="w-16 h-16 text-pb-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-pb-text-primary mb-2">Connect Wallet</h2>
                        <p className="text-pb-text-secondary mb-6">Connect your wallet to view your transaction history.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-pb-text-primary">Transaction History</h1>
                        <p className="text-pb-text-secondary mt-1">View all your exchange intents</p>
                    </div>
                    <Link to="/create">
                        <Button>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Intent
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-pb-bg-tertiary/50">
                        <CardContent className="py-4 text-center">
                            <div className="text-2xl font-bold text-pb-status-warning">{stats.pending}</div>
                            <div className="text-xs text-pb-text-muted">Pending</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-pb-bg-tertiary/50">
                        <CardContent className="py-4 text-center">
                            <div className="text-2xl font-bold text-pb-status-success">{stats.executed}</div>
                            <div className="text-xs text-pb-text-muted">Executed</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-pb-bg-tertiary/50">
                        <CardContent className="py-4 text-center">
                            <div className="text-2xl font-bold text-pb-text-muted">{stats.expired}</div>
                            <div className="text-xs text-pb-text-muted">Expired</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-pb-bg-tertiary/50">
                        <CardContent className="py-4 text-center">
                            <div className="text-2xl font-bold text-pb-text-muted">{stats.cancelled}</div>
                            <div className="text-xs text-pb-text-muted">Cancelled</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Intent List */}
                {intents.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <svg className="w-16 h-16 text-pb-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="text-lg font-semibold text-pb-text-primary mb-2">No intents yet</h3>
                            <p className="text-pb-text-secondary mb-6">Create your first rate-protected exchange intent.</p>
                            <Link to="/create">
                                <Button>Create Intent</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {intents.map((intent) => (
                            <Link key={intent.id} to={`/status/${intent.id}`}>
                                <Card className="hover:border-pb-border-focus transition-colors cursor-pointer">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            {/* Left: Currency pair */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <CurrencyIcon code={intent.sourceCurrency.code} className="w-6 h-6" />
                                                    <span className="font-mono font-medium text-pb-text-primary">
                                                        {parseFloat(intent.amount).toLocaleString()} {intent.sourceCurrency.code}
                                                    </span>
                                                </div>
                                                <svg className="w-4 h-4 text-pb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                                <div className="flex items-center gap-2">
                                                    <CurrencyIcon code={intent.destCurrency.code} className="w-6 h-6" />
                                                    <span className="font-mono text-pb-text-secondary">{intent.destCurrency.code}</span>
                                                </div>
                                            </div>

                                            {/* Right: Status and date */}
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs text-pb-text-muted">{formatDate(intent.createdAt)}</div>
                                                    <div className="font-mono text-sm text-pb-accent-primary">@ {intent.minRate}</div>
                                                </div>
                                                <StatusBadge status={intent.status} size="sm" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Network Badge */}
                <div className="text-center mt-8">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pb-bg-tertiary text-xs text-pb-text-muted">
                        🧪 Stellar Testnet
                    </span>
                </div>
            </div>
        </div>
    );
}
