import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    glow?: boolean;
    hover?: boolean;
}

export default function Card({ children, className = '', glow = false, hover = false }: CardProps) {
    const baseStyles = 'bg-pb-bg-secondary rounded-xl border border-pb-border-subtle p-6';
    const glowStyles = glow ? 'shadow-glow-sm border-pb-accent-primary/30' : '';
    const hoverStyles = hover ? 'hover:border-pb-border-focus hover:bg-pb-bg-tertiary/50 transition-all duration-300 cursor-pointer' : '';

    return (
        <div className={`${baseStyles} ${glowStyles} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
    return (
        <h3 className={`text-xl font-semibold text-pb-text-primary ${className}`}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return (
        <p className={`text-pb-text-secondary text-sm mt-1 ${className}`}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}
