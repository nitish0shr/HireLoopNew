const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    location?: string;
    skills: string[];
    experience: string;
    education: string;
    years_of_experience?: number;
    stage: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
    fit_score: number;
    fit_score_breakdown?: {
        skills: number;
        experience: number;
        education: number;
    };
    resume_text?: string;
    source?: string;
    created_at?: string;
    updated_at?: string;
}

const getCandidates = async (): Promise<Candidate[]> => {
    const response = await fetch(`${API_BASE_URL}/candidates`);
    if (!response.ok) throw new Error('Failed to fetch candidates');
    return response.json();
};

const getCandidate = async (id: string): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`);
    if (!response.ok) throw new Error('Failed to fetch candidate');
    return response.json();
};

const uploadResume = async (file: File, jobId?: string): Promise<Candidate> => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobId) {
        formData.append('jobId', jobId);
    }

    const response = await fetch(`${API_BASE_URL}/candidates/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload resume');
    return response.json();
};

const updateCandidate = async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update candidate');
    return response.json();
};

const recalculateFitScore = async (candidateId: string): Promise<Candidate> => {
    // For now, just update with current score
    const candidate = await getCandidate(candidateId);
    return candidate;
};

export const candidatesService = {
    getCandidates,
    getCandidate,
    uploadResume,
    updateCandidate,
    recalculateFitScore,
};
