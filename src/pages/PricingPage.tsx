import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { MarketingLayout } from '../components/layout/MarketingLayout';

const TIERS = [
    {
        name: 'Starter',
        price: '$2,500',
        period: '/role/month',
        description: 'Perfect for small teams and startups',
        features: [
            '1 active role at a time',
            'Up to 100 candidates/month',
            'AI-powered matching',
            'Email sequences (D0/D3/D7)',
            'Basic analytics',
            'Email support',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Growth',
        price: '$2,000',
        period: '/role/month',
        description: 'Most popular for growing companies',
        features: [
            '5 active roles simultaneously',
            'Up to 500 candidates/month',
            'Advanced AI matching',
            'Full outreach sequences',
            'Auto-sourcing from LinkedIn',
            'Interview scheduling',
            'Prep packs & scorecards',
            'Advanced analytics',
            'Priority support',
        ],
        cta: 'Get Started',
        popular: true,
    },
    {
        name: 'Pro',
        price: '$1,500',
        period: '/role/month',
        description: 'For high-volume recruiting teams',
        features: [
            '15 active roles simultaneously',
            'Unlimited candidates',
            'Multi-source auto-sourcing',
            'Custom email templates',
            'API access',
            'Dedicated account manager',
            'Custom integrations',
            'SLA guarantee',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Scale',
        price: 'Custom',
        period: '',
        description: 'Enterprise-grade recruiting',
        features: [
            'Unlimited active roles',
            'Unlimited candidates',
            'White-label options',
            'Custom AI models',
            'SSO & SAML',
            '24/7 dedicated support',
            'On-premise deployment option',
            'Custom SLA',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function Pricing() {
    const [rolesPerMonth, setRolesPerMonth] = useState(5);
    const [avgSalary, setAvgSalary] = useState(120000);
    const [showMath, setShowMath] = useState(false);

    // ROI Calculations
    const traditionalCost = rolesPerMonth * avgSalary * 0.20; // 20% recruiter fee
    const hireloopCost = rolesPerMonth * 2500; // $2,500 per role
    const savings = traditionalCost - hireloopCost;
    const percentReduction = ((savings / traditionalCost) * 100).toFixed(0);
    const daysFaster = 12; // Configurable metric
    const profilesPerMonth = rolesPerMonth * 50; // Assume 50 profiles per role

    return (
        <MarketingLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Choose the plan that's right for your team's hiring needs
                    </p>
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative rounded-xl border-2 p-8 ${tier.popular
                                        ? 'border-primary-500 bg-primary-50 shadow-lg'
                                        : 'border-slate-200 bg-white'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-gradient-primary px-4 py-1 text-sm font-medium text-white">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                                    <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
                                    <div className="mt-6">
                                        <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                                        <span className="text-slate-600">{tier.period}</span>
                                    </div>
                                </div>

                                <ul className="mt-8 space-y-3">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="h-5 w-5 flex-shrink-0 text-green-500 mr-2" />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`mt-8 w-full rounded-md px-4 py-3 text-sm font-medium ${tier.popular
                                            ? 'bg-gradient-primary text-white hover:opacity-90'
                                            : 'bg-black text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {tier.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROI Calculator */}
            <section className="py-16 bg-slate-50">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">ROI Calculator</h2>
                        <p className="mt-2 text-slate-600">See how much you can save with HireLoop</p>
                    </div>

                    <div className="rounded-xl bg-white p-8 shadow-sm">
                        {/* Sliders */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Roles per Month: <span className="font-bold text-primary-600">{rolesPerMonth}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={rolesPerMonth}
                                    onChange={(e) => setRolesPerMonth(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Average Salary: <span className="font-bold text-primary-600">${avgSalary.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range"
                                    min="50000"
                                    max="300000"
                                    step="10000"
                                    value={avgSalary}
                                    onChange={(e) => setAvgSalary(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                />
                            </div>
                        </div>

                        {/* Quick Results */}
                        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    ${savings.toLocaleString()}
                                </div>
                                <div className="text-sm text-slate-600">Monthly Savings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary-600">{percentReduction}%</div>
                                <div className="text-sm text-slate-600">Cost Reduction</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">{daysFaster}</div>
                                <div className="text-sm text-slate-600">Days Faster</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600">{profilesPerMonth}</div>
                                <div className="text-sm text-slate-600">Profiles/Month</div>
                            </div>
                        </div>

                        {/* Show/Hide Math Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setShowMath(!showMath)}
                                className="inline-flex items-center gap-2 rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                {showMath ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                {showMath ? 'Hide Comparison' : 'Show Me the Math'}
                            </button>
                        </div>

                        {/* Detailed Comparison */}
                        {showMath && (
                            <div className="mt-6 rounded-lg border-2 border-slate-200 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Traditional Recruiter */}
                                    <div className="rounded-lg bg-slate-50 p-6">
                                        <h4 className="text-lg font-bold text-slate-900 mb-4">Traditional Recruiter</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Roles per month:</span>
                                                <span className="font-medium">{rolesPerMonth}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Placement fee (20%):</span>
                                                <span className="font-medium">${(avgSalary * 0.20).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2">
                                                <span className="font-bold">Total Cost:</span>
                                                <span className="font-bold text-red-600">${traditionalCost.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Avg. Time to Hire:</span>
                                                <span className="font-medium">36 days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Profiles Reviewed:</span>
                                                <span className="font-medium">{rolesPerMonth * 20}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* HireLoop Bot */}
                                    <div className="rounded-lg bg-green-50 p-6">
                                        <h4 className="text-lg font-bold text-slate-900 mb-4">HireLoop Bot</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Roles per month:</span>
                                                <span className="font-medium">{rolesPerMonth}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Bot cost per role:</span>
                                                <span className="font-medium">$2,500</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2">
                                                <span className="font-bold">Total Cost:</span>
                                                <span className="font-bold text-green-600">${hireloopCost.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Avg. Time to Hire:</span>
                                                <span className="font-medium">24 days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Profiles Reviewed:</span>
                                                <span className="font-medium">{profilesPerMonth}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-gradient-primary py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white">
                        Ready to Start Saving?
                    </h2>
                    <p className="mt-4 text-lg text-blue-100">
                        Start your free trial today—no credit card required
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
