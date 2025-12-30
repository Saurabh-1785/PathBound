import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    isLoading?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-medium rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-gradient-to-r from-pb-accent-primary to-pb-accent-secondary text-white hover:shadow-glow-md active:scale-[0.98]',
        secondary: 'bg-pb-bg-tertiary border border-pb-border-default text-pb-text-primary hover:bg-pb-bg-elevated hover:border-pb-border-focus',
        ghost: 'text-pb-text-secondary hover:text-pb-text-primary hover:bg-pb-bg-tertiary',
        outline: 'border border-pb-border-default text-pb-text-secondary hover:text-pb-text-primary hover:border-pb-accent-primary bg-transparent',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed hover:shadow-none';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? disabledStyles : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}
