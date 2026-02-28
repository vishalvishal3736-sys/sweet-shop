'use client';

import { useState, useEffect } from 'react';

// Balloon configs — only rendered if device can handle them
const BALLOONS = [
    { color: '#fecdd3', left: '8%', size: 28, duration: '18s', delay: '0s', opacity: 0.45 },
    { color: '#bfdbfe', left: '25%', size: 22, duration: '22s', delay: '3s', opacity: 0.35 },
    { color: '#fde68a', left: '45%', size: 30, duration: '20s', delay: '1s', opacity: 0.4 },
    { color: '#c4b5fd', left: '65%', size: 24, duration: '25s', delay: '5s', opacity: 0.35 },
    { color: '#fbcfe8', left: '85%', size: 26, duration: '19s', delay: '2s', opacity: 0.4 },
];

/**
 * Detects whether the device is low-end based on:
 * 1. CPU cores (navigator.hardwareConcurrency)
 * 2. Device memory (navigator.deviceMemory)
 * 3. Network speed (navigator.connection.effectiveType)
 * 4. Prefers-reduced-motion media query
 * 
 * Returns true if animations should be skipped.
 */
function isLowEndDevice(): boolean {
    if (typeof window === 'undefined') return false;

    // Respect user preference for reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return true;
    }

    // Check CPU cores (low-end = 2 or fewer)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
        return true;
    }

    // Check device memory (low-end = 2GB or less)
    // @ts-expect-error — deviceMemory is not in all TS definitions
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
        return true;
    }

    // Check network (slow connection = skip non-essential animations)
    // @ts-expect-error — connection is not in all TS definitions
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)) {
        return true;
    }

    return false;
}

export default function BalloonBackground() {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Only render balloons if device is capable
        if (!isLowEndDevice()) {
            const timeoutId = setTimeout(() => setShouldRender(true), 0);
            return () => clearTimeout(timeoutId);
        }
    }, []);

    // Don't render anything on low-end devices or during SSR
    if (!shouldRender) return null;

    return (
        <div
            aria-hidden="true"
            className="balloon-container"
        >
            {BALLOONS.map((b, i) => (
                <div
                    key={i}
                    className="balloon"
                    style={{
                        left: b.left,
                        width: b.size,
                        height: b.size * 1.2,
                        opacity: b.opacity,
                        animationDuration: b.duration,
                        animationDelay: b.delay,
                        background: b.color,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    }}
                >
                    {/* Balloon string */}
                    <div className="balloon-string" />
                </div>
            ))}
        </div>
    );
}
