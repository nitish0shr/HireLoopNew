import { Check } from 'lucide-react';
import { MarketingLayout } from '../components/layout/MarketingLayout';

const SOLUTIONS = [
    {
        title: 'JD Intake & Parsing',
        features: [
            'Upload or paste any job description format',
            'AI extracts must-haves, nice-to-haves, deal-breakers',
            'Auto-generates weighted scoring rubric',
        ],
    },
    {
        title: 'Candidate Screening',
        features: [
            'Text embeddings for semantic matching (0–100 score)',
            'Highlights strengths and gaps vs. requirements',
            'Filters by sponsorship, relocation, salary expectations',
        ],
    },
    {
        title: 'Smart Outreach',
        features: [
            'Multi-step sequences (D0 / D3 / D7 / D14)',
            'AI-personalized emails based on profile highlights',
            'Open/click/reply tracking with GDPR compliance',
        ],
    },
    {
        title: 'One-Click Scheduling',
        features: [
            'Syncs with Google Calendar and Outlook',
            'Proposes 3 conflict-free slots to candidate',
            'Auto-generates video links and sends invites',
        ],
    },
    {
        title: 'Prep Packs',
        features: [
            'AI-generated interview questions targeting gaps',
            '"Listen for" guidance per criterion',
            '5-point rating scale with exportable evaluations',
        ],
    },
    {
        title: 'Pipeline Health',
        features: [
            'Real-time health index (0–100) per job',
            'Auto-sourcing triggers when pipeline is weak',
            'Stale stage alerts and reply rate monitoring',
        ],
    },
    {
        title: 'Analytics & Insights',
        features: [
            'Conversion funnel (applied → hired)',
            'Source performance and time-to-hire metrics',
            'DEI insights (gender diversity by stage)',
        ],
    },
    {
        title: 'Compliance & Audit',
        features: [
            'Full audit trail of candidate interactions',
            'GDPR-compliant data handling',
            'Customizable rejection reasons and notes',
        ],
    },
];

export default function Solutions() {
    return (
        <MarketingLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                        Complete Recruiting Solutions
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Everything you need to hire faster and smarter—all in one platform
                    </p>
                </div>
            </section>

            {/* Solutions Grid */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {SOLUTIONS.map((solution) => (
                            <div
                                key={solution.title}
                                className="rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-primary-500 hover:shadow-lg transition-all"
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-4">{solution.title}</h3>
                                <ul className="space-y-3">
                                    {solution.features.map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="h-5 w-5 flex-shrink-0 text-green-500 mr-2 mt-0.5" />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-primary py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white">
                        See All Features in Action
                    </h2>
                    <p className="mt-4 text-lg text-blue-100">
                        Schedule a personalized demo with our team
                    </p>
                    <button className="mt-8 inline-block rounded-md bg-white px-8 py-3 text-base font-medium text-primary-600 hover:bg-slate-50">
                        Book a Demo
                    </button>
                </div>
            </section>
        </MarketingLayout>
    );
}
