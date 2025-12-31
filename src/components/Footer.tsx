import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="relative z-20 border-t border-pb-border-subtle bg-pb-bg-primary">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pb-accent-primary to-pb-accent-secondary flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-pb-text-primary">PathBound</span>
                        </div>
                        <p className="text-sm text-pb-text-muted mb-4">
                            Rate-protected currency exchange built on Stellar. Non-custodial, time-bounded, and fully transparent.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-pb-accent-primary/10 text-xs text-pb-accent-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-pb-status-success animate-pulse"></span>
                                Testnet
                            </span>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-pb-text-primary mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/create" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    Create Intent
                                </Link>
                            </li>
                            <li>
                                <Link to="/history" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    Transaction History
                                </Link>
                            </li>
                            <li>
                                <a href="#how-it-works" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    How It Works
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-pb-text-primary mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    Stellar.org
                                </a>
                            </li>
                            <li>
                                <a href="https://developers.stellar.org" target="_blank" rel="noopener noreferrer" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    Stellar Docs
                                </a>
                            </li>
                            <li>
                                <a href="https://laboratory.stellar.org" target="_blank" rel="noopener noreferrer" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    Stellar Lab
                                </a>
                            </li>
                            <li>
                                <a href="https://stellar.expert" target="_blank" rel="noopener noreferrer" className="text-sm text-pb-text-muted hover:text-pb-accent-primary transition-colors">
                                    Stellar Expert
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-pb-text-primary mb-4">Connect</h4>
                        <div className="flex items-center gap-3">
                            {/* GitHub */}
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-pb-bg-tertiary border border-pb-border-subtle flex items-center justify-center text-pb-text-muted hover:text-pb-accent-primary hover:border-pb-accent-primary/50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                            </a>
                            {/* Twitter/X */}
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-pb-bg-tertiary border border-pb-border-subtle flex items-center justify-center text-pb-text-muted hover:text-pb-accent-primary hover:border-pb-accent-primary/50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            {/* Discord */}
                            <a
                                href="https://discord.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-pb-bg-tertiary border border-pb-border-subtle flex items-center justify-center text-pb-text-muted hover:text-pb-accent-primary hover:border-pb-accent-primary/50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-pb-border-subtle">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-pb-text-muted">
                            © 2025 PathBound. Built with ❤️ for the Stellar ecosystem.
                        </p>
                        <p className="text-xs text-pb-text-muted text-center md:text-right max-w-xl">
                            PathBound is non-custodial. All transactions are signed by your wallet and executed on Stellar.
                            We never hold your funds. Expired transactions are automatically rejected—your funds remain safe.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
