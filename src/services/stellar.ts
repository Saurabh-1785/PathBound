// Stellar SDK Service - Full Integration
// Real transaction building for PathBound

import * as StellarSdk from '@stellar/stellar-sdk';
import { Currency, Orderbook, LiquidityEstimate, TransactionEnvelope } from '../types';

// Horizon server URLs
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const HORIZON_MAINNET_URL = 'https://horizon.stellar.org';
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Initialize Horizon servers
const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const mainnetServer = new StellarSdk.Horizon.Server(HORIZON_MAINNET_URL);

// Stellar testnet anchor asset issuers
const TESTNET_USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const TESTNET_EURC_ISSUER = 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5YGJSDFNPHRH7LBC6DAWPZSSC';

// Mainnet asset issuers (for real price fetching)
const MAINNET_USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'; // Centre.io USDC
const MAINNET_EURC_ISSUER = 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2'; // Circle EURC

// Available currencies for the app
export const CURRENCIES: Currency[] = [
    {
        code: 'XLM',
        name: 'Stellar Lumens',
        symbol: 'XLM',
        issuer: undefined // Native asset
    },
    {
        code: 'USDC',
        name: 'USD Coin (Testnet)',
        symbol: '$',
        issuer: TESTNET_USDC_ISSUER
    },
    {
        code: 'EURC',
        name: 'Euro Coin (Testnet)',
        symbol: '€',
        issuer: TESTNET_EURC_ISSUER
    },
];

// Mainnet currencies for price fetching
const MAINNET_CURRENCIES: Record<string, Currency> = {
    'XLM': { code: 'XLM', name: 'Stellar Lumens', symbol: 'XLM', issuer: undefined },
    'USDC': { code: 'USDC', name: 'USD Coin', symbol: '$', issuer: MAINNET_USDC_ISSUER },
    'EURC': { code: 'EURC', name: 'Euro Coin', symbol: '€', issuer: MAINNET_EURC_ISSUER },
};

/**
 * Get Asset object from currency - creates lazily to avoid initialization errors
 */
export function getAsset(currency: Currency): StellarSdk.Asset {
    if (currency.code === 'XLM' || !currency.issuer) {
        return StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(currency.code, currency.issuer);
}

/**
 * Fetch account details from Horizon
 */
export async function fetchAccount(publicKey: string) {
    try {
        const account = await server.loadAccount(publicKey);
        return account;
    } catch (error) {
        console.error('Error fetching account:', error);
        throw error;
    }
}

/**
 * Get account balances
 */
export async function getBalances(publicKey: string): Promise<{ asset: string; balance: string }[]> {
    try {
        const account = await server.loadAccount(publicKey);
        return account.balances.map((balance) => {
            if (balance.asset_type === 'native') {
                return { asset: 'XLM', balance: balance.balance };
            }
            return {
                asset: (balance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset).asset_code,
                balance: balance.balance
            };
        });
    } catch (error) {
        console.error('Error fetching balances:', error);
        return [];
    }
}

/**
 * Fetch REAL market rate from Stellar mainnet for accurate price display
 * This is used for showing users the actual market rate, while transactions
 * happen on testnet with testnet assets
 */
export async function fetchMainnetMarketRate(
    sourceCode: string,
    destCode: string
): Promise<{ rate: number | null; source: 'mainnet' | 'testnet' }> {
    try {
        // Get mainnet currencies
        const sourceCurrency = MAINNET_CURRENCIES[sourceCode];
        const destCurrency = MAINNET_CURRENCIES[destCode];

        if (!sourceCurrency || !destCurrency) {
            console.warn('Currency not found for mainnet price fetch');
            return { rate: null, source: 'testnet' };
        }

        const sellingAsset = getAsset(sourceCurrency);
        const buyingAsset = getAsset(destCurrency);

        // Fetch orderbook from mainnet
        const orderbook = await mainnetServer.orderbook(sellingAsset, buyingAsset).call();

        if (orderbook.bids.length === 0 && orderbook.asks.length === 0) {
            return { rate: null, source: 'mainnet' };
        }

        // Calculate mid-market rate
        const bestBid = orderbook.bids[0] ? parseFloat(orderbook.bids[0].price) : 0;
        const bestAsk = orderbook.asks[0] ? parseFloat(orderbook.asks[0].price) : 0;

        let rate: number;
        if (bestBid > 0 && bestAsk > 0) {
            rate = (bestBid + bestAsk) / 2;
        } else if (bestBid > 0) {
            rate = bestBid;
        } else if (bestAsk > 0) {
            rate = bestAsk;
        } else {
            return { rate: null, source: 'mainnet' };
        }

        return { rate, source: 'mainnet' };
    } catch (error) {
        console.error('Error fetching mainnet market rate:', error);
        return { rate: null, source: 'testnet' };
    }
}

/**
 * Fetch orderbook from MAINNET for accurate liquidity estimation
 * Uses mainnet asset issuers for real market data
 */
export async function fetchMainnetOrderbook(
    sourceCode: string,
    destCode: string
): Promise<Orderbook> {
    try {
        const sourceCurrency = MAINNET_CURRENCIES[sourceCode];
        const destCurrency = MAINNET_CURRENCIES[destCode];

        if (!sourceCurrency || !destCurrency) {
            return { bids: [], asks: [], base: { code: sourceCode, name: '', symbol: '' }, counter: { code: destCode, name: '', symbol: '' } };
        }

        const sellingAsset = getAsset(sourceCurrency);
        const buyingAsset = getAsset(destCurrency);

        const orderbook = await mainnetServer.orderbook(sellingAsset, buyingAsset).call();

        return {
            bids: orderbook.bids.map((bid) => ({
                price: bid.price,
                amount: bid.amount,
            })),
            asks: orderbook.asks.map((ask) => ({
                price: ask.price,
                amount: ask.amount,
            })),
            base: sourceCurrency,
            counter: destCurrency,
        };
    } catch (error) {
        console.error('Error fetching mainnet orderbook:', error);
        return {
            bids: [],
            asks: [],
            base: { code: sourceCode, name: '', symbol: '' },
            counter: { code: destCode, name: '', symbol: '' },
        };
    }
}

/**
 * Check if user has required trustlines for a currency pair
 * Returns missing trustlines that need to be created
 */
export async function checkTrustlines(
    publicKey: string,
    currencies: Currency[]
): Promise<{ hasTrustlines: boolean; missing: Currency[] }> {
    try {
        const account = await server.loadAccount(publicKey);
        const existingTrustlines = new Set<string>();

        // XLM is native, always "trusted"
        existingTrustlines.add('XLM');

        for (const balance of account.balances) {
            if (balance.asset_type !== 'native') {
                const assetBalance = balance as StellarSdk.Horizon.HorizonApi.BalanceLineAsset;
                existingTrustlines.add(`${assetBalance.asset_code}:${assetBalance.asset_issuer}`);
            }
        }

        const missing: Currency[] = [];
        for (const currency of currencies) {
            if (currency.code === 'XLM') continue; // Native asset, no trustline needed

            const key = `${currency.code}:${currency.issuer}`;
            if (!existingTrustlines.has(key)) {
                missing.push(currency);
            }
        }

        return {
            hasTrustlines: missing.length === 0,
            missing,
        };
    } catch (error) {
        console.error('Error checking trustlines:', error);
        return { hasTrustlines: false, missing: currencies.filter(c => c.code !== 'XLM') };
    }
}

/**
 * Build a change trust operation to create a trustline
 */
export async function buildTrustlineTransaction(
    publicKey: string,
    currency: Currency
): Promise<string> {
    if (currency.code === 'XLM' || !currency.issuer) {
        throw new Error('Cannot create trustline for native asset');
    }

    const account = await server.loadAccount(publicKey);
    const asset = new StellarSdk.Asset(currency.code, currency.issuer);

    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(StellarSdk.Operation.changeTrust({ asset }))
        .setTimeout(300)
        .build();

    return transaction.toXDR();
}

/**
 * Fetches the orderbook for a given asset pair from Horizon
 */
export async function fetchOrderbook(
    sellingCurrency: Currency,
    buyingCurrency: Currency
): Promise<Orderbook> {
    try {
        const sellingAsset = getAsset(sellingCurrency);
        const buyingAsset = getAsset(buyingCurrency);

        const orderbook = await server.orderbook(sellingAsset, buyingAsset).call();

        return {
            bids: orderbook.bids.map((bid) => ({
                price: bid.price,
                amount: bid.amount,
            })),
            asks: orderbook.asks.map((ask) => ({
                price: ask.price,
                amount: ask.amount,
            })),
            base: sellingCurrency,
            counter: buyingCurrency,
        };
    } catch (error) {
        console.error('Error fetching orderbook:', error);
        // Return empty orderbook - testnet may not have liquidity
        return {
            bids: [],
            asks: [],
            base: sellingCurrency,
            counter: buyingCurrency,
        };
    }
}

/**
 * Find payment paths from source to destination
 */
export async function findPaymentPaths(
    sourcePublicKey: string,
    destAsset: Currency,
    destAmount: string
): Promise<StellarSdk.Horizon.ServerApi.PaymentPathRecord[]> {
    try {
        const asset = getAsset(destAsset);
        const paths = await server
            .strictReceivePaths(sourcePublicKey, asset, destAmount)
            .call();
        return paths.records;
    } catch (error) {
        console.error('Error finding payment paths:', error);
        return [];
    }
}

/**
 * Estimates liquidity and execution probability for a given rate
 * 
 * Probability is calculated based on:
 * 1. How close target rate is to market rate (deviation %)
 * 2. Available liquidity depth at the target rate
 * 3. Historical volatility approximation
 */
export function estimateLiquidity(
    orderbook: Orderbook,
    targetRate: number,
    amount: number
): LiquidityEstimate {
    // If orderbook is empty, return low probability with no market rate
    if (orderbook.bids.length === 0 && orderbook.asks.length === 0) {
        return {
            probability: 15,
            availableDepth: '0',
            recommendedRate: undefined, // No market data available
            lastUpdated: Date.now(),
        };
    }

    // Calculate available depth at target rate
    let availableDepth = 0;
    for (const bid of orderbook.bids) {
        if (parseFloat(bid.price) >= targetRate) {
            availableDepth += parseFloat(bid.amount);
        }
    }

    // Get actual market rate from orderbook
    const bestBid = orderbook.bids[0] ? parseFloat(orderbook.bids[0].price) : 0;
    const bestAsk = orderbook.asks[0] ? parseFloat(orderbook.asks[0].price) : 0;

    // Use mid-market rate if both exist, otherwise best available
    let marketRate: number;
    if (bestBid > 0 && bestAsk > 0) {
        marketRate = (bestBid + bestAsk) / 2;
    } else if (bestBid > 0) {
        marketRate = bestBid;
    } else if (bestAsk > 0) {
        marketRate = bestAsk;
    } else {
        marketRate = 0;
    }

    // Calculate deviation from market rate (as percentage)
    const deviationPercent = marketRate > 0
        ? ((targetRate - marketRate) / marketRate) * 100
        : 0;

    // Calculate probability using a smooth curve
    let probability: number;

    if (deviationPercent <= -10) {
        // Target is 10%+ BELOW market - very favorable, but check depth
        const depthFactor = Math.min(1, availableDepth / amount);
        probability = 90 + (depthFactor * 5); // 90-95%
    } else if (deviationPercent <= 0) {
        // Target is 0-10% below market - favorable
        // Linear scale from 95% (at -10%) to 85% (at 0%)
        const depthFactor = Math.min(1, availableDepth / amount);
        probability = 85 + (depthFactor * 10) + (Math.abs(deviationPercent) / 10) * 5;
        probability = Math.min(95, probability);
    } else if (deviationPercent <= 2) {
        // Target is 0-2% above market - possible with patience
        // Scale from 85% to 65%
        probability = 85 - (deviationPercent / 2) * 20;
    } else if (deviationPercent <= 5) {
        // Target is 2-5% above market - needs favorable movement
        // Scale from 65% to 40%
        probability = 65 - ((deviationPercent - 2) / 3) * 25;
    } else if (deviationPercent <= 10) {
        // Target is 5-10% above market - unlikely without volatility
        // Scale from 40% to 20%
        probability = 40 - ((deviationPercent - 5) / 5) * 20;
    } else if (deviationPercent <= 25) {
        // Target is 10-25% above market - very unlikely
        // Scale from 20% to 10%
        probability = 20 - ((deviationPercent - 10) / 15) * 10;
    } else if (deviationPercent <= 50) {
        // Target is 25-50% above market - extremely unlikely
        // Scale from 10% to 5%
        probability = 10 - ((deviationPercent - 25) / 25) * 5;
    } else {
        // Target is 50%+ above market - essentially impossible
        probability = Math.max(1, 5 - (deviationPercent - 50) / 50);
    }

    // Apply depth penalty if there's not enough liquidity
    if (availableDepth > 0 && availableDepth < amount) {
        const depthRatio = availableDepth / amount;
        probability = probability * (0.5 + depthRatio * 0.5); // Reduce by up to 50%
    }

    return {
        probability: Math.round(Math.max(1, Math.min(95, probability))),
        availableDepth: availableDepth.toFixed(2),
        recommendedRate: marketRate > 0 ? marketRate.toFixed(4) : undefined,
        lastUpdated: Date.now(),
    };
}

/**
 * Builds a path_payment_strict_receive transaction
 * This is the core functionality of PathBound!
 * 
 * Rate Calculation:
 * - User sends: sourceAmount of sourceCurrency
 * - User receives: at least (sourceAmount * minRate) of destCurrency
 * - minRate = how many destCurrency units per 1 sourceCurrency
 * 
 * Example: Send 100 USD, minRate = 83 INR/USD → Receive at least 8300 INR
 */
export async function buildPathPaymentTransaction(
    sourcePublicKey: string,
    sourceCurrency: Currency,
    destCurrency: Currency,
    sourceAmount: string,
    minRate: string,
    timeWindowSeconds: number,
    destinationPublicKey?: string  // Optional: defaults to sourcePublicKey if not provided
): Promise<TransactionEnvelope> {
    // Use destination address if provided, otherwise send to self
    const destination = destinationPublicKey || sourcePublicKey;

    // Load the source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Calculate amounts
    const sourceAmountNum = parseFloat(sourceAmount);
    const minRateNum = parseFloat(minRate);

    // For path_payment_strict_receive:
    // - destAmount = what we want to receive (sourceAmount * rate)
    // - sendMax = maximum we're willing to send (sourceAmount)
    // The rate protection: We want AT LEAST destAmount, paying AT MOST sendMax
    // If rate is worse, this effectively means we'd need to send more than sendMax → tx fails

    const destAmount = (sourceAmountNum * minRateNum).toFixed(7);
    const sendMax = sourceAmountNum.toFixed(7);

    // Build assets
    const sendAsset = getAsset(sourceCurrency);
    const destAsset = getAsset(destCurrency);

    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(
            StellarSdk.Operation.pathPaymentStrictReceive({
                sendAsset: sendAsset,
                sendMax: sendMax,
                destination: destination, // Send to specified destination or self
                destAsset: destAsset,
                destAmount: destAmount,
                path: [], // Let network find the best path
            })
        )
        .setTimeout(timeWindowSeconds)
        .build();

    return {
        xdr: transaction.toXDR(),
        networkPassphrase: NETWORK_PASSPHRASE,
        sourceAccount: sourcePublicKey,
        operations: [
            {
                type: 'path_payment_strict_receive',
                sendAsset: sourceCurrency.code === 'XLM' ? 'native' : `${sourceCurrency.code}:${sourceCurrency.issuer}`,
                sendMax: sendMax,
                destination: destination,
                destAsset: destCurrency.code === 'XLM' ? 'native' : `${destCurrency.code}:${destCurrency.issuer}`,
                destAmount: destAmount,
            },
        ],
        timeBounds: {
            minTime: 0,
            maxTime: Math.floor(Date.now() / 1000) + timeWindowSeconds,
        },
    };
}

/**
 * Submit a signed transaction to the network
 */
export async function submitTransaction(signedXdr: string): Promise<{
    success: boolean;
    hash?: string;
    error?: string;
}> {
    try {
        const transaction = StellarSdk.TransactionBuilder.fromXDR(
            signedXdr,
            NETWORK_PASSPHRASE
        );

        const result = await server.submitTransaction(transaction);

        return {
            success: true,
            hash: result.hash,
        };
    } catch (error: unknown) {
        console.error('Transaction submission error:', error);

        let errorMessage = 'Transaction failed';
        if (error && typeof error === 'object' && 'response' in error) {
            const stellarError = error as { response?: { data?: { extras?: { result_codes?: unknown } } } };
            errorMessage = JSON.stringify(stellarError.response?.data?.extras?.result_codes || 'Unknown error');
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Check transaction status on the network
 */
export async function checkTransactionStatus(hash: string): Promise<{
    status: 'pending' | 'executed' | 'failed';
    details?: unknown;
}> {
    try {
        const transaction = await server.transactions().transaction(hash).call();
        return {
            status: transaction.successful ? 'executed' : 'failed',
            details: transaction,
        };
    } catch (error) {
        // Transaction not found yet
        return {
            status: 'pending',
        };
    }
}

/**
 * Format public key for display
 */
export function formatPublicKey(publicKey: string): string {
    if (!publicKey || publicKey.length < 10) return publicKey;
    return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
}
