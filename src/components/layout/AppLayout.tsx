import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageTransition } from '../ui/Animations';

export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden flex items-center p-4 bg-white border-b">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-2 font-bold text-slate-900">HireLoop</span>
                </div>

                <div className="hidden lg:block">
                    <Header />
                </div>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </main>
            </div>
        </div>
    );
}
