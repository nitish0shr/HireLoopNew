const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string;
    created_at?: string;
}

const getTemplates = async (): Promise<Template[]> => {
    const response = await fetch(`${API_BASE_URL}/templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
};

const createTemplate = async (template: Omit<Template, 'id' | 'created_at'>): Promise<Template> => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
};

const updateTemplate = async (id: string, template: Partial<Template>): Promise<Template> => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
};

const deleteTemplate = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete template');
};

export const templatesService = {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
};
