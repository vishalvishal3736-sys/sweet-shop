// app/twitter-image.tsx
// Generates the same OG image for Twitter card previews

import { ImageResponse } from 'next/og';
import { SHOP_CONFIG } from '@/lib/config';

export const alt = `${SHOP_CONFIG.name} — Fresh Indian Sweets Online`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
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
                }}
            >
                <div style={{ width: 80, height: 4, background: '#fbbf24', borderRadius: 2, marginBottom: 24, display: 'flex' }} />
                <div style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', letterSpacing: '-2px', display: 'flex' }}>
                    {SHOP_CONFIG.name}
                </div>
                <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', marginTop: 16, fontWeight: 500, display: 'flex' }}>
                    Fresh and Authentic Indian Sweets
                </div>
                <div style={{ marginTop: 40, background: '#25D366', color: '#fff', fontSize: 22, fontWeight: 700, padding: '14px 36px', borderRadius: 14, display: 'flex' }}>
                    Order via WhatsApp
                </div>
            </div>
        ),
        { ...size }
    );
}
