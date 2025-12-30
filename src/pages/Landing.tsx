import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

export default function Landing() {
    return (
        <div className="min-h-screen relative">
            {/* Hero Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    src="/home.png"
                    alt=""
                    className="w-full h-full object-cover object-center"
                />
                {/* Gradient overlay for smooth content blending */}
                <div className="absolute inset-0 bg-gradient-to-b from-pb-bg-primary/30 via-transparent to-pb-bg-primary" />
            </div>

            {/* Semi-transparent overlay for content readability */}
            <div className="fixed inset-0 bg-pb-bg-primary/40 z-[1] pointer-events-none" />

            {/* Main Content - above the background */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="relative py-24 px-6 overflow-hidden min-h-[80vh] flex items-center">
                    {/* Extra gradient for hero emphasis */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pb-bg-primary/40" />

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-pb-bg-secondary border border-pb-border-subtle rounded-full px-4 py-2 mb-8">
                            <span className="text-sm text-pb-text-muted">Built on</span>
                            <span className="text-sm font-medium text-pb-accent-primary">Stellar</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-pb-text-primary mb-6 leading-tight">
                            Lock Your Rate.
                            <br />
                            <span className="text-gradient">Or Do Nothing.</span>
                        </h1>

                        <p className="text-xl text-pb-text-secondary mb-8 max-w-2xl mx-auto">
                            Rate-protected currency exchange for emerging markets. Set your acceptable FX rate,
                            define a time window, and let the Stellar network execute—or safely expire.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/create">
                                <Button size="lg" className="w-full sm:w-auto">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Intent
                                </Button>
                            </Link>
                            <a href="#how-it-works">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    How It Works
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Problem Statement */}
                <section className="relative py-20 px-6">
                    <div className="absolute inset-0 bg-pb-bg-secondary/30 backdrop-blur-sm" />
                    <div className="relative max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-pb-text-primary mb-4">
                                FX Volatility Destroys Value
                            </h2>
                            <p className="text-pb-text-secondary max-w-2xl mx-auto">
                                For families sending remittances, a $10 rate swing can cost 5% of a $200 transfer.
                                Traditional solutions force you to accept market rates—or gamble on timing.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card hover className="text-center">
                                <CardContent className="py-8">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pb-status-error/15 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-pb-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-pb-text-primary mb-2">Rate Uncertainty</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        You never know what rate you'll get when converting between currencies.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card hover className="text-center">
                                <CardContent className="py-8">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pb-status-warning/15 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-pb-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-pb-text-primary mb-2">Timing Pressure</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        Markets move fast. Waiting for "the right rate" often means missing it.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card hover className="text-center">
                                <CardContent className="py-8">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pb-accent-primary/15 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-pb-text-primary mb-2">Custodial Risk</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        Traditional limit orders require trusting exchanges with your funds.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="relative py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-pb-text-primary mb-4">
                                How PathBound Works
                            </h2>
                            <p className="text-pb-text-secondary max-w-3xl mx-auto">
                                PathBound uses Stellar's native <span className="font-mono text-pb-accent-primary">path_payment_strict_receive</span> operation
                                combined with time bounds to create rate-protected exchanges. Here's exactly what happens:
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Step 1 */}
                            <Card className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pb-accent-primary to-pb-accent-secondary" />
                                <CardContent className="py-8 pl-8">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pb-accent-primary/15 flex items-center justify-center">
                                            <span className="text-xl font-bold text-pb-accent-primary">1</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-pb-text-primary mb-3">
                                                Define Your Exchange Intent
                                            </h3>
                                            <p className="text-pb-text-secondary mb-4">
                                                You specify the exact terms of your currency exchange. This creates a "conditional order" that will only execute if the market meets your requirements.
                                            </p>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-pb-bg-tertiary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-pb-text-primary mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        What You Set
                                                    </h4>
                                                    <ul className="text-sm text-pb-text-secondary space-y-1">
                                                        <li>• <strong>Amount:</strong> How much you want to convert</li>
                                                        <li>• <strong>Currency Pair:</strong> From → To (e.g., XLM → USDC)</li>
                                                        <li>• <strong>Minimum Rate:</strong> Your price protection threshold</li>
                                                        <li>• <strong>Time Window:</strong> How long to wait (1h to 7 days)</li>
                                                    </ul>
                                                </div>
                                                <div className="bg-pb-bg-primary rounded-lg p-4 border border-pb-border-subtle">
                                                    <h4 className="text-sm font-semibold text-pb-text-muted mb-2">Example Intent</h4>
                                                    <div className="font-mono text-xs space-y-1">
                                                        <div className="text-pb-text-secondary">Convert: <span className="text-pb-accent-primary">1,000 XLM</span></div>
                                                        <div className="text-pb-text-secondary">To: <span className="text-pb-accent-primary">USDC</span></div>
                                                        <div className="text-pb-text-secondary">Min Rate: <span className="text-pb-status-success">≥ 0.12 USDC/XLM</span></div>
                                                        <div className="text-pb-text-secondary">Expires: <span className="text-pb-status-warning">24 hours</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-pb-text-muted bg-pb-bg-secondary/50 rounded-lg p-3">
                                                💡 <strong>Why this matters:</strong> Traditional exchanges force you to accept whatever rate is available.
                                                With PathBound, you set the rules—your funds only move if the market meets your conditions.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Step 2 */}
                            <Card className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pb-accent-primary to-pb-accent-secondary" />
                                <CardContent className="py-8 pl-8">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pb-accent-primary/15 flex items-center justify-center">
                                            <span className="text-xl font-bold text-pb-accent-primary">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-pb-text-primary mb-3">
                                                Review & Sign the Transaction
                                            </h3>
                                            <p className="text-pb-text-secondary mb-4">
                                                PathBound constructs a Stellar transaction with your exact parameters. You review the details and sign it with your wallet.
                                                <strong className="text-pb-text-primary"> We never hold your private keys or funds.</strong>
                                            </p>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-pb-bg-tertiary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-pb-text-primary mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-pb-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Transaction Contains
                                                    </h4>
                                                    <ul className="text-sm text-pb-text-secondary space-y-1">
                                                        <li>• <code className="text-pb-accent-primary text-xs">path_payment_strict_receive</code> operation</li>
                                                        <li>• <strong>Send Max:</strong> Maximum you'll spend</li>
                                                        <li>• <strong>Destination Amount:</strong> What you'll receive</li>
                                                        <li>• <strong>Time Bounds:</strong> Valid until your expiry time</li>
                                                    </ul>
                                                </div>
                                                <div className="bg-pb-bg-primary rounded-lg p-4 border border-pb-border-subtle">
                                                    <h4 className="text-sm font-semibold text-pb-text-muted mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        Security Guarantees
                                                    </h4>
                                                    <ul className="text-sm text-pb-text-secondary space-y-1">
                                                        <li>✓ You sign with your own wallet</li>
                                                        <li>✓ Transaction details are transparent</li>
                                                        <li>✓ No custody of your funds</li>
                                                        <li>✓ Rate is enforced by Stellar protocol</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <p className="text-xs text-pb-text-muted bg-pb-bg-secondary/50 rounded-lg p-3">
                                                🔐 <strong>How signing works:</strong> Your wallet (like Freighter) holds your private key.
                                                When you click "Sign," your wallet creates a cryptographic signature that authorizes this specific transaction.
                                                PathBound never sees your private key.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Step 3 */}
                            <Card className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pb-accent-primary to-pb-accent-secondary" />
                                <CardContent className="py-8 pl-8">
                                    <div className="flex items-start gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pb-accent-primary/15 flex items-center justify-center">
                                            <span className="text-xl font-bold text-pb-accent-primary">3</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-pb-text-primary mb-3">
                                                Network Monitors & Executes
                                            </h3>
                                            <p className="text-pb-text-secondary mb-4">
                                                Once signed, your transaction is submitted to the Stellar network. The network continuously checks if your rate conditions can be met using available liquidity from the SDEX (Stellar Decentralized Exchange).
                                            </p>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div className="bg-pb-status-success/10 border border-pb-status-success/20 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-pb-status-success mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        If Rate is Met → EXECUTED
                                                    </h4>
                                                    <ul className="text-sm text-pb-text-secondary space-y-1">
                                                        <li>• Your source currency is converted</li>
                                                        <li>• You receive the destination currency</li>
                                                        <li>• Transaction is atomic (all-or-nothing)</li>
                                                        <li>• You got your protected rate!</li>
                                                    </ul>
                                                </div>
                                                <div className="bg-pb-text-muted/10 border border-pb-text-muted/20 rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-pb-text-muted mb-2 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        If Time Expires → SAFE FAILURE
                                                    </h4>
                                                    <ul className="text-sm text-pb-text-secondary space-y-1">
                                                        <li>• Transaction becomes invalid</li>
                                                        <li>• Your funds remain untouched</li>
                                                        <li>• No fees charged (except ~0.00001 XLM)</li>
                                                        <li>• You can create a new intent</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <p className="text-xs text-pb-text-muted bg-pb-bg-secondary/50 rounded-lg p-3">
                                                ⚡ <strong>Stellar's Path Payment Magic:</strong> The network automatically finds the best route through available order books.
                                                If XLM→USDC direct rate isn't good enough, it might route XLM→EUR→USDC if that gives you a better rate—all atomic and instant.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Visual Flow Diagram */}
                        <div className="mt-12 bg-pb-bg-secondary/30 rounded-2xl p-8 border border-pb-border-subtle">
                            <h3 className="text-lg font-semibold text-pb-text-primary mb-6 text-center">The Complete Flow</h3>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-pb-bg-tertiary px-4 py-2 rounded-lg">
                                    <span className="w-6 h-6 rounded-full bg-pb-accent-primary/20 text-pb-accent-primary flex items-center justify-center text-xs font-bold">1</span>
                                    <span className="text-pb-text-secondary">Set Parameters</span>
                                </div>
                                <svg className="w-6 h-6 text-pb-text-muted hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <div className="flex items-center gap-2 bg-pb-bg-tertiary px-4 py-2 rounded-lg">
                                    <span className="w-6 h-6 rounded-full bg-pb-accent-primary/20 text-pb-accent-primary flex items-center justify-center text-xs font-bold">2</span>
                                    <span className="text-pb-text-secondary">Sign with Wallet</span>
                                </div>
                                <svg className="w-6 h-6 text-pb-text-muted hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <div className="flex items-center gap-2 bg-pb-bg-tertiary px-4 py-2 rounded-lg">
                                    <span className="w-6 h-6 rounded-full bg-pb-accent-primary/20 text-pb-accent-primary flex items-center justify-center text-xs font-bold">3</span>
                                    <span className="text-pb-text-secondary">Submit to Stellar</span>
                                </div>
                                <svg className="w-6 h-6 text-pb-text-muted hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <div className="flex items-center gap-2 bg-pb-status-success/10 border border-pb-status-success/20 px-4 py-2 rounded-lg">
                                    <svg className="w-5 h-5 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-pb-status-success font-medium">Execute or Expire</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Model */}
                <section className="relative py-20 px-6">
                    <div className="absolute inset-0 bg-pb-bg-secondary/30 backdrop-blur-sm" />
                    <div className="relative max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-pb-text-primary mb-4">
                                Why Your Funds Are Safe
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            <Card className="flex items-start gap-4 p-6">
                                <div className="w-10 h-10 rounded-lg bg-pb-status-success/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-pb-text-primary mb-1">Non-Custodial</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        Your wallet holds your funds at all times. We only construct transactions—you sign them.
                                    </p>
                                </div>
                            </Card>

                            <Card className="flex items-start gap-4 p-6">
                                <div className="w-10 h-10 rounded-lg bg-pb-status-success/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-pb-text-primary mb-1">Atomic Execution</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        Stellar's path payments execute fully or not at all. No partial fills, no stuck funds.
                                    </p>
                                </div>
                            </Card>

                            <Card className="flex items-start gap-4 p-6">
                                <div className="w-10 h-10 rounded-lg bg-pb-status-success/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-pb-text-primary mb-1">Time-Bounded Safety</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        Expired transactions are automatically rejected by the Stellar network. Expiry = safe failure.
                                    </p>
                                </div>
                            </Card>

                            <Card className="flex items-start gap-4 p-6">
                                <div className="w-10 h-10 rounded-lg bg-pb-status-success/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-pb-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-pb-text-primary mb-1">Backend Independence</h3>
                                    <p className="text-sm text-pb-text-secondary">
                                        If our servers go down, your signed transactions continue processing on the Stellar network.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-24 px-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-pb-bg-primary/50 via-transparent to-transparent" />
                    <div className="relative max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-pb-text-primary mb-6">
                            Ready to Lock Your Rate?
                        </h2>
                        <p className="text-pb-text-secondary mb-8">
                            Create your first rate-protected exchange intent. No account needed—just connect your Stellar wallet.
                        </p>
                        <Link to="/create">
                            <Button size="lg">
                                Get Started
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

