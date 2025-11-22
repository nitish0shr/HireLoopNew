import { useState, useEffect } from 'react';
import { Play, Users } from 'lucide-react';
import { jobsService, type Job } from '../services/jobs';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';
import { Link } from 'react-router-dom';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';
// import { CardSkeleton } from '../components/ui/LoadingStates'; // CardSkeleton was removed as it's not used

import type { Candidate } from '../services/candidates';

export default function AutoSourcing() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [isSourcing, setIsSourcing] = useState(false);
    const [sourcedCandidates, setSourcedCandidates] = useState<Candidate[]>([]);
    const [runStats, setRunStats] = useState({ total: 0, qualified: 0 });
    const [threshold, setThreshold] = useState(70);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await jobsService.getJobs();
            setJobs(data.filter(j => j.status === 'published'));
            if (data.length > 0) setSelectedJobId(data[0].id);
        } catch (error) {
            console.error('Failed to load jobs', error);
        } finally {
            setLoading(false);
        }
    };

    const startSourcing = async () => {
        if (!selectedJobId) return;

        setIsSourcing(true);
        const toastId = showLoading('AI is sourcing candidates...');

        try {
            const response = await fetch('http://localhost:3001/api/sourcing/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId: selectedJobId })
            });

            if (!response.ok) throw new Error('Sourcing failed');

            const data = await response.json();
            setSourcedCandidates(prev => [...data.candidates, ...prev]);
            setRunStats(prev => ({
                total: prev.total + data.candidates.length,
                qualified: prev.qualified + data.candidates.filter((c: any) => c.fit_score >= 70).length
            }));

            dismissToast(toastId);
            showSuccess(`Sourced ${data.candidates.length} new candidates!`);
        } catch (error) {
            dismissToast(toastId);
            showError('Failed to source candidates');
        } finally {
            setIsSourcing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-6">
                        <div className="h-96 w-full animate-pulse rounded-lg bg-slate-200" />
                    </div>
                    <div className="col-span-2">
                        <div className="h-96 w-full animate-pulse rounded-lg bg-slate-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Auto-Sourcing</h1>
                        <p className="text-sm text-slate-500">AI-powered candidate discovery and screening</p>
                    </div>
                </div>
            </FadeIn>

            <div className="grid grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="col-span-1 space-y-6">
                    <FadeIn delay={100}>
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Configuration</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Job</label>
                                    <select
                                        className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        value={selectedJobId}
                                        onChange={(e) => setSelectedJobId(e.target.value)}
                                        disabled={jobs.length === 0}
                                    >
                                        {jobs.length === 0 ? (
                                            <option value="">No published jobs available</option>
                                        ) : (
                                            <>
                                                <option value="">Select a job...</option>
                                                {jobs.map(job => (
                                                    <option key={job.id} value={job.id}>{job.title}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    {jobs.length === 0 && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Please <Link to="/dashboard/jobs/create" className="text-blue-600 hover:underline">create a job</Link> first
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Minimum Fit Score: {threshold}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={threshold}
                                        onChange={(e) => setThreshold(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Source Channels</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input type="checkbox" checked readOnly className="rounded text-blue-600 focus:ring-blue-500" />
                                            LinkedIn Recruiter
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input type="checkbox" checked readOnly className="rounded text-blue-600 focus:ring-blue-500" />
                                            GitHub
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input type="checkbox" checked readOnly className="rounded text-blue-600 focus:ring-blue-500" />
                                            Portfolio Sites
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={startSourcing}
                                    disabled={isSourcing || !selectedJobId}
                                    className={`w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-md active:scale-95 ${isSourcing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {isSourcing ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Sourcing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" />
                                            Start Sourcing
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn delay={200}>
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Session Stats</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <div className="text-2xl font-bold text-slate-900">{runStats.total}</div>
                                    <div className="text-xs text-slate-500">Profiles Analyzed</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-700">{runStats.qualified}</div>
                                    <div className="text-xs text-green-600">Qualified Matches</div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Results Panel */}
                <div className="col-span-2">
                    <FadeIn delay={300}>
                        <div className="rounded-lg border bg-white shadow-sm min-h-[600px]">
                            <div className="border-b border-slate-200 p-4 flex justify-between items-center">
                                <h2 className="font-semibold text-slate-900">Live Feed</h2>
                                <span className="text-xs text-slate-500">Showing {sourcedCandidates.length} candidates</span>
                            </div>

                            <div className="divide-y divide-slate-200">
                                {sourcedCandidates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                        <Users className="h-12 w-12 mb-4 text-slate-300" />
                                        <p>No candidates sourced yet.</p>
                                        <p className="text-sm">Select a job and click Start Sourcing to begin.</p>
                                    </div>
                                ) : (
                                    <StaggeredList>
                                        {sourcedCandidates.map((candidate) => (
                                            <ScaleOnHover key={candidate.id}>
                                                <div className="p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                                                                {candidate.name[0]}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium text-slate-900">{candidate.name}</h3>
                                                                <p className="text-sm text-slate-600">{candidate.role}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    {candidate.skills.slice(0, 3).map((skill, i) => (
                                                                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${candidate.fit_score >= 80 ? 'text-green-600' :
                                                                candidate.fit_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                                }`}>
                                                                {candidate.fit_score}%
                                                            </div>
                                                            <p className="text-xs text-slate-500">Fit Score</p>
                                                            <Link
                                                                to={`/dashboard/candidates/${candidate.id}`}
                                                                className="text-xs text-blue-600 hover:underline mt-1 block"
                                                            >
                                                                View Profile
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScaleOnHover>
                                        ))}
                                    </StaggeredList>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
