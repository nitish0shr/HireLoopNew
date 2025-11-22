import { useState } from 'react';
import { X, User } from 'lucide-react';
import { scorecardsService } from '../../services/scorecards';
import { showSuccess, showError } from '../../lib/toast';

interface AddScorecardModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidateId: string;
    jobId: string;
    onSuccess: () => void;
}

const COMPETENCIES = [
    'Technical Skills',
    'Communication',
    'Problem Solving',
    'Culture Fit',
    'Leadership',
    'Teamwork'
];

const STAGES = [
    { value: 'screening', label: 'Recruiter Screen' },
    { value: 'interview', label: 'Hiring Manager Interview' },
    { value: 'onsite', label: 'Virtual On-site' }
];

export default function AddScorecardModal({ isOpen, onClose, candidateId, jobId, onSuccess }: AddScorecardModalProps) {
    const [interviewerName, setInterviewerName] = useState('');
    const [stage, setStage] = useState('screening');
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScoreChange = (competency: string, score: number) => {
        setScores(prev => ({ ...prev, [competency]: score }));
    };

    const handleSubmit = async () => {
        if (!interviewerName || Object.keys(scores).length === 0) {
            showError('Please enter interviewer name and at least one score');
            return;
        }

        setLoading(true);
        try {
            await scorecardsService.createScorecard({
                candidate_id: candidateId,
                job_id: jobId,
                interviewer_id: interviewerName,
                stage,
                scores,
                feedback
            });
            showSuccess('Scorecard added successfully');
            onSuccess();
            onClose();
            // Reset form
            setInterviewerName('');
            setStage('screening');
            setScores({});
            setFeedback('');
        } catch (error) {
            showError('Failed to add scorecard');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Add Interview Scorecard</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Interviewer Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Interviewer Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={interviewerName}
                                onChange={(e) => setInterviewerName(e.target.value)}
                                placeholder="Enter interviewer name"
                                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Interview Stage
                        </label>
                        <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {STAGES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Competency Ratings */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-slate-700">
                            Competency Ratings (1-5) <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-4">
                            {COMPETENCIES.map(competency => (
                                <div key={competency} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-700 font-medium">{competency}</span>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => handleScoreChange(competency, rating)}
                                                className={`h-8 w-8 rounded-full border transition-all active:scale-95 ${scores[competency] === rating
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-110'
                                                    : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:scale-105'
                                                    }`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Feedback & Notes
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Share your thoughts on the candidate's performance..."
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-sl ate-200 bg-white py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !interviewerName || Object.keys(scores).length === 0}
                            className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Scorecard'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
