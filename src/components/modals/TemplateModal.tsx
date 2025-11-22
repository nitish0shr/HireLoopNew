import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Template } from '../../services/templates';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: Omit<Template, 'id' | 'created_at'>) => Promise<void>;
    initialData?: Template;
    isSaving: boolean;
}

export default function TemplateModal({ isOpen, onClose, onSave, initialData, isSaving }: TemplateModalProps) {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('candidate');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSubject(initialData.subject);
            setBody(initialData.body);
            setCategory(initialData.category);
        } else {
            setName('');
            setSubject('');
            setBody('');
            setCategory('candidate');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, subject, body, category });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {initialData ? 'Edit Template' : 'New Template'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="e.g., Initial Outreach"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="candidate">Candidate Email</option>
                            <option value="hiring_manager">Hiring Manager Email</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="e.g., Opportunity at HireLoop - {{role}}"
                        />
                        <p className="text-xs text-slate-500 mt-1">Use {'{{variable}}'} for dynamic content</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Body</label>
                        <textarea
                            required
                            rows={8}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full rounded-md border border-slate-300 p-2 text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Hi {{name}}, ..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md border border-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-all hover:shadow-md active:scale-95"
                        >
                            {isSaving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
