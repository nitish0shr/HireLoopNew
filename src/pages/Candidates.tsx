import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Download } from 'lucide-react';
import { candidatesService, type Candidate } from '../services/candidates';
import { exportCandidatesToCsv } from '../lib/export';
import { showSuccess, showError } from '../lib/toast';
import { CardSkeleton, EmptyState } from '../components/ui/LoadingStates';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';
import CandidateUploadModal from '../components/modals/CandidateUploadModal';

export default function Candidates() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [scoreFilter, setScoreFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        loadCandidates();
    }, []);

    useEffect(() => {
        filterCandidates();
    }, [candidates, searchTerm, stageFilter, scoreFilter, roleFilter, sourceFilter]);

    const loadCandidates = async () => {
        try {
            const data = await candidatesService.getCandidates();
            setCandidates(data);
        } catch (error) {
            showError('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const filterCandidates = () => {
        let filtered = [...candidates];

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (stageFilter !== 'all') {
            filtered = filtered.filter(c => c.stage === stageFilter);
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(c => c.role === roleFilter);
        }

        if (sourceFilter !== 'all') {
            filtered = filtered.filter(c => (c.source || 'Direct Application') === sourceFilter);
        }

        if (scoreFilter !== 'all') {
            if (scoreFilter === 'high') {
                filtered = filtered.filter(c => c.fit_score >= 80);
            } else if (scoreFilter === 'medium') {
                filtered = filtered.filter(c => c.fit_score >= 60 && c.fit_score < 80);
            } else if (scoreFilter === 'low') {
                filtered = filtered.filter(c => c.fit_score < 60);
            }
        }

        setFilteredCandidates(filtered);
    };



    const handleExport = () => {
        const toExport = selectedIds.size > 0
            ? filteredCandidates.filter(c => selectedIds.has(c.id))
            : filteredCandidates;

        exportCandidatesToCsv(toExport);
        showSuccess(`Exported ${toExport.length} candidates`);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredCandidates.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const roles = Array.from(new Set(candidates.map(c => c.role))).sort();
    const sources = Array.from(new Set(candidates.map(c => c.source || 'Direct Application'))).sort();

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
                        <p className="text-sm text-slate-500">
                            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
                            {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Resume
                        </button>
                    </div>
                </div>
            </FadeIn>

            {/* Filters */}
            <FadeIn delay={100}>
                <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition-all focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>

                    <select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Stages</option>
                        <option value="new">Application Review</option>
                        <option value="screening">Recruiter Screen</option>
                        <option value="interview">Hiring Manager Interview</option>
                        <option value="onsite">Virtual On-site</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Sources</option>
                        {sources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </select>

                    <select
                        value={scoreFilter}
                        onChange={(e) => setScoreFilter(e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Scores</option>
                        <option value="high">High (80+)</option>
                        <option value="medium">Medium (60-79)</option>
                        <option value="low">Low (&lt;60)</option>
                    </select>

                    {(searchTerm || stageFilter !== 'all' || scoreFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStageFilter('all');
                                setScoreFilter('all');
                                setRoleFilter('all');
                                setSourceFilter('all');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </FadeIn>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <FadeIn>
                    <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedIds.size} selected
                        </span>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                        >
                            Clear Selection
                        </button>
                    </div>
                </FadeIn>
            )}

            {/* Candidates List */}
            {loading ? (
                <CardSkeleton count={5} />
            ) : filteredCandidates.length === 0 ? (
                <EmptyState
                    icon={Upload}
                    title="No candidates found"
                    description={searchTerm || stageFilter !== 'all' || scoreFilter !== 'all'
                        ? "Try adjusting your filters or search term"
                        : "Upload a resume to add your first candidate"}
                    action={!searchTerm && stageFilter === 'all' && scoreFilter === 'all' ? {
                        label: "Upload Resume",
                        onClick: () => setIsUploadModalOpen(true)
                    } : undefined}
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-4">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                        />
                        <span className="text-sm text-slate-600">Select all</span>
                    </div>

                    <StaggeredList staggerDelay={50}>
                        {filteredCandidates.map((candidate) => (
                            <ScaleOnHover key={candidate.id} scale={1.01}>
                                <div
                                    className={`rounded-lg border bg-white p-6 transition-all ${selectedIds.has(candidate.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(candidate.id)}
                                                onChange={() => toggleSelect(candidate.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                                            />
                                            <Link to={`/dashboard/candidates/${candidate.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-medium text-slate-600">
                                                    {candidate.name[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{candidate.name}</h3>
                                                    <p className="text-sm text-slate-500">
                                                        {candidate.role} • {candidate.source || 'Direct Application'}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className={`text-lg font-bold ${candidate.fit_score >= 80 ? 'text-green-600' :
                                                    candidate.fit_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {candidate.fit_score}%
                                                </div>
                                                <p className="text-xs text-slate-500">Fit Score</p>
                                            </div>

                                            <div className="text-right">
                                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${candidate.stage === 'new' ? 'bg-blue-100 text-blue-700' :
                                                    candidate.stage === 'screening' ? 'bg-indigo-100 text-indigo-700' :
                                                        candidate.stage === 'interview' ? 'bg-purple-100 text-purple-700' :
                                                            candidate.stage === 'offer' ? 'bg-amber-100 text-amber-700' :
                                                                candidate.stage === 'hired' ? 'bg-green-100 text-green-700' :
                                                                    candidate.stage === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {candidate.stage === 'new' ? 'Application Review' :
                                                        candidate.stage === 'screening' ? 'Recruiter Screen' :
                                                            candidate.stage === 'interview' ? 'Hiring Manager' :
                                                                candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                                                </span>
                                            </div>

                                            <div className="text-right min-w-[100px]">
                                                <p className="text-sm text-slate-600">
                                                    {new Date(candidate.created_at || Date.now()).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-500">Applied</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScaleOnHover>
                        ))}
                    </StaggeredList>
                </div>
            )}

            <CandidateUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={loadCandidates}
            />
        </div>
    );
}
