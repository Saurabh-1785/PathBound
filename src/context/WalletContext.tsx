import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface WalletContextType {
    publicKey: string | null;
    isConnected: boolean;
    isLoading: boolean;
    network: string | null;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signTx: (xdr: string, network: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [network, setNetwork] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Auto-connect if already authorized
    useEffect(() => {
        const autoConnect = async () => {
            try {
                console.log('[PathBound] Checking for existing Freighter connection...');
                const { isConnected: checkConnected, getAddress, getNetwork } = await import('@stellar/freighter-api');

                const connectedResult = await checkConnected();
                console.log('[PathBound] isConnected result:', connectedResult);

                if (connectedResult.isConnected) {
                    const addressResult = await getAddress();
                    console.log('[PathBound] getAddress result:', addressResult);

                    if (addressResult.address && !addressResult.error) {
                        const networkResult = await getNetwork();
                        console.log('[PathBound] getNetwork result:', networkResult);

                        setPublicKey(addressResult.address);
                        setIsConnected(true);
                        setNetwork(networkResult.network || 'TESTNET');
                        console.log('[PathBound] Auto-connected successfully!');
                    }
                }
            } catch (err) {
                console.log('[PathBound] Auto-connect not available:', err);
            }
        };

        // Wait for extension to be ready
        const timer = setTimeout(autoConnect, 1000);
        return () => clearTimeout(timer);
    }, []);

    const connect = useCallback(async () => {
        console.log('[PathBound] Connect wallet clicked');
        setIsLoading(true);
        setError(null);

        try {
            // Import the Freighter API
            console.log('[PathBound] Loading Freighter API...');
            const freighterApi = await import('@stellar/freighter-api');

            // First, try to request access - this will prompt the user
            console.log('[PathBound] Requesting access from Freighter...');
            const accessResult = await freighterApi.requestAccess();

            console.log('[PathBound] requestAccess result:', accessResult);

            // Check for user rejection or other errors
            if (accessResult.error) {
                if (accessResult.error.includes('User declined')) {
                    throw new Error('Connection rejected. Please approve the request in Freighter.');
                }
                throw new Error(accessResult.error);
            }

            // If we got here without an address, Freighter might not be installed
            if (!accessResult.address) {
                throw new Error('Could not get address. Make sure Freighter is unlocked.');
            }

            // Get the network
            console.log('[PathBound] Getting network info...');
            const networkResult = await freighterApi.getNetwork();
            console.log('[PathBound] Network:', networkResult);

            // Success!
            setPublicKey(accessResult.address);
            setIsConnected(true);
            setNetwork(networkResult.network || 'TESTNET');

            console.log('[PathBound] ✅ Successfully connected:', accessResult.address);

        } catch (err: unknown) {
            console.error('[PathBound] Connection error:', err);

            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Failed to connect. Is Freighter installed and unlocked?';
            }

            setError(errorMessage);

            // If it seems like Freighter isn't installed, open the download page
            if (errorMessage.includes('not installed') || errorMessage.includes('undefined')) {
                window.open('https://freighter.app', '_blank');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        console.log('[PathBound] Disconnecting wallet');
        setPublicKey(null);
        setIsConnected(false);
        setNetwork(null);
        setError(null);
    }, []);

    const signTx = useCallback(async (xdr: string, networkPassphrase: string): Promise<string> => {
        if (!isConnected || !publicKey) {
            throw new Error('Wallet not connected');
        }

        console.log('[PathBound] Signing transaction...');
        const { signTransaction } = await import('@stellar/freighter-api');

        const result = await signTransaction(xdr, {
            networkPassphrase,
        });

        console.log('[PathBound] Sign result:', result);

        if (result.error) {
            throw new Error(result.error);
        }

        return result.signedTxXdr;
    }, [isConnected, publicKey]);

    return (
        <WalletContext.Provider
            value={{
                publicKey,
                isConnected,
                isLoading,
                network,
                error,
                connect,
                disconnect,
                signTx,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
