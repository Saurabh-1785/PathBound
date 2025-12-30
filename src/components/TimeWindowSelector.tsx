interface TimeWindowSelectorProps {
    value: number;
    onChange: (seconds: number) => void;
}

const timeOptions = [
    { label: '1 hour', value: 3600 },
    { label: '6 hours', value: 21600 },
    { label: '12 hours', value: 43200 },
    { label: '24 hours', value: 86400 },
    { label: '48 hours', value: 172800 },
];

export default function TimeWindowSelector({ value, onChange }: TimeWindowSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-pb-text-secondary">
                Time Window
            </label>
            <div className="grid grid-cols-5 gap-2">
                {timeOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`
              px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${value === option.value
                                ? 'bg-pb-accent-primary/15 border-pb-accent-primary text-pb-accent-primary shadow-glow-sm'
                                : 'bg-pb-bg-tertiary border-pb-border-default text-pb-text-secondary hover:border-pb-border-focus hover:text-pb-text-primary'
                            }
            `}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Explanation about monitoring */}
            <div className="bg-pb-status-success/5 border border-pb-status-success/20 rounded-lg p-3">
                <div className="flex gap-2">
                    <svg className="w-4 h-4 text-pb-status-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-pb-text-secondary space-y-1">
                        <p>
                            <span className="text-pb-status-success font-medium">✓ Auto-Monitoring Enabled</span>
                        </p>
                        <p className="text-pb-text-muted">
                            Our service monitors the market rate every 30 seconds and automatically submits your
                            transaction when the rate reaches your target—no action needed from you!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
