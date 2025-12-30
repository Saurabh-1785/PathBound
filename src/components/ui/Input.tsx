import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    isMono?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    hint,
    leftIcon,
    rightElement,
    isMono = false,
    className = '',
    ...props
}, ref) => {
    const inputStyles = `
    w-full bg-pb-bg-tertiary border rounded-lg px-4 py-3
    text-pb-text-primary placeholder-pb-text-muted
    focus:outline-none focus:border-pb-accent-primary focus:ring-1 focus:ring-pb-accent-primary/50
    transition-all duration-200
    ${isMono ? 'font-mono' : ''}
    ${leftIcon ? 'pl-11' : ''}
    ${rightElement ? 'pr-20' : ''}
    ${error ? 'border-pb-status-error' : 'border-pb-border-default'}
  `;

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-pb-text-secondary">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pb-text-muted">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={inputStyles}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-pb-status-error">{error}</p>
            )}
            {hint && !error && (
                <p className="text-sm text-pb-text-muted">{hint}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
