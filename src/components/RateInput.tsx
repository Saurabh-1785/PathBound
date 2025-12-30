import Input from './ui/Input';

interface RateInputProps {
    value: string;
    onChange: (value: string) => void;
    sourceCurrency: string;
    destCurrency: string;
    currentRate?: string;
}

export default function RateInput({
    value,
    onChange,
    sourceCurrency,
    destCurrency,
    currentRate,
}: RateInputProps) {
    const marketRate = currentRate ? parseFloat(currentRate) : null;
    const enteredRate = value ? parseFloat(value) : null;
    const isRateBelowMarket = marketRate !== null && enteredRate !== null && enteredRate < marketRate;
    const isRateAtMarket = marketRate !== null && enteredRate !== null && Math.abs(enteredRate - marketRate) < 0.0001;

    const handleSetMarketRate = () => {
        if (currentRate) {
            onChange(currentRate);
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <Input
                    label="Minimum Acceptable Rate"
                    type="number"
                    step="0.0001"
                    min={currentRate || "0"}
                    placeholder={currentRate || 'e.g. 1.0000'}
                    value={value}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        // Enforce minimum as current market rate
                        if (marketRate !== null && parseFloat(newValue) < marketRate && newValue !== '') {
                            // Still allow typing, but show validation error
                            onChange(newValue);
                        } else {
                            onChange(newValue);
                        }
                    }}
                    isMono
                    rightElement={
                        <span className="text-sm text-pb-text-muted font-mono">
                            {destCurrency}/{sourceCurrency}
                        </span>
                    }
                    hint={currentRate ? `Minimum allowed rate: ${currentRate} ${destCurrency}/${sourceCurrency}` : 'Enter your minimum acceptable exchange rate'}
                />
            </div>

            {/* Validation Error */}
            {isRateBelowMarket && (
                <div className="bg-pb-status-error/10 border border-pb-status-error/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-pb-status-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-pb-status-error">
                            <strong>Rate too low!</strong> Minimum rate must be at least the current market rate ({currentRate} {destCurrency}/{sourceCurrency}).
                        </p>
                    </div>
                </div>
            )}

            {/* Quick Set Market Rate Button */}
            {currentRate && (
                <button
                    type="button"
                    onClick={handleSetMarketRate}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        isRateAtMarket 
                            ? 'bg-pb-status-success/10 border border-pb-status-success/30 text-pb-status-success'
                            : 'bg-pb-accent-primary/10 border border-pb-accent-primary/30 text-pb-accent-primary hover:bg-pb-accent-primary/20'
                    }`}
                >
                    {isRateAtMarket ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            ⚡ Instant Transfer at Market Rate ({currentRate})
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Use Current Market Rate ({currentRate}) for Instant Transfer
                        </span>
                    )}
                </button>
            )}

            {/* Rate explanation */}
            <div className={`rounded-lg p-3 border ${
                isRateAtMarket 
                    ? 'bg-pb-status-success/10 border-pb-status-success/30'
                    : 'bg-pb-bg-tertiary/50 border-pb-border-subtle'
            }`}>
                <p className="text-xs text-pb-text-muted">
                    {isRateAtMarket ? (
                        <>
                            <span className="text-pb-status-success">⚡</span>{' '}
                            <strong className="text-pb-status-success">Instant Execution:</strong> Your funds will be transferred immediately at the current market rate.
                        </>
                    ) : enteredRate && marketRate && enteredRate > marketRate ? (
                        <>
                            <span className="text-pb-accent-secondary">⏳</span>{' '}
                            <strong className="text-pb-text-secondary">Pending Execution:</strong> Your conversion will execute if the rate reaches{' '}
                            <span className="text-pb-text-secondary font-medium">≥ {value}</span> {destCurrency} per {sourceCurrency}.
                            The system will monitor the market for the specified time window.
                        </>
                    ) : (
                        <>
                            <span className="text-pb-accent-primary">ℹ</span> Your conversion will only execute if the rate is{' '}
                            <span className="text-pb-text-secondary font-medium">≥ {value || '...'}</span> {destCurrency} per {sourceCurrency}.
                            Otherwise, your funds remain untouched.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
