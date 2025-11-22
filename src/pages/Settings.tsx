import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { showSuccess, showError } from '../lib/toast';
import { FadeIn } from '../components/ui/Animations';
import { settingsService } from '../services/settings';

export default function Settings() {
    const [settings, setSettings] = useState({
        company_name: 'Acme Corp',
        website: 'https://acme.com',
        auto_reject_threshold: 'Disabled',
        email_notifications: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            if (data && Object.keys(data).length > 0) {
                setSettings({
                    company_name: data.company_name || 'Acme Corp',
                    website: data.website || 'https://acme.com',
                    auto_reject_threshold: data.auto_reject_threshold || 'Disabled',
                    email_notifications: data.email_notifications
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await settingsService.saveSettings(settings);
            showSuccess('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showError('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <FadeIn>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500">Manage your organization and preferences.</p>
                </div>
            </FadeIn>

            <div className="grid gap-6">
                {/* Organization Settings */}
                <FadeIn delay={100}>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-medium text-slate-900">Organization Profile</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Company Name</label>
                                <input
                                    type="text"
                                    value={settings.company_name}
                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Website</label>
                                <input
                                    type="url"
                                    value={settings.website}
                                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Hiring Preferences */}
                <FadeIn delay={200}>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-medium text-slate-900">Hiring Preferences</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Auto-Reject Threshold</h3>
                                    <p className="text-xs text-slate-500">Automatically reject candidates below this fit score.</p>
                                </div>
                                <select
                                    value={settings.auto_reject_threshold}
                                    onChange={(e) => setSettings({ ...settings, auto_reject_threshold: e.target.value })}
                                    className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500"
                                >
                                    <option>Disabled</option>
                                    <option>Below 50%</option>
                                    <option>Below 60%</option>
                                    <option>Below 70%</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                                    <p className="text-xs text-slate-500">Receive daily digest of pipeline activity.</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={settings.email_notifications}
                                        onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                                    />
                                    <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={300}>
                    <div className="flex justify-end">
                        <button
                            onClick={saveSettings}
                            disabled={loading}
                            className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md active:scale-95"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
