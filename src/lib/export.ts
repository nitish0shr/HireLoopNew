import type { Candidate } from '../services/candidates';
import type { Job } from '../services/jobs';

export const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle arrays and objects
                if (Array.isArray(value)) {
                    return `"${value.join('; ')}"`;
                }
                if (typeof value === 'object' && value !== null) {
                    return `"${JSON.stringify(value)}"`;
                }
                // Escape quotes and wrap in quotes if contains comma
                const stringValue = String(value || '');
                return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportCandidatesToCsv = (candidates: Candidate[]) => {
    const exportData = candidates.map(c => ({
        Name: c.name,
        Email: c.email,
        Role: c.role,
        'Fit Score': c.fit_score,
        Stage: c.stage,
        Skills: c.skills?.join('; ') || '',
        Experience: c.experience || '',
        Education: c.education || '',
        'Applied At': c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A',
    }));

    exportToCsv(exportData, 'candidates');
};

export const exportJobsToCsv = (jobs: Job[]) => {
    const exportData = jobs.map(j => ({
        Title: j.title,
        Department: j.department,
        Location: j.location,
        Type: j.type,
        Status: j.status,
        'Candidates Count': j.candidates_count,
        'Created At': j.created_at ? new Date(j.created_at).toLocaleDateString() : 'N/A',
    }));

    exportToCsv(exportData, 'jobs');
};
