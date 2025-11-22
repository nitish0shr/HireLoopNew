import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
});

// Helper function to generate IDs
// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface Job {
    id: string;
    title: string;
    department: string;
    description: string;
    requirements: string;
    responsibilities: string;
    status: string;
    location: string;
    type: string;
    created_at: string;
}

interface Candidate {
    id: string;
    job_id: string;
    name: string;
    email: string;
    resume_text: string;
    skills: string;
    experience: string;
    education: string;
    fit_score: number;
    summary: string;
    status: string;
    stage: string;
    applied_at: string;
    source?: string;
}

// ============= JOBS API =============

// Get all jobs
app.get('/api/jobs', (req, res) => {
    try {
        const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all() as Job[];
        const formatted = jobs.map(job => ({
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Get single job
app.get('/api/jobs/:id', (req, res) => {
    try {
        const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id) as any;
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        const formatted = {
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            responsibilities: job.responsibilities ? JSON.parse(job.responsibilities) : [],
        };
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// Create job
app.post('/api/jobs', async (req, res) => {
    try {
        const { title, department, location, type, description, requirements, responsibilities, status, deal_breakers, auto_sourcing_enabled, sourcing_threshold } = req.body;
        const id = generateId();

        const insert = db.prepare(`
      INSERT INTO jobs (id, title, department, location, type, status, description, requirements, responsibilities, deal_breakers, auto_sourcing_enabled, sourcing_threshold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        insert.run(
            id,
            title,
            department,
            location,
            type,
            status || 'draft',
            description,
            JSON.stringify(requirements || []),
            JSON.stringify(responsibilities || []),
            deal_breakers || null,
            auto_sourcing_enabled ? 1 : 0,
            sourcing_threshold || 70
        );

        const job: any = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
        res.json({
            ...job,
            requirements: JSON.parse(job.requirements),
            responsibilities: JSON.parse(job.responsibilities),
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// Update job
app.put('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const allowedFields = ['title', 'department', 'location', 'type', 'status', 'description', 'requirements', 'responsibilities', 'deal_breakers', 'auto_sourcing_enabled', 'sourcing_threshold'];

        const fieldsToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key));

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
        const values = fieldsToUpdate.map(key => {
            const value = updates[key];
            if (key === 'requirements' || key === 'responsibilities') {
                return JSON.stringify(value);
            }
            if (key === 'auto_sourcing_enabled') {
                return value ? 1 : 0;
            }
            return value;
        });

        const update = db.prepare(`UPDATE jobs SET ${setClause} WHERE id = ?`);
        update.run(...values, id);

        const job: any = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            ...job,
            requirements: JSON.parse(job.requirements || '[]'),
            responsibilities: JSON.parse(job.responsibilities || '[]'),
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// Generate outreach email
app.post('/api/outreach/generate-email', async (req, res) => {
    try {
        const { candidateId, jobId, type } = req.body;

        // Use 'any' to avoid type errors
        const candidate: any = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId);
        const job: any = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);

        if (!candidate || !job) return res.status(404).json({ error: 'Candidate or Job not found' });

        const prompt = `Write a ${type || 'initial'} outreach email to a candidate.
        
        Candidate: ${candidate.name}
        Role: ${candidate.role}
        Skills: ${candidate.skills}
        
        Job: ${job.title}
        Company: HireLoop
        Description: ${job.description}
        
        Keep it professional, personalized, and engaging.
        Return JSON with "subject" and "body".`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert recruiter writing outreach emails. Return JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        res.json(result);
    } catch (error) {
        console.error('Email generation error:', error);
        res.status(500).json({ error: 'Failed to generate email' });
    }
});

// Get sent emails
app.get('/api/outreach/emails', (req, res) => {
    try {
        const emails = db.prepare('SELECT * FROM outreach_emails ORDER BY sent_at DESC').all();
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

// Save sent email
app.post('/api/outreach/emails', (req, res) => {
    try {
        const { candidateId, jobId, subject, body, status } = req.body;
        const id = generateId();

        db.prepare(`
            INSERT INTO outreach_emails (id, candidate_id, job_id, sequence_day, subject, body, status, sent_at)
            VALUES (?, ?, ?, 0, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(id, candidateId, jobId, subject, body, status || 'sent');

        const email = db.prepare('SELECT * FROM outreach_emails WHERE id = ?').get(id);
        res.json(email);
    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({ error: 'Failed to save email' });
    }
});

// Parse job description with AI
app.post('/api/jobs/parse', async (req, res) => {
    try {
        const { jobText } = req.body;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert HR assistant. Extract structured information from job descriptions. Return a JSON object with: title, department, location, type (Full-time/Part-time/Contract), description, requirements (array), and responsibilities (array).'
                },
                {
                    role: 'user',
                    content: `Parse this job description:\n\n${jobText}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        res.json(result);
    } catch (error) {
        console.error('Error parsing job:', error);
        res.status(500).json({ error: 'Failed to parse job description' });
    }
});

// Get job dashboard with AI insights and pipeline stats
app.get('/api/jobs/:id/dashboard', async (req, res) => {
    try {
        const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id) as Job | undefined;
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Get pipeline statistics
        const candidates = db.prepare('SELECT stage FROM candidates').all() as Candidate[];
        const pipelineStats = {
            applicationReview: candidates.filter(c => c.stage === 'new' || c.stage === 'application_review').length,
            phoneScreen: candidates.filter(c => c.stage === 'phone_screen').length,
            hiringManagerInterview: candidates.filter(c => c.stage === 'hiring_manager').length,
            virtualOnsite: candidates.filter(c => c.stage === 'onsite').length,
            offer: candidates.filter(c => c.stage === 'offer').length,
            hired: candidates.filter(c => c.stage === 'hired').length,
            rejected: candidates.filter(c => c.stage === 'rejected').length,
        };

        // Generate AI insights
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert hiring manager and recruiter. Analyze job descriptions and provide strategic hiring insights. Return a JSON object.'
                },
                {
                    role: 'user',
                    content: `Analyze this job posting and provide hiring insights:

Title: ${job.title}
Department: ${job.department}
Description: ${job.description}
Requirements: ${job.requirements}
Responsibilities: ${job.responsibilities}

Provide:
1. mustHaveSkills: Array of 5-7 critical skills (strings)
2. niceToHaveSkills: Array of 3-5 bonus skills (strings)
3. dealBreakers: Array of 3-4 absolute requirements (strings)
4. hiringGuide: Comprehensive guide for hiring managers (string, 3-4 paragraphs)
5. keyCompetencies: Array of 4-6 competencies to assess (strings)
6. interviewFocus: Array of 3-4 key areas to probe in interviews (strings)

Return as JSON.`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const aiInsights = JSON.parse(completion.choices[0].message.content || '{}');

        // Calculate health score
        const totalCandidates = candidates.length;
        const healthScore = Math.min(100, (totalCandidates / 30) * 100);
        const healthStatus = healthScore >= 70 ? 'healthy' : healthScore >= 40 ? 'at-risk' : 'critical';

        res.json({
            job: {
                ...job,
                requirements: JSON.parse(job.requirements),
                responsibilities: JSON.parse(job.responsibilities),
            },
            aiInsights,
            pipelineStats,
            healthMetrics: {
                score: Math.round(healthScore),
                status: healthStatus,
                totalCandidates,
                targetCandidates: 30,
            }
        });
    } catch (error) {
        console.error('Error getting job dashboard:', error);
        res.status(500).json({ error: 'Failed to get job dashboard' });
    }
});

// ============= CANDIDATES API =============

// Get all candidates
app.get('/api/candidates', (req, res) => {
    try {
        const candidates = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all() as any[];
        const formatted = candidates.map(c => {
            // Helper to parse fields that might be JSON or plain strings
            const parseField = (field: any) => {
                if (!field) return field;
                try {
                    return JSON.parse(field);
                } catch {
                    return field; // Return as-is if not valid JSON
                }
            };

            return {
                ...c,
                skills: c.skills ? JSON.parse(c.skills) : [],
                experience: parseField(c.experience),
                education: parseField(c.education),
                fit_score_breakdown: c.fit_score_breakdown ? JSON.parse(c.fit_score_breakdown) : null,
            };
        });
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});

// Get single candidate
app.get('/api/candidates/:id', (req, res) => {
    try {
        const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id) as any;
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        // Helper to parse fields that might be JSON or plain strings
        const parseField = (field: any) => {
            if (!field) return field;
            try {
                return JSON.parse(field);
            } catch {
                return field; // Return as-is if not valid JSON
            }
        };

        const formatted = {
            ...candidate,
            skills: candidate.skills ? JSON.parse(candidate.skills) : [],
            experience: parseField(candidate.experience),
            education: parseField(candidate.education),
            fit_score_breakdown: candidate.fit_score_breakdown ? JSON.parse(candidate.fit_score_breakdown) : null,
        };
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching candidate:', error);
        res.status(500).json({ error: 'Failed to fetch candidate' });
    }
});

// Analyze candidate with AI
app.post('/api/candidates/:id/analyze', async (req, res) => {
    try {
        const { candidate } = req.body;
        let jobContext = '';
        if (candidate.job_id) {
            const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(candidate.job_id) as Job | undefined;
            if (job) {
                jobContext = `
                Target Job: ${job.title}
                Description: ${job.description}
                Requirements: ${job.requirements}
                Deal Breakers: Location must be ${job.location}, Type must be ${job.type}
                `;
            }
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert recruiter and talent assessor. Analyze candidates thoroughly against the specific job requirements and provide structured insights. Return a JSON object.'
                },
                {
                    role: 'user',
                    content: `Analyze this candidate profile against the job context:

${jobContext}

Candidate Profile:
Name: ${candidate.name}
Role: ${candidate.role}
Experience: ${candidate.years_of_experience} years
Skills: ${JSON.stringify(candidate.skills)}
Location: ${candidate.location}

Provide:
1. summary: Professional 2-3 sentence summary (string)
2. strengths: Array of 3-4 key strengths relevant to the job (strings)
3. gaps: Array of 2-3 areas of concern or gaps relative to job requirements (strings)
4. fitScore: Object with overall, skills, experience, education scores (0-100 each)
5. dealBreakerCheck: Object with passed (boolean) and details (array of strings explaining any failures)
6. recommendation: Clear hiring recommendation (string, 2-3 sentences)

Return as JSON.`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const analysis = JSON.parse(completion.choices[0].message.content || '{}');
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ error: 'Failed to analyze candidate' });
    }
});

// Auto-source candidates
app.post('/api/sourcing/run', async (req, res) => {
    try {
        const { jobId } = req.body;
        // Use 'any' to avoid type errors with better-sqlite3 inference
        const job: any = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);

        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Generate candidates with AI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert sourcer. Generate realistic candidate profiles for a job. Return a JSON array of candidates.'
                },
                {
                    role: 'user',
                    content: `Generate 3 realistic candidate profiles for this job:
                    
                    Title: ${job.title}
                    Description: ${job.description}
                    
                    For each candidate provide:
                    - name
                    - email (fake)
                    - role (current title)
                    - location
                    - years_of_experience (number)
                    - skills (array of strings)
                    - experience (array of objects with company, title, duration, description)
                    - education (object with degree, institution, year)
                    - fit_score (number 0-100)
                    - summary (string)
                    
                    Return as JSON object with key "candidates" containing the array.`
                }
            ],
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{"candidates": []}');
        const newCandidates = [];

        // Insert into DB
        const insert = db.prepare(`
            INSERT INTO candidates (id, job_id, name, email, role, location, years_of_experience, skills, experience, education, fit_score, stage, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
        `);

        for (const c of result.candidates) {
            const id = generateId();
            insert.run(
                id,
                jobId,
                c.name,
                c.email,
                c.role,
                c.location,
                c.years_of_experience,
                JSON.stringify(c.skills),
                JSON.stringify(c.experience),
                JSON.stringify(c.education),
                c.fit_score,
                new Date().toISOString()
            );
            newCandidates.push({ ...c, id });
        }

        res.json({ candidates: newCandidates });
    } catch (error) {
        console.error('Sourcing error:', error);
        res.status(500).json({ error: 'Failed to source candidates' });
    }
});

// Upload and parse resume
app.post('/api/candidates/upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { jobId } = req.body;

        const resumeText = req.file.buffer.toString('utf-8');

        console.log(`Resume upload: Original length: ${resumeText.length} characters`);

        // Truncate if too long to avoid OpenAI context length errors
        // Conservative limit: 50k chars (≈12.5k tokens) to be safe
        // This leaves plenty of room for normal resumes while preventing huge PDFs
        const MAX_CHARS = 50000;
        const truncatedText = resumeText.length > MAX_CHARS
            ? resumeText.substring(0, MAX_CHARS) + '\n\n[Resume truncated due to length. Please upload a shorter resume or plain text file.]'
            : resumeText;

        console.log(`Resume upload: Using ${truncatedText.length} characters for parsing`);

        // Parse with OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert resume parser. Extract structured information from resumes. Return a JSON object with: name, email, phone, location, role (job title/position), summary, skills (array), experience (description), education, and yearsOfExperience (number).'
                },
                {
                    role: 'user',
                    content: `Parse this resume:\n\n${truncatedText}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
        });

        const parsed = JSON.parse(completion.choices[0].message.content || '{}');

        console.log('Parsed resume data:', parsed);

        // Helper to serialize fields that might be objects or strings
        const serializeField = (field: any): string => {
            if (!field) return '';
            if (typeof field === 'string') return field;
            if (typeof field === 'object') return JSON.stringify(field);
            return String(field);
        };

        // Create candidate
        const id = generateId();
        const insert = db.prepare(`
      INSERT INTO candidates (id, job_id, name, email, phone, role, location, skills, experience, education, years_of_experience, stage, fit_score, resume_text)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        insert.run(
            id,
            jobId || null,
            String(parsed.name || 'Unknown'),
            String(parsed.email || `unknown-${id}@example.com`),
            parsed.phone ? String(parsed.phone) : null,
            String(parsed.role || 'General Position'),
            parsed.location ? String(parsed.location) : null,
            JSON.stringify(Array.isArray(parsed.skills) ? parsed.skills : []),
            serializeField(parsed.experience),
            serializeField(parsed.education),
            Number(parsed.yearsOfExperience || 0),
            'new',
            70,
            truncatedText
        );

        const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id) as any;
        res.json({
            ...candidate,
            skills: JSON.parse(candidate.skills),
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: 'Failed to upload resume' });
    }
});

// Update candidate
app.put('/api/candidates/:id', (req, res) => {
    try {
        const { stage, fit_score } = req.body;
        const update = db.prepare('UPDATE candidates SET stage = ?, fit_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        update.run(stage, fit_score, req.params.id);

        const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id) as any;
        res.json({
            ...candidate,
            skills: JSON.parse(candidate.skills),
        });
    } catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ error: 'Failed to update candidate' });
    }
});

// ============= INTERVIEWS API =============

// Get all interviews
app.get('/api/interviews', (req, res) => {
    try {
        const interviews = db.prepare('SELECT * FROM interviews ORDER BY start_time ASC').all();
        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ error: 'Failed to fetch interviews' });
    }
});

// Create interview
app.post('/api/interviews', (req, res) => {
    try {
        const { candidate_id, job_id, start_time, end_time, video_link, status } = req.body;
        const id = generateId();

        const insert = db.prepare(`
      INSERT INTO interviews (id, candidate_id, job_id, start_time, end_time, video_link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        insert.run(id, candidate_id, job_id || null, start_time, end_time, video_link, status || 'scheduled');

        const interview = db.prepare('SELECT * FROM interviews WHERE id = ?').get(id);
        res.json(interview);
    } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ error: 'Failed to create interview' });
    }
});

// ============= SCORECARDS API =============

app.get('/api/scorecards/:candidateId', (req, res) => {
    try {
        const scorecards = db.prepare('SELECT * FROM scorecards WHERE candidate_id = ? ORDER BY created_at DESC').all(req.params.candidateId);
        res.json(scorecards);
    } catch (error) {
        console.error('Error fetching scorecards:', error);
        res.status(500).json({ error: 'Failed to fetch scorecards' });
    }
});

app.post('/api/scorecards', (req, res) => {
    try {
        const { candidateId, jobId, stage, scores, feedback, interviewerId } = req.body;
        const id = generateId();
        const insert = db.prepare(`
            INSERT INTO scorecards (id, candidate_id, job_id, interviewer_id, stage, scores, feedback)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(id, candidateId, jobId, interviewerId, stage, JSON.stringify(scores), feedback);
        res.json({ id, candidateId, stage, scores, feedback });
    } catch (error) {
        console.error('Error creating scorecard:', error);
        res.status(500).json({ error: 'Failed to create scorecard' });
    }
});


// ============= CONTACT API =============

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, company, message } = req.body;
        const id = generateId();

        const insert = db.prepare(`
      INSERT INTO contact_requests (id, name, email, company, message)
      VALUES (?, ?, ?, ?, ?)
    `);

        insert.run(id, name, email, company || null, message);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Failed to save contact request' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============= TEMPLATES API =============

app.get('/api/templates', (req, res) => {
    try {
        const templates = db.prepare('SELECT * FROM email_templates ORDER BY created_at DESC').all();
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

app.post('/api/templates', (req, res) => {
    try {
        const { name, subject, body, category } = req.body;
        const id = generateId();
        db.prepare('INSERT INTO email_templates (id, name, subject, body, category) VALUES (?, ?, ?, ?, ?)').run(id, name, subject, body, category);
        res.json({ id, name, subject, body, category });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

app.put('/api/templates/:id', (req, res) => {
    try {
        const { name, subject, body, category } = req.body;
        db.prepare('UPDATE email_templates SET name = ?, subject = ?, body = ?, category = ? WHERE id = ?').run(name, subject, body, category, req.params.id);
        res.json({ id: req.params.id, name, subject, body, category });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

app.delete('/api/templates/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM email_templates WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// ============= SETTINGS API =============

app.get('/api/settings', (req, res) => {
    try {
        const settings = db.prepare('SELECT * FROM settings LIMIT 1').get();
        res.json(settings || {});
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const { company_name, website, auto_reject_threshold, email_notifications } = req.body;
        const existing = db.prepare('SELECT id FROM settings LIMIT 1').get() as any;

        if (existing) {
            db.prepare(`
                UPDATE settings 
                SET company_name = ?, website = ?, auto_reject_threshold = ?, email_notifications = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).run(company_name, website, auto_reject_threshold, email_notifications ? 1 : 0, existing.id);
        } else {
            const id = generateId();
            db.prepare(`
                INSERT INTO settings (id, company_name, website, auto_reject_threshold, email_notifications)
                VALUES (?, ?, ?, ?, ?)
            `).run(id, company_name, website, auto_reject_threshold, email_notifications ? 1 : 0);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// ============= INTEGRATIONS API =============

app.get('/api/integrations', (req, res) => {
    try {
        const integrations = db.prepare('SELECT * FROM integrations').all();
        res.json(integrations);
    } catch (error) {
        console.error('Error fetching integrations:', error);
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
});

app.post('/api/integrations', (req, res) => {
    try {
        const { id, name, status } = req.body;
        const existing = db.prepare('SELECT id FROM integrations WHERE id = ?').get(id);

        if (existing) {
            db.prepare('UPDATE integrations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
        } else {
            db.prepare('INSERT INTO integrations (id, name, status) VALUES (?, ?, ?)').run(id, name, status);
        }

        res.json({ success: true, id, name, status });
    } catch (error) {
        console.error('Error updating integration:', error);
        res.status(500).json({ error: 'Failed to update integration' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ HireLoop API running on http://localhost:${PORT}`);
    console.log(`✅ Database connected`);
});
