'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';

export default function AdminSettings() {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const { data } = await supabase
                .from('shop_settings')
                .select('whatsapp_number')
                .eq('id', 1)
                .single();

            if (data) {
                setWhatsappNumber(data.whatsapp_number);
            }
            setLoading(false);
        }
        fetchSettings();
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const { error } = await supabase
            .from('shop_settings')
            .upsert({ id: 1, whatsapp_number: whatsappNumber });

        setSaving(false);
        if (error) {
            alert('Error saving settings: ' + error.message);
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    }

    if (loading) return <div className="text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Shop Settings</h2>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number for Orders
                    </label>
                    <div className="flex gap-2 items-center">
                        <span className="text-gray-500 bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg">wa.me/</span>
                        <input
                            id="whatsapp"
                            type="text"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g. 919876543210"
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Include country code (e.g., 91 for India) without the + sign.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2 text-white font-bold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: SHOP_CONFIG.themeColor }}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>

                {success && (
                    <p className="text-green-600 text-sm text-center font-medium mt-2">
                        Settings saved successfully!
                    </p>
                )}
            </form>
        </div>
    );
}
