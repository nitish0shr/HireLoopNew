import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Check, Loader2 } from 'lucide-react';
import { jobsService, type Job } from '../services/jobs';

export default function CreateJob() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [jdText, setJdText] = useState('');
    const [parsing, setParsing] = useState(false);
    const [parsedJob, setParsedJob] = useState<Partial<Job>>({});
    const [saving, setSaving] = useState(false);
    const [dealBreakers, setDealBreakers] = useState({
        location_match: false,
        no_sponsorship: false,
        onsite_required: false
    });

    const handleParse = async () => {
        if (!jdText.trim()) return;
        setParsing(true);
        try {
            const result = await jobsService.parseJobDescription(jdText);
            setParsedJob(result);
            setStep('review');
        } catch (error) {
            console.error('Parsing failed', error);
        } finally {
            setParsing(false);
        }
    };

    const handleCreate = async () => {
        setSaving(true);
        try {
            const jobToCreate = {
                ...parsedJob,
                status: 'published',
                requirements: parsedJob.requirements || [],
                responsibilities: parsedJob.responsibilities || [],
                deal_breakers: JSON.stringify(dealBreakers)
            } as any;

            await jobsService.createJob(jobToCreate);
            navigate('/jobs');
        } catch (error) {
            console.error('Creation failed', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center text-sm text-slate-500 hover:text-slate-900"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
            </button>

            <div>
                <h1 className="text-2xl font-bold text-slate-900">Create New Job</h1>
                <p className="text-sm text-slate-500">Paste your job description to automatically extract details.</p>
            </div>

            {step === 'input' ? (
                <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Job Description</label>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the full job description here..."
                            className="h-64 w-full rounded-md border border-slate-200 p-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleParse}
                            disabled={!jdText.trim() || parsing}
                            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {parsing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-4 w-4" />
                                    Analyze & Extract
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-slate-900">Review Extracted Details</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Job Title</label>
                                <input
                                    type="text"
                                    value={parsedJob.title || ''}
                                    onChange={(e) => setParsedJob({ ...parsedJob, title: e.target.value })}
                                    className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Department</label>
                                <input
                                    type="text"
                                    value={parsedJob.department || ''}
                                    onChange={(e) => setParsedJob({ ...parsedJob, department: e.target.value })}
                                    className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Location</label>
                                <input
                                    type="text"
                                    value={parsedJob.location || ''}
                                    onChange={(e) => setParsedJob({ ...parsedJob, location: e.target.value })}
                                    className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <input
                                    type="text"
                                    value={parsedJob.type || ''}
                                    onChange={(e) => setParsedJob({ ...parsedJob, type: e.target.value })}
                                    className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-slate-900">Deal Breakers</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={dealBreakers.location_match}
                                    onChange={(e) => setDealBreakers({ ...dealBreakers, location_match: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-sm text-slate-700">Location Match Required</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={dealBreakers.no_sponsorship}
                                    onChange={(e) => setDealBreakers({ ...dealBreakers, no_sponsorship: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-sm text-slate-700">No Visa Sponsorship</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={dealBreakers.onsite_required}
                                    onChange={(e) => setDealBreakers({ ...dealBreakers, onsite_required: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="text-sm text-slate-700">On-site Work Required</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setStep('input')}
                            className="rounded-md border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" />
                                    Publish Job
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
