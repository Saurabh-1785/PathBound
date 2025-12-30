// Currency types
export interface Currency {
    code: string;
    name: string;
    symbol: string;
    issuer?: string; // Stellar asset issuer
}

// Intent represents a user's rate-protected exchange intent
export interface Intent {
    id: string;
    sourceAmount: string;
    sourceCurrency: Currency;
    destinationCurrency: Currency;
    minRate: string;
    timeWindow: number; // in seconds
    createdAt: number;
    expiresAt: number;
    status: IntentStatus;
    transactionHash?: string;
    finalRate?: string;
    maxSendAmount?: string;
}

export type IntentStatus = 'pending' | 'monitoring' | 'executed' | 'expired' | 'cancelled';

// Transaction envelope for signing
export interface TransactionEnvelope {
    xdr: string;
    networkPassphrase: string;
    sourceAccount: string;
    operations: OperationSummary[];
    timeBounds: TimeBounds;
}

export interface OperationSummary {
    type: string;
    sendAsset: string;
    sendMax: string;
    destination: string;
    destAsset: string;
    destAmount: string;
}

export interface TimeBounds {
    minTime: number;
    maxTime: number;
}

// Orderbook types
export interface OrderbookEntry {
    price: string;
    amount: string;
}

export interface Orderbook {
    bids: OrderbookEntry[];
    asks: OrderbookEntry[];
    base: Currency;
    counter: Currency;
}

// Liquidity estimate
export interface LiquidityEstimate {
    probability: number;
    availableDepth: string;
    recommendedRate?: string; // undefined when no market data available
    lastUpdated: number;
}

// Wallet connection
export interface WalletConnection {
    publicKey: string;
    connected: boolean;
    walletType: 'freighter' | 'demo';
}
