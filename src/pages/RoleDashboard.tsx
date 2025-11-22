import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import PipelineChart from '../components/charts/PipelineChart';
import { jobsService } from '../services/jobs';
import { toast } from 'react-hot-toast';
import { CardSkeleton, ChartSkeleton } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';

interface JobDashboard {
    job: {
        id: string;
        title: string;
        department: string;
        location: string;
        type: string;
        status: string;
        description: string;
        requirements: string[];
        responsibilities: string[];
        auto_sourcing_enabled?: boolean;
        sourcing_threshold?: number;
    };
    aiInsights: {
        mustHaveSkills: string[];
        niceToHaveSkills: string[];
        dealBreakers: string[];
        hiringGuide: string;
        keyCompetencies: string[];
        interviewFocus: string[];
    };
    pipelineStats: {
        applicationReview: number;
        phoneScreen: number;
        hiringManagerInterview: number;
        virtualOnsite: number;
        offer: number;
        hired: number;
        rejected: number;
    };
    healthMetrics: {
        score: number;
        status: 'healthy' | 'at-risk' | 'critical';
        totalCandidates: number;
        targetCandidates: number;
    };
}

export default function RoleDashboard() {
    const { id } = useParams<{ id: string }>();
    const [dashboard, setDashboard] = useState<JobDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [sourcingEnabled, setSourcingEnabled] = useState(false);
    const [sourcingThreshold, setSourcingThreshold] = useState(70);
    const [updatingSourcing, setUpdatingSourcing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, [id]);

    const loadDashboard = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/jobs/${id}/dashboard`);
            const data = await response.json();
            setDashboard(data);
            setSourcingEnabled(data.job.auto_sourcing_enabled || false);
            setSourcingThreshold(data.job.sourcing_threshold || 70);
        } catch (error) {
            console.error('Failed to load dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSourcingUpdate = async (enabled: boolean, threshold: number) => {
        if (!dashboard?.job.id) return;
        setUpdatingSourcing(true);
        try {
            await jobsService.updateJob(dashboard.job.id, {
                auto_sourcing_enabled: enabled,
                sourcing_threshold: threshold
            });
            setSourcingEnabled(enabled);
            setSourcingThreshold(threshold);
            toast.success('Sourcing settings updated');
        } catch (error) {
            console.error('Failed to update sourcing settings', error);
            toast.error('Failed to update settings');
        } finally {
            setUpdatingSourcing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="border-b border-slate-200 mb-6">
                    <div className="flex space-x-8">
                        <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartSkeleton />
                    <CardSkeleton count={2} />
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return <div className="p-8">Dashboard not found</div>;
    }

    const { job, aiInsights, pipelineStats, healthMetrics } = dashboard;

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
            case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/dashboard/jobs"
                            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                            <p className="text-sm text-slate-500">{job.department} • {job.location} • {job.type}</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${getHealthColor(healthMetrics.status)} animate-scale-in`}>
                        <div className="text-sm font-medium">Pipeline Health</div>
                        <div className="text-2xl font-bold">{healthMetrics.score}%</div>
                        <div className="text-xs">{healthMetrics.totalCandidates} / {healthMetrics.targetCandidates} candidates</div>
                    </div>
                </div>
            </FadeIn>

            {/* Pipeline Overview */}
            <FadeIn delay={100}>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900">Pipeline Overview</h2>
                        <div className="flex gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Active: {pipelineStats.applicationReview + pipelineStats.phoneScreen + pipelineStats.hiringManagerInterview + pipelineStats.virtualOnsite}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Hired: {pipelineStats.hired}</span>
                            </div>
                        </div>
                    </div>

                    <PipelineChart data={pipelineStats} />

                    <div className="grid grid-cols-7 gap-4 mt-6 pt-6 border-t border-slate-100">
                        {[
                            { label: 'New', count: pipelineStats.applicationReview, color: 'text-blue-600' },
                            { label: 'Screen', count: pipelineStats.phoneScreen, color: 'text-indigo-600' },
                            { label: 'Interview', count: pipelineStats.hiringManagerInterview, color: 'text-purple-600' },
                            { label: 'Onsite', count: pipelineStats.virtualOnsite, color: 'text-pink-600' },
                            { label: 'Offer', count: pipelineStats.offer, color: 'text-yellow-600' },
                            { label: 'Hired', count: pipelineStats.hired, color: 'text-green-600' },
                            { label: 'Rejected', count: pipelineStats.rejected, color: 'text-gray-500' },
                        ].map((stage) => (
                            <ScaleOnHover key={stage.label}>
                                <div className="text-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className={`text-2xl font-bold ${stage.color}`}>{stage.count}</div>
                                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{stage.label}</div>
                                </div>
                            </ScaleOnHover>
                        ))}
                    </div>
                </div>
            </FadeIn>

            {/* Sourcing Configuration */}
            <FadeIn delay={200}>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">Auto-Sourcing Configuration</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 font-medium">
                                {sourcingEnabled ? 'Active' : 'Paused'}
                            </span>
                            <button
                                onClick={() => handleSourcingUpdate(!sourcingEnabled, sourcingThreshold)}
                                disabled={updatingSourcing}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${sourcingEnabled ? 'bg-green-500' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sourcingEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Minimum Fit Score Threshold</label>
                                <span className="text-sm font-bold text-slate-900">{sourcingThreshold}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="95"
                                step="5"
                                value={sourcingThreshold}
                                onChange={(e) => setSourcingThreshold(Number(e.target.value))}
                                onMouseUp={() => handleSourcingUpdate(sourcingEnabled, sourcingThreshold)}
                                disabled={!sourcingEnabled || updatingSourcing}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Candidates with a fit score below this threshold will not be automatically added to the pipeline.
                            </p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* AI Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StaggeredList staggerDelay={50}>
                    {/* Must-Have Skills */}
                    <ScaleOnHover>
                        <div className="rounded-lg border bg-white p-6 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Must-Have Skills</h3>
                            </div>
                            <ul className="space-y-2">
                                {aiInsights.mustHaveSkills?.map((skill, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                        <span className="text-sm text-slate-700">{skill}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScaleOnHover>

                    {/* Nice-to-Have Skills */}
                    <ScaleOnHover>
                        <div className="rounded-lg border bg-white p-6 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Nice-to-Have Skills</h3>
                            </div>
                            <ul className="space-y-2">
                                {aiInsights.niceToHaveSkills?.map((skill, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                        <span className="text-sm text-slate-700">{skill}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScaleOnHover>

                    {/* Deal Breakers */}
                    <ScaleOnHover>
                        <div className="rounded-lg border bg-white p-6 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Deal Breakers</h3>
                            </div>
                            <ul className="space-y-2">
                                {aiInsights.dealBreakers?.map((breaker, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-red-600"></span>
                                        <span className="text-sm text-slate-700">{breaker}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScaleOnHover>

                    {/* Key Competencies */}
                    <ScaleOnHover>
                        <div className="rounded-lg border bg-white p-6 shadow-sm h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="h-5 w-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Key Competencies</h3>
                            </div>
                            <ul className="space-y-2">
                                {aiInsights.keyCompetencies?.map((competency, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                                        <span className="text-sm text-slate-700">{competency}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScaleOnHover>
                </StaggeredList>
            </div>

            {/* Hiring Guide */}
            <FadeIn delay={300}>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Hiring Guide</h3>
                    <div className="prose prose-sm max-w-none text-slate-700">
                        {aiInsights.hiringGuide?.split('\n\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                    </div>
                </div>
            </FadeIn>

            {/* Interview Focus Areas */}
            <FadeIn delay={400}>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Interview Focus Areas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiInsights.interviewFocus?.map((area, idx) => (
                            <ScaleOnHover key={idx}>
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                                        {idx + 1}
                                    </div>
                                    <span className="text-sm text-slate-700">{area}</span>
                                </div>
                            </ScaleOnHover>
                        ))}
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
