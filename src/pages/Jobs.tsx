import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Users, Clock, MoreVertical, Briefcase } from 'lucide-react';
import { jobsService, type Job } from '../services/jobs';
import { format } from 'date-fns';
import { CardSkeleton, EmptyState } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';

export default function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await jobsService.getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to load jobs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
                        <p className="text-sm text-slate-500">Manage your open positions and hiring pipeline.</p>
                    </div>
                    <Link
                        to="/dashboard/jobs/new"
                        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Job
                    </Link>
                </div>
            </FadeIn>

            {loading ? (
                <CardSkeleton count={4} />
            ) : jobs.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No jobs found"
                    description="Get started by creating your first job posting."
                    action={{
                        label: "Create Job",
                        onClick: () => window.location.href = '/dashboard/jobs/new'
                    }}
                />
            ) : (
                <div className="grid gap-4">
                    <StaggeredList staggerDelay={75}>
                        {jobs.map((job) => (
                            <ScaleOnHover key={job.id} scale={1.01}>
                                <Link
                                    to={`/dashboard/jobs/${job.id}`}
                                    className="flex items-center justify-between rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300 cursor-pointer"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-slate-900">{job.title}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${job.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {job.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                Created {job.created_at ? format(new Date(job.created_at), 'MMM d, yyyy') : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-lg font-semibold text-slate-900">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                {job.candidates_count}
                                            </div>
                                            <div className="text-xs text-slate-500">Candidates</div>
                                        </div>
                                        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </Link>
                            </ScaleOnHover>
                        ))}
                    </StaggeredList>
                </div>
            )}
        </div>
    );
}
