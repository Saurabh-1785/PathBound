import { useState } from 'react';
import { Currency } from '../types';

interface CurrencySelectorProps {
    label: string;
    value: Currency | null;
    onChange: (currency: Currency) => void;
    currencies: Currency[];
    disabled?: boolean;
}

export default function CurrencySelector({
    label,
    value,
    onChange,
    currencies,
    disabled = false,
}: CurrencySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-pb-text-secondary">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
            w-full flex items-center justify-between
            bg-pb-bg-tertiary border border-pb-border-default rounded-lg px-4 py-3
            text-left transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-pb-border-focus cursor-pointer'}
            ${isOpen ? 'border-pb-accent-primary ring-1 ring-pb-accent-primary/50' : ''}
          `}
                >
                    <div className="flex items-center gap-3">
                        {value ? (
                            <>
                                <CurrencyIcon code={value.code} className="w-8 h-8" />
                                <div>
                                    <div className="text-pb-text-primary font-medium">{value.code}</div>
                                    <div className="text-pb-text-muted text-xs">{value.name}</div>
                                </div>
                            </>
                        ) : (
                            <span className="text-pb-text-muted">Select currency</span>
                        )}
                    </div>
                    <svg
                        className={`w-5 h-5 text-pb-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-pb-bg-elevated border border-pb-border-default rounded-lg shadow-card overflow-hidden">
                        {currencies.map((currency) => (
                            <button
                                key={currency.code}
                                type="button"
                                onClick={() => {
                                    onChange(currency);
                                    setIsOpen(false);
                                }}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-pb-bg-tertiary transition-colors duration-150
                  ${value?.code === currency.code ? 'bg-pb-accent-glow' : ''}
                `}
                            >
                                <CurrencyIcon code={currency.code} className="w-8 h-8" />
                                <div>
                                    <div className="text-pb-text-primary font-medium">{currency.code}</div>
                                    <div className="text-pb-text-muted text-xs">{currency.name}</div>
                                </div>
                                {value?.code === currency.code && (
                                    <svg className="w-5 h-5 text-pb-accent-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Currency icon component that uses SVG files for crypto assets
export function CurrencyIcon({ code, className = "w-8 h-8" }: { code: string; className?: string }) {
    const cryptoIcons: Record<string, string> = {
        XLM: '/stellar-xlm-logo.svg',
        USDC: '/usdc.svg',
        EURC: '/eurc.svg',
    };

    if (cryptoIcons[code]) {
        return (
            <img
                src={cryptoIcons[code]}
                alt={code}
                className={className}
            />
        );
    }

    // Fallback to emoji flags for fiat currencies
    const flags: Record<string, string> = {
        USD: '🇺🇸',
        EUR: '🇪🇺',
        INR: '🇮🇳',
        PHP: '🇵🇭',
        NGN: '🇳🇬',
        MXN: '🇲🇽',
        BRL: '🇧🇷',
        GBP: '🇬🇧',
    };
    return <span className="text-2xl">{flags[code] || '🌐'}</span>;
}
