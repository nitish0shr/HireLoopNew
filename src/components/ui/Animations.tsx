import { ReactNode } from 'react';

// Fade In animation wrapper
export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

// Slide Up animation wrapper
export function SlideUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

// Staggered List - animates children with incremental delay
export function StaggeredList({ children, staggerDelay = 100 }: { children: ReactNode[]; staggerDelay?: number }) {
    return (
        <>
            {children.map((child, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * staggerDelay}ms` }}>
                    {child}
                </div>
            ))}
        </>
    );
}

// Scale on Hover wrapper
export function ScaleOnHover({ children, scale = 1.05 }: { children: ReactNode; scale?: number }) {
    return (
        <div className="transition-transform duration-200 active:scale-95" style={{ '--hover-scale': scale } as any}
            onMouseEnter={(e) => e.currentTarget.style.transform = `scale(${scale})`}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            {children}
        </div>
    );
}

// Page Transition wrapper for route changes
export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <div className="animate-fade-in">
            {children}
        </div>
    );
}

// Pulse Indicator for live data
export function PulseIndicator({ className = '' }: { className?: string }) {
    return (
        <span className={`relative flex h-3 w-3 ${className}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
    );
}
