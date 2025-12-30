import { useState } from 'react';
import Button from './ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import { Currency } from '../types';
import { buildTrustlineTransaction, submitTransaction, NETWORK_PASSPHRASE } from '../services/stellar';
import { useWallet } from '../context/WalletContext';

interface TrustlineSetupProps {
    missingTrustlines: Currency[];
    onComplete: () => void;
    onCancel: () => void;
}

export default function TrustlineSetup({ missingTrustlines, onComplete, onCancel }: TrustlineSetupProps) {
    const { publicKey, signTx } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState<string[]>([]);

    const handleCreateTrustline = async () => {
        if (!publicKey || currentIndex >= missingTrustlines.length) return;

        const currency = missingTrustlines[currentIndex];
        setIsLoading(true);
        setError(null);

        try {
            // Build the trustline transaction
            const xdr = await buildTrustlineTransaction(publicKey, currency);

            // Sign with wallet
            const signedXdr = await signTx(xdr, NETWORK_PASSPHRASE);

            // Submit to network
            const result = await submitTransaction(signedXdr);

            if (result.success) {
                setCompleted([...completed, currency.code]);

                if (currentIndex + 1 >= missingTrustlines.length) {
                    // All trustlines created
                    setTimeout(onComplete, 500);
                } else {
                    setCurrentIndex(currentIndex + 1);
                }
            } else {
                setError(result.error || 'Failed to create trustline');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create trustline');
        } finally {
            setIsLoading(false);
        }
    };

    const currentCurrency = missingTrustlines[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Trustline Required
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-300">
                        To trade <span className="text-white font-semibold">{currentCurrency?.code}</span>,
                        you need to establish a trustline with the asset issuer.
                    </p>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">Progress</div>
                        <div className="flex gap-2">
                            {missingTrustlines.map((c, i) => (
                                <div
                                    key={c.code}
                                    className={`flex-1 h-2 rounded-full ${completed.includes(c.code)
                                            ? 'bg-green-500'
                                            : i === currentIndex
                                                ? 'bg-amber-500'
                                                : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {completed.length} of {missingTrustlines.length} trustlines created
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <div className="text-blue-400 text-sm font-medium mb-1">What is a trustline?</div>
                        <div className="text-blue-300/80 text-xs">
                            On Stellar, you must explicitly trust an asset issuer before
                            receiving their tokens. This is a one-time setup per asset.
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateTrustline}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Creating...
                                </span>
                            ) : (
                                `Trust ${currentCurrency?.code}`
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
