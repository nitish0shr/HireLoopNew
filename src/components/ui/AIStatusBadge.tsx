import { Brain, BrainCircuit } from 'lucide-react';
import { aiService } from '../../services/ai';

export function AIStatusBadge() {
    return (
        <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5">
            {aiService.isAIEnabled() ? (
                <>
                    <BrainCircuit className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">AI Enabled</span>
                </>
            ) : (
                <>
                    <Brain className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Mock Mode</span>
                </>
            )}
        </div>
    );
}
