import { IntentStatus as IntentStatusType } from '../../types';

interface StatusBadgeProps {
    status: IntentStatusType;
    size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const statusConfig = {
        pending: {
            label: 'Pending',
            bgColor: 'bg-pb-status-warning/15',
            textColor: 'text-pb-status-warning',
            dotColor: 'bg-pb-status-warning',
            animate: true,
        },
        monitoring: {
            label: 'Monitoring',
            bgColor: 'bg-pb-accent-primary/15',
            textColor: 'text-pb-accent-primary',
            dotColor: 'bg-pb-accent-primary',
            animate: true,
        },
        executed: {
            label: 'Executed',
            bgColor: 'bg-pb-status-success/15',
            textColor: 'text-pb-status-success',
            dotColor: 'bg-pb-status-success',
            animate: false,
        },
        expired: {
            label: 'Expired',
            bgColor: 'bg-pb-status-expired/15',
            textColor: 'text-pb-status-expired',
            dotColor: 'bg-pb-status-expired',
            animate: false,
        },
        cancelled: {
            label: 'Cancelled',
            bgColor: 'bg-pb-text-muted/15',
            textColor: 'text-pb-text-muted',
            dotColor: 'bg-pb-text-muted',
            animate: false,
        },
    };

    const config = statusConfig[status] || statusConfig.pending;

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const dotSizes = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
    };

    return (
        <span className={`inline-flex items-center gap-2 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizes[size]}`}>
            <span className={`${dotSizes[size]} rounded-full ${config.dotColor} ${config.animate ? 'animate-pulse' : ''}`} />
            {config.label}
        </span>
    );
}
