'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SHOP_CONFIG } from '@/lib/config';
import toast from 'react-hot-toast';

// Regex: country code (1-3 digits) + number (7-12 digits), no spaces/dashes/plus
const WHATSAPP_REGEX = /^\d{10,15}$/;

export default function AdminSettings() {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

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

    function validateNumber(value: string) {
        if (!value.trim()) {
            setValidationError('WhatsApp number is required.');
            return false;
        }
        if (!WHATSAPP_REGEX.test(value.trim())) {
            setValidationError('Enter digits only (10–15 characters). Include country code, no spaces or "+".');
            return false;
        }
        setValidationError(null);
        return true;
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();

        if (!validateNumber(whatsappNumber)) return;

        setSaving(true);
        setSuccess(false);

        const { error } = await supabase
            .from('shop_settings')
            .upsert({ id: 1, whatsapp_number: whatsappNumber.trim() });

        setSaving(false);
        if (error) {
            toast.error('Error saving settings: ' + error.message);
        } else {
            setSuccess(true);
            toast.success('Settings saved!');
            setTimeout(() => setSuccess(false), 3000);
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="max-w-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Shop Settings</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="skeleton h-5 w-48 mb-2"></div>
                    <div className="skeleton h-10 w-full"></div>
                    <div className="skeleton h-10 w-full"></div>
                </div>
            </div>
        );
    }

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
                            onChange={(e) => {
                                setWhatsappNumber(e.target.value);
                                if (validationError) validateNumber(e.target.value);
                            }}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${validationError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`}
                            placeholder="e.g. 919876543210"
                            required
                        />
                    </div>
                    {validationError ? (
                        <p className="text-xs text-red-500 mt-2 font-medium">{validationError}</p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-2">
                            Include country code (e.g., 91 for India) without the + sign.
                        </p>
                    )}
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
