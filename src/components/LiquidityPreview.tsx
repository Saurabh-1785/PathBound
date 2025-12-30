import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';

interface LiquidityPreviewProps {
    probability: number;
    depth: string;
    sourceCurrency: string;
    destCurrency: string;
    targetRate: string;
    currentRate?: string;
}

export default function LiquidityPreview({
    probability,
    depth,
    sourceCurrency,
    destCurrency,
    targetRate,
    currentRate,
}: LiquidityPreviewProps) {
    const getProbabilityColor = (prob: number) => {
        if (prob >= 70) return 'text-pb-status-success';
        if (prob >= 40) return 'text-pb-status-warning';
        return 'text-pb-status-error';
    };

    const getProbabilityLabel = (prob: number) => {
        if (prob >= 70) return 'High likelihood';
        if (prob >= 40) return 'Moderate likelihood';
        return 'Low likelihood';
    };

    // Calculate rate deviation
    const targetRateNum = parseFloat(targetRate) || 0;
    const currentRateNum = parseFloat(currentRate || '0') || 0;
    const rateDeviation = currentRateNum > 0
        ? ((targetRateNum - currentRateNum) / currentRateNum) * 100
        : 0;
    const isUnrealistic = rateDeviation > 10; // More than 10% above market
    const isOptimistic = rateDeviation > 5 && rateDeviation <= 10;

    return (
        <Card className="bg-pb-bg-tertiary/50">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <svg className="w-5 h-5 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Liquidity Preview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Rate Comparison */}
                    {currentRate && currentRateNum > 0 ? (
                        <div className="bg-pb-bg-primary rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-pb-text-secondary">Market Rate</span>
                                <span className="font-mono text-pb-text-primary">{parseFloat(currentRate).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-pb-text-secondary">Your Target</span>
                                <span className={`font-mono ${isUnrealistic ? 'text-pb-status-error' : isOptimistic ? 'text-pb-status-warning' : 'text-pb-status-success'}`}>
                                    {parseFloat(targetRate).toFixed(4)}
                                    {rateDeviation !== 0 && (
                                        <span className="ml-1 text-xs">
                                            ({rateDeviation > 0 ? '+' : ''}{rateDeviation.toFixed(1)}%)
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                            <div className="flex gap-2">
                                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-xs">
                                    <div className="font-medium text-amber-400">No Market Data</div>
                                    <p className="text-amber-300/80 mt-1">
                                        No orderbook liquidity found for this pair on testnet. Rate comparison unavailable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Unrealistic Rate Warning */}
                    {isUnrealistic && (
                        <div className="bg-pb-status-error/10 border border-pb-status-error/30 rounded-lg p-3">
                            <div className="flex gap-2">
                                <svg className="w-5 h-5 text-pb-status-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="text-sm">
                                    <div className="font-medium text-pb-status-error">Unrealistic Rate</div>
                                    <p className="text-pb-status-error/80 text-xs mt-1">
                                        Your target is {rateDeviation.toFixed(1)}% above market. This intent is unlikely to execute.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Optimistic Rate Notice */}
                    {isOptimistic && !isUnrealistic && (
                        <div className="bg-pb-status-warning/10 border border-pb-status-warning/30 rounded-lg p-3">
                            <div className="flex gap-2">
                                <svg className="w-4 h-4 text-pb-status-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-xs text-pb-status-warning">
                                    Rate is above market. May require waiting for favorable conditions.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Probability gauge */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-pb-text-secondary">Execution probability</span>
                            <span className={`text-lg font-bold font-mono ${getProbabilityColor(probability)}`}>
                                {probability}%
                            </span>
                        </div>
                        <div className="h-2 bg-pb-bg-primary rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${probability >= 70 ? 'bg-pb-status-success' :
                                    probability >= 40 ? 'bg-pb-status-warning' :
                                        'bg-pb-status-error'
                                    }`}
                                style={{ width: `${probability}%` }}
                            />
                        </div>
                        <p className="text-xs text-pb-text-muted">
                            {getProbabilityLabel(probability)} based on current orderbook data
                        </p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-pb-border-subtle">
                        <div>
                            <div className="text-xs text-pb-text-muted mb-1">Available depth</div>
                            <div className="font-mono text-sm text-pb-text-primary">
                                {depth} <span className="text-pb-text-muted">{destCurrency}</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-pb-text-muted mb-1">Target rate</div>
                            <div className="font-mono text-sm text-pb-text-primary">
                                {targetRate} <span className="text-pb-text-muted">{destCurrency}/{sourceCurrency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
