import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AIStatusBadge } from '../ui/AIStatusBadge';

export function Header() {
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search candidates, jobs..."
                        className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <AIStatusBadge />
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{user?.email || 'User'}</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
