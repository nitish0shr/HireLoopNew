const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    status: 'draft' | 'published' | 'closed';
    description: string;
    requirements: string[];
    responsibilities: string[];
    candidates_count?: number;
    created_at?: string;
    updated_at?: string;
    deal_breakers?: string; // JSON string
    auto_sourcing_enabled?: boolean;
    sourcing_threshold?: number;
}

export interface ParsedJobDescription {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
}

const getJobs = async (): Promise<Job[]> => {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
};

const getJob = async (id: string): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
};

const createJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
};

const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
};

const parseJobDescription = async (jobText: string): Promise<ParsedJobDescription> => {
    const response = await fetch(`${API_BASE_URL}/jobs/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobText }),
    });
    if (!response.ok) throw new Error('Failed to parse job description');
    return response.json();
};

export const jobsService = {
    getJobs,
    getJob,
    createJob,
    updateJob,
    parseJobDescription,
};
