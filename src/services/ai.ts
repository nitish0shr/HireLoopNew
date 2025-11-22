import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Check if OpenAI is configured
const isAIEnabled = (): boolean => !!OPENAI_API_KEY;

// Initialize OpenAI client
const getOpenAIClient = () => {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }
    return new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });
};

export interface ParsedJobDescription {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
}

export interface ParsedResume {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    role: string;
    summary?: string;
    skills: string[];
    experience: string;
    education: string;
    yearsOfExperience?: number;
}

export interface CandidateFitScore {
    overall: number;
    breakdown: {
        skills: number;
        experience: number;
        education: number;
    };
    reasoning: string;
    strengths: string[];
    concerns: string[];
}

const parseJobDescription = async (jobText: string): Promise<ParsedJobDescription> => {
    if (!isAIEnabled()) {
        throw new Error('OpenAI API key not configured');
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert HR assistant. Extract structured information from job descriptions. 
Return a JSON object with: title, department, location, type (Full-time/Part-time/Contract), description, requirements (array), and responsibilities (array).`
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

    return {
        title: result.title || 'Untitled Position',
        department: result.department || 'General',
        location: result.location || 'Remote',
        type: result.type || 'Full-time',
        description: result.description || jobText,
        requirements: result.requirements || [],
        responsibilities: result.responsibilities || [],
    };
};

const parseResume = async (resumeText: string): Promise<ParsedResume> => {
    if (!isAIEnabled()) {
        throw new Error('OpenAI API key not configured');
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert resume parser. Extract structured information from resumes.
Return a JSON object with: name, email, phone, location, role (job title/position), summary, skills (array), experience (description), education, and yearsOfExperience (number).`
            },
            {
                role: 'user',
                content: `Parse this resume:\n\n${resumeText}`
            }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
        name: result.name || 'Unknown Candidate',
        email: result.email || 'no-email@example.com',
        phone: result.phone,
        location: result.location,
        role: result.role || 'General Position',
        summary: result.summary,
        skills: result.skills || [],
        experience: result.experience || 'No experience information available',
        education: result.education || 'Not specified',
        yearsOfExperience: result.yearsOfExperience || 0,
    };
};

const calculateFitScore = async (
    candidateProfile: ParsedResume,
    jobDescription: ParsedJobDescription
): Promise<CandidateFitScore> => {
    if (!isAIEnabled()) {
        throw new Error('OpenAI API key not configured');
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert recruiter evaluating candidate fit. Analyze how well a candidate matches a job.
Return a JSON object with:
- overall: number (0-100)
- breakdown: { skills: number (0-100), experience: number (0-100), education: number (0-100) }
- reasoning: string (brief explanation)
- strengths: array of strings (top 3 strengths)
- concerns: array of strings (top 3 concerns, if any)`
            },
            {
                role: 'user',
                content: `Job Position: ${jobDescription.title}
Department: ${jobDescription.department}
Requirements: ${jobDescription.requirements.join(', ')}

Candidate: ${candidateProfile.name}
Role: ${candidateProfile.role}
Skills: ${candidateProfile.skills.join(', ')}
Experience: ${candidateProfile.experience}
Education: ${candidateProfile.education}
Years of Experience: ${candidateProfile.yearsOfExperience}

Evaluate this candidate's fit for the position.`
            }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
        overall: result.overall || 50,
        breakdown: {
            skills: result.breakdown?.skills || 50,
            experience: result.breakdown?.experience || 50,
            education: result.breakdown?.education || 50,
        },
        reasoning: result.reasoning || 'No analysis available',
        strengths: result.strengths || [],
        concerns: result.concerns || [],
    };
};

const generateOutreachEmail = async (
    candidateName: string,
    jobTitle: string,
    companyName: string
): Promise<string> => {
    if (!isAIEnabled()) {
        return `Hi ${candidateName},\n\nI came across your profile and I think you'd be a great fit for the ${jobTitle} position at ${companyName}.\n\nWould you be interested in learning more?\n\nBest regards`;
    }

    try {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional recruiter writing personalized outreach emails.'
                },
                {
                    role: 'user',
                    content: `Write a professional but friendly outreach email to ${candidateName} 
about the ${jobTitle} position at ${companyName}. Keep it concise (3-4 paragraphs), 
highlight why we're interested, and invite them for a conversation.`
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0].message.content || 'Unable to generate email';
    } catch (error) {
        console.error('Error generating outreach email:', error);
        return `Hi ${candidateName},\n\nI came across your profile and I think you'd be a great fit for the ${jobTitle} position at ${companyName}.\n\nWould you be interested in learning more?\n\nBest regards`;
    }
};

const generateText = async (prompt: string): Promise<string> => {
    if (!isAIEnabled()) {
        return 'AI not enabled';
    }

    try {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that generates JSON responses.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error generating text:', error);
        throw error;
    }
};

export const aiService = {
    parseJobDescription,
    parseResume,
    calculateFitScore,
    generateOutreachEmail,
    generateText,
    isAIEnabled,
};
