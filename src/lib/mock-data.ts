export const MOCK_USER = {
    id: 'mock-user-1',
    email: 'demo@hireloop.ai',
    full_name: 'Demo Recruiter',
    role: 'recruiter',
    org_id: 'org-1',
};

export const MOCK_JOBS = [
    {
        id: 'job-1',
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        status: 'published',
        created_at: new Date().toISOString(),
        candidates_count: 12,
    },
    {
        id: 'job-2',
        title: 'Product Manager',
        department: 'Product',
        location: 'San Francisco, CA',
        type: 'Full-time',
        status: 'draft',
        created_at: new Date().toISOString(),
        candidates_count: 0,
    },
];

export const MOCK_CANDIDATES = [
    {
        id: 'cand-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Senior Frontend Engineer',
        fit_score: 88,
        stage: 'screening',
        applied_at: new Date().toISOString(),
    },
    {
        id: 'cand-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Senior Frontend Engineer',
        fit_score: 65,
        stage: 'new',
        applied_at: new Date().toISOString(),
    },
];
