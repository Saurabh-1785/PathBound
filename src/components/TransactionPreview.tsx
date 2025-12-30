import Card, { CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { TransactionEnvelope } from '../types';

interface TransactionPreviewProps {
    envelope: TransactionEnvelope;
}

export default function TransactionPreview({ envelope }: TransactionPreviewProps) {
    const operation = envelope.operations[0];
    const expiryDate = new Date(envelope.timeBounds.maxTime * 1000);

    return (
        <Card glow>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transaction Details
                </CardTitle>
                <CardDescription>
                    Review your path payment transaction before signing
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Operation type */}
                <div className="bg-pb-bg-primary rounded-lg p-4 border border-pb-border-subtle">
                    <div className="text-xs text-pb-text-muted mb-1 uppercase tracking-wider">Operation</div>
                    <div className="font-mono text-pb-accent-primary text-sm">
                        path_payment_strict_receive
                    </div>
                </div>

                {/* Transaction parameters */}
                <div className="grid gap-3">
                    <div className="flex justify-between items-center py-2 border-b border-pb-border-subtle">
                        <span className="text-sm text-pb-text-secondary">Send Asset</span>
                        <span className="font-mono text-sm text-pb-text-primary">{operation?.sendAsset || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-pb-border-subtle">
                        <span className="text-sm text-pb-text-secondary">Maximum Send</span>
                        <span className="font-mono text-sm text-pb-text-primary">{operation?.sendMax || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-pb-border-subtle">
                        <span className="text-sm text-pb-text-secondary">Receive Asset</span>
                        <span className="font-mono text-sm text-pb-text-primary">{operation?.destAsset || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-pb-border-subtle">
                        <span className="text-sm text-pb-text-secondary">Target Amount</span>
                        <span className="font-mono text-sm text-pb-text-primary">{operation?.destAmount || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-pb-border-subtle">
                        <span className="text-sm text-pb-text-secondary">Expires</span>
                        <span className="font-mono text-sm text-pb-text-primary">{expiryDate.toLocaleString()}</span>
                    </div>
                </div>

                {/* Safety explanation */}
                <div className="bg-pb-status-success/10 border border-pb-status-success/30 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-pb-status-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div className="text-sm">
                            <div className="font-medium text-pb-status-success mb-1">Your funds are protected</div>
                            <p className="text-pb-text-secondary">
                                This transaction uses <span className="font-mono text-pb-accent-primary">path_payment_strict_receive</span> with time bounds.
                                If liquidity isn't available at your rate, or if time expires, the transaction fails atomically—your funds remain in your wallet.
                            </p>
                        </div>
                    </div>
                </div>

                {/* XDR preview */}
                <details className="group">
                    <summary className="cursor-pointer text-sm text-pb-text-muted hover:text-pb-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        View Transaction XDR
                    </summary>
                    <div className="mt-3 p-3 bg-pb-bg-primary rounded-lg border border-pb-border-subtle overflow-hidden">
                        <code className="text-xs font-mono text-pb-text-muted break-all block">
                            {envelope.xdr}
                        </code>
                    </div>
                </details>
            </CardContent>
        </Card>
    );
}
