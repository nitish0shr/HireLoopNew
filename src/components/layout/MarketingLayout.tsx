import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { BookDemoModal } from '../modals/BookDemoModal';

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [demoModalOpen, setDemoModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b bg-white sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                HireLoop
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            <Link to="/product" className="text-sm font-medium text-slate-700 hover:text-primary-600">
                                Product
                            </Link>
                            <Link to="/solutions" className="text-sm font-medium text-slate-700 hover:text-primary-600">
                                Solutions
                            </Link>
                            <Link to="/pricing" className="text-sm font-medium text-slate-700 hover:text-primary-600">
                                Pricing
                            </Link>
                            <Link to="/contact" className="text-sm font-medium text-slate-700 hover:text-primary-600">
                                Contact
                            </Link>
                            <button
                                onClick={() => setDemoModalOpen(true)}
                                className="text-sm font-medium text-slate-700 hover:text-primary-600"
                            >
                                Book a Demo
                            </button>
                            <Link
                                to="/dashboard"
                                className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden rounded-md p-2 text-slate-700 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            <Link
                                to="/product"
                                className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Product
                            </Link>
                            <Link
                                to="/solutions"
                                className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Solutions
                            </Link>
                            <Link
                                to="/pricing"
                                className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Pricing
                            </Link>
                            <Link
                                to="/contact"
                                className="block rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Contact
                            </Link>
                            <button className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100">
                                Book a Demo
                            </button>
                            <Link
                                to="/dashboard"
                                className="block rounded-md bg-gradient-primary px-3 py-2 text-base font-medium text-white text-center"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        {/* Brand */}
                        <div>
                            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                HireLoop
                            </span>
                            <p className="mt-4 text-sm text-slate-600">
                                Hire smarter. Work simpler.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <Link to="/product" className="text-sm text-slate-600 hover:text-primary-600">
                                        How It Works
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/solutions" className="text-sm text-slate-600 hover:text-primary-600">
                                        Solutions
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pricing" className="text-sm text-slate-600 hover:text-primary-600">
                                        Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <Link to="/contact" className="text-sm text-slate-600 hover:text-primary-600">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-slate-600 hover:text-primary-600">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-slate-600 hover:text-primary-600">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
                            <ul className="mt-4 space-y-2">
                                <li className="text-sm text-slate-600">hello@hireloop.ai</li>
                                <li className="text-sm text-slate-600">1-800-HIRELOOP</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-8">
                        <p className="text-center text-sm text-slate-500">
                            © {new Date().getFullYear()} HireLoop. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Book Demo Modal */}
            <BookDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
        </div>
    );
}
