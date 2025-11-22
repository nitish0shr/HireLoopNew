import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface PipelineChartProps {
    data: {
        applicationReview: number;
        phoneScreen: number;
        hiringManagerInterview: number;
        virtualOnsite: number;
        offer: number;
        hired: number;
        rejected: number;
    };
}

export default function PipelineChart({ data }: PipelineChartProps) {
    const chartData = [
        { name: 'New', count: data.applicationReview, color: '#3b82f6' },
        { name: 'Screen', count: data.phoneScreen, color: '#6366f1' },
        { name: 'Interview', count: data.hiringManagerInterview, color: '#a855f7' },
        { name: 'Onsite', count: data.virtualOnsite, color: '#ec4899' },
        { name: 'Offer', count: data.offer, color: '#eab308' },
        { name: 'Hired', count: data.hired, color: '#22c55e' },
        { name: 'Rejected', count: data.rejected, color: '#9ca3af' },
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1500} animationBegin={200}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
