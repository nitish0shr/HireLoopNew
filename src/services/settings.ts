const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Settings {
    id?: string;
    company_name: string;
    website: string;
    auto_reject_threshold: string;
    email_notifications: boolean;
    updated_at?: string;
}

const getSettings = async (): Promise<Settings> => {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
};

const saveSettings = async (settings: Settings): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to save settings');
};

export const settingsService = {
    getSettings,
    saveSettings,
};
