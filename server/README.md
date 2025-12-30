# PathBound Monitoring Service

Backend service that monitors market rates and auto-submits transactions when conditions are met.

## Features

- **Rate Monitoring**: Checks mainnet market rates every 30 seconds
- **Auto-Submit**: Submits pre-signed transactions when target rate is reached
- **Status Tracking**: Provides status updates to the frontend
- **Safe Expiry**: Handles expired transactions gracefully

## Setup

```bash
# From the server directory
npm install

# Start the server
npm start

# Or with watch mode (auto-restart on changes)
npm run dev
```

## API Endpoints

### POST /api/intents
Submit a new intent for monitoring.

```json
{
  "id": "intent_123",
  "signedXdr": "AAAA...",
  "sourceCurrency": "XLM",
  "destCurrency": "USDC",
  "sourceAmount": "100",
  "targetRate": "0.35",
  "expiresAt": 1735500000000,
  "publicKey": "GXXX..."
}
```

### GET /api/intents/:id
Get status of a specific intent.

### GET /api/intents?publicKey=GXXX
List all intents for a public key.

### DELETE /api/intents/:id
Cancel a pending intent.

### GET /api/health
Health check endpoint.

## How It Works

1. Frontend signs a transaction with the user's wallet
2. Signed XDR is sent to this service
3. Service monitors mainnet market rate every 30 seconds
4. When rate >= target rate, transaction is submitted to testnet
5. Status is updated and frontend polls for updates

## Environment Variables

- `PORT`: Server port (default: 3001)

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Monitoring Svc  │────▶│ Stellar Testnet │
│  (React)    │     │  (Node.js)       │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ Stellar Mainnet │
                    │ (Price Feed)    │
                    └─────────────────┘
```

## Note

This service uses:
- **Mainnet** for price checking (real market data)
- **Testnet** for transaction submission (test tokens)
