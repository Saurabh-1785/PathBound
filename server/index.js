/**
 * PathBound Backend Monitoring Service
 * 
 * This service:
 * 1. Stores pending signed transactions from the frontend
 * 2. Monitors market rates periodically
 * 3. Submits transactions when the target rate is met
 * 4. Provides status updates to the frontend
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const StellarSdk = require('@stellar/stellar-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3001;
const HORIZON_TESTNET = 'https://horizon-testnet.stellar.org';
const HORIZON_MAINNET = 'https://horizon.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Mainnet asset issuers for price checking
const MAINNET_ISSUERS = {
    'USDC': 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    'EURC': 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
};

// Testnet asset issuers for transactions
const TESTNET_ISSUERS = {
    'USDC': 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    'EURC': 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5YGJSDFNPHRH7LBC6DAWPZSSC',
};

// Initialize servers
const testnetServer = new StellarSdk.Horizon.Server(HORIZON_TESTNET);
const mainnetServer = new StellarSdk.Horizon.Server(HORIZON_MAINNET);

// In-memory storage for pending intents (use a database in production)
const pendingIntents = new Map();

/**
 * Get asset object for mainnet price checking
 */
function getMainnetAsset(code) {
    if (code === 'XLM') {
        return StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(code, MAINNET_ISSUERS[code]);
}

/**
 * Fetch current market rate from mainnet
 * Uses direct HTTP request as fallback if SDK fails
 */
async function fetchMainnetRate(sourceCode, destCode) {
    try {
        // First try with SDK
        const sourceAsset = getMainnetAsset(sourceCode);
        const destAsset = getMainnetAsset(destCode);

        const orderbook = await mainnetServer.orderbook(sourceAsset, destAsset).call();

        if (orderbook.bids.length === 0 && orderbook.asks.length === 0) {
            console.log('  Orderbook empty, trying HTTP fallback...');
            return await fetchRateViaHttp(sourceCode, destCode);
        }

        const bestBid = orderbook.bids[0] ? parseFloat(orderbook.bids[0].price) : 0;
        const bestAsk = orderbook.asks[0] ? parseFloat(orderbook.asks[0].price) : 0;

        if (bestBid > 0 && bestAsk > 0) {
            return (bestBid + bestAsk) / 2;
        } else if (bestBid > 0) {
            return bestBid;
        } else if (bestAsk > 0) {
            return bestAsk;
        }
        return null;
    } catch (error) {
        console.error('Error fetching mainnet rate via SDK:', error?.message || error);
        console.log('  Trying HTTP fallback...');
        return await fetchRateViaHttp(sourceCode, destCode);
    }
}

/**
 * Fallback: Fetch rate via axios HTTP request
 */
async function fetchRateViaHttp(sourceCode, destCode) {
    try {
        let url = 'https://horizon.stellar.org/order_book?';

        // Build selling asset params
        if (sourceCode === 'XLM') {
            url += 'selling_asset_type=native';
        } else {
            url += `selling_asset_type=credit_alphanum4&selling_asset_code=${sourceCode}&selling_asset_issuer=${MAINNET_ISSUERS[sourceCode]}`;
        }

        // Build buying asset params
        if (destCode === 'XLM') {
            url += '&buying_asset_type=native';
        } else {
            url += `&buying_asset_type=credit_alphanum4&buying_asset_code=${destCode}&buying_asset_issuer=${MAINNET_ISSUERS[destCode]}`;
        }

        url += '&limit=10';

        console.log('  Fetching from:', url);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = response.data;

        const bestBid = data.bids?.[0] ? parseFloat(data.bids[0].price) : 0;
        const bestAsk = data.asks?.[0] ? parseFloat(data.asks[0].price) : 0;

        if (bestBid > 0 && bestAsk > 0) {
            console.log(`  ✓ Got rate via axios: bid=${bestBid.toFixed(4)}, ask=${bestAsk.toFixed(4)}`);
            return (bestBid + bestAsk) / 2;
        } else if (bestBid > 0) {
            return bestBid;
        } else if (bestAsk > 0) {
            return bestAsk;
        }

        console.log('  No bids/asks found');
        return null;
    } catch (error) {
        console.error('  Axios request failed:', error.message);
        if (error.response) {
            console.error('  Response status:', error.response.status);
            console.error('  Response data:', JSON.stringify(error.response.data).substring(0, 200));
        }
        return null;
    }
}

/**
 * Submit a signed transaction to the testnet
 */
async function submitTransaction(signedXdr) {
    try {
        const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
        const result = await testnetServer.submitTransaction(transaction);
        return { success: true, hash: result.hash };
    } catch (error) {
        console.error('Transaction submission error:', error.message);
        return { success: false, error: error.message };
    }
}

// ============= API ENDPOINTS =============

/**
 * POST /api/intents
 * Store a new pending intent for monitoring
 * If isImmediateTransfer is true, execute immediately
 */
app.post('/api/intents', async (req, res) => {
    const {
        id,
        signedXdr,
        sourceCurrency,
        destCurrency,
        sourceAmount,
        targetRate,
        expiresAt,
        publicKey,
        isImmediateTransfer
    } = req.body;

    if (!id || !signedXdr || !sourceCurrency || !destCurrency || !targetRate || !expiresAt) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const intent = {
        id,
        signedXdr,
        sourceCurrency,
        destCurrency,
        sourceAmount,
        targetRate: parseFloat(targetRate),
        expiresAt,
        publicKey,
        isImmediateTransfer: !!isImmediateTransfer,
        status: 'pending',
        createdAt: Date.now(),
        lastChecked: null,
        currentRate: null,
        attempts: 0,
    };

    console.log(`[${new Date().toISOString()}] New intent received: ${id}`);
    console.log(`  - ${sourceAmount} ${sourceCurrency} → ${destCurrency} @ ${targetRate}`);
    console.log(`  - Immediate transfer: ${isImmediateTransfer ? 'YES' : 'NO'}`);
    console.log(`  - Expires: ${new Date(expiresAt).toISOString()}`);

    // If this is an immediate transfer (rate = market rate), execute now
    if (isImmediateTransfer) {
        console.log(`[${new Date().toISOString()}] ⚡ Immediate transfer requested, submitting now...`);

        const result = await submitTransaction(signedXdr);

        if (result.success) {
            intent.status = 'executed';
            intent.transactionHash = result.hash;
            intent.lastChecked = Date.now();
            console.log(`[${new Date().toISOString()}] ✓ Immediate transfer executed: ${result.hash}`);

            // Store the completed intent for status tracking
            pendingIntents.set(id, intent);

            return res.json({
                success: true,
                immediateExecution: true,
                transactionHash: result.hash,
                intent: { ...intent, signedXdr: '[hidden]' }
            });
        } else {
            intent.status = 'failed';
            intent.error = result.error;
            intent.lastChecked = Date.now();
            console.log(`[${new Date().toISOString()}] ✗ Immediate transfer failed: ${result.error}`);

            // Store the failed intent for status tracking
            pendingIntents.set(id, intent);

            return res.status(500).json({
                success: false,
                immediateExecution: true,
                error: result.error,
                intent: { ...intent, signedXdr: '[hidden]' }
            });
        }
    }

    // Otherwise, store for monitoring (rate > market rate, wait for time window)
    pendingIntents.set(id, intent);

    console.log(`[${new Date().toISOString()}] Intent stored for monitoring: ${id}`);

    // Fetch current rate for display
    const currentRate = await fetchMainnetRate(sourceCurrency, destCurrency);
    intent.currentRate = currentRate;
    intent.lastChecked = Date.now();
    console.log(`  - Current rate: ${currentRate ? currentRate.toFixed(4) : 'N/A'}`);
    console.log(`  - Target rate: ${targetRate} (${((parseFloat(targetRate) - currentRate) / currentRate * 100).toFixed(2)}% above market)`);

    res.json({ success: true, immediateExecution: false, intent: { ...intent, signedXdr: '[hidden]' } });
});


/**
 * GET /api/intents/:id
 * Get status of a pending intent
 */
app.get('/api/intents/:id', (req, res) => {
    const intent = pendingIntents.get(req.params.id);

    if (!intent) {
        return res.status(404).json({ error: 'Intent not found' });
    }

    res.json({
        id: intent.id,
        status: intent.status,
        sourceCurrency: intent.sourceCurrency,
        destCurrency: intent.destCurrency,
        sourceAmount: intent.sourceAmount,
        targetRate: intent.targetRate,
        currentRate: intent.currentRate,
        expiresAt: intent.expiresAt,
        createdAt: intent.createdAt,
        lastChecked: intent.lastChecked,
        attempts: intent.attempts,
        transactionHash: intent.transactionHash,
        error: intent.error,
    });
});

/**
 * GET /api/intents
 * Get all intents for a public key
 */
app.get('/api/intents', (req, res) => {
    const { publicKey } = req.query;

    const intents = Array.from(pendingIntents.values())
        .filter(i => !publicKey || i.publicKey === publicKey)
        .map(i => ({
            id: i.id,
            status: i.status,
            sourceCurrency: i.sourceCurrency,
            destCurrency: i.destCurrency,
            sourceAmount: i.sourceAmount,
            targetRate: i.targetRate,
            currentRate: i.currentRate,
            expiresAt: i.expiresAt,
            createdAt: i.createdAt,
        }));

    res.json({ intents });
});

/**
 * DELETE /api/intents/:id
 * Cancel a pending intent
 */
app.delete('/api/intents/:id', (req, res) => {
    const intent = pendingIntents.get(req.params.id);

    if (!intent) {
        return res.status(404).json({ error: 'Intent not found' });
    }

    if (intent.status !== 'pending') {
        return res.status(400).json({ error: 'Can only cancel pending intents' });
    }

    intent.status = 'cancelled';
    pendingIntents.set(req.params.id, intent);

    console.log(`[${new Date().toISOString()}] Intent cancelled: ${req.params.id}`);

    res.json({ success: true });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        pendingCount: Array.from(pendingIntents.values()).filter(i => i.status === 'pending').length,
        timestamp: Date.now()
    });
});

// ============= MONITORING LOOP =============

/**
 * Check all pending intents and submit if conditions are met
 */
async function monitorIntents() {
    const now = Date.now();

    for (const [id, intent] of pendingIntents.entries()) {
        if (intent.status !== 'pending') continue;

        // Check if expired
        if (now > intent.expiresAt) {
            intent.status = 'expired';
            console.log(`[${new Date().toISOString()}] Intent expired: ${id}`);
            continue;
        }

        // Fetch current rate
        const currentRate = await fetchMainnetRate(intent.sourceCurrency, intent.destCurrency);
        intent.currentRate = currentRate;
        intent.lastChecked = now;
        intent.attempts++;

        if (currentRate === null) {
            console.log(`[${new Date().toISOString()}] Could not fetch rate for ${id}`);
            continue;
        }

        console.log(`[${new Date().toISOString()}] Checking ${id}: target=${intent.targetRate}, current=${currentRate.toFixed(4)}`);

        // Check if rate condition is met (current rate >= target rate)
        if (currentRate >= intent.targetRate) {
            console.log(`[${new Date().toISOString()}] ✓ Rate met for ${id}! Submitting...`);

            // Submit the transaction
            const result = await submitTransaction(intent.signedXdr);

            if (result.success) {
                intent.status = 'executed';
                intent.transactionHash = result.hash;
                console.log(`[${new Date().toISOString()}] ✓ Transaction executed: ${result.hash}`);
            } else {
                // Check if it's a permanent failure or temporary
                if (result.error?.includes('tx_too_late')) {
                    intent.status = 'expired';
                    intent.error = 'Transaction time bounds exceeded';
                } else if (result.error?.includes('tx_bad_seq')) {
                    intent.status = 'failed';
                    intent.error = 'Account sequence changed - transaction invalid';
                } else {
                    // Keep pending for retry
                    intent.error = result.error;
                    console.log(`[${new Date().toISOString()}] Submission failed, will retry: ${result.error}`);
                }
            }
        } else {
            const diff = ((intent.targetRate - currentRate) / currentRate * 100).toFixed(2);
            console.log(`[${new Date().toISOString()}] Rate not met for ${id} (${diff}% below target)`);
        }
    }
}

// Run monitoring every 10 seconds for faster response
const MONITOR_INTERVAL = 10 * 1000; // 10 seconds
setInterval(monitorIntents, MONITOR_INTERVAL);

// Also run immediately on startup
monitorIntents();

// ============= START SERVER =============

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   🚀 PathBound Monitoring Service                         ║');
    console.log('║                                                            ║');
    console.log(`║   Server running on http://localhost:${PORT}                  ║`);
    console.log('║   Monitoring interval: 30 seconds                          ║');
    console.log('║                                                            ║');
    console.log('║   Endpoints:                                               ║');
    console.log('║   POST   /api/intents      - Submit new intent             ║');
    console.log('║   GET    /api/intents/:id  - Get intent status             ║');
    console.log('║   GET    /api/intents      - List all intents              ║');
    console.log('║   DELETE /api/intents/:id  - Cancel intent                 ║');
    console.log('║   GET    /api/health       - Health check                  ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
});
