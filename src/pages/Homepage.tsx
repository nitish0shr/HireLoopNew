import { useState } from 'react';
import { Check } from 'lucide-react';
import { MarketingLayout } from '../components/layout/MarketingLayout';

const STEPS = [
    {
        id: 1,
        number: '01',
        title: 'Parse JD',
        color: 'step-parse',
        bgColor: 'bg-blue-50',
        borderColor: 'border-step-parse',
        content: {
            title: 'Intelligent JD Parsing',
            features: [
                'Upload or paste any job description',
                'AI extracts must-haves, nice-to-haves, and deal-breakers',
                'Auto-generates scoring rubric with weighted criteria',
                'One-click publish to career page',
            ],
        },
    },
    {
        id: 2,
        number: '02',
        title: 'Source',
        color: 'step-source',
        bgColor: 'bg-green-50',
        borderColor: 'border-step-source',
        content: {
            title: 'Auto-Sourcing',
            features: [
                'Set your match threshold (e.g., 75%+)',
                'Bot continuously searches LinkedIn, GitHub, Stack Overflow',
                'Boolean queries + activity signals (recent commits, posts)',
                'Duplicate detection and profile enrichment',
            ],
        },
    },
    {
        id: 3,
        number: '03',
        title: 'Engage',
        color: 'step-engage',
        bgColor: 'bg-purple-50',
        borderColor: 'border-step-engage',
        content: {
            title: 'Smart Outreach',
            features: [
                'Personalized email sequences (D0 / D3 / D7 / D14)',
                'AI writes Why you\'re a fit based on profile highlights',
                'Track opens, clicks, and replies in real-time',
                'GDPR-compliant unsubscribe and bounce handling',
            ],
        },
    },
    {
        id: 4,
        number: '04',
        title: 'Schedule',
        color: 'step-schedule',
        bgColor: 'bg-orange-50',
        borderColor: 'border-step-schedule',
        content: {
            title: 'One-Click Scheduling',
            features: [
                'Candidate picks from 3 conflict-free slots',
                'Auto-syncs with Google Calendar and Outlook',
                'Generates video links (Zoom/Meet) automatically',
                'Sends calendar invites to all participants',
            ],
        },
    },
    {
        id: 5,
        number: '05',
        title: 'Review',
        color: 'step-review',
        bgColor: 'bg-pink-50',
        borderColor: 'border-step-review',
        content: {
            title: 'AI Prep Packs',
            features: [
                'Auto-generated interview questions targeting gaps',
                '"Listen for" guidance per criterion',
                '5-point rating scale (Definitely Not → Strong Yes)',
                'Export evaluation as PDF for hiring committee',
            ],
        },
    },
];

export default function Homepage() {
    const [activeStep, setActiveStep] = useState(1);
    const currentStep = STEPS.find((s) => s.id === activeStep) || STEPS[0];

    return (
        <MarketingLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-teal-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
                            Hire smarter.
                            <br />
                            <span className="bg-gradient-primary bg-clip-text text-transparent">
                                Work simpler.
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                            HireLoop automates your entire recruiting workflow—from parsing job descriptions
                            to scheduling interviews—so you can focus on finding the perfect hire.
                        </p>
                        <div className="mt-10 flex justify-center gap-4">
                            <a
                                href="/dashboard"
                                className="rounded-md bg-gradient-primary px-8 py-3 text-base font-medium text-white hover:opacity-90"
                            >
                                Get Started Free
                            </a>
                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                className="rounded-md bg-black px-8 py-3 text-base font-medium text-white hover:bg-slate-800"
                            >
                                See How It Works
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5-Step Interactive Section */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900">
                            Your Complete Recruiting Workflow
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            From job description to hired candidate in 5 automated steps
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center space-x-4">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => setActiveStep(step.id)}
                                        className={`relative flex flex-col items-center group`}
                                    >
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all ${activeStep >= step.id
                                                    ? `bg-${step.color} ${step.borderColor} text-white`
                                                    : 'border-slate-300 bg-white text-slate-400'
                                                }`}
                                            style={{
                                                backgroundColor: activeStep >= step.id ? `var(--${step.color})` : undefined,
                                                borderColor: activeStep >= step.id ? `var(--${step.color})` : undefined,
                                            }}
                                        >
                                            {activeStep > step.id ? (
                                                <Check className="h-8 w-8" />
                                            ) : (
                                                <span className="text-xl font-bold">{step.number}</span>
                                            )}
                                        </div>
                                        <span className={`mt-2 text-sm font-medium ${activeStep === step.id ? 'text-slate-900' : 'text-slate-500'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </button>
                                    {index < STEPS.length - 1 && (
                                        <div className={`h-1 w-16 mx-4 ${activeStep > step.id ? 'bg-slate-300' : 'bg-slate-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content Card */}
                    <div className={`rounded-xl border-4 ${currentStep.borderColor} ${currentStep.bgColor} p-8 max-w-3xl mx-auto`}>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">
                            {currentStep.content.title}
                        </h3>
                        <ul className="space-y-4">
                            {currentStep.content.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <Check className={`h-6 w-6 mr-3 flex-shrink-0 text-${currentStep.color}`} />
                                    <span className="text-slate-700">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-gradient-primary py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white">
                        Ready to Transform Your Recruiting?
                    </h2>
                    <p className="mt-4 text-lg text-blue-100">
                        Join hundreds of companies hiring faster and smarter with HireLoop
                    </p>
                    <a
                        href="/dashboard"
                        className="mt-8 inline-block rounded-md bg-white px-8 py-3 text-base font-medium text-primary-600 hover:bg-slate-50"
                    >
                        Get Started Free
                    </a>
                </div>
            </section>
        </MarketingLayout>
    );
}
