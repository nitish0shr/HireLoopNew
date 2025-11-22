import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus } from 'lucide-react';
import { candidatesService, type Candidate } from '../services/candidates';
import { showSuccess } from '../lib/toast';
import { CardSkeleton } from '../components/ui/LoadingStates';
import { FadeIn, ScaleOnHover } from '../components/ui/Animations';

const STAGES = [
    { id: 'new', name: 'New Applied', color: 'border-blue-500' },
    { id: 'screening', name: 'Screening', color: 'border-indigo-500' },
    { id: 'interview', name: 'Interview', color: 'border-purple-500' },
    { id: 'offer', name: 'Offer', color: 'border-green-500' },
    { id: 'hired', name: 'Hired', color: 'border-emerald-600' },
];

export default function Pipeline() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCandidates();
    }, []);

    const loadCandidates = async () => {
        const data = await candidatesService.getCandidates();
        setCandidates(data);
        setLoading(false);
    };

    const getCandidatesByStage = (stageId: string) => {
        return candidates.filter((c) => c.stage === stageId);
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId;
        const candidate = candidates.find((c) => c.id === draggableId);

        if (!candidate) return;

        // Optimistic update
        const updatedCandidates = candidates.map((c) =>
            c.id === draggableId ? { ...c, stage: newStage as Candidate['stage'] } : c
        );
        setCandidates(updatedCandidates);

        try {
            await candidatesService.updateCandidate(draggableId, { stage: newStage as Candidate['stage'] });

            // Update in storage as backup/cache
            const storedCandidates = JSON.parse(localStorage.getItem('hireloop_candidates') || '[]');
            const updated = storedCandidates.map((c: Candidate) =>
                c.id === draggableId ? { ...c, stage: newStage } : c
            );
            localStorage.setItem('hireloop_candidates', JSON.stringify(updated));

            const stageName = STAGES.find(s => s.id === newStage)?.name || newStage;
            showSuccess(`${candidate.name} moved to ${stageName}`);
        } catch (error) {
            console.error('Failed to update candidate stage:', error);
            // Revert on failure
            setCandidates(candidates);
            showSuccess('Failed to move candidate');
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-80 flex-shrink-0">
                            <CardSkeleton count={3} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
                        <p className="text-sm text-slate-500">Drag and drop candidates to move them between stages.</p>
                    </div>
                    <button className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Candidate
                    </button>
                </div>
            </FadeIn>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex h-full gap-6 min-w-[1000px]">
                        {STAGES.map((stage, stageIndex) => (
                            <FadeIn key={stage.id} delay={stageIndex * 100}>
                                <div className="flex h-full w-80 flex-col rounded-lg bg-slate-50 border border-slate-200">
                                    <div className={`flex items-center justify-between border-t-4 bg-white p-4 shadow-sm rounded-t-lg ${stage.color}`}>
                                        <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                            {getCandidatesByStage(stage.id).length}
                                        </span>
                                    </div>

                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                {getCandidatesByStage(stage.id).map((candidate, index) => (
                                                    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{ ...provided.draggableProps.style }}
                                                            >
                                                                <ScaleOnHover scale={1.02}>
                                                                    <div className={`cursor-pointer rounded-md border bg-white p-3 shadow-sm transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:shadow-md'
                                                                        }`}>
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h4 className="font-medium text-slate-900">{candidate.name}</h4>
                                                                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 mb-3">{candidate.role}</p>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className={`text-xs font-bold ${candidate.fit_score >= 80 ? 'text-green-600' : 'text-yellow-600'
                                                                                }`}>
                                                                                {candidate.fit_score}% Match
                                                                            </div>
                                                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">
                                                                                {candidate.name[0]}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </ScaleOnHover>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}

                                                {getCandidatesByStage(stage.id).length === 0 && !snapshot.isDraggingOver && (
                                                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-400">
                                                        No candidates
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}
