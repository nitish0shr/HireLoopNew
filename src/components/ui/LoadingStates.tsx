import { ReactNode } from 'react';

// Shimmer Skeleton with animated gradient
export function ShimmerSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`skeleton-shimmer rounded ${className}`}></div>
    );
}

// Card Skeleton for job/candidate cards
export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-fade-in rounded-xl border bg-white p-6 shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                            <ShimmerSkeleton className="h-5 w-2/3" />
                            <ShimmerSkeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 pt-2">
                                <ShimmerSkeleton className="h-6 w-16" />
                                <ShimmerSkeleton className="h-6 w-20" />
                            </div>
                        </div>
                        <ShimmerSkeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Table Skeleton for data tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b">
                <ShimmerSkeleton className="h-4 w-1/4" />
                <ShimmerSkeleton className="h-4 w-1/4" />
                <ShimmerSkeleton className="h-4 w-1/4" />
                <ShimmerSkeleton className="h-4 w-1/4" />
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <ShimmerSkeleton className="h-4 w-1/4" />
                    <ShimmerSkeleton className="h-4 w-1/4" />
                    <ShimmerSkeleton className="h-4 w-1/4" />
                    <ShimmerSkeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
    );
}

// Chart Skeleton for analytics
export function ChartSkeleton() {
    return (
        <div className="space-y-4 p-4">
            <div className="flex items-end justify-between h-48 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <ShimmerSkeleton
                        key={i}
                        className="w-full animate-slide-up"
                        style={{
                            height: `${Math.random() * 60 + 40}%`,
                            animationDelay: `${i * 100}ms`
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-center gap-6 pt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <ShimmerSkeleton className="h-3 w-3 rounded-full" />
                        <ShimmerSkeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Stats Card Skeleton
export function StatsCardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-white p-6 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-4">
                        <ShimmerSkeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <ShimmerSkeleton className="h-8 w-20" />
                            <ShimmerSkeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Legacy support - basic skeleton
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return <CardSkeleton count={count} />;
}

// Enhanced Empty State with animation
export function EmptyState({
    icon: Icon,
    title,
    description,
    action
}: {
    icon: any;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-6 mb-4 transition-transform duration-300 hover:scale-110">
                <Icon className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white 
                             transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

// Loading Spinner with text
export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mb-4"></div>
            <p className="text-sm text-slate-500">{text}</p>
        </div>
    );
}
