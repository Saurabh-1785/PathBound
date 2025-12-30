import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CurrencySelector from '../components/CurrencySelector';
import RateInput from '../components/RateInput';
import TimeWindowSelector from '../components/TimeWindowSelector';
import LiquidityPreview from '../components/LiquidityPreview';
import RateChart from '../components/RateChart';
import { useWallet } from '../context/WalletContext';
import { Currency, LiquidityEstimate } from '../types';
import { CURRENCIES, estimateLiquidity, getBalances } from '../services/stellar';
import PixelBlast from '../components/PixelBlast';

export default function CreateIntent() {
    const navigate = useNavigate();
    const { publicKey, isConnected, connect } = useWallet();

    // Form state
    const [amount, setAmount] = useState('');
    const [sourceCurrency, setSourceCurrency] = useState<Currency | null>(CURRENCIES[0]); // XLM
    const [destCurrency, setDestCurrency] = useState<Currency | null>(CURRENCIES[1]); // USDC
    const [minRate, setMinRate] = useState('');
    const [timeWindow, setTimeWindow] = useState(86400); // 24 hours default

    // Destination address state
    const [sendToSelf, setSendToSelf] = useState(true);
    const [destinationAddress, setDestinationAddress] = useState('');

    // Liquidity state
    const [liquidityEstimate, setLiquidityEstimate] = useState<LiquidityEstimate | null>(null);
    const [isLoadingLiquidity, setIsLoadingLiquidity] = useState(false);

    // Balances state
    const [balances, setBalances] = useState<{ asset: string; balance: string }[]>([]);

    // Fetch balances when wallet connects
    useEffect(() => {
        const loadBalances = async () => {
            if (isConnected && publicKey) {
                const bal = await getBalances(publicKey);
                setBalances(bal);
            }
        };
        loadBalances();
    }, [isConnected, publicKey]);

    // Get balance for selected source currency
    const sourceBalance = balances.find(b => b.asset === sourceCurrency?.code)?.balance || '0';

    // Mainnet market rate for accurate pricing
    const [mainnetRate, setMainnetRate] = useState<number | null>(null);
    const [rateSource, setRateSource] = useState<'mainnet' | 'testnet'>('testnet');

    // Fetch both testnet liquidity and mainnet rate
    useEffect(() => {
        const fetchData = async () => {
            if (!sourceCurrency || !destCurrency) {
                setLiquidityEstimate(null);
                setMainnetRate(null);
                return;
            }

            setIsLoadingLiquidity(true);
            try {
                // Import dynamically to avoid circular deps
                const { fetchMainnetMarketRate, fetchMainnetOrderbook } = await import('../services/stellar');

                // Fetch mainnet rate for accurate pricing display
                const mainnetResult = await fetchMainnetMarketRate(
                    sourceCurrency.code,
                    destCurrency.code
                );
                if (mainnetResult.rate !== null) {
                    setMainnetRate(mainnetResult.rate);
                    setRateSource(mainnetResult.source);
                }

                // Fetch MAINNET orderbook for accurate liquidity/probability estimate
                if (minRate && amount) {
                    // Use mainnet orderbook for real liquidity data
                    const orderbook = await fetchMainnetOrderbook(sourceCurrency.code, destCurrency.code);
                    const estimate = estimateLiquidity(orderbook, parseFloat(minRate), parseFloat(amount));

                    // Override recommendedRate with mainnet rate if available
                    if (mainnetResult.rate !== null) {
                        estimate.recommendedRate = mainnetResult.rate.toFixed(4);
                    }

                    setLiquidityEstimate(estimate);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoadingLiquidity(false);
            }
        };

        const debounceTimer = setTimeout(fetchData, 500);
        return () => clearTimeout(debounceTimer);
    }, [sourceCurrency, destCurrency, minRate, amount]);

    const handleContinue = () => {
        if (!isConnected) {
            connect();
            return;
        }

        // Determine the destination address
        const finalDestination = sendToSelf ? publicKey : destinationAddress.trim();

        // Validate destination address if not sending to self
        if (!sendToSelf && (!finalDestination || finalDestination.length !== 56 || !finalDestination.startsWith('G'))) {
            alert('Please enter a valid Stellar public key (56 characters starting with G)');
            return;
        }

        // Validate minimum rate is >= market rate
        const marketRateValue = mainnetRate || (liquidityEstimate?.recommendedRate ? parseFloat(liquidityEstimate.recommendedRate) : null);
        if (marketRateValue && parseFloat(minRate) < marketRateValue) {
            alert(`Minimum rate must be at least ${marketRateValue.toFixed(4)} (current market rate)`);
            return;
        }

        // Determine if this is an immediate transfer (rate = market rate)
        const isImmediateTransfer = marketRateValue !== null && Math.abs(parseFloat(minRate) - marketRateValue) < 0.0001;

        // Store intent data in sessionStorage for the review page
        const intentData = {
            amount,
            sourceCurrency,
            destCurrency,
            minRate,
            timeWindow,
            destinationAddress: finalDestination,
            isImmediateTransfer,
            currentMarketRate: marketRateValue,
        };
        sessionStorage.setItem('pendingIntent', JSON.stringify(intentData));
        navigate('/review');
    };

    // Calculate if rate is valid (>= market rate)
    const marketRateValue = mainnetRate || (liquidityEstimate?.recommendedRate ? parseFloat(liquidityEstimate.recommendedRate) : null);
    const isRateValid = !marketRateValue || !minRate || parseFloat(minRate) >= marketRateValue;
    const isFormValid = amount && sourceCurrency && destCurrency && minRate && parseFloat(minRate) > 0 && isRateValid && (sendToSelf || (destinationAddress.length === 56 && destinationAddress.startsWith('G')));


    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* PixelBlast Animated Background */}
            <div className="fixed inset-0 z-0 opacity-60">
                <PixelBlast
                    variant="circle"
                    pixelSize={3}
                    color="#8B5CF6"
                    patternScale={3}
                    patternDensity={0.6}
                    enableRipples={true}
                    rippleIntensityScale={0.8}
                    rippleSpeed={0.2}
                    rippleThickness={0.12}
                    edgeFade={0.5}
                    speed={0.25}
                    transparent={true}
                />
            </div>

            {/* Page Content */}
            <div className="relative z-10 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-pb-text-primary mb-3">
                            Create Exchange Intent
                        </h1>
                        <p className="text-pb-text-secondary">
                            Define your rate protection parameters. Your funds won't move unless your conditions are met.
                        </p>

                        {/* Connection Status */}
                        {isConnected && publicKey && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pb-status-success/10 border border-pb-status-success/20">
                                <span className="w-2 h-2 rounded-full bg-pb-status-success animate-pulse" />
                                <span className="text-sm text-pb-status-success">
                                    Connected: {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Amount */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Amount to Convert</CardTitle>
                                    <CardDescription>
                                        How much do you want to exchange?
                                        {isConnected && sourceCurrency && (
                                            <span className="ml-2 text-pb-accent-primary">
                                                (Available: {parseFloat(sourceBalance).toFixed(4)} {sourceCurrency.code})
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        isMono
                                        leftIcon={
                                            <span className="text-pb-text-muted">
                                                {sourceCurrency?.symbol || 'XLM'}
                                            </span>
                                        }
                                    />
                                    {isConnected && sourceBalance && parseFloat(amount) > parseFloat(sourceBalance) && (
                                        <p className="mt-2 text-sm text-pb-status-error">
                                            ⚠️ Amount exceeds available balance
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Currency Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Currencies</CardTitle>
                                    <CardDescription>Select source and destination currencies (Stellar Testnet)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <CurrencySelector
                                            label="From"
                                            value={sourceCurrency}
                                            onChange={setSourceCurrency}
                                            currencies={CURRENCIES.filter(c => c.code !== destCurrency?.code)}
                                        />

                                        {/* Swap button */}
                                        <div className="hidden sm:flex items-end justify-center pb-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const temp = sourceCurrency;
                                                    setSourceCurrency(destCurrency);
                                                    setDestCurrency(temp);
                                                }}
                                                className="p-2 rounded-lg bg-pb-bg-tertiary border border-pb-border-default hover:border-pb-border-focus transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-pb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                            </button>
                                        </div>

                                        <CurrencySelector
                                            label="To"
                                            value={destCurrency}
                                            onChange={setDestCurrency}
                                            currencies={CURRENCIES.filter(c => c.code !== sourceCurrency?.code)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rate Input */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Rate Protection</CardTitle>
                                            <CardDescription>Set your minimum acceptable exchange rate</CardDescription>
                                        </div>
                                        {mainnetRate && (
                                            <span className="text-xs text-pb-status-success bg-pb-status-success/10 px-2 py-1 rounded-full">
                                                📡 Live {rateSource === 'mainnet' ? 'Mainnet' : 'Testnet'} Price
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <RateInput
                                        value={minRate}
                                        onChange={setMinRate}
                                        sourceCurrency={sourceCurrency?.code || 'SRC'}
                                        destCurrency={destCurrency?.code || 'DST'}
                                        currentRate={mainnetRate ? mainnetRate.toFixed(4) : liquidityEstimate?.recommendedRate}
                                    />
                                </CardContent>
                            </Card>

                            {/* Time Window */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Time Window</CardTitle>
                                    <CardDescription>How long should the network try to execute?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TimeWindowSelector
                                        value={timeWindow}
                                        onChange={setTimeWindow}
                                    />
                                </CardContent>
                            </Card>

                            {/* Recipient Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recipient</CardTitle>
                                    <CardDescription>Who should receive the exchanged funds?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Send to Self Toggle */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={sendToSelf}
                                                onChange={(e) => {
                                                    setSendToSelf(e.target.checked);
                                                    if (e.target.checked) {
                                                        setDestinationAddress('');
                                                    }
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-pb-bg-tertiary border border-pb-border-default rounded-full peer-checked:bg-pb-accent-primary peer-checked:border-pb-accent-primary transition-colors" />
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-pb-text-muted rounded-full peer-checked:translate-x-5 peer-checked:bg-white transition-transform" />
                                        </div>
                                        <span className="text-sm text-pb-text-primary group-hover:text-pb-accent-primary transition-colors">
                                            Send to myself
                                        </span>
                                    </label>

                                    {/* Destination Address Display/Input */}
                                    {sendToSelf ? (
                                        <div className="p-4 bg-pb-bg-tertiary/50 border border-pb-border-subtle rounded-lg">
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-4 h-4 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-pb-text-secondary">Recipient:</span>
                                                <code className="font-mono text-pb-accent-primary">
                                                    {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : 'Connect wallet'}
                                                </code>
                                                <span className="text-pb-text-muted">(Your wallet)</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter recipient's Stellar public key (G...)"
                                                value={destinationAddress}
                                                onChange={(e) => setDestinationAddress(e.target.value.trim())}
                                                isMono
                                                leftIcon={
                                                    <svg className="w-4 h-4 text-pb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                }
                                            />
                                            {destinationAddress && destinationAddress.length !== 56 && (
                                                <p className="text-xs text-pb-status-warning">
                                                    ⚠️ Stellar public keys are 56 characters long
                                                </p>
                                            )}
                                            {destinationAddress && destinationAddress.length === 56 && !destinationAddress.startsWith('G') && (
                                                <p className="text-xs text-pb-status-error">
                                                    ❌ Invalid address - must start with 'G'
                                                </p>
                                            )}
                                            {destinationAddress && destinationAddress.length === 56 && destinationAddress.startsWith('G') && (
                                                <p className="text-xs text-pb-status-success">
                                                    ✓ Valid Stellar address format
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Market Rate Chart */}
                            {sourceCurrency && destCurrency && (
                                <RateChart
                                    sourceCurrency={sourceCurrency}
                                    destCurrency={destCurrency}
                                    targetRate={minRate}
                                />
                            )}

                            {/* Liquidity Preview */}
                            {isLoadingLiquidity ? (
                                <Card className="bg-pb-bg-tertiary/50">
                                    <CardContent className="py-8 text-center">
                                        <div className="animate-spin w-8 h-8 border-2 border-pb-accent-primary border-t-transparent rounded-full mx-auto mb-3" />
                                        <p className="text-sm text-pb-text-muted">Fetching liquidity data...</p>
                                    </CardContent>
                                </Card>
                            ) : liquidityEstimate && sourceCurrency && destCurrency && minRate ? (
                                <LiquidityPreview
                                    probability={liquidityEstimate.probability}
                                    depth={liquidityEstimate.availableDepth}
                                    sourceCurrency={sourceCurrency.code}
                                    destCurrency={destCurrency.code}
                                    targetRate={minRate}
                                    currentRate={mainnetRate ? mainnetRate.toFixed(4) : liquidityEstimate.recommendedRate}
                                />
                            ) : (
                                <Card className="bg-pb-bg-tertiary/50">
                                    <CardContent className="py-8 text-center">
                                        <svg className="w-12 h-12 text-pb-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-sm text-pb-text-muted">
                                            Enter amount and rate to see liquidity preview
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Summary */}
                            <Card glow={!!isFormValid}>
                                <CardHeader>
                                    <CardTitle className="text-base">Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-pb-text-secondary">Amount</span>
                                        <span className="font-mono text-pb-text-primary">
                                            {amount ? `${parseFloat(amount).toLocaleString()} ${sourceCurrency?.code}` : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-pb-text-secondary">Conversion</span>
                                        <span className="text-pb-text-primary">
                                            {sourceCurrency?.code || '—'} → {destCurrency?.code || '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-pb-text-secondary">Min Rate</span>
                                        <span className="font-mono text-pb-accent-primary">
                                            {minRate ? `${minRate} ${destCurrency?.code}/${sourceCurrency?.code}` : '—'}
                                        </span>
                                    </div>

                                    {/* Expected Output - Highlighted */}
                                    <div className="bg-pb-bg-primary rounded-lg p-3 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-pb-text-secondary">You will receive at least</span>
                                            <span className="font-mono text-lg font-bold text-pb-status-success">
                                                {amount && minRate
                                                    ? `${(parseFloat(amount) * parseFloat(minRate)).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${destCurrency?.code}`
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Warning for very low output */}
                                    {amount && minRate && parseFloat(minRate) < 0.01 && parseFloat(amount) > 10 && (
                                        <div className="bg-pb-status-error/10 border border-pb-status-error/30 rounded-lg p-3 mt-2">
                                            <div className="flex gap-2">
                                                <svg className="w-4 h-4 text-pb-status-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <p className="text-xs text-pb-status-error">
                                                    <strong>Check your rate!</strong> You're getting very little {destCurrency?.code} for your {sourceCurrency?.code}.
                                                    Did you mean {(parseFloat(minRate) * 1000).toFixed(4)} instead of {minRate}?
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-pb-text-secondary">Expires</span>
                                        <span className="text-pb-text-primary">
                                            {timeWindow / 3600} hours
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-pb-text-secondary">Recipient</span>
                                        <span className="font-mono text-pb-text-primary text-xs">
                                            {sendToSelf
                                                ? (publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-6)} (You)` : 'Your wallet')
                                                : (destinationAddress ? `${destinationAddress.slice(0, 6)}...${destinationAddress.slice(-6)}` : '—')
                                            }
                                        </span>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-pb-border-subtle">
                                        <Button
                                            className="w-full"
                                            disabled={!isFormValid}
                                            onClick={handleContinue}
                                        >
                                            {!isConnected ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                    Connect Wallet First
                                                </>
                                            ) : (
                                                <>
                                                    Continue to Review
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Network Info */}
                            <Card className="bg-pb-bg-tertiary/30">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-2 text-xs text-pb-text-muted">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Using Stellar Testnet • Transactions are real but use test tokens</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
