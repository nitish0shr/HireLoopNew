const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Integration {
    id: string;
    name: string;
    status: 'connected' | 'disconnected';
    config?: any;
    updated_at?: string;
}

const getIntegrations = async (): Promise<Integration[]> => {
    const response = await fetch(`${API_BASE_URL}/integrations`);
    if (!response.ok) throw new Error('Failed to fetch integrations');
    return response.json();
};

const updateIntegration = async (id: string, name: string, status: 'connected' | 'disconnected'): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, status }),
    });
    if (!response.ok) throw new Error('Failed to update integration');
};

export const integrationsService = {
    getIntegrations,
    updateIntegration,
};
