// app/opengraph-image.tsx
// Dynamically generates the OG image at build time using Next.js ImageResponse
// This image appears in WhatsApp, Facebook, Twitter, etc. link previews

import { ImageResponse } from 'next/og';
import { SHOP_CONFIG } from '@/lib/config';

export const alt = `${SHOP_CONFIG.name} — Fresh Indian Sweets Online`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative corner circles */}
                <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }} />

                {/* Gold accent line */}
                <div style={{ width: 80, height: 4, background: '#fbbf24', borderRadius: 2, marginBottom: 24, display: 'flex' }} />

                {/* Shop name */}
                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 900,
                        color: '#ffffff',
                        letterSpacing: '-2px',
                        lineHeight: 1.1,
                        textAlign: 'center',
                        display: 'flex',
                    }}
                >
                    {SHOP_CONFIG.name}
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontSize: 28,
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginTop: 16,
                        fontWeight: 500,
                        display: 'flex',
                    }}
                >
                    Fresh and Authentic Indian Sweets
                </div>

                {/* CTA */}
                <div
                    style={{
                        marginTop: 40,
                        background: '#25D366',
                        color: '#fff',
                        fontSize: 22,
                        fontWeight: 700,
                        padding: '14px 36px',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    Order via WhatsApp
                </div>

                {/* Bottom accent */}
                <div style={{ position: 'absolute', bottom: 30, fontSize: 16, color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
                    Browse - Add to Cart - Checkout Instantly
                </div>
            </div>
        ),
        { ...size }
    );
}
