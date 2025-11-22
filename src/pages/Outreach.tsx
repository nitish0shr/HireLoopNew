import { useState, useEffect } from 'react';
import { Mail, Sparkles, Send, FileText, Edit2, Trash2, Plus } from 'lucide-react';
import { candidatesService, type Candidate } from '../services/candidates';
import { jobsService, type Job } from '../services/jobs';
import { templatesService, type Template } from '../services/templates';
import TemplateModal from '../components/modals/TemplateModal';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';
import { CardSkeleton, EmptyState } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';

interface OutreachEmail {
    id: string;
    candidateId: string;
    sequence_day: number;
    subject: string;
    body: string;
    status: 'sent' | 'opened' | 'replied';
    sent_at: string;
    opened_at?: string;
    replied_at?: string;
}

export default function Outreach() {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [emails, setEmails] = useState<OutreachEmail[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    // Template management state
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    // Compose state
    const [selectedCandidateId, setSelectedCandidateId] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [generatedSubject, setGeneratedSubject] = useState('');
    const [generatedBody, setGeneratedBody] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cands, jobsData, templatesData, emailsData] = await Promise.all([
                candidatesService.getCandidates(),
                jobsService.getJobs(),
                templatesService.getTemplates(),
                fetch('http://localhost:3001/api/outreach/emails').then(res => res.json())
            ]);
            setCandidates(cands);
            setJobs(jobsData.filter(j => j.status === 'published'));
            setTemplates(templatesData);
            if (Array.isArray(emailsData)) {
                setEmails(emailsData);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async (templateData: Omit<Template, 'id' | 'created_at'>) => {
        setIsSavingTemplate(true);
        try {
            if (editingTemplate) {
                await templatesService.updateTemplate(editingTemplate.id, templateData);
                showSuccess('Template updated');
            } else {
                await templatesService.createTemplate(templateData);
                showSuccess('Template created');
            }
            const updatedTemplates = await templatesService.getTemplates();
            setTemplates(updatedTemplates);
            setIsTemplateModalOpen(false);
            setEditingTemplate(undefined);
        } catch (error) {
            showError('Failed to save template');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await templatesService.deleteTemplate(id);
            showSuccess('Template deleted');
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            showError('Failed to delete template');
        }
    };

    const openNewTemplateModal = () => {
        setEditingTemplate(undefined);
        setIsTemplateModalOpen(true);
    };

    const openEditTemplateModal = (template: Template) => {
        setEditingTemplate(template);
        setIsTemplateModalOpen(true);
    };

    const generateEmail = async () => {
        if (!selectedCandidateId || !selectedJobId) return;

        setIsGenerating(true);
        const toastId = showLoading('AI is writing your email...');

        try {
            const response = await fetch('http://localhost:3001/api/outreach/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: selectedCandidateId,
                    jobId: selectedJobId,
                    type: 'initial'
                })
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            setGeneratedSubject(data.subject);
            setGeneratedBody(data.body);
            dismissToast(toastId);
            showSuccess('Email generated!');
        } catch (error) {
            dismissToast(toastId);
            showError('Failed to generate email');
        } finally {
            setIsGenerating(false);
        }
    };

    const sendEmail = async () => {
        if (!selectedCandidateId || !generatedSubject || !generatedBody) return;

        const toastId = showLoading('Sending email...');

        try {
            const response = await fetch('http://localhost:3001/api/outreach/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: selectedCandidateId,
                    jobId: selectedJobId,
                    subject: generatedSubject,
                    body: generatedBody,
                    status: 'sent'
                })
            });

            if (!response.ok) throw new Error('Failed to send');

            const newEmail = await response.json();
            setEmails([newEmail, ...emails]);
            setGeneratedSubject('');
            setGeneratedBody('');
            setSelectedCandidateId('');
            dismissToast(toastId);
            showSuccess('Email sent successfully!');
        } catch (error) {
            dismissToast(toastId);
            showError('Failed to send email');
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
                    <CardSkeleton count={1} className="h-96" />
                    <CardSkeleton count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Outreach</h1>
                        <p className="text-sm text-slate-500">AI-powered email campaigns and templates</p>
                    </div>
                </div>
            </FadeIn>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'campaigns'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Campaigns & Generation
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'templates'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Communication Templates
                    </button>
                </nav>
            </div>

            {activeTab === 'campaigns' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Composer */}
                    <FadeIn delay={100} className="space-y-6">
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Compose Email</h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Candidate</label>
                                        <select
                                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            value={selectedCandidateId}
                                            onChange={(e) => setSelectedCandidateId(e.target.value)}
                                        >
                                            <option value="">Select Candidate...</option>
                                            {candidates.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Job Context</label>
                                        <select
                                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            value={selectedJobId}
                                            onChange={(e) => setSelectedJobId(e.target.value)}
                                        >
                                            <option value="">Select Job...</option>
                                            {jobs.map(j => (
                                                <option key={j.id} value={j.id}>{j.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={generateEmail}
                                    disabled={isGenerating || !selectedCandidateId || !selectedJobId}
                                    className="w-full flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-all hover:shadow-md active:scale-95"
                                >
                                    {isGenerating ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Sparkles className="h-4 w-4" />
                                    )}
                                    Generate with AI
                                </button>

                                {generatedSubject && (
                                    <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                value={generatedSubject}
                                                onChange={(e) => setGeneratedSubject(e.target.value)}
                                                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                                            <textarea
                                                rows={8}
                                                value={generatedBody}
                                                onChange={(e) => setGeneratedBody(e.target.value)}
                                                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={sendEmail}
                                            className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all hover:shadow-md active:scale-95"
                                        >
                                            <Send className="h-4 w-4" />
                                            Send Email
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>

                    {/* History */}
                    <FadeIn delay={200} className="space-y-6">
                        <div className="rounded-lg border bg-white p-6 shadow-sm min-h-[500px]">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {emails.length === 0 ? (
                                    <EmptyState
                                        icon={Mail}
                                        title="No emails sent yet"
                                        description="Generate and send your first outreach email to see activity here."
                                    />
                                ) : (
                                    <StaggeredList staggerDelay={50}>
                                        {emails.map(email => {
                                            const candidate = candidates.find(c => c.id === email.candidateId);
                                            return (
                                                <ScaleOnHover key={email.id} scale={1.01}>
                                                    <div className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-medium text-slate-900">{candidate?.name || 'Unknown'}</h3>
                                                                <p className="text-xs text-slate-500">{new Date(email.sent_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Sent</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-800">{email.subject}</p>
                                                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{email.body}</p>
                                                    </div>
                                                </ScaleOnHover>
                                            );
                                        })}
                                    </StaggeredList>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            ) : (
                <div className="space-y-6">
                    <FadeIn>
                        <div className="flex justify-end">
                            <button
                                onClick={openNewTemplateModal}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-md active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                New Template
                            </button>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Candidate Templates */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-500" />
                                Candidate Email Templates
                            </h3>
                            <StaggeredList staggerDelay={50}>
                                {templates.filter(t => t.category === 'candidate').map(template => (
                                    <ScaleOnHover key={template.id}>
                                        <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-slate-900">{template.name}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditTemplateModal(template)}
                                                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium mb-1">Subject: {template.subject}</p>
                                            <p className="text-sm text-slate-500 line-clamp-3 whitespace-pre-wrap">{template.body}</p>
                                        </div>
                                    </ScaleOnHover>
                                ))}
                            </StaggeredList>
                        </div>

                        {/* Hiring Manager Templates */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-500" />
                                Hiring Manager Templates
                            </h3>
                            <StaggeredList staggerDelay={50}>
                                {templates.filter(t => t.category === 'hiring_manager').map(template => (
                                    <ScaleOnHover key={template.id}>
                                        <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-slate-900">{template.name}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditTemplateModal(template)}
                                                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium mb-1">Subject: {template.subject}</p>
                                            <p className="text-sm text-slate-500 line-clamp-3 whitespace-pre-wrap">{template.body}</p>
                                        </div>
                                    </ScaleOnHover>
                                ))}
                            </StaggeredList>
                        </div>
                    </div>
                </div>
            )}
            <TemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSave={handleSaveTemplate}
                initialData={editingTemplate}
                isSaving={isSavingTemplate}
            />
        </div>
    );
}
