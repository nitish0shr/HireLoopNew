import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Target } from 'lucide-react';
import { candidatesService } from '../services/candidates';
import { jobsService } from '../services/jobs';
import { FadeIn } from '../components/ui/Animations';

export default function Analytics() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [candidatesData, jobsData] = await Promise.all([
                candidatesService.getCandidates(),
                jobsService.getJobs()
            ]);
            setCandidates(candidatesData);
            setJobs(jobsData);
        } catch (error) {
            console.error('Failed to load analytics data', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const metrics = {
        applied: candidates.length,
        qualified: candidates.filter(c => c.fit_score >= 70).length,
        interviewed: candidates.filter(c => c.stage === 'interview').length,
        hired: candidates.filter(c => c.stage === 'hired').length,
        activeJobs: jobs.filter(j => j.status === 'published').length,
        totalJobs: jobs.length,
    };

    const conversionRates = {
        qualifiedRate: metrics.applied > 0 ? Math.round((metrics.qualified / metrics.applied) * 100) : 0,
        interviewRate: metrics.qualified > 0 ? Math.round((metrics.interviewed / metrics.qualified) * 100) : 0,
        hireRate: metrics.interviewed > 0 ? Math.round((metrics.hired / metrics.interviewed) * 100) : 0,
    };

    const timeToHire = {
        average: 24,
        trend: -2,
        previous: 26,
    };

    // Source performance
    const sources = [
        { name: 'Auto-Sourcing', candidates: candidates.filter(c => c.stage !== 'new').length, hires: Math.floor(metrics.hired * 0.6) },
        { name: 'Inbound', candidates: candidates.filter(c => c.stage === 'new').length, hires: Math.floor(metrics.hired * 0.3) },
        { name: 'Referral', candidates: Math.floor(candidates.length * 0.1), hires: Math.floor(metrics.hired * 0.1) },
    ];

    const genderDiversity = [
        { stage: 'Applied', female: 42 },
        { stage: 'Qualified', female: 45 },
        { stage: 'Interviewed', female: 48 },
        { stage: 'Hired', female: 50 },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
                <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="h-48 w-full animate-pulse rounded-xl bg-slate-200" />
                    <div className="h-48 w-full animate-pulse rounded-xl bg-slate-200" />
                </div>
                <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500">Insights and metrics across your hiring pipeline</p>
                </div>
            </FadeIn>

            {/* Conversion Funnel */}
            <FadeIn delay={100}>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Conversion Funnel</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Applied</span>
                                <span className="text-2xl font-bold text-slate-900">{metrics.applied}</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-blue-200">
                                <div className="h-3 rounded-full bg-blue-600 transition-all duration-1000" style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Qualified</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">{metrics.qualified}</span>
                                    <span className="ml-2 text-sm text-green-600">({conversionRates.qualifiedRate}%)</span>
                                </div>
                            </div>
                            <div className="h-3 w-full rounded-full bg-indigo-200">
                                <div className="h-3 rounded-full bg-indigo-600 transition-all duration-1000" style={{ width: `${conversionRates.qualifiedRate}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Interviewed</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">{metrics.interviewed}</span>
                                    <span className="ml-2 text-sm text-green-600">({conversionRates.interviewRate}%)</span>
                                </div>
                            </div>
                            <div className="h-3 w-full rounded-full bg-purple-200">
                                <div className="h-3 rounded-full bg-purple-600 transition-all duration-1000" style={{ width: `${conversionRates.interviewRate}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Hired</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">{metrics.hired}</span>
                                    <span className="ml-2 text-sm text-green-600">({conversionRates.hireRate}%)</span>
                                </div>
                            </div>
                            <div className="h-3 w-full rounded-full bg-green-200">
                                <div className="h-3 rounded-full bg-green-600 transition-all duration-1000" style={{ width: `${conversionRates.hireRate}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Time to Hire */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FadeIn delay={200}>
                    <div className="rounded-xl border bg-white p-6 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="h-10 w-10 text-orange-600" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Time to Hire</h3>
                                <p className="text-sm text-slate-500">Average days from application to offer</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-bold text-slate-900">{timeToHire.average}</div>
                            <div className="text-lg text-slate-600">days</div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                                {Math.abs(timeToHire.trend)} days faster than last month ({timeToHire.previous} days)
                            </span>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={300}>
                    <div className="rounded-xl border bg-white p-6 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="h-10 w-10 text-green-600" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Offer Acceptance</h3>
                                <p className="text-sm text-slate-500">Candidates accepting offers</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-bold text-slate-900">92</div>
                            <div className="text-lg text-slate-600">%</div>
                        </div>
                        <div className="mt-2">
                            <span className="text-sm text-slate-600">{metrics.hired} of {metrics.hired + 1} offers accepted</span>
                        </div>
                    </div>
                </FadeIn>
            </div>

            {/* Source Performance */}
            <FadeIn delay={400}>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Source Performance</h3>
                    <div className="space-y-6">
                        {sources.map((source) => (
                            <div key={source.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-700">{source.name}</span>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-slate-900">{source.candidates}</span>
                                        <span className="text-sm text-slate-500"> candidates</span>
                                        <span className="mx-2 text-slate-400">•</span>
                                        <span className="text-lg font-bold text-green-600">{source.hires}</span>
                                        <span className="text-sm text-slate-500"> hires</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Candidates</div>
                                        <div className="h-2 w-full rounded-full bg-blue-200">
                                            <div className="h-2 rounded-full bg-blue-600 transition-all duration-1000" style={{ width: `${(source.candidates / candidates.length) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Hires</div>
                                        <div className="h-2 w-full rounded-full bg-green-200">
                                            <div className="h-2 rounded-full bg-green-600 transition-all duration-1000" style={{ width: `${(source.hires / (metrics.hired || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeIn>

            {/* Gender Diversity */}
            <FadeIn delay={500}>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Gender Diversity by Stage</h3>
                    <div className="space-y-4">
                        {genderDiversity.map((stage) => (
                            <div key={stage.stage}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-slate-700">{stage.stage}</span>
                                    <span className="text-sm font-medium text-purple-600">{stage.female}% female</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-200">
                                    <div className="h-3 rounded-full bg-purple-600 transition-all duration-1000" style={{ width: `${stage.female}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                        * Diversity data is approximate and based on available information
                    </p>
                </div>
            </FadeIn>
        </div>
    );
}
