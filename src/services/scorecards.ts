const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Scorecard {
    id: string;
    candidate_id: string;
    job_id: string;
    interviewer_id?: string;
    stage: string;
    scores: Record<string, number>;
    feedback: string;
    created_at: string;
}

const getScorecards = async (candidateId: string): Promise<Scorecard[]> => {
    const response = await fetch(`${API_BASE_URL}/scorecards/${candidateId}`);
    if (!response.ok) throw new Error('Failed to fetch scorecards');
    const data = await response.json();
    // Parse scores from JSON string
    return data.map((sc: any) => ({
        ...sc,
        scores: typeof sc.scores === 'string' ? JSON.parse(sc.scores) : sc.scores
    }));
};

const createScorecard = async (scorecard: Omit<Scorecard, 'id' | 'created_at'>): Promise<Scorecard> => {
    const response = await fetch(`${API_BASE_URL}/scorecards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scorecard),
    });
    if (!response.ok) throw new Error('Failed to create scorecard');
    return response.json();
};

export const scorecardsService = {
    getScorecards,
    createScorecard,
};
