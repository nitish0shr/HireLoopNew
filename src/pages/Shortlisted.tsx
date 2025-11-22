import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, MapPin, DollarSign, Globe, Users } from 'lucide-react';
import { candidatesService } from '../services/candidates';
import { CardSkeleton, EmptyState } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';

export default function Shortlisted() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        try {
            const data = await candidatesService.getCandidates();
            // Filter for high fit score or specific stage
            const shortlisted = data.filter((c: any) => c.fit_score >= 80 || c.stage === 'interview');
            setCandidates(shortlisted);
        } catch (error) {
            console.error('Failed to load candidates', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCandidates = filter === 'all'
        ? candidates
        : candidates.filter(c => c.stage === filter);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
                <div className="flex gap-4">
                    <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200" />
                </div>
                <div className="space-y-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Shortlisted Candidates</h1>
                        <p className="text-sm text-slate-500">High-potential candidates ready for review.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </button>
                        <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </button>
                    </div>
                </div>
            </FadeIn>

            {/* Filters */}
            <FadeIn delay={100}>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('interview')}
                        className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${filter === 'interview'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Scheduled
                    </button>
                    <button
                        onClick={() => setFilter('screening')}
                        className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${filter === 'screening'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Screening
                    </button>
                </div>
            </FadeIn>

            {/* Candidates List */}
            {filteredCandidates.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No shortlisted candidates"
                    description="Candidates with a high fit score will appear here."
                    action={{
                        label: "View All Candidates",
                        onClick: () => window.location.href = '/dashboard/candidates'
                    }}
                />
            ) : (
                <div className="space-y-4">
                    <StaggeredList>
                        {filteredCandidates.map((candidate) => (
                            <ScaleOnHover key={candidate.id}>
                                <Link
                                    to={`/dashboard/candidates/${candidate.id}`}
                                    className="block rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-white shadow-sm">
                                                {candidate.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900">{candidate.name}</h3>
                                                <p className="text-sm text-slate-600">{candidate.role}</p>
                                                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {candidate.location || 'Remote'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-4 w-4" />
                                                        Market rate
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="h-4 w-4" />
                                                        {candidate.source || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-600">{candidate.fit_score}%</div>
                                                <div className="text-xs text-slate-500">Match Score</div>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${candidate.stage === 'interview'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {candidate.stage === 'interview' ? 'Scheduled' : 'Screening'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {candidate.skills?.slice(0, 5).map((skill: string) => (
                                            <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            </ScaleOnHover>
                        ))}
                    </StaggeredList>
                </div>
            )}
        </div>
    );
}
