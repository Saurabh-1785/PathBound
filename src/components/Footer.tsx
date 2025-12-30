export default function Footer() {
    return (
        <footer className="border-t border-pb-border-subtle bg-pb-bg-primary">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left - Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pb-accent-primary to-pb-accent-secondary flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-sm text-pb-text-secondary">
                            Built on <span className="text-pb-text-primary text-white font-medium">Stellar</span>
                        </span>
                    </div>

                    {/* Center - Links */}
                    <div className="flex items-center gap-6 text-sm ">
                        <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-pb-text-muted hover:text-pb-text-primary text-white transition-colors">
                            Stellar
                        </a>
                        <a href="https://horizon.stellar.org" target="_blank" rel="noopener noreferrer" className="text-pb-text-muted hover:text-pb-text-primary text-white transition-colors">
                            Horizon API
                        </a>
                        <a href="https://laboratory.stellar.org" target="_blank" rel="noopener noreferrer" className="text-pb-text-muted text-white hover:text-pb-text-primary transition-colors">
                            Stellar Lab
                        </a>
                    </div>

                    {/* Right - Copyright */}
                    <div className="text-sm text-pb-text-muted text-white">
                        © 2025 PathBound. Non-custodial.
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 pt-6 border-t border-pb-border-subtle">
                    <p className="text-xs text-pb-text-muted text-center">
                        PathBound is a non-custodial application. All transactions are signed by your wallet and executed on the Stellar network.
                        We never hold your funds. Expired transactions are automatically rejected—your funds remain safe.
                    </p>
                </div>
            </div>
        </footer>
    );
}
