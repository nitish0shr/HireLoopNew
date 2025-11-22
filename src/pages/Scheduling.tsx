import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, CheckCircle, Users, Calendar } from 'lucide-react';
import { candidatesService, type Candidate } from '../services/candidates';
import { showSuccess } from '../lib/toast';
import { StatsCardSkeleton, CardSkeleton, EmptyState } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';

interface TimeSlot {
    id: string;
    start: Date;
    end: Date;
    available: boolean;
}

interface Interview {
    id: string;
    candidateId: string;
    start: Date;
    end: Date;
    videoLink: string;
    status: 'scheduled' | 'completed';
    interviewers: string[];
    emailTemplate: string;
    type: 'phone' | 'virtual' | 'onsite';
}

const MOCK_INTERVIEWERS = [
    'Sarah Jenkins (Engineering Manager)',
    'Mike Ross (Senior Developer)',
    'Rachel Zane (Product Manager)',
    'Harvey Specter (VP of Engineering)'
];

const EMAIL_TEMPLATES = [
    { id: 'initial', name: 'Initial Screen Invite' },
    { id: 'technical', name: 'Technical Interview Invite' },
    { id: 'onsite', name: 'Virtual Onsite Invite' }
];

const INTERVIEW_TYPES = [
    { value: 'phone', label: 'Phone Interview', icon: '📞' },
    { value: 'virtual', label: 'Virtual Interview', icon: '💻' },
    { value: 'onsite', label: 'On-site Interview', icon: '🏢' }
];

export default function Scheduling() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [loading, setLoading] = useState(true);

    // New state for enhanced features
    const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('initial');
    const [sendEmail, setSendEmail] = useState(true);
    const [interviewType, setInterviewType] = useState<'phone' | 'virtual' | 'onsite'>('virtual');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allCandidates = await candidatesService.getCandidates();
            const shortlisted = allCandidates.filter(c => c.fit_score >= 70 && c.stage !== 'hired');
            setCandidates(shortlisted);

            // Load interviews from API
            const response = await fetch('http://localhost:3001/api/interviews');
            if (response.ok) {
                const data = await response.json();
                setInterviews(data.map((i: any) => ({
                    ...i,
                    start: new Date(i.start_time),
                    end: new Date(i.end_time),
                    videoLink: i.video_link,
                    candidateId: i.candidate_id,
                    // Map other fields if needed or ensure backend returns them
                    interviewers: i.interviewers ? JSON.parse(i.interviewers) : [],
                })));
            }
        } catch (error) {
            console.error('Failed to load scheduling data', error);
        } finally {
            setLoading(false);
        }
    };

    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const today = new Date();

        for (let day = 1; day <= 7; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() + day);

            // Morning slots (9 AM - 12 PM)
            for (let hour = 9; hour < 12; hour++) {
                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setHours(hour + 1);

                slots.push({
                    id: `${date.toDateString()}-${hour}`,
                    start,
                    end,
                    available: Math.random() > 0.3, // 70% available
                });
            }

            // Afternoon slots (2 PM - 5 PM)
            for (let hour = 14; hour < 17; hour++) {
                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setHours(hour + 1);

                slots.push({
                    id: `${date.toDateString()}-${hour}`,
                    start,
                    end,
                    available: Math.random() > 0.3,
                });
            }
        }

        return slots;
    };

    const [timeSlots] = useState(generateTimeSlots());

    const toggleInterviewer = (interviewer: string) => {
        if (selectedInterviewers.includes(interviewer)) {
            setSelectedInterviewers(selectedInterviewers.filter(i => i !== interviewer));
        } else {
            setSelectedInterviewers([...selectedInterviewers, interviewer]);
        }
    };

    const scheduleInterview = async () => {
        if (!selectedCandidate || !selectedSlot) return;

        try {
            const response = await fetch('http://localhost:3001/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidate_id: selectedCandidate.id,
                    start_time: selectedSlot.start.toISOString(),
                    end_time: selectedSlot.end.toISOString(),
                    video_link: `https://meet.google.com/${Math.random().toString(36).substring(7)}`,
                    status: 'scheduled',
                    interviewers: JSON.stringify(selectedInterviewers),
                    type: interviewType
                })
            });

            if (!response.ok) throw new Error('Failed to schedule');

            const savedInterview = await response.json();

            // Transform for UI
            const newInterview: Interview = {
                id: savedInterview.id,
                candidateId: savedInterview.candidate_id,
                start: new Date(savedInterview.start_time),
                end: new Date(savedInterview.end_time),
                videoLink: savedInterview.video_link,
                status: savedInterview.status,
                interviewers: selectedInterviewers,
                emailTemplate: selectedTemplate,
                type: interviewType
            };

            setInterviews([...interviews, newInterview]);

            showSuccess(`${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} interview scheduled with ${selectedCandidate.name}`);
            if (sendEmail) {
                setTimeout(() => showSuccess('Invite email sent to candidate and interviewers'), 1000);
            }

            // Reset form
            setSelectedCandidate(null);
            setSelectedSlot(null);
            setSelectedInterviewers([]);
            setSelectedTemplate('initial');
            setInterviewType('virtual');
        } catch (error) {
            showSuccess('Failed to schedule interview'); // Using showSuccess as error fallback based on toast lib
            console.error(error);
        }
    };

    const upcomingInterviews = interviews.filter(i => i.start > new Date()).sort((a, b) => a.start.getTime() - b.start.getTime());

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <CardSkeleton count={1} className="h-96" />
                    <CardSkeleton count={1} className="h-96" />
                    <CardSkeleton count={1} className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Scheduling</h1>
                    <p className="text-sm text-slate-500">One-click interview scheduling with calendar sync</p>
                </div>
            </FadeIn>

            {/* Stats */}
            <StaggeredList className="grid grid-cols-1 gap-6 md:grid-cols-3" staggerDelay={100}>
                <ScaleOnHover>
                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-10 w-10 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{upcomingInterviews.length}</div>
                                <div className="text-sm text-slate-500">Upcoming</div>
                            </div>
                        </div>
                    </div>
                </ScaleOnHover>

                <ScaleOnHover>
                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <Clock className="h-10 w-10 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{candidates.length}</div>
                                <div className="text-sm text-slate-500">Ready to Schedule</div>
                            </div>
                        </div>
                    </div>
                </ScaleOnHover>

                <ScaleOnHover>
                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {interviews.filter(i => i.status === 'completed').length}
                                </div>
                                <div className="text-sm text-slate-500">Completed</div>
                            </div>
                        </div>
                    </div>
                </ScaleOnHover>
            </StaggeredList>

            {/* Scheduling Interface */}
            <FadeIn delay={300}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Candidate Selection */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">1. Select Candidate</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {candidates.map((candidate) => (
                                <button
                                    key={candidate.id}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${selectedCandidate?.id === candidate.id
                                        ? 'border-primary-500 bg-primary-50 shadow-sm scale-[1.02]'
                                        : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white shadow-sm">
                                            {candidate.name[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-slate-900">{candidate.name}</h4>
                                            <p className="text-sm text-slate-600">{candidate.role}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">{candidate.fit_score}%</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">2. Select Time</h3>
                        {!selectedCandidate ? (
                            <div className="flex h-64 items-center justify-center text-center">
                                <div>
                                    <Clock className="mx-auto h-12 w-12 text-slate-300 animate-pulse" />
                                    <p className="mt-4 text-sm text-slate-500">Select a candidate first</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {timeSlots.filter(s => s.available).slice(0, 10).map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${selectedSlot?.id === slot.id
                                            ? 'border-green-500 bg-green-50 shadow-sm scale-[1.02]'
                                            : 'border-slate-200 hover:border-green-300 hover:bg-slate-50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {slot.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {slot.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {' '}
                                                    {slot.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {selectedSlot?.id === slot.id && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details & Confirmation */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">3. Interview Details</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Interview Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {INTERVIEW_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setInterviewType(type.value as any)}
                                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200 ${interviewType === type.value
                                                ? 'border-blue-600 bg-blue-50 scale-105 shadow-sm'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-2xl">{type.icon}</span>
                                            <span className="text-xs font-medium text-slate-700">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Interview Panel</label>
                                <div className="space-y-2">
                                    {MOCK_INTERVIEWERS.map(interviewer => (
                                        <label key={interviewer} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedInterviewers.includes(interviewer)}
                                                onChange={() => toggleInterviewer(interviewer)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            {interviewer}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Template</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                >
                                    {EMAIL_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                Send calendar invites automatically
                            </label>

                            <button
                                onClick={scheduleInterview}
                                disabled={!selectedCandidate || !selectedSlot}
                                className={`w-full rounded-md px-4 py-3 text-sm font-medium text-white transition-all duration-200 ${!selectedCandidate || !selectedSlot
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-gradient-primary hover:opacity-90 hover:shadow-lg active:scale-95'
                                    }`}
                            >
                                Schedule Interview
                            </button>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Upcoming Interviews */}
            <FadeIn delay={500}>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Interviews</h3>
                    {upcomingInterviews.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No interviews scheduled"
                            description="Select a candidate and time slot to schedule your first interview."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingInterviews.map((interview) => {
                                const candidate = candidates.find(c => c.id === interview.candidateId);
                                if (!candidate) return null;

                                return (
                                    <ScaleOnHover key={interview.id}>
                                        <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-white shadow-sm">
                                                    {candidate.name[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900">{candidate.name}</h4>
                                                    <p className="text-sm text-slate-600">{candidate.role}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    {interview.start.toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Clock className="h-4 w-4" />
                                                    {interview.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                </div>
                                                {interview.interviewers && interview.interviewers.length > 0 && (
                                                    <div className="flex items-start gap-2 text-slate-600">
                                                        <Users className="h-4 w-4 mt-0.5" />
                                                        <div className="flex flex-wrap gap-1">
                                                            {interview.interviewers.map((name, i) => (
                                                                <span key={i} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    {name.split(' ')[0]}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <a
                                                    href={interview.videoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-2 font-medium hover:underline"
                                                >
                                                    <Video className="h-4 w-4" />
                                                    Join Video Call
                                                </a>
                                            </div>
                                        </div>
                                    </ScaleOnHover>
                                );
                            })}
                        </div>
                    )}
                </div>
            </FadeIn>
        </div>
    );
}
