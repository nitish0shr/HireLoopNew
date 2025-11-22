import { isMockMode } from '../lib/supabase';

export type DashboardMetrics = {
    totalCandidates: number;
    activeJobs: number;
    avgTimeToHire: number;
    pipelineHealth: number;
    recentActivity: {
        id: string;
        type: 'application' | 'interview' | 'offer';
        description: string;
        timestamp: string;
    }[];
};

export const analyticsService = {
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        if (isMockMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        totalCandidates: 142,
                        activeJobs: 8,
                        avgTimeToHire: 18,
                        pipelineHealth: 92,
                        recentActivity: [
                            {
                                id: 'act-1',
                                type: 'application',
                                description: 'Alice Johnson applied for Senior Frontend Engineer',
                                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
                            },
                            {
                                id: 'act-2',
                                type: 'interview',
                                description: 'Bob Smith completed Technical Screen',
                                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                            },
                            {
                                id: 'act-3',
                                type: 'offer',
                                description: 'Offer sent to Charlie Brown',
                                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                            },
                        ],
                    });
                }, 800);
            });
        }

        // Real implementation would fetch from Supabase
        return {
            totalCandidates: 0,
            activeJobs: 0,
            avgTimeToHire: 0,
            pipelineHealth: 0,
            recentActivity: [],
        };
    }
};
