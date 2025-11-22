import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink, Download, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { candidatesService, type Candidate } from '../services/candidates';

export default function CandidateProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCandidate(id);
        }
    }, [id]);

    const loadCandidate = async (candidateId: string) => {
        try {
            const data = await candidatesService.getCandidate(candidateId);
            setCandidate(data);
        } catch (error) {
            console.error('Failed to load candidate', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading candidate...</div>;
    if (!candidate) return <div className="p-8">Candidate not found</div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/candidates')}
                className="flex items-center text-sm text-slate-500 hover:text-slate-900"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Candidates
            </button>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                                    {candidate.name[0]}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">{candidate.name}</h1>
                                    <p className="text-slate-500">{candidate.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <Download className="mr-2 h-4 w-4" />
                                    Resume
                                </button>
                                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                    Contact
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 border-t pt-6">
                            <div className="flex items-center text-sm text-slate-500">
                                <Mail className="mr-2 h-4 w-4" />
                                {candidate.email}
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                <Phone className="mr-2 h-4 w-4" />
                                +1 (555) 123-4567
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                <MapPin className="mr-2 h-4 w-4" />
                                San Francisco, CA
                            </div>
                            <div className="flex items-center text-sm text-blue-600 hover:underline cursor-pointer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                LinkedIn Profile
                            </div>
                        </div>
                    </div>

                    {/* Experience & Skills */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">Experience & Skills</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-700">Summary</h3>
                                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                                    {candidate.experience || 'No experience summary available.'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-700">Top Skills</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {candidate.skills?.map((skill) => (
                                        <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                            {skill}
                                        </span>
                                    )) || <span className="text-sm text-slate-500">No skills extracted</span>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-slate-700">Education</h3>
                                <p className="mt-1 text-sm text-slate-600">{candidate.education || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Fit Score Card */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">AI Fit Score</h2>
                        <div className="flex items-center justify-center py-4">
                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-slate-100">
                                <div
                                    className={`absolute h-full w-full rounded-full border-8 ${candidate.fit_score >= 80 ? 'border-green-500' :
                                        candidate.fit_score >= 60 ? 'border-yellow-500' : 'border-red-500'
                                        }`}
                                    style={{ clipPath: `polygon(0 0, 100% 0, 100% ${candidate.fit_score}%, 0 100%)` }} // Simplified visual
                                />
                                <span className="text-3xl font-bold text-slate-900">{candidate.fit_score}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Skills Match</span>
                                <span className="font-medium text-green-600">{candidate.fit_score_breakdown?.skills || 85}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Experience</span>
                                <span className="font-medium text-yellow-600">{candidate.fit_score_breakdown?.experience || 70}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Education</span>
                                <span className="font-medium text-green-600">{candidate.fit_score_breakdown?.education || 90}%</span>
                            </div>
                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    await candidatesService.recalculateFitScore(candidate.id);
                                    await loadCandidate(candidate.id);
                                }}
                                className="mt-4 w-full text-xs text-blue-600 hover:underline"
                            >
                                Recalculate Score
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-900">Actions</h2>
                    <div className="space-y-3">
                        <button className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Advance to Screening
                        </button>
                        <button className="flex w-full items-center justify-center rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject Candidate
                        </button>
                        <button className="flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
