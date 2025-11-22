import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { showSuccess } from '../lib/toast';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            showSuccess('Thanks for reaching out! We\'ll get back to you soon.');
            setFormData({ name: '', email: '', company: '', message: '' });
            setSubmitting(false);
        }, 1000);
    };

    return (
        <MarketingLayout>
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
                        <p className="mt-4 text-lg text-slate-600">
                            Have questions? We're here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <a
                                    href="mailto:hello@hireloop.ai"
                                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <Mail className="h-6 w-6 text-primary-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-slate-900">Email</div>
                                        <div className="text-slate-600">hello@hireloop.ai</div>
                                    </div>
                                </a>

                                <a
                                    href="tel:1-800-HIRELOOP"
                                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <Phone className="h-6 w-6 text-primary-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-slate-900">Phone</div>
                                        <div className="text-slate-600">1-800-HIRELOOP</div>
                                    </div>
                                </a>

                                <div className="flex items-start gap-4 p-4 rounded-lg">
                                    <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-slate-900">Office</div>
                                        <div className="text-slate-600">
                                            123 Innovation Drive<br />
                                            San Francisco, CA 94105
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-md bg-gradient-primary px-6 py-3 text-base font-medium text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {submitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
