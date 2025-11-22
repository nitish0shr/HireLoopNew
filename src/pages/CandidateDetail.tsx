import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, AlertCircle, CheckCircle, TrendingUp, Star, FileText, Calendar, Sparkles } from 'lucide-react';
import { showSuccess, showError } from '../lib/toast';
import { scorecardsService, type Scorecard } from '../services/scorecards';
import AddScorecardModal from '../components/modals/AddScorecardModal';

interface CandidateDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    skills: string[];
    experience: any;
    education: any;
    years_of_experience: number;
    stage: string;
    fit_score: number;
    resume_text: string;
    created_at: string;
    job_id?: string;
}

interface AIAnalysis {
    summary: string;
    strengths: string[];
    gaps: string[];
    fitScore: {
        overall: number;
        skills: number;
        experience: number;
        education: number;
    };
    dealBreakerCheck: {
        passed: boolean;
        details: string[];
    };
    recommendation: string;
}

export default function CandidateDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzingAI, setAnalyzingAI] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'scorecards' | 'emails'>('profile');
    const [scorecards, setScorecards] = useState<Scorecard[]>([]);
    const [isAddScorecardOpen, setIsAddScorecardOpen] = useState(false);

    useEffect(() => {
        loadCandidate();
    }, [id]);

    const loadCandidate = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/candidates/${id}`);
            if (!response.ok) throw new Error('Failed to fetch candidate');
            const data = await response.json();
            setCandidate(data);

            // Trigger AI analysis if not already present (mock check for now, ideally backend stores it)
            analyzeCandidate(data);
            // Load scorecards
            loadScorecards();
        } catch (error) {
            console.error('Failed to load candidate', error);
            showError('Failed to load candidate details');
        } finally {
            setLoading(false);
        }
    };

    const loadScorecards = async () => {
        try {
            const data = await scorecardsService.getScorecards(id!);
            setScorecards(data);
        } catch (error) {
            console.error('Failed to load candidate', error);
            showError('Failed to load candidate details');
        } finally {
            setLoading(false);
        }
    };

    const analyzeCandidate = async (candidateData: CandidateDetail) => {
        setAnalyzingAI(true);
        try {
            const response = await fetch(`http://localhost:3001/api/candidates/${id}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidate: candidateData })
            });
            const analysis = await response.json();
            setAiAnalysis(analysis);
        } catch (error) {
            console.error('Failed to analyze candidate', error);
        } finally {
            setAnalyzingAI(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading candidate...</div>;
    if (!candidate) return <div className="flex h-screen items-center justify-center">Candidate not found</div>;

    // Robust parsing helpers
    const parseList = (data: any): string[] => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return data.split(',').map(s => s.trim());
            }
        }
        return [];
    };

    const parseExperience = (data: any): any[] => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    const skills = parseList(candidate.skills);
    const experience = parseExperience(candidate.experience);
    const education = parseExperience(candidate.education);

    return (
        <>
            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard/candidates" className="text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{candidate.name}</h1>
                            <p className="text-sm text-slate-500">{candidate.role} • Added {new Date(candidate.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${candidate.fit_score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                            candidate.fit_score >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <TrendingUp className="h-4 w-4" />
                            Fit Score: {candidate.fit_score}%
                        </div>
                        <select
                            value={candidate.stage}
                            onChange={async (e) => {
                                const newStage = e.target.value;
                                try {
                                    const response = await fetch(`http://localhost:3001/api/candidates/${id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ stage: newStage, fit_score: candidate.fit_score })
                                    });
                                    if (response.ok) {
                                        setCandidate({ ...candidate, stage: newStage });
                                        showSuccess('Stage updated successfully');
                                    } else {
                                        showError('Failed to update stage');
                                    }
                                } catch (error) {
                                    showError('Failed to update stage');
                                }
                            }}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize cursor-pointer"
                        >
                            <option value="new">Application Review</option>
                            <option value="screening">Recruiter Screen</option>
                            <option value="interview">Hiring Manager Interview</option>
                            <option value="onsite">Virtual On-site</option>
                            <option value="offer">Offer</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8">
                        {['profile', 'scorecards', 'emails'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'profile' && (
                            <>
                                {/* Contact Info */}
                                <div className="bg-white rounded-lg border shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                            <span>{candidate.email}</span>
                                        </div>
                                        {candidate.phone && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Phone className="h-5 w-5 text-slate-400" />
                                                <span>{candidate.phone}</span>
                                            </div>
                                        )}
                                        {candidate.location && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <MapPin className="h-5 w-5 text-slate-400" />
                                                <span>{candidate.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                            <span>{candidate.years_of_experience} years experience</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="bg-white rounded-lg border shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.length > 0 ? skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
                                                {skill}
                                            </span>
                                        )) : (
                                            <p className="text-slate-500 italic">No skills extracted.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div className="bg-white rounded-lg border shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Experience</h2>
                                    <div className="space-y-6">
                                        {experience.length > 0 ? experience.map((exp: any, idx: number) => (
                                            <div key={idx} className="relative pl-6 border-l-2 border-slate-200 last:border-0">
                                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white" />
                                                <div className="mb-1">
                                                    <h3 className="text-base font-semibold text-slate-900">{exp.title || exp.position || 'Unknown Role'}</h3>
                                                    <p className="text-sm font-medium text-slate-600">{exp.company || 'Unknown Company'}</p>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2">{exp.duration || exp.dates || 'Dates not specified'}</p>
                                                {exp.description && (
                                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{
                                                        Array.isArray(exp.description) ? exp.description.join('\n') : exp.description
                                                    }</p>
                                                )}
                                            </div>
                                        )) : (
                                            <p className="text-slate-500 italic">No experience details available.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="bg-white rounded-lg border shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Education</h2>
                                    <div className="space-y-4">
                                        {education.length > 0 ? education.map((edu: any, idx: number) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="mt-1 h-10 w-10 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-900">{edu.degree || edu.qualification || 'Degree'}</h3>
                                                    <p className="text-sm text-slate-600">{edu.institution || edu.school || 'Institution'}</p>
                                                    <p className="text-xs text-slate-500">{edu.year || edu.dates}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-slate-500 italic">No education details available.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'scorecards' && (
                            <div className="bg-white rounded-lg border shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-slate-900">Interview Scorecards</h2>
                                    <button
                                        onClick={() => setIsAddScorecardOpen(true)}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-800"
                                    >
                                        Add Scorecard
                                    </button>
                                </div>

                                {scorecards.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-500">No scorecards yet. Add interview feedback to track candidate performance.</p>
                                        <button
                                            onClick={() => setIsAddScorecardOpen(true)}
                                            className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                                        >
                                            Add First Scorecard
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {scorecards.map((scorecard) => {
                                            const avgScore = Object.values(scorecard.scores).reduce((a, b) => a + b, 0) / Object.values(scorecard.scores).length;
                                            return (
                                                <div key={scorecard.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-medium text-slate-900 capitalize">{scorecard.stage.replace('_', ' ')} Interview</h3>
                                                            <p className="text-sm text-slate-500">Interviewer: {scorecard.interviewer_id || 'Unknown'}</p>
                                                            <p className="text-xs text-slate-400">{new Date(scorecard.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${avgScore >= 4 ? 'bg-green-100 text-green-700' :
                                                            avgScore >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            <Star className="h-3 w-3 fill-current" />
                                                            {avgScore.toFixed(1)}/5
                                                        </div>
                                                    </div>
                                                    {scorecard.feedback && (
                                                        <p className="text-sm text-slate-600 mt-2">{scorecard.feedback}</p>
                                                    )}
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {Object.entries(scorecard.scores).map(([comp, score]) => (
                                                            <span key={comp} className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                                {comp}: {score}/5
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'emails' && (
                            <div className="bg-white rounded-lg border shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Communication History</h2>
                                <p className="text-slate-500 text-sm">No emails sent yet.</p>
                                <div className="mt-4">
                                    <Link to="/dashboard/outreach" className="text-blue-600 text-sm font-medium hover:underline">
                                        Go to Outreach to send an email
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: AI Analysis */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-yellow-400" />
                                <h2 className="text-lg font-semibold">AI Analysis</h2>
                            </div>

                            {analyzingAI ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Summary</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">{aiAnalysis.summary}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Strengths</h3>
                                        <ul className="space-y-2">
                                            {aiAnalysis.strengths.map((strength, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                    {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gaps</h3>
                                        <ul className="space-y-2">
                                            {aiAnalysis.gaps.map((gap, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                                    {gap}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-4 border-t border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-300">Recommendation</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${aiAnalysis.recommendation.toLowerCase().includes('hire') || aiAnalysis.recommendation.toLowerCase().includes('proceed')
                                                ? 'bg-green-900 text-green-300'
                                                : 'bg-yellow-900 text-yellow-300'
                                                }`}>
                                                {aiAnalysis.recommendation.includes('Proceed') ? 'Proceed' : 'Review'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">{aiAnalysis.recommendation}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-400 text-sm mb-4">Analysis not available</p>
                                    <button
                                        onClick={() => candidate && analyzeCandidate(candidate)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm transition-colors"
                                    >
                                        Generate Analysis
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg border shadow-sm p-4">
                            <h3 className="font-medium text-slate-900 mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link to="/dashboard/outreach" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md text-sm text-slate-700 transition-colors">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    Send Email
                                </Link>
                                <Link to="/dashboard/scheduling" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md text-sm text-slate-700 transition-colors">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    Schedule Interview
                                </Link>
                                <button
                                    onClick={() => showSuccess('Resume download started')}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md text-sm text-slate-700 transition-colors text-left"
                                >
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    Download Resume
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddScorecardModal
                isOpen={isAddScorecardOpen}
                onClose={() => setIsAddScorecardOpen(false)}
                candidateId={id!}
                jobId={candidate?.job_id || ''}
                onSuccess={loadScorecards}
            />
        </>
    );
}
