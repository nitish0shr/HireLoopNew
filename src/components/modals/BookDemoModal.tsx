import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar } from 'lucide-react';
import { showSuccess } from '../../lib/toast';

interface BookDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showSuccess('Demo request received! We\'ll contact you soon.');
        setFormData({ name: '', email: '', company: '' });
        onClose();
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-  shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <Dialog.Title className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="h-6 w-6 text-primary-600" />
                                    Book a Demo
                                </Dialog.Title>
                                <button
                                    onClick={onClose}
                                    className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <Dialog.Description className="text-slate-600 mb-6">
                                Schedule a personalized demo with our team to see HireLoop in action.
                            </Dialog.Description>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="demo-name" className="block text-sm font-medium text-slate-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="demo-name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="demo-email" className="block text-sm font-medium text-slate-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="demo-email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="demo-company" className="block text-sm font-medium text-slate-700 mb-2">
                                        Company *
                                    </label>
                                    <input
                                        type="text"
                                        id="demo-company"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all hover:shadow-md active:scale-95"
                                    >
                                        Schedule Demo
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
