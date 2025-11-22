import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { jobsService, type Job } from '../../services/jobs';
import { candidatesService } from '../../services/candidates';
import { showSuccess, showError, showLoading, dismissToast } from '../../lib/toast';

interface CandidateUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export default function CandidateUploadModal({ isOpen, onClose, onUploadSuccess }: CandidateUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadJobs();
        }
    }, [isOpen]);

    const loadJobs = async () => {
        try {
            const data = await jobsService.getJobs();
            setJobs(data.filter(j => j.status !== 'closed'));
        } catch (error) {
            console.error('Failed to load jobs', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedJobId) return;

        const toastId = showLoading('Parsing resume and analyzing fit...');
        setLoading(true);

        try {
            await candidatesService.uploadResume(file, selectedJobId);
            showSuccess('Candidate added successfully');
            onUploadSuccess();
            onClose();
            setFile(null);
            setSelectedJobId('');
        } catch (error) {
            showError('Failed to upload candidate');
        } finally {
            dismissToast(toastId);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-scale-in">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">Add Candidate</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Job Selection */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Assign to Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Select a role...</option>
                            {jobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                    {job.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Resume <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 transition-all hover:border-blue-400 hover:bg-blue-50 hover:scale-[1.02]">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            {file ? (
                                <div className="flex items-center gap-3 text-blue-600">
                                    <FileText className="h-8 w-8" />
                                    <div className="text-left">
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-blue-400">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <Upload className="mx-auto mb-2 h-8 w-8" />
                                    <p className="text-sm font-medium">Click to upload resume</p>
                                    <p className="text-xs">PDF, DOCX, TXT up to 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || !selectedJobId || loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all hover:shadow-md active:scale-95"
                    >
                        {loading ? 'Processing...' : 'Add Candidate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
