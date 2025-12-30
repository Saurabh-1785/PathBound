# PathBound-Limit Orders for Remittances: Intent-Based FX Rate Protection on Stellar

**A Non-Custodial Currency Exchange System for Emerging Market Users**

---

## 1. Problem Statement (Real-World)

**The FX Timing Problem**

Maria, a domestic worker in Dubai, sends money home to the Philippines every month. She knows that 1 USD = 58 PHP today, but by the time her remittance provider processes the transaction tomorrow, the rate has dropped to 57 PHP. On a $200 transfer, she loses 200 PHP (~$3.50) to timing—over 1.5% of her hard-earned money.

This isn’t unique to Maria:

- **Migrant workers** in the Gulf, sending to India, Pakistan, Philippines, Bangladesh face daily FX volatility
- **Small businesses** importing goods from China or Vietnam see price uncertainty between order and payment
- **NGOs** disbursing grants across Latin America face 2-5% monthly currency swings against the USD
- **Families** in Nigeria, Kenya, or Argentina watch their local currency depreciate hourly

The core problem: **Users have no control over the *moment* of currency conversion**, even when they know what rate they need.

Traditional remittance providers (Western Union, Wise, etc.) execute conversions immediately at whatever rate is available. Banks batch FX trades, giving customers no say in timing. Crypto solutions either require technical expertise or introduce new volatility (holding volatile assets).

**The specific pain:**
- A carpenter in India needs exactly ₹4,000 to pay rent, requiring $48 at today’s rate of 83.33 INR/USD
- Tomorrow the rate might be 84.1, meaning he needs $47.55 (saves $0.45)
- Or it could be 82.8, meaning he needs $48.30 (loses $0.30)
- He has *no way* to say: “Convert my USD only if I get at least 83 INR/USD”

This is not speculation—it’s basic financial planning for people operating on thin margins.

---

## 2. Core Idea (Plain English)

**What Users Do:**
1. Set their desired amount and acceptable exchange rate: “I want to receive at least ₹4,000 INR, and I’ll pay up to $50 USD, but only if the rate is at least 80 INR/USD”
2. Choose a time window: “Try to execute this today between now and 11:59 PM”
3. Sign a transaction on their phone that encodes these exact conditions
4. The system monitors Stellar’s real orderbook and submits the signed transaction only when the rate condition can be met

**What the System Guarantees:**
- ✅ Your funds never leave your wallet unless your rate condition is met
- ✅ Execution is atomic—either the full conversion happens at your rate or nothing happens
- ✅ Transaction expires automatically if conditions aren’t met
- ✅ No one (including the service operator) can access your funds
- ✅ You can see real orderbook liquidity before you commit

**What It Does NOT Promise:**
- ❌ Guaranteed execution (if the market rate never reaches your target, nothing happens)
- ❌ Price prediction or market analysis
- ❌ Better rates than the current market (it uses real Stellar orderbook liquidity)
- ❌ Protection against your own unrealistic rate settings

**The Mental Model:**
Think of it like setting a fare limit on a ride-hailing app: “I’ll pay up to $15 for this ride, but not more.” If no driver accepts, you don’t get a ride—but you also don’t overpay. This system does the same for currency exchange.

---

## 3. Why Stellar (Critical Section)

This system is fundamentally **Stellar-native** and cannot be cleanly replicated on Ethereum, Solana, or other chains. Here’s why:

### Stellar’s Native Primitives Enable This System

**1. Built-In Decentralized Orderbook (SDEX)**
- Stellar has a *protocol-level* order book where anyone can place offers to exchange assets
- No AMM pools, no liquidity provider tokens, no smart contracts needed
- Real market makers (like Franklin Templeton, MoneyGram, DSTOQ) already provide liquidity for real-world currency pairs
- The system can query actual available liquidity: “Is there 4,000 INR available at 80 INR/USD right now?”

**2. Path Payment Operations (`path_payment_strict_receive`)**

This is the killer feature. Stellar transactions can specify:

```
Send: Up to X amount of Asset A (e.g., 50 USD)
Receive: Exactly Y amount of Asset B (e.g., 4,000 INR)
Path: [USD → USDC → INR] (multi-hop allowed)
```

The transaction *automatically fails* if:
- The exchange rate would be worse than implied by the amounts
- There isn’t enough orderbook liquidity
- The path can’t be completed atomically

This is **native to the protocol**—no smart contracts, no custom logic, no trusted intermediaries.

**3. Time-Bounded Transactions**
Every Stellar transaction can include `timebounds`:

```
Valid after: 2025-12-21 08:00 UTC
Valid until: 2025-12-21 20:00 UTC
```

After the upper bound, the transaction becomes *invalid and cannot be executed*. This is enforced at the protocol level. No contract needed to implement expiry.

**4. Atomic Multi-Currency Settlement**
When a path payment executes, *all* hops happen in a single ledger close (3-5 seconds):
- Deduct USD from sender
- Execute USD→USDC on orderbook
- Execute USDC→INR on orderbook

- Credit INR to receiver

Either the entire chain succeeds or nothing happens. No partial failures, no bridging delays, no intermediary custody.

**5. Predictable Fees**
- Base fee: 0.00001 XLM (~$0.000003) per operation
- For a path payment: ~0.0001 XLM total (~$0.00003)
- Fee is known *before* signing, encoded in the transaction
- No gas auctions, no MEV, no fluctuating execution costs

**6. Instant Finality**
- Ledger closes every 3-5 seconds
- Once a transaction is in a closed ledger, it’s final (no reorganizations)
- Users see results immediately, not after 20 confirmations

### Why Ethereum/L2s Cannot Do This Cleanly

**Ethereum (and most L2s) lack:**

1. **Built-In Orderbook:**
    - Ethereum has no native orderbook. Solutions require:
        - AMMs (Uniswap) → users face slippage, impermanent loss, and can’t specify exact minimum rates
        - Intent protocols (Cowswap, 1inch Fusion) → require off-chain solvers, matching networks, and complex trust assumptions
        - On-chain limit order contracts → require custom smart contracts, gas for placement/cancellation
2. **Native Path Payments:**
    - Multi-hop atomic swaps on Ethereum require smart contracts
    - Each hop is a separate contract call
    - Adds gas costs and complexity
    - No protocol-level guarantee of atomicity across different DEXs
3. **Gas Economics:**
    - Even on optimistic rollups, transactions cost $0.01-0.50
    - On Ethereum mainnet: $1-20 depending on congestion
    - Makes $10-$50 remittances uneconomical (1-10% overhead)
    - Gas costs are *uncertain* until execution
4. **Custody Requirements:**
    - Intent-based systems on Ethereum typically require:
        - Depositing funds into a smart contract
        - Trusting the solver network
        - Or using EIP-712 signed messages (off-chain, not protocol-native)
    - Adds smart contract risk and complexity
5. **Time-Based Logic:**
    - Ethereum has no native transaction timebound feature
    - Requires smart contracts to enforce time windows
    - Adds gas costs and implementation complexity

### Concrete Example: $20 INR→USD Conversion

**On Stellar:**
- User signs a time-bounded path payment: “Receive at least 24 USD for up to 2,000 INR, valid for next 12 hours”
- Fee: $0.00003 (~0.00001 XLM)
- Execution time if conditions met: 3-5 seconds
- Worst case: Transaction expires, funds never moved, cost = $0

**On Ethereum (theoretical equivalent):**
- User must interact with a smart contract (e.g., limit order contract on a DEX)
- Gas to place order: $0.50-2.00 (L2) or $5-50 (mainnet)
- Gas to cancel if not filled: Another $0.50-2.00
- Execution against AMM: Slippage risk, no rate guarantee
- Execution time: 12-60 seconds (mainnet), 1-10 seconds (L2)
- Worst case: Lost gas fees on failed transactions

**The math simply doesn’t work** for small remittances on Ethereum-based systems.

### Why This Is Stellar-Native, Not “Blockchain-Generic”

This system doesn’t just *use* Stellar—it’s *built on primitives that only exist in Stellar’s design*:
- The protocol’s native understanding of multiple assets
- The built-in orderbook that’s been running since 2014
- The path payment semantics that assume atomic multi-hop conversions
- The predictable, sub-cent fee structure

Attempting to build this on another chain would require recreating these primitives in smart contracts, introducing custody risks, complexity, and economic unfeasibility.

---

## 4. User Experience Flow (3 Steps)

### Step 1: User Sets Intent with Liquidity Preview

**What the user sees:**

```
┌─────────────────────────────────────┐
│ Convert Currency with Rate Protection│
├─────────────────────────────────────┤
│ From: USD (in your wallet)          │
│ To:   INR                           │
│                                     │
│ I want to receive: 4,000 INR       │
│ Minimum rate:      80 INR/USD      │
│ I'll pay up to:    50 USD          │
│                                     │
│ ✓ Current orderbook rate: 83.2     │
│ ✓ Liquidity available: Yes          │
│                                     │
│ Execute: ○ Immediately              │
│          ● Anytime in next 12 hours │
│                                     │
│ [Preview Transaction]               │
└─────────────────────────────────────┘
```

**Behind the scenes:**
- App queries Stellar Horizon API: `GET /paths/strict-receive`
- Destination: 4,000 INR (as INR anchor token)
- Source: USD (as USD anchor token)

- Max source: 50 USD
- Receives back:
- Available paths (e.g., USD → USDC → INR)
- Actual cost for full conversion (e.g., 48.07 USD at current rates)
- Whether sufficient liquidity exists
- User sees: “✓ Can execute now at 83.2 INR/USD” or “⚠ Insufficient liquidity at your rate”

**Key UX elements:**
- Simple language, no “slippage” or “gas” terminology
- Clear rate comparison: “Market rate: 83.2 | Your minimum: 80.0”
- Honest preview: “Estimated cost: $48.07 | Your limit: $50 ✓”
- Time window selector: Today only / Next 24 hours / Custom

### Step 2: Create and Sign Pre-Authorized Transaction

**What the user sees:**

```
┌─────────────────────────────────────┐
│ Sign Transaction                    │
├─────────────────────────────────────┤
│ This authorizes (but doesn't send): │
│                                     │
│ • Pay: Up to 50 USD                 │
│ • Receive: Exactly 4,000 INR       │
│ • Valid: Next 12 hours              │
│ • Fee: 0.00001 XLM (~$0.000003)    │
│                                     │
│ Your funds stay in your wallet      │
│ until conditions are met.           │
│                                     │
│ [Sign with Wallet]                  │
└─────────────────────────────────────┘
```

**Behind the scenes:**
- App constructs Stellar transaction:
`javascript   const tx = new TransactionBuilder(sourceAccount, {     fee: BASE_FEE,     networkPassphrase: Networks.PUBLIC   })     .addOperation(Operation.pathPaymentStrictReceive({       sendAsset: USD_ASSET,       sendMax: '50.0000000',       destination: userPublicKey,       destAsset: INR_ASSET,       destAmount: '4000.0000000',       path: [USDC_ASSET] // if multi-hop needed     }))     .setTimeout(TimeoutInfinite)     .setTimebounds({       minTime: nowTimestamp,       maxTime: nowTimestamp + 43200 // 12 hours     })     .build();`
- User signs with their Stellar wallet (Freighter, Lobstr, Albedo, etc.)
- Signed transaction is returned to the app (user never exposes private key)

**Key UX elements:**
- Standard wallet signing flow (users already understand this from other Stellar apps)
- Clear summary of what’s being authorized
- Explicit statement: “Signing ≠ Sending”
- Explanation that funds remain in user’s wallet

### Step 3: Monitoring and Execution

**What the user sees:**

```
┌─────────────────────────────────────┐
│ Intent Active                       │
├─────────────────────────────────────┤
│ Target: 4,000 INR at ≥80 INR/USD   │
│ Status: Monitoring orderbook...     │
│                                     │
│ Current rate: 82.1 (below target)   │
│ Time remaining: 11 hours 34 min     │
│                                     │
│ We'll execute automatically when    │
│ your rate is available.             │
│                                     │
│ [View Details] [Cancel Intent]      │
└─────────────────────────────────────┘
```

**Behind the scenes:**
- App submits signed transaction to monitoring service
- Service stores transaction (just the XDR, which is public data)
- Every 30-60 seconds, service:
1. Queries Stellar orderbook for current liquidity
2. Simulates the path payment
3. If conditions are met AND within time bounds:
- Submits the pre-signed transaction to Stellar network
- Transaction executes atomically
4. If time expires:
- Transaction becomes invalid (protocol enforced)
- Service stops monitoring
- User receives notification: “✓ Executed at 83.0 INR/USD” or “⊗ Expired—rate not reached”

**Key UX elements:**
- Real-time status updates (current rate vs target)
- Countdown timer creating urgency
- Option to cancel (user can submit a different transaction with higher sequence number)
- Clear outcome notification

### Complete Flow Summary

```
User → Sets parameters → Signs transaction → Monitoring service
                                           ↓
                                    Watches orderbook
                                           ↓
                           Conditions met? ──Yes──→ Submits tx → Stellar
                                  No                              executes
                                  ↓                                  ↓
                           Time expired? ───Yes──→ Tx invalid    Success
```

**Total user actions: 2** (set parameters + sign)
**User holds funds: Always** (until execution)
**User risk: Zero** (worst case = non-execution)

---

## 5. Technical Architecture

### System Components

```
┌──────────────┐
│   User       │
│  (Mobile/Web)│
└──────┬───────┘
       │ 1. Create intent
       │ 2. Sign tx
       ↓
┌──────────────────────────────────────────┐
│  Frontend Application                    │
│  ├─ React/React Native                   │
│  ├─ Stellar SDK (stellar-sdk.js)        │
│  ├─ Wallet integration (Freighter, etc.) │
│  └─ Liquidity checker                    │
└──────────────┬───────────────────────────┘
               │ 3. Submit signed tx XDR
               ↓
┌──────────────────────────────────────────┐
│  Monitoring Service (Backend)            │
│  ├─ Stateless intent processor           │
│  ├─ Orderbook polling service            │
│  ├─ Transaction submission queue         │
│  └─ WebSocket notification service       │
└──────────────┬───────────────────────────┘
               │ 4. Query liquidity
               │ 5. Submit valid tx
               ↓
┌──────────────────────────────────────────┐
│  Stellar Network                         │
│  ├─ Horizon API (orderbook data)        │
│  ├─ SDEX (decentralized orderbook)      │
│  ├─ Core (transaction validation)        │
│  └─ Anchor integrations (fiat on/off)   │
└──────────────────────────────────────────┘
```

### Component Details

### 1. Frontend Application

**Technology:**
- React (web) or React Native (mobile)
- Stellar SDK for JavaScript (`@stellar/stellar-sdk`)
- Wallet SDKs: Freighter connector, Albedo, Lobstr mobile SDK

**Responsibilities:**
- Asset selection UI (USD, INR, EUR, etc. via anchor tokens)
- Rate input and validation
- Time window selection
- **Liquidity preview:**
```javascript
const paths = await server.strictReceivePaths(
INR_ASSET,
‘4000’,
[USD_ASSET]
).call();

// Show user if rate is achievable
const bestPath = paths.records[0];
const effectiveRate = bestPath.source_amount / 4000;
```
- Transaction construction with timebounds
- Wallet signing flow
- Intent submission to monitoring service
- Status polling and notifications

**No custody:** Frontend never touches private keys. All signing happens via wallet extensions/apps.

### 2. Monitoring Service (Backend)

**Technology:**
- Node.js or Go (for performance)
- Stellar SDK for transaction submission
- Database: PostgreSQL (for intent tracking, not for funds)
- Redis (for rate limiting and caching)
- WebSocket server (for real-time updates)

**Responsibilities:**
- Receive signed transaction XDR from frontend
- Store intent metadata:
`json   {     "intent_id": "uuid",     "tx_xdr": "AAAAAgAAAAB...", // pre-signed transaction     "target_rate": 80.0,     "source_asset": "USD:G...",     "dest_asset": "INR:G...",     "expires_at": 1703203200,     "status": "active" // active | executed | expired | cancelled   }`
- **Polling loop** (every 30-60 seconds):
```javascript
for (const intent of activeIntents) {
if (Date.now() > intent.expires_at) {
updateStatus(intent.id, ‘expired’);
continue;
}

```
// Check if path payment would succeed
const canExecute = await simulateTransaction(intent.tx_xdr);

if (canExecute) {
  await submitTransaction(intent.tx_xdr);
  updateStatus(intent.id, 'executed');
}
```

}
```
- Transaction simulation (using Horizon’s simulation endpoint)
- Actual submission to Stellar when conditions are met
- Notification delivery (push, email, webhook)

**Critical characteristic: Stateless regarding funds**
- Service never holds user assets
- Cannot modify signed transactions
- Cannot execute transactions that don’t meet original conditions
- Can go offline without risking user funds

### 3. Stellar Network Integration

**APIs Used:**
- **Horizon API** (Stellar’s REST API):
- `GET /paths/strict-receive` → Liquidity checking
- `POST /transactions` → Transaction submission
- `GET /orderbook` → Current market rates
- `GET /accounts/{account_id}` → Balance checks

- **Stellar Core** (via Horizon):
    - Transaction validation and execution
    - Orderbook matching
    - Time-bound enforcement

**Anchor Integration:**
- System works with any Stellar anchor tokens (e.g., USDC by Circle, INRx, EURT)
- Users must have trustlines established for desired assets
- On/off-ramp happens through existing anchors (MoneyGram, AnchorUSD, etc.)

**No Custom Smart Contracts:**
- Zero Soroban contracts needed
- Pure protocol-level transactions
- No contract deployment, no upgrade risks

### Data Flow Example

1. **User creates intent at 10:00 AM:**
    
    ```
    Frontend → Constructs tx with timebounds [10:00 AM - 10:00 PM]
             → User signs with wallet
             → Posts XDR to monitoring service
    ```
    
2. **Monitoring service (10:00 AM - 10:00 PM):**
    
    ```
    Every minute:
      Check Horizon: Can path payment execute?
      At 2:47 PM: YES, rate is 83.1 INR/USD
      Submit tx to Stellar
      Stellar validates → Executes → Closes in ledger
      Update database: status = 'executed'
      Notify user: "✓ Completed at 83.1 INR/USD"
    ```
    
3. **If never executable:**
    
    ```
    At 10:00 PM: Transaction timebounds expired
    Stellar rejects any submission attempt (invalid tx)
    Update database: status = 'expired'
    Notify user: "⊗ Rate not reached, funds safe in your wallet"
    ```
    

### Scalability Considerations

- **Monitoring service** can be horizontally scaled (multiple workers polling)
- **Intent storage** is lightweight (just XDR + metadata)
- **Stellar network** handles all heavy lifting (orderbook matching, settlement)
- For 10,000 concurrent intents checking every 60 seconds = 167 Horizon API calls/second (easily manageable)

### Open Source Strategy

- Frontend: MIT licensed, hosted on GitHub
- Monitoring service: Open source reference implementation
- Anyone can run their own monitoring service
- Users can verify the code matches claimed behavior
- Creates trust through transparency, not through custody

---

## 6. Trust & Security Model

### Core Principle: Trust Through Math, Not Reputation

This system is designed so users **do not need to trust the service operator**. Here’s why:

### 1. Non-Custodial by Design

**User funds never leave their wallet until execution:**
- When a user signs the transaction, it specifies:
- Exact source account (their wallet)
- Exact destination account (their wallet or intended recipient)
- Maximum send amount
- Minimum receive amount
- Time validity window

- The signed transaction is **cryptographically bound** to these parameters
- **No one can modify it** after signing (any change invalidates the signature)
- The monitoring service only holds a *copy* of this signed transaction, not the funds themselves

**Analogy:** It’s like writing a check with “void after December 21, 2025” and specific conditions. The check can’t be cashed unless those conditions are met, and no one can change the check’s terms.

### 2. Protocol-Level Enforcement

**Stellar’s protocol enforces all conditions:**
- If the path payment can’t deliver the minimum receive amount → Transaction rejected
- If current time is outside timebounds → Transaction rejected
- If user’s account doesn’t have sufficient balance → Transaction rejected
- If the signature is invalid → Transaction rejected

These checks happen at the **protocol level** in Stellar Core, not in application code. The monitoring service cannot override them.

### 3. Worst-Case Failure Analysis

**If the monitoring service is malicious:**

**Scenario A: Service tries to execute at unfavorable rate**
- Transaction attempts to path payment with insufficient return
- Stellar protocol validates: “destAmount not achievable”
- Transaction **fails**, funds stay in wallet
- Cost to user: 0 XLM (failed transactions don’t charge fees)

**Scenario B: Service tries to steal funds**
- Cannot modify destination (would invalidate signature)
- Cannot modify amounts (would invalidate signature)
- Cannot remove timebounds (would invalidate signature)
- **Impossible to steal** due to cryptographic signature

**Scenario C: Service goes offline/disappears**
- User’s signed transaction is still valid
- User can submit it themselves directly to Horizon
- Or use any other service to monitor and submit
- Transaction will expire naturally if conditions aren’t met
- **No fund loss**, just missed opportunity

**Scenario D: Service spams network with transaction**
- Stellar sequence numbers prevent duplicate submissions
- Only first successful submission counts
- Subsequent attempts fail with “bad sequence” error
- No additional cost to user

**Scenario E: Service never submits when it should**
- User loses opportunity (doesn’t get optimal rate)
- But funds remain safe in wallet
- User can cancel by signing another transaction with higher sequence
- Worst case: Time expires, user can try again

### 4. What Users ARE Trusting

**Be clear about limited trust assumptions:**

✅ **No trust needed for:**
- Fund custody (never given up)
- Transaction integrity (cryptographically enforced)
- Time expiry (protocol enforced)
- Rate enforcement (protocol enforced via `path_payment_strict_receive`)

⚠️ **Minimal trust needed for:**
- **Monitoring reliability:** Service might not submit when it should (user loses opportunity, not funds)
- **Liquidity data accuracy:** Service shows current rates (user can verify independently via Horizon)
- **Notification delivery:** User might not get immediate alerts (can check wallet directly)

### 5. User Verification Options

**Users can independently verify:**

1. **Transaction contents** (before signing):
    
    ```jsx
    // Decode the transaction XDR to inspect
    const tx = TransactionBuilder.fromXDR(xdrString, Networks.PUBLIC);
    console.log(tx.operations[0].destination); // Check it's YOUR address
    console.log(tx.operations[0].destAmount);  // Check receive amount
    console.log(tx.timeBounds);                 // Check expiry
    ```
    
2. **Current orderbook state:**
    
    ```bash
    # Query Stellar Horizon directly
    curl "https://horizon.stellar.org/paths/strict-receive?
          destination_amount=4000&
          destination_asset_code=INR&
          destination_asset_issuer=G...&
          source_assets=USD:G..."
    ```
    
3. **Transaction submission:**
    
    ```jsx
    // User can submit their own signed transaction
    await server.submitTransaction(signedTx);
    ```
    

### 6. Security Properties Summary

| Property | Guaranteed By | Can Service Violate? |
| --- | --- | --- |
| Fund custody | User’s private key | No - keys never shared |
| Rate protection | Protocol path payment | No - enforced in Core |
| Time bounds | Protocol timebounds | No - enforced in Core |
| Destination | Transaction signature | No - modification invalidates |
| Atomic execution | Stellar ledger | No - all-or-nothing by design |
| Fee amount | Transaction fee field | No - fixed at signing |
| Execution monitoring | Service uptime | Yes - service could go offline |
| Optimal timing | Service honesty | Yes - might not submit optimally |

### 7. Comparison to Alternatives

**vs. Custodial Remittance Services (Western Union, Wise):**
- Limit Orders: ✅ Non-custodial, ❌ No guaranteed execution
- Custodial: ❌ Full custody, ✅ Guaranteed execution

**vs. Centralized Exchanges (Binance, Coinbase):**
- Limit Orders: ✅ Non-custodial, ✅ Transparent protocol
- CEX: ❌ Full custody, ❌ Opaque matching

**vs. DEX Limit Orders (Ethereum-based):**
- Limit Orders: ✅ No smart contract risk, ✅ $0.00003 fees
- DEX: ⚠️ Smart contract risk, ❌ $0.50-5 fees

### 8. Recommendations for Users

**Best practices:**
1. **Always verify transaction parameters before signing** (use wallet’s transaction preview)
2. **Set realistic rate targets** (check current orderbook first)
3. **Use reasonable time windows** (24 hours is usually sufficient)
4. **Don’t set-and-forget** (check status periodically)
5. **Understand non-execution is OK** (safety over execution guarantee)

**Red flags to watch for:**
- Service asking for private keys (NEVER provide these)
- Pressure to sign quickly without reviewing
- Transactions with very long time windows (months/years)
- Destination addresses you don’t recognize

---

## 7. Failure Scenarios (Important)

### Core Philosophy: Safe Failures Are Features, Not Bugs

In systems handling people’s money, **non-execution is often the correct outcome**. This system is designed to fail safely.

---

### Scenario 1: No Liquidity Available

**What happens:**
- User sets target: “Receive 4,000 INR at minimum 85 INR/USD”
- Current orderbook: Best rate available is 83 INR/USD
- Monitoring service checks path: `path_payment_strict_receive` simulation fails
- Status: “⚠ Liquidity unavailable at your target rate”

**Why this is SAFE:**
- User’s funds never moved
- No fees charged (transaction never submitted)
- User can adjust target rate or wait for market to improve
- System is being **honest** rather than executing at worse rate

**User options:**
1. Lower rate target to match available liquidity
2. Wait for market conditions to improve
3. Cancel intent and use immediate exchange instead
4. Extend time window to increase chances

**Real-world analogy:** Like setting a lowball offer on a house. If no seller accepts, you don’t accidentally pay more than your limit.

---

### Scenario 2: Transaction Expires

**What happens:**
- User sets 12-hour time window
- Market rate never reaches target during that period
- At expiry (enforced by protocol `maxTime`):
- Transaction becomes **invalid**
- Monitoring service can no longer submit it
- Stellar network rejects any submission attempts

**Why this is SAFE:**
- User chose the time window
- Automatic expiry prevents indefinite hanging intents
- User maintains control (can create new intent with different parameters)
- No ongoing cost or risk

**User notification:**

```
⊗ Intent Expired

Your rate target of 85 INR/USD was not reached
within the 12-hour window.

Current rate: 83.2 INR/USD
Your funds remain safe in your wallet.

Would you like to:
• Try again with adjusted rate
• Convert at current market rate
• Cancel
```

**Real-world analogy:** Like a “good til canceled” order expiring at end of trading day. You don’t accidentally get filled at next day’s worse price.

---

### Scenario 3: User Sets Unrealistic Rate

**What happens:**
- User wants: 4,000 INR for 40 USD (100 INR/USD)
- Current market rate: 83 INR/USD (17% better than market)
- Liquidity preview shows: “⚠ Rate unlikely—20% above market”

**Why this is SAFE:**
- Frontend warns user during setup
- If user proceeds anyway, intent simply never executes
- After time expires, no harm done
- User learns to set realistic expectations

**Frontend prevention:**

```
┌─────────────────────────────────────┐
│ ⚠ Rate Check                       │
├─────────────────────────────────────┤
│ Your target: 100 INR/USD            │
│ Market rate: 83 INR/USD             │
│ Difference:  +20.5%                 │
│                                     │
│ This rate is very unlikely to be    │
│ reached. Consider adjusting closer  │
│ to market rate.                     │
│                                     │
│ [Adjust Rate] [Continue Anyway]     │
└─────────────────────────────────────┘
```

**Real-world analogy:** Setting a limit order to buy AAPL stock at $50 when it’s trading at $180. Order just sits there harmlessly.

---

### Scenario 4: Market Moves Away from Target

**What happens:**
- User sets: 85 INR/USD minimum
- Current rate at signing: 86 INR/USD (achievable)
- Over next hours, INR weakens to 81 INR/USD
- Intent never executes

**Why this is SAFE:**
- User was protected from executing at worse rate (81)
- This is **exactly the protection they wanted**
- Intent expires naturally
- User can reassess and create new intent if desired

**This is not a bug—it’s the core value proposition:**
- “Only execute if rate is favorable”
- Unfavorable rate = no execution = success

---

### Scenario 5: Insufficient Balance

**What happens:**
- User signs intent to send 50 USD
- Before execution, user spends 45 USD elsewhere
- Only 5 USD remains in wallet
- When monitoring service tries to submit: Transaction fails

**Why this is SAFE:**
- Stellar validates source account balance
- Transaction rejected with “insufficient balance”
- No partial execution
- User can top up and create new intent

**Prevention:**
- Frontend should check balance before signing
- Warning: “⚠ This will reserve 50 USD from your wallet”

---

### Scenario 6: Trustline Not Established

**What happens:**
- User wants to receive INR token
- User’s account doesn’t have INR trustline established
- Path payment operation fails

**Why this is SAFE:**
- Stellar requires explicit trustlines for non-native assets
- Transaction fails at protocol level
- Funds never leave source account

**Prevention:**
- Frontend checks for required trustlines
- Offers to create trustline before intent (requires user signature)

```
┌─────────────────────────────────────┐
│ Trustline Required                  │
├─────────────────────────────────────┤
│ To receive INR, you need to trust   │
│ the issuer: GDINR...                │
│                                     │
│ This is a one-time setup.           │
│                                     │
│ [Establish Trustline] [Cancel]      │
└─────────────────────────────────────┘
```

---

### Scenario 7: Network Congestion or Outage

**What happens:**
- Stellar network experiences high transaction volume
- Monitoring service’s submission might be delayed
- Or Stellar Horizon API has temporary outage

**Why this is SAFE:**
- Signed transaction remains valid until timebound expiry
- Service can retry submission
- If outage exceeds time window, transaction expires safely
- No fund loss, just missed opportunity

**Mitigation:**
- Service uses multiple Horizon endpoints
- Implements retry logic with exponential backoff
- Users should set reasonable time windows (not “1 hour during volatile period”)

---

### Scenario 8: User Changes Mind

**What happens:**
- User signs intent but then decides to cancel
- Options:
1. Create new transaction with same source, higher sequence number
2. Use sequence number to invalidate old intent
3. Simply let it expire

**Why this is SAFE:**
- Stellar sequence numbers are linear
- Once a transaction with higher sequence executes, lower sequences become invalid
- User maintains full control

**Cancellation flow:**

```jsx
// User signs a "bump sequence" transaction
const cancelTx = new TransactionBuilder(account, {fee: BASE_FEE})
  .addOperation(Operation.bumpSequence({
    bumpTo: (currentSequence + 1).toString()
  }))
  .build();
```

---

### Scenario 9: Monitoring Service Malfunction

**What happens:**
- Service crashes, has bugs, or goes permanently offline
- User’s intent is not monitored

**Why this is SAFE:**
- User’s funds remain in their wallet
- Transaction will expire naturally
- User can submit transaction themselves if they want
- Or use different monitoring service (open source, anyone can run)

**Recovery options:**

```jsx
// User can submit their own signed transaction
const stellarServer = new Stellar.Server('https://horizon.stellar.org');
await stellarServer.submitTransaction(mySignedTransaction);
```

---

### Scenario 10: Front-Running or MEV

**Could a malicious actor see the signed transaction and front-run it?**

**Why this is NOT a problem on Stellar:**
- Stellar doesn’t have public mempool like Ethereum
- Transactions go directly to validator nodes
- Orderbook execution is deterministic (first-come-first-served in ledger)
- No gas auctions, no MEV extractors
- Path payment executes atomically in single ledger close

**Even if someone knew your target rate:**
- They can’t modify your signed transaction
- They can’t prevent your execution (no censorship mechanism)
- Worst case: They could place competing order, but Stellar’s fair ordering protects you

---

### Summary: Failure Mode Matrix

| Failure Type | Outcome | User Loss | System Behavior |
| --- | --- | --- | --- |
| No liquidity | No execution | $0 | Safe expiry |
| Unrealistic rate | No execution | $0 | Safe expiry |
| Time expiry | No execution | $0 | Protocol enforcement |
| Insufficient balance | No execution | $0 | Protocol rejection |
| Missing trustline | No execution | $0 | Protocol rejection |
| Network outage | Delayed/no execution | $0 | Safe expiry |
| Service offline | No execution | $0 | Safe expiry |
| User cancels | No execution | Tiny seq bump fee | User control |
| Market moves away | No execution | $0 | **Intended protection** |

**Key insight:** Every failure results in $0 loss and maintains user control. The worst outcome is opportunity cost, never fund loss.

---

## 8. Feature List

### Core Features

**1. Rate Protection**
- Set minimum acceptable exchange rate
- Execution only when rate condition is met
- No slippage beyond user-specified limits
- Atomic all-or-nothing execution

**2. Multi-Currency Path Execution**
- Support for multi-hop conversions (e.g., INR → USDC → USD)
- Automatic path finding through Stellar orderbook
- Works with any Stellar anchor tokens
- No need to hold intermediate currencies

**3. Real-Time Liquidity Preview**
- Query current orderbook before committing
- Show achievable rates based on actual liquidity
- Display historical rate ranges for context
- Warn if target rate is unrealistic

**4. Time-Bound Intents**
- User-defined execution windows
- Protocol-enforced expiry (no manual cleanup)
- Options: immediate-only, today-only, 24h, 48h, custom
- Automatic notifications on expiry

**5. Non-Custodial Security**
- User funds never leave their wallet
- Pre-signed transactions with cryptographic integrity
- No smart contract risk
- No intermediary custody

**6. Open-Source Monitoring**
- Public reference implementation
- Anyone can run their own monitoring service
- Verifiable code on GitHub
- Community-run nodes possible

**7. Transaction Auditability**
- All executions on public Stellar ledger
- Verify exact rate received after execution
- Full transaction history via Horizon
- Export for accounting/tax purposes

**8. Cost Transparency**
- Fixed protocol fee: ~$0.00003 per transaction
- No hidden service fees
- Show exact fee before signing
- Compare to traditional remittance costs

**9. Wallet Integration**
- Works with existing Stellar wallets (Freighter, Lobstr, Albedo)
- No new custody model to learn
- Standard Stellar transaction signing
- Mobile and web support

**10. Multi-Asset Support**
- All Stellar anchor tokens supported
- Fiat: USD, EUR, INR, PHP, NGN, BRL, ARS, etc.
- Stablecoins: USDC, USDT (Stellar versions)
- Add new assets without code changes

### User Experience Features

**11. Rate Alerts (Optional)**
- Push notifications when target rate is achieved
- Email/SMS for non-app execution
- Status dashboard for active intents
- Historical execution analytics

**12. Smart Recommendations**
- Suggest realistic rate targets based on 24h averages
- Show % deviation from current market
- Historical success rate for similar intents
- Best time windows based on liquidity patterns

**13. Batch Intent Creation**
- Schedule multiple intents with different rate targets
- “Ladder” approach: some at conservative rates, some at optimistic
- Manage multiple currency pairs simultaneously

**14. Recipient Flexibility**
- Send to your own wallet (self-conversion)
- Send directly to recipient’s Stellar address
- Works with any Stellar account

**15. Cancel/Modify**
- Cancel active intent using sequence number bumping
- Create revised intent with different parameters
- No penalty for cancellation

### Advanced Features (Optional Enhancements)

**16. Recurring Intents**
- Schedule weekly/monthly intents for regular remittances
- Auto-renew if previous intent expired without execution
- Useful for recurring bills or salary conversions

**17. Partial Fill Support**
- “Execute up to 50% if rate is met for partial amount”
- Useful when liquidity is limited
- Multiple smaller intents instead of one large

**18. Group Intents (Community Feature)**
- Combine multiple users’ intents for better orderbook matching
- Shared liquidity discovery
- Still non-custodial (each user signs their own transaction)

**19. Analytics Dashboard**
- Show success rate of intents by rate target
- Compare your execution prices vs market
- Track savings vs immediate conversion

**20. Anchor Integration Directory**
- List of available anchor tokens
- On-ramp/off-ramp integration info
- Liquidity ratings by currency pair

### Integration Features

**21. API Access**
- RESTful API for programmatic intent creation
- Webhooks for execution notifications
- Suitable for business integrations (e.g., payroll systems)

**22. Accounting Export**
- Download transaction history as CSV
- Tax reporting format
- Integration with accounting software

**23. Compliance Support**
- Transaction history for audit trails
- KYC delegation to anchor services (not the app itself)
- AML compliance through regulated anchors

---

### What This System Does NOT Offer

*(Important for honest positioning)*

❌ **Not a trading platform** – No speculative features, no leverage, no shorts
❌ **Not a price oracle** – No predictions, just execution when conditions are met
❌ **Not guaranteed execution** – Market might never reach your rate
❌ **Not instant always** – May take hours or expire
❌ **Not a full remittance solution** – Still need anchors for fiat on/off-ramp
❌ **Not anonymous** – Anchors may require KYC for fiat conversion
❌ **Not insurance** – No protection if market moves against you long-term

---

## 9. Implementation Plan

### Phase 1: Core Protocol Integration (Weeks 1-2)

**Deliverable:** Functional path payment intent creation and submission

**Steps:**

1. **Set up development environment**
    
    ```bash
    npm install @stellar/stellar-sdk
    # Configure testnet access
    export HORIZON_URL="https://horizon-testnet.stellar.org"
    ```
    
2. **Implement liquidity checker**
    
    ```jsx
    async function checkLiquidity(sourceAsset, destAsset, destAmount, maxSource) {
      const server = new Stellar.Server(HORIZON_URL);
    
      const paths = await server.strictReceivePaths(
        [sourceAsset],
        destAsset,
        destAmount
      ).call();
    
      if (paths.records.length === 0) return null;
    
      const bestPath = paths.records[0];
      if (parseFloat(bestPath.source_amount) > parseFloat(maxSource)) {
        return null; // Exceeds max source
      }
    
      return {
        sourceAmount: bestPath.source_amount,
        path: bestPath.path,
        effectiveRate: parseFloat(destAmount) / parseFloat(bestPath.source_amount)
      };
    }
    ```
    
3. **Build transaction constructor**
    
    ```jsx
    async function createPathPaymentIntent(params) {
      const {
        sourceKeypair,
        sourceAsset,
        destAsset,
        destAmount,
        maxSource,
        validUntil,
        path
      } = params;
    
      const account = await server.loadAccount(sourceKeypair.publicKey());
    
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(Operation.pathPaymentStrictReceive({
          sendAsset: sourceAsset,
          sendMax: maxSource,
          destination: sourceKeypair.publicKey(), // or recipient
          destAsset: destAsset,
          destAmount: destAmount,
          path: path
        }))
        .setTimeout(TimeoutInfinite)
        .setTimebounds({
          minTime: Math.floor(Date.now() / 1000),
          maxTime: validUntil
        })
        .build();
    
      transaction.sign(sourceKeypair);
      return transaction;
    }
    ```
    
4. **Test on Stellar testnet**
    - Create test accounts with friendbot
    - Establish trustlines for test assets
    - Execute sample path payments manually
    - Verify atomic execution behavior

**Validation criteria:**
- ✓ Can query paths successfully
- ✓ Can construct valid time-bounded transactions
- ✓ Transactions execute when conditions are met
- ✓ Transactions fail gracefully when conditions aren’t met

---

### Phase 2: Monitoring Service (Weeks 3-4)

**Deliverable:** Stateless backend that monitors and submits intents

**Steps:**

1. **Set up Node.js service**
    
    ```jsx
    // server.js
    const express = require('express');
    const Stellar = require('@stellar/stellar-sdk');
    
    const app = express();
    const server = new Stellar.Server(HORIZON_URL);
    const intents = new Map(); // In production: use PostgreSQL
    
    app.post('/api/intents', async (req, res) => {
      const { txXDR, targetRate, expiresAt } = req.body;
    
      // Validate transaction
      const tx = TransactionBuilder.fromXDR(txXDR, Networks.TESTNET);
      if (!tx.timeBounds || tx.timeBounds.maxTime < Date.now()) {
        return res.status(400).json({ error: 'Invalid timebounds' });
      }
    
      const intentId = generateUUID();
      intents.set(intentId, {
        txXDR,
        targetRate,
        expiresAt,
        status: 'active'
      });
    
      res.json({ intentId, status: 'monitoring' });
    });
    ```
    
2. **Implement monitoring loop**
    
    ```jsx
    async function monitorIntents() {
      for (const [intentId, intent] of intents.entries()) {
        if (intent.status !== 'active') continue;
    
        // Check expiry
        if (Date.now() > intent.expiresAt) {
          intent.status = 'expired';
          await notifyUser(intentId, 'expired');
          continue;
        }
    
        // Simulate transaction
        try {
          const canExecute = await simulateTransaction(intent.txXDR);
    
          if (canExecute) {
            const result = await server.submitTransaction(
              TransactionBuilder.fromXDR(intent.txXDR, Networks.TESTNET)
            );
    
            intent.status = 'executed';
            intent.txHash = result.hash;
            await notifyUser(intentId, 'executed', result);
          }
        } catch (error) {
          console.error(`Intent${intentId} simulation failed:`, error.message);
          // Don't mark as failed - keep trying until expiry
        }
      }
    }
    
    // Run every 60 seconds
    setInterval(monitorIntents, 60000);
    ```
    
3. **Add transaction simulation**
    
    ```jsx
    async function simulateTransaction(txXDR) {
      try {
        // Stellar Horizon's check_transaction endpoint
        const response = await fetch(`${HORIZON_URL}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `tx=${encodeURIComponent(txXDR)}`
        });
    
        const data = await response.json();
    
        // Check if simulation succeeded
        return !data.extras?.result_codes?.operations?.includes('op_underfunded') &&
               !data.extras?.result_codes?.operations?.includes('op_under_dest_min');
      } catch (error) {
        return false;
      }
    }
    ```
    
4. **Add persistence (PostgreSQL)**
    
    ```sql
    CREATE TABLE intents (
      id UUID PRIMARY KEY,
      tx_xdr TEXT NOT NULL,
      source_account VARCHAR(56) NOT NULL,
      source_asset VARCHAR(100),
      dest_asset VARCHAR(100),
      target_rate DECIMAL(20, 7),
      expires_at TIMESTAMP NOT NULL,
      status VARCHAR(20) NOT NULL,
      tx_hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX idx_active_intents ON intents(status, expires_at)
      WHERE status = 'active';
    ```
    

**Validation criteria:**
- ✓ Service accepts signed transactions
- ✓ Monitoring loop checks conditions every minute
- ✓ Submits transactions when conditions are met
- ✓ Handles expiries correctly
- ✓ Persists state across restarts

---

### Phase 3: Frontend Application (Weeks 5-7)

**Deliverable:** User-facing web/mobile app

**Steps:**

1. **Initialize React application**
    
    ```bash
    npx create-react-app limit-orders-remittances
    cd limit-orders-remittances
    npm install @stellar/stellar-sdk @stellar/freighter-api
    ```
    
2. **Build wallet connection**
    
    ```jsx
    // WalletProvider.js
    import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
    
    export function useWallet() {
      const [publicKey, setPublicKey] = useState(null);
    
      const connect = async () => {
        if (await isConnected()) {
          const key = await getPublicKey();
          setPublicKey(key);
        }
      };
    
      const sign = async (xdr) => {
        return await signTransaction(xdr, { networkPassphrase: Networks.TESTNET });
      };
    
      return { publicKey, connect, sign };
    }
    ```
    
3. **Create intent builder UI**
    
    ```jsx
    // IntentBuilder.js
    function IntentBuilder() {
      const [sourceAsset, setSourceAsset] = useState('USD');
      const [destAsset, setDestAsset] = useState('INR');
      const [destAmount, setDestAmount] = useState('');
      const [maxSource, setMaxSource] = useState('');
      const [timeWindow, setTimeWindow] = useState(12); // hours
      const [liquidity, setLiquidity] = useState(null);
    
      useEffect(() => {
        const checkLiquidity = async () => {
          if (!destAmount || !maxSource) return;
          const result = await api.checkLiquidity({
            sourceAsset, destAsset, destAmount, maxSource
          });
          setLiquidity(result);
        };
    
        checkLiquidity();
      }, [destAmount, maxSource, sourceAsset, destAsset]);
    
      return (
        <div>
          {/* Amount inputs */}
          {/* Rate calculator */}
          {liquidity && (
            <div>
              ✓ Available at {liquidity.effectiveRate} {destAsset}/{sourceAsset}
            </div>
          )}
          <button onClick={handleCreateIntent}>Create Intent</button>
        </div>
      );
    }
    ```
    
4. **Implement signing flow**
    
    ```jsx
    async function handleCreateIntent() {
      // 1. Build transaction
      const tx = await buildPathPaymentTx({
        sourceAsset,
        destAsset,
        destAmount,
        maxSource,
        validUntil: Date.now() + (timeWindow * 3600 * 1000)
      });
    
      // 2. Get user to sign with wallet
      const signedXDR = await wallet.sign(tx.toXDR());
    
      // 3. Submit to monitoring service
      const response = await fetch('/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txXDR: signedXDR,
          targetRate: calculateRate(destAmount, maxSource),
          expiresAt: Date.now() + (timeWindow * 3600 * 1000)
        })
      });
    
      const { intentId } = await response.json();
      navigate(`/intent/${intentId}`);
    }
    ```
    
5. **Build status dashboard**
    
    ```jsx
    // IntentStatus.js
    function IntentStatus({ intentId }) {
      const [intent, setIntent] = useState(null);
    
      useEffect(() => {
        const fetchStatus = async () => {
          const response = await fetch(`/api/intents/${intentId}`);
          const data = await response.json();
          setIntent(data);
        };
    
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5s
        return () => clearInterval(interval);
      }, [intentId]);
    
      if (!intent) return <div>Loading...</div>;
    
      return (
        <div>
          <h2>Intent Status: {intent.status}</h2>
          {intent.status === 'active' && (
            <>
              <p>Monitoring orderbook...</p>
              <p>Expires: {new Date(intent.expiresAt).toLocaleString()}</p>
            </>
          )}
          {intent.status === 'executed' && (
            <p>✓ Executed! View on Stellar Expert:
              <a href={`https://stellar.expert/explorer/testnet/tx/${intent.txHash}`}>
                {intent.txHash}
              </a>
            </p>
          )}
        </div>
      );
    }
    ```
    

**Validation criteria:**
- ✓ User can connect Stellar wallet
- ✓ Can select assets and amounts
- ✓ Shows real-time liquidity data
- ✓ Signing flow works smoothly
- ✓ Status updates in real-time

---

### Phase 4: Testnet Demo (Week 8)

**Deliverable:** End-to-end working demo on Stellar testnet

**Steps:**

1. **Set up test assets**
    
    ```jsx
    // Create test anchor accounts for USD, INR, EUR
    const usdIssuer = Keypair.random();
    const inrIssuer = Keypair.random();
    
    // Fund with friendbot
    await fetch(`https://friendbot.stellar.org?addr=${usdIssuer.publicKey()}`);
    
    // Create test liquidity offers
    await server.submitTransaction(/* create offers on SDEX */);
    ```
    
2. **Create demo scenario**
    - User account with 100 test USD
    - Target: Receive 8,000 test INR
    - Maximum pay: 100 USD
    - Minimum rate: 80 INR/USD
    - Time window: 1 hour
3. **Simulate market conditions**
    
    ```jsx
    // Script to adjust orderbook rates over time
    async function simulateMarketMovement() {
      // Start at 82 INR/USD (below target)
      // After 30 minutes, move to 85 INR/USD (above target)
      // Intent should execute automatically
    }
    ```
    
4. **Record demo walkthrough**
    - Screen recording of full user flow
    - Show transaction on Stellar Expert
    - Explain what’s happening at each step

**Validation criteria:**
- ✓ Complete user journey works end-to-end
- ✓ Intent executes when conditions are met
- ✓ Expires safely when conditions aren’t met
- ✓ All transactions visible on Stellar testnet

---

### Phase 5: Production Hardening (Weeks 9-10)

**Deliverable:** Production-ready system

**Steps:**

1. **Switch to mainnet**
    - Update network passphrase to PUBLIC
    - Configure mainnet Horizon endpoints
    - Use real anchor tokens (Circle USDC, actual anchor INR)
2. **Add monitoring improvements**
    - Multiple Horizon endpoints for redundancy
    - Error alerting (Sentry, PagerDuty)
    - Metrics dashboard (Grafana)
    - Rate limiting and DDoS protection
3. **Security audit**
    - Code review for signature validation
    - Ensure no private key exposure
    - SQL injection prevention
    - HTTPS/TLS enforcement
4. **Documentation**
    - User guide with screenshots
    - API documentation
    - Open-source contribution guidelines
    - Security disclosure policy
5. **Testing suite**
    
    ```jsx
    describe('Path Payment Intent System', () => {
      it('should create valid transaction', async () => {
        const tx = await createIntent(/* params */);
        expect(tx.operations[0].type).toBe('pathPaymentStrictReceive');
      });
    
      it('should reject transactions without timebounds', () => {
        expect(() => validateIntent(/* no timebounds */)).toThrow();
      });
    
      it('should handle expired intents', async () => {
        const result = await monitorExpiredIntent();
        expect(result.status).toBe('expired');
      });
    });
    ```
    

**Validation criteria:**
- ✓ Works on Stellar mainnet
- ✓ No security vulnerabilities
- ✓ Monitoring and alerting in place
- ✓ Comprehensive test coverage

---

### Phase 6: Launch and Iteration (Week 11+)

**Deliverable:** Public launch with user feedback loop

1. **Soft launch**
    - Invite 50-100 beta users
    - Monitor for issues
    - Collect feedback
2. **Documentation and education**
    - Blog post explaining the system
    - Video tutorials
    - FAQ section
3. **Community engagement**
    - Discord/Telegram for support
    - GitHub for open-source contributors
    - Regular AMAs
4. **Feature expansion** (based on feedback)
    - Additional currency pairs
    - Recurring intents
    - Mobile app (React Native)
    - Analytics dashboard

---

### Technical Stack Summary

**Frontend:**
- React or React Native
- Stellar SDK for JavaScript
- Freighter/Albedo/Lobstr for wallet integration
- TailwindCSS for styling

**Backend:**
- Node.js with Express (or Go for performance)
- PostgreSQL for intent storage
- Redis for caching
- WebSockets for real-time updates

**Infrastructure:**
- Hosted on AWS/GCP/DigitalOcean
- Stellar Horizon API (public or self-hosted)
- GitHub Actions for CI/CD
- Docker for containerization

**Monitoring:**
- Sentry for error tracking
- Grafana + Prometheus for metrics
- PagerDuty for alerting

**Total Development Time:** 10-11 weeks for MVP
**Team Size:** 2-3 developers (1 frontend, 1 backend, 1 devops)

---

## 10. One-Paragraph Pitch (Judge-Ready)

**Limit Orders for Remittances** solves a critical problem for migrant workers, small businesses, and families in emerging markets: they have no control over when their currency conversions happen, often losing 2-5% to FX timing volatility. Our system lets users set their acceptable exchange rate and time window—like “convert my USD to INR only if I get at least 80 INR per dollar, anytime in the next 12 hours”—and then uses Stellar’s built-in orderbook and path payment operations to execute atomically only when conditions are met. Crucially, this is **non-custodial**: users pre-sign time-bounded transactions that can only execute at their specified rate, meaning even if our service goes down or acts maliciously, funds stay safe in their wallet. We’re not building another remittance app or speculative DEX—we’re providing rate protection for real-world $10-$50 transactions using Stellar’s unique primitives (built-in orderbook, path payments, predictable sub-cent fees, atomic settlement) that make this economically viable in a way Ethereum or other chains fundamentally cannot replicate. When the market never reaches your target rate, the transaction simply expires safely—because protecting users from unfavorable conversions is the core value, not guaranteeing execution at any cost.

---

**END OF DOCUMENT**

---

### Appendix: Why This Matters

This isn’t theoretical. In 2024:
- $669 billion in remittances were sent to low- and middle-income countries (World Bank)
- Average cost: 6.3% per transaction
- FX spreads account for 1-3% of that cost
- Timing variability adds another 1-2% unpredictability

For someone sending $200/month, losing 2% to bad FX timing = $48/year = **4+ days of wages in many markets**.

This system gives them agency. Not prediction, not speculation—just the ability to say “execute at my rate or don’t execute at all.” That’s dignity in financial infrastructure.