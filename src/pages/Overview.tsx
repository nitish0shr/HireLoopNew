import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { jobsService, type Job } from '../services/jobs';
import { candidatesService } from '../services/candidates';
import { StatsCardSkeleton, CardSkeleton } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';

export default function Overview() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCandidates: 0,
        shortlisted: 0,
        interviewed: 0,
        hired: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [jobsData, candidatesData] = await Promise.all([
                jobsService.getJobs(),
                candidatesService.getCandidates(),
            ]);

            setJobs(jobsData.filter(j => j.status === 'published'));

            setStats({
                totalCandidates: candidatesData.length,
                shortlisted: candidatesData.filter(c => c.stage === 'screening' || c.stage === 'interview').length,
                interviewed: candidatesData.filter(c => c.stage === 'interview').length,
                hired: candidatesData.filter(c => c.stage === 'hired').length,
            });
        } catch (error) {
            console.error('Failed to load overview data', error);
        } finally {
            setLoading(false);
        }
    };

    const getJobHealth = (job: Job) => {
        const candidateCount = job.candidates_count || 0;
        if (candidateCount >= 20) return { status: 'healthy', color: 'status-healthy', label: 'Healthy' };
        if (candidateCount >= 10) return { status: 'warning', color: 'status-warning', label: 'At Risk' };
        return { status: 'error', color: 'status-error', label: 'Needs Attention' };
    };

    const calculatePipelineHealth = (job: Job) => {
        const count = job.candidates_count || 0;
        return Math.min(100, Math.round((count / 30) * 100));
    };

    return (
        <div className="space-y-6">
            <FadeIn>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
                    <p className="text-sm text-slate-500">Monitor your active roles and pipeline health</p>
                </div>
            </FadeIn>

            {/* Stats Cards */}
            {loading ? (
                <StatsCardSkeleton count={4} />
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <StaggeredList staggerDelay={100}>
                        <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="text-sm font-medium text-slate-500">Total Candidates</div>
                            <div className="mt-2 text-3xl font-bold text-slate-900 animate-scale-in">{stats.totalCandidates}</div>
                            <div className="mt-2 flex items-center text-sm text-green-600">
                                <TrendingUp className="mr-1 h-4 w-4" />
                                12% vs last month
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="text-sm font-medium text-slate-500">Shortlisted</div>
                            <div className="mt-2 text-3xl font-bold text-slate-900 animate-scale-in">{stats.shortlisted}</div>
                            <div className="mt-2 flex items-center text-sm text-green-600">
                                <TrendingUp className="mr-1 h-4 w-4" />
                                8% vs last month
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="text-sm font-medium text-slate-500">Interviewed</div>
                            <div className="mt-2 text-3xl font-bold text-slate-900 animate-scale-in">{stats.interviewed}</div>
                            <div className="mt-2 flex items-center text-sm text-slate-500">
                                ~5% vs last month
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="text-sm font-medium text-slate-500">Hired</div>
                            <div className="mt-2 text-3xl font-bold text-slate-900 animate-scale-in">{stats.hired}</div>
                            <div className="mt-2 flex items-center text-sm text-green-600">
                                <TrendingUp className="mr-1 h-4 w-4" />
                                15% vs last month
                            </div>
                        </div>
                    </StaggeredList>
                </div>
            )}

            {/* Active Jobs */}
            <div>
                <FadeIn delay={200}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Active Roles</h2>
                        <Link
                            to="/dashboard/jobs/new"
                            className="rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all hover:shadow-lg active:scale-95"
                        >
                            Create New Role
                        </Link>
                    </div>
                </FadeIn>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <CardSkeleton count={3} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <StaggeredList staggerDelay={100}>
                            {jobs.map((job) => {
                                const health = getJobHealth(job);
                                const pipelineHealth = calculatePipelineHealth(job);

                                return (
                                    <ScaleOnHover key={job.id}>
                                        <Link
                                            to={`/dashboard/jobs/${job.id}`}
                                            className="block h-full rounded-xl border-2 bg-white p-6 shadow-sm transition-all hover:border-blue-200"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                                                    <p className="text-sm text-slate-500">
                                                        {job.location} • {job.type}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors`}
                                                    style={{
                                                        backgroundColor: health.status === 'healthy' ? '#d1fae5' : health.status === 'warning' ? '#fed7aa' : '#fee2e2',
                                                        color: health.status === 'healthy' ? '#065f46' : health.status === 'warning' ? '#92400e' : '#991b1b',
                                                    }}
                                                >
                                                    {health.status === 'healthy' ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3" />
                                                    )}
                                                    {health.label}
                                                </span>
                                            </div>

                                            {/* Metrics */}
                                            <div className="grid grid-cols-4 gap-2 mb-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-slate-900">{job.candidates_count || 0}</div>
                                                    <div className="text-xs text-slate-500">Total</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {Math.round((job.candidates_count || 0) * 0.6)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">Shortlist</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {Math.round((job.candidates_count || 0) * 0.3)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">Interview</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {Math.round((job.candidates_count || 0) * 0.1)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">Hired</div>
                                                </div>
                                            </div>

                                            {/* Pipeline Health */}
                                            <div>
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-slate-600">Pipeline Health</span>
                                                    <span className="font-bold text-slate-900">{pipelineHealth}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ease-out`}
                                                        style={{
                                                            width: `${pipelineHealth}%`,
                                                            backgroundColor: pipelineHealth >= 70 ? '#10B981' : pipelineHealth >= 40 ? '#F59E0B' : '#EF4444',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    </ScaleOnHover>
                                );
                            })}
                        </StaggeredList>
                    </div>
                )}
            </div>
        </div>
    );
}
