import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import Button from './ui/Button';
import { formatPublicKey } from '../services/stellar';

export default function Header() {
    const location = useLocation();
    const {
        publicKey,
        isConnected,
        isLoading,
        connect,
        disconnect,
        network,
        error
    } = useWallet();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyAddress = () => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey);
            setIsDropdownOpen(false);
        }
    };

    const handleViewOnExplorer = () => {
        if (publicKey) {
            window.open(`https://stellar.expert/explorer/testnet/account/${publicKey}`, '_blank');
            setIsDropdownOpen(false);
        }
    };

    const handleLogout = () => {
        setIsDropdownOpen(false);
        disconnect();
    };

    return (
        <header className="sticky top-0 z-50 bg-pb-bg-primary/80 backdrop-blur-md border-b border-pb-border-subtle">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pb-accent-primary to-pb-accent-secondary flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-pb-text-primary">PathBound</span>
                        <span className="hidden sm:block text-xs text-pb-text-muted">Limit orders for remittances</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <Link
                        to="/"
                        className={`text-sm font-medium transition-colors duration-200 ${location.pathname === '/' ? 'text-pb-accent-primary' : 'text-pb-text-secondary hover:text-pb-text-primary'}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/create"
                        className={`text-sm font-medium transition-colors duration-200 ${location.pathname === '/create' ? 'text-pb-accent-primary' : 'text-pb-text-secondary hover:text-pb-text-primary'}`}
                    >
                        Create Intent
                    </Link>
                    <Link
                        to="/history"
                        className={`text-sm font-medium transition-colors duration-200 ${location.pathname === '/history' ? 'text-pb-accent-primary' : 'text-pb-text-secondary hover:text-pb-text-primary'}`}
                    >
                        History
                    </Link>

                    {/* Wallet Connection Button */}
                    {isConnected && publicKey ? (
                        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                            {/* Network Badge */}
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-pb-status-success/15 text-pb-status-success text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-pb-status-success animate-pulse" />
                                {network === 'TESTNET' ? 'Testnet' : network}
                            </span>

                            {/* Address Display - Now toggles dropdown */}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pb-bg-tertiary border border-pb-border-default hover:border-pb-accent-primary transition-colors group"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pb-accent-primary to-pb-accent-secondary flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <span className="font-mono text-sm text-pb-text-primary">
                                    {formatPublicKey(publicKey)}
                                </span>
                                <svg className={`w-4 h-4 text-pb-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-pb-bg-secondary border border-pb-border-default rounded-lg shadow-xl overflow-hidden z-50">
                                    {/* Profile Section */}
                                    <div className="px-4 py-3 border-b border-pb-border-subtle">
                                        <p className="text-xs text-pb-text-muted">Connected as</p>
                                        <p className="font-mono text-sm text-pb-text-primary truncate" title={publicKey}>
                                            {publicKey.slice(0, 12)}...{publicKey.slice(-8)}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <button
                                            onClick={handleCopyAddress}
                                            className="w-full px-4 py-2 text-left text-sm text-pb-text-secondary hover:text-pb-text-primary hover:bg-pb-bg-tertiary flex items-center gap-3 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy Address
                                        </button>

                                        <button
                                            onClick={handleViewOnExplorer}
                                            className="w-full px-4 py-2 text-left text-sm text-pb-text-secondary hover:text-pb-text-primary hover:bg-pb-bg-tertiary flex items-center gap-3 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View on Explorer
                                        </button>

                                        <Link
                                            to="/history"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full px-4 py-2 text-left text-sm text-pb-text-secondary hover:text-pb-text-primary hover:bg-pb-bg-tertiary flex items-center gap-3 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Transaction History
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-pb-border-subtle py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-pb-status-error hover:bg-pb-status-error/10 flex items-center gap-3 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Disconnect Wallet
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={connect}
                                isLoading={isLoading}
                            >
                                {isLoading ? (
                                    'Connecting...'
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path d="M9 12l2 2 4-4" />
                                        </svg>
                                        Connect Wallet
                                    </>
                                )}
                            </Button>
                            {error && (
                                <span className="text-xs text-pb-status-error mt-1 max-w-[200px] text-right" title={error}>
                                    {error.length > 40 ? error.slice(0, 40) + '...' : error}
                                </span>
                            )}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
