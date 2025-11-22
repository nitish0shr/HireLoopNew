import { ReactNode } from 'react';

interface InteractiveCardProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    badge?: {
        text: string;
        color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    };
    isLoading?: boolean;
}

const badgeColors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
};

export function InteractiveCard({
    children,
    onClick,
    className = '',
    badge,
    isLoading = false
}: InteractiveCardProps) {
    const baseClasses = `
        rounded-xl border border-slate-200 bg-white p-6 shadow-sm
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:translate-y-0' : ''}
        ${className}
    `;

    if (isLoading) {
        return (
            <div className={baseClasses}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div onClick={onClick} className={baseClasses}>
            {badge && (
                <span className={`
                    absolute top-4 right-4 
                    px-2.5 py-1 rounded-full text-xs font-medium
                    ${badgeColors[badge.color || 'blue']}
                `}>
                    {badge.text}
                </span>
            )}
            {children}
        </div>
    );
}
