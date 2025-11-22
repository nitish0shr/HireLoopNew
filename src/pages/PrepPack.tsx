import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { candidatesService, type Candidate } from '../services/candidates';
import { jobsService, type Job } from '../services/jobs';
import { aiService } from '../services/ai';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

interface Question {
    id: string;
    question: string;
    listenFor: string[];
    criterion: string;
}

interface Evaluation {
    questionId: string;
    rating: number;
}

export default function PrepPack() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [generating, setGenerating] = useState(false);
    const [prepType, setPrepType] = useState<'Behavioral' | 'Technical' | 'Recruiter' | 'HR'>('Behavioral');
    const [questionCount, setQuestionCount] = useState(5);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [candidatesData, jobsData] = await Promise.all([
            candidatesService.getCandidates(),
            jobsService.getJobs(),
        ]);
        setCandidates(candidatesData.filter(c => c.fit_score >= 60));
        setJobs(jobsData.filter(j => j.status === 'published'));
    };

    const generateQuestions = async () => {
        if (!selectedCandidate || !selectedJob) return;

        setGenerating(true);
        const toastId = showLoading('Generating interview questions with AI...');

        try {
            // Use real AI to generate questions
            const prompt = `Generate ${questionCount} ${prepType.toLowerCase()} interview questions for a ${selectedJob.title} position. 
The candidate has these skills: ${selectedCandidate.skills?.join(', ') || 'general skills'}.
The candidate's background: ${selectedCandidate.experience ? JSON.stringify(selectedCandidate.experience).substring(0, 200) : 'N/A'}.
Focus on: ${prepType === 'Technical' ? 'technical depth, problem-solving, system design' : prepType === 'Behavioral' ? 'communication, teamwork, leadership' : prepType === 'Recruiter' ? 'motivation, culture fit, career goals' : 'values alignment, work style, team dynamics'}.

Return as JSON array with format:
[{
  "question": "Tell me about a time when...",
  "listenFor": ["specific example", "outcome", "learning"],
  "criterion": "Communication"
}]`;

            const response = await aiService.generateText(prompt);

            try {
                const parsed = JSON.parse(response);
                const generatedQuestions: Question[] = parsed.map((q: any, index: number) => ({
                    id: `q-${index}`,
                    question: q.question,
                    listenFor: q.listenFor || [],
                    criterion: q.criterion || 'General',
                }));

                setQuestions(generatedQuestions);
                setEvaluations(generatedQuestions.map(q => ({ questionId: q.id, rating: 0 })));
            } catch (parseError) {
                // Fallback to mock questions if AI fails
                const mockQuestions: Question[] = [
                    {
                        id: 'q-1',
                        question: `Tell me about a time when you had to learn a new technology quickly for ${selectedJob.title} role.`,
                        listenFor: ['Specific technology', 'Learning approach', 'Timeline', 'Outcome'],
                        criterion: 'Learning Ability',
                    },
                    {
                        id: 'q-2',
                        question: 'Describe a situation where you had to collaborate with a difficult team member.',
                        listenFor: ['Conflict resolution', 'Communication strategy', 'Positive outcome'],
                        criterion: 'Teamwork',
                    },
                    {
                        id: 'q-3',
                        question: `How do you prioritize tasks when working on multiple ${selectedJob.title} projects?`,
                        listenFor: ['Prioritization framework', 'Tools used', 'Examples'],
                        criterion: 'Time Management',
                    },
                    {
                        id: 'q-4',
                        question: 'Tell me about a technical challenge you faced and how you solved it.',
                        listenFor: ['Problem description', 'Solution approach', 'Technical depth'],
                        criterion: 'Problem Solving',
                    },
                    {
                        id: 'q-5',
                        question: 'Describe a time when you had to give difficult feedback to a colleague.',
                        listenFor: ['Approach', 'Communication style', 'Result'],
                        criterion: 'Leadership',
                    },
                ];

                setQuestions(mockQuestions);
                setEvaluations(mockQuestions.map(q => ({ questionId: q.id, rating: 0 })));
            }

            dismissToast(toastId);
            showSuccess('Interview questions generated!');
        } catch (error) {
            dismissToast(toastId);
            showError('Failed to generate questions');
        } finally {
            setGenerating(false);
        }
    };

    const updateRating = (questionId: string, rating: number) => {
        setEvaluations(prev =>
            prev.map(e => e.questionId === questionId ? { ...e, rating } : e)
        );
    };

    const exportPrepPack = () => {
        if (!selectedCandidate || !selectedJob) return;

        const content = `INTERVIEW PREP PACK
Candidate: ${selectedCandidate.name}
Position: ${selectedJob.title}
Match Score: ${selectedCandidate.fit_score}%
Generated: ${new Date().toLocaleDateString()}

INTERVIEW QUESTIONS & GUIDANCE
===============================

${questions.map((q, index) => `
${index + 1}. ${q.question}

Criterion: ${q.criterion}

Listen For:
${q.listenFor.map(item => `  • ${item}`).join('\n')}

Rating: ${['☐', '☐', '☐', '☐', '☐'].map((box, i) =>
            i < (evaluations.find(e => e.questionId === q.id)?.rating || 0) ? '☑' : box
        ).join(' ')} (Definitely Not → Strong Yes)

---`).join('\n')}

EVALUATION SUMMARY
==================
${questions.map((q, index) => {
            const rating = evaluations.find(e => e.questionId === q.id)?.rating || 0;
            const labels = ['Definitely Not', 'Probably Not', 'Maybe', 'Probably Yes', 'Strong Yes'];
            return `${index + 1}. ${q.criterion}: ${labels[rating - 1] || 'Not Rated'}`;
        }).join('\n')}
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prep-pack-${selectedCandidate.name.replace(/\s+/g, '-')}.txt`;
        link.click();

        showSuccess('Prep pack exported!');
    };

    const ratingLabels = ['Definitely Not', 'Probably Not', 'Maybe', 'Probably Yes', 'Strong Yes'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Prep Pack</h1>
                    <p className="text-sm text-slate-500">AI-generated interview questions and evaluation</p>
                </div>
                {questions.length > 0 && (
                    <button
                        onClick={exportPrepPack}
                        className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Download className="h-4 w-4" />
                        Export PDF
                    </button>
                )}
            </div>

            {/* Selection */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Candidate Selection */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Select Candidate</h3>
                    <select
                        value={selectedCandidate?.id || ''}
                        onChange={(e) => {
                            const candidate = candidates.find(c => c.id === e.target.value);
                            setSelectedCandidate(candidate || null);
                            setQuestions([]);
                        }}
                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Choose a candidate...</option>
                        {candidates.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                                {candidate.name} - {candidate.role} ({candidate.fit_score}%)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Job Selection */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Select Job</h3>
                    <select
                        value={selectedJob?.id || ''}
                        onChange={(e) => {
                            const job = jobs.find(j => j.id === e.target.value);
                            setSelectedJob(job || null);
                            setQuestions([]);
                        }}
                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Choose a job...</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title} - {job.department}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Configuration */}
            {selectedCandidate && selectedJob && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Interview Type</h3>
                        <select
                            value={prepType}
                            onChange={(e) => {
                                setPrepType(e.target.value as any);
                                setQuestions([]);
                            }}
                            className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Behavioral">Behavioral Interview</option>
                            <option value="Technical">Technical Interview</option>
                            <option value="Recruiter">Recruiter Screen</option>
                            <option value="HR">HR & Culture Fit</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            {prepType === 'Behavioral' && 'Focus on past experiences, teamwork, and soft skills'}
                            {prepType === 'Technical' && 'Focus on technical depth, problem-solving, and system design'}
                            {prepType === 'Recruiter' && 'Focus on motivation, career goals, and basic fit'}
                            {prepType === 'HR' && 'Focus on values, work style, and cultural alignment'}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Number of Questions</h3>
                        <select
                            value={questionCount}
                            onChange={(e) => {
                                setQuestionCount(Number(e.target.value));
                                setQuestions([]);
                            }}
                            className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value={3}>3 Questions (Quick Screen)</option>
                            <option value={5}>5 Questions (Standard)</option>
                            <option value={7}>7 Questions (Comprehensive)</option>
                            <option value={10}>10 Questions (Deep Dive)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-2">Recommended: 5-7 questions for most interviews</p>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            {selectedCandidate && selectedJob && questions.length === 0 && (
                <button
                    onClick={generateQuestions}
                    disabled={generating}
                    className="w-full rounded-md bg-gradient-primary px-6 py-4 text-base font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                    {generating ? 'Generating Questions...' : 'Generate Interview Questions'}
                </button>
            )}

            {/* Questions */}
            {questions.length > 0 && (
                <div className="space-y-6">
                    {questions.map((question, index) => {
                        const evaluation = evaluations.find(e => e.questionId === question.id);
                        const rating = evaluation?.rating || 0;

                        return (
                            <div key={question.id} className="rounded-xl border bg-white p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="text-lg font-bold text-slate-900">{question.question}</h3>
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                                {question.criterion}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Listen For:</h4>
                                            <ul className="space-y-1">
                                                {question.listenFor.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <span className="text-primary-600">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Rating:</h4>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <button
                                                        key={value}
                                                        onClick={() => updateRating(question.id, value)}
                                                        className={`flex-1 rounded-md border-2 px-4 py-3 text-center text-sm font-medium transition-all ${rating >= value
                                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                            : 'border-slate-200 text-slate-600 hover:border-primary-300'
                                                            }`}
                                                    >
                                                        <div className="font-bold">{value}</div>
                                                        <div className="text-xs mt-1">{ratingLabels[value - 1]}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
