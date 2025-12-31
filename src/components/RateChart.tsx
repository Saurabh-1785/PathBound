import { useState, useEffect, useRef } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import { Currency } from '../types';
import { HORIZON_MAINNET_URL } from '../services/stellar';

// Mainnet asset issuers for real price data
const MAINNET_ISSUERS: Record<string, string> = {
    'USDC': 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // Centre.io USDC
    'EURC': 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2', // Circle EURC
};

interface RateChartProps {
    sourceCurrency: Currency;
    destCurrency: Currency;
    targetRate?: string;
}

interface TradeDataPoint {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    avg: number;
}

type TimeRange = '1H' | '1D' | '1W';

export default function RateChart({ sourceCurrency, destCurrency, targetRate }: RateChartProps) {
    const [tradeData, setTradeData] = useState<TradeDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('1D');
    const [currentRate, setCurrentRate] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch trade aggregations from MAINNET Horizon for real prices
    useEffect(() => {
        const fetchTradeData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Calculate time parameters based on range
                const now = Date.now();
                let startTime: number;
                let resolution: number;

                switch (timeRange) {
                    case '1H':
                        startTime = now - 60 * 60 * 1000; // 1 hour ago
                        resolution = 60000; // 1 minute
                        break;
                    case '1D':
                        startTime = now - 24 * 60 * 60 * 1000; // 24 hours ago
                        resolution = 900000; // 15 minutes
                        break;
                    case '1W':
                        startTime = now - 7 * 24 * 60 * 60 * 1000; // 1 week ago
                        resolution = 3600000; // 1 hour
                        break;
                }

                // Use MAINNET issuers for real price data
                const baseCode = sourceCurrency.code === 'XLM' ? 'native' : sourceCurrency.code;
                const baseIssuer = MAINNET_ISSUERS[sourceCurrency.code] || '';
                const counterCode = destCurrency.code === 'XLM' ? 'native' : destCurrency.code;
                const counterIssuer = MAINNET_ISSUERS[destCurrency.code] || '';

                // Fetch from MAINNET for real market data
                let url = `${HORIZON_MAINNET_URL}/trade_aggregations?`;
                if (baseCode === 'native') {
                    url += 'base_asset_type=native';
                } else {
                    url += `base_asset_type=credit_alphanum4&base_asset_code=${baseCode}&base_asset_issuer=${baseIssuer}`;
                }
                if (counterCode === 'native') {
                    url += '&counter_asset_type=native';
                } else {
                    url += `&counter_asset_type=credit_alphanum4&counter_asset_code=${counterCode}&counter_asset_issuer=${counterIssuer}`;
                }
                url += `&start_time=${startTime}&end_time=${now}&resolution=${resolution}&limit=100&order=asc`;

                const response = await fetch(url);
                const data = await response.json();

                if (data._embedded?.records?.length > 0) {
                    const points: TradeDataPoint[] = data._embedded.records.map((record: {
                        timestamp: string;
                        open: string;
                        high: string;
                        low: string;
                        close: string;
                        avg: string;
                    }) => ({
                        timestamp: parseInt(record.timestamp),
                        open: parseFloat(record.open),
                        high: parseFloat(record.high),
                        low: parseFloat(record.low),
                        close: parseFloat(record.close),
                        avg: parseFloat(record.avg),
                    }));
                    setTradeData(points);
                    setCurrentRate(points[points.length - 1]?.close || null);
                } else {
                    setTradeData([]);
                    setError('No trade data available');
                }
            } catch (err) {
                console.error('Error fetching trade data:', err);
                setError('Failed to load market data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTradeData();
    }, [sourceCurrency, destCurrency, timeRange]);

    // Draw chart on canvas
    useEffect(() => {
        if (!canvasRef.current || tradeData.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 10, bottom: 30, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);

        // Calculate min/max
        const closes = tradeData.map(d => d.close);
        const minRate = Math.min(...closes) * 0.995;
        const maxRate = Math.max(...closes) * 1.005;
        const rateRange = maxRate - minRate;

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y-axis labels
            const rate = maxRate - (rateRange / 4) * i;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(rate.toFixed(4), padding.left - 5, y + 4);
        }

        // Draw area fill
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        tradeData.forEach((point, i) => {
            const x = padding.left + (chartWidth / (tradeData.length - 1)) * i;
            const y = padding.top + chartHeight - ((point.close - minRate) / rateRange) * chartHeight;

            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
        ctx.closePath();

        // Create gradient
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        tradeData.forEach((point, i) => {
            const x = padding.left + (chartWidth / (tradeData.length - 1)) * i;
            const y = padding.top + chartHeight - ((point.close - minRate) / rateRange) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw target rate line if provided
        if (targetRate) {
            const targetRateNum = parseFloat(targetRate);
            if (targetRateNum >= minRate && targetRateNum <= maxRate) {
                const targetY = padding.top + chartHeight - ((targetRateNum - minRate) / rateRange) * chartHeight;
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(padding.left, targetY);
                ctx.lineTo(width - padding.right, targetY);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.setLineDash([]);

                // Target label
                ctx.fillStyle = '#22c55e';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('Target', width - padding.right + 5, targetY + 4);
            }
        }

        // X-axis time labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
            const i = Math.floor(pct * (tradeData.length - 1));
            const x = padding.left + pct * chartWidth;
            const time = new Date(tradeData[i]?.timestamp || 0);
            let label: string;
            if (timeRange === '1H' || timeRange === '1D') {
                label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                label = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
            ctx.fillText(label, x, height - 10);
        });

    }, [tradeData, targetRate]);

    // Calculate price change
    const priceChange = tradeData.length >= 2
        ? ((tradeData[tradeData.length - 1].close - tradeData[0].close) / tradeData[0].close) * 100
        : 0;

    return (
        <Card className="bg-pb-bg-tertiary/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <svg className="w-5 h-5 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        Market Rate
                        <span className="text-xs font-normal text-pb-status-success bg-pb-status-success/10 px-2 py-0.5 rounded-full">
                            Live
                        </span>
                    </CardTitle>
                    <div className="flex gap-1">
                        {(['1H', '1D', '1W'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-2 py-1 text-xs rounded ${timeRange === range
                                    ? 'bg-pb-accent-primary text-white'
                                    : 'bg-pb-bg-primary text-pb-text-muted hover:text-pb-text-primary'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-pb-accent-primary border-t-transparent rounded-full" />
                    </div>
                ) : error || tradeData.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-center">
                        <svg className="w-10 h-10 text-pb-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm text-pb-text-muted">No trading history</p>
                        <p className="text-xs text-pb-text-muted mt-1">This pair has no trades on testnet</p>
                    </div>
                ) : (
                    <>
                        {/* Price Header */}
                        <div className="mb-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold font-mono text-pb-text-primary">
                                    {currentRate?.toFixed(4)}
                                </span>
                                <span className="text-sm text-pb-text-muted">
                                    {destCurrency.code}/{sourceCurrency.code}
                                </span>
                                <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-pb-status-success' : 'text-pb-status-error'}`}>
                                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        {/* Chart */}
                        <canvas
                            ref={canvasRef}
                            className="w-full h-48"
                            style={{ width: '100%', height: '192px' }}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
