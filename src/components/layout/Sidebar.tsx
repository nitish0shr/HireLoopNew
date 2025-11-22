import { Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Star, Zap, Mail, Calendar, FileText, BarChart3, Settings as SettingsIcon, LogOut, X, Plug } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { signOut } = useAuth();
    const path = window.location.pathname;

    const isActive = (href: string) => path === href || path.startsWith(href + '/');

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/dashboard/jobs', icon: Briefcase, label: 'Jobs' },
        { href: '/dashboard/candidates', icon: Users, label: 'Candidates' },
        { href: '/dashboard/shortlisted', icon: Star, label: 'Shortlisted' },
        { href: '/dashboard/auto-sourcing', icon: Zap, label: 'Auto-Sourcing' },
        { href: '/dashboard/outreach', icon: Mail, label: 'Outreach' },
        { href: '/dashboard/scheduling', icon: Calendar, label: 'Scheduling' },
        { href: '/dashboard/prep-pack', icon: FileText, label: 'Prep Pack' },
        { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
        { href: '/dashboard/integrations', icon: Plug, label: 'Integrations' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`flex h-screen w-64 flex-col border-r bg-slate-900 text-white fixed lg:static z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
                    <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        HireLoop
                    </Link>
                    {isOpen && onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href)
                                ? 'bg-gradient-primary text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-slate-800 p-3">
                    <Link
                        to="/dashboard/settings"
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/settings')
                            ? 'bg-gradient-primary text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <SettingsIcon className="h-5 w-5" />
                        Settings
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}
