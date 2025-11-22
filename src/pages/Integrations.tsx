import { useState, useEffect } from 'react';
import { Mail, Video, MessageSquare, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { showSuccess, showError } from '../lib/toast';
import { FadeIn, StaggeredList, ScaleOnHover } from '../components/ui/Animations';
import { integrationsService } from '../services/integrations';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: any;
    status: 'connected' | 'disconnected';
    color: string;
}

export default function Integrations() {
    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: 'gmail',
            name: 'Gmail',
            description: 'Sync emails and calendar events.',
            icon: Mail,
            status: 'disconnected',
            color: 'text-red-600 bg-red-100'
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Receive notifications and updates in Slack channels.',
            icon: MessageSquare,
            status: 'disconnected',
            color: 'text-purple-600 bg-purple-100'
        },
        {
            id: 'zoom',
            name: 'Zoom',
            description: 'Automatically generate meeting links for interviews.',
            icon: Video,
            status: 'disconnected',
            color: 'text-blue-600 bg-blue-100'
        },
        {
            id: 'gcal',
            name: 'Google Calendar',
            description: 'Sync interview schedules.',
            icon: Calendar,
            status: 'disconnected',
            color: 'text-green-600 bg-green-100'
        }
    ]);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const data = await integrationsService.getIntegrations();
            if (Array.isArray(data)) {
                setIntegrations(prev => prev.map(int => {
                    const saved = data.find((d: any) => d.id === int.id);
                    return saved ? { ...int, status: saved.status } : int;
                }));
            }
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        }
    };

    const toggleIntegration = async (id: string) => {
        const integration = integrations.find(int => int.id === id);
        if (!integration) return;

        const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';

        // Optimistic update
        setIntegrations(prev => prev.map(int =>
            int.id === id ? { ...int, status: newStatus } : int
        ));

        try {
            await integrationsService.updateIntegration(id, integration.name, newStatus);
            showSuccess(`${integration.name} ${newStatus === 'connected' ? 'connected' : 'disconnected'}`);
        } catch (error) {
            console.error('Failed to update integration:', error);
            showError('Failed to update integration');
            // Revert
            setIntegrations(prev => prev.map(int =>
                int.id === id ? { ...int, status: integration.status } : int
            ));
        }
    };

    return (
        <div className="space-y-6">
            <FadeIn>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
                    <p className="text-sm text-slate-500">Connect your favorite tools to HireLoop.</p>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StaggeredList>
                    {integrations.map((integration) => (
                        <ScaleOnHover key={integration.id}>
                            <div className="flex items-start justify-between rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-all h-full">
                                <div className="flex gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${integration.color}`}>
                                        <integration.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                                        <p className="text-sm text-slate-500">{integration.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleIntegration(integration.id)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all active:scale-95 ${integration.status === 'connected'
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {integration.status === 'connected' ? (
                                        <>
                                            <CheckCircle className="h-3 w-3" />
                                            Connected
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-3 w-3" />
                                            Connect
                                        </>
                                    )}
                                </button>
                            </div>
                        </ScaleOnHover>
                    ))}
                </StaggeredList>
            </div>
        </div>
    );
}
