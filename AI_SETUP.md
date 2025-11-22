# HireLoop - AI-Powered Recruiting Platform

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# OpenAI Configuration (Required for AI features)
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase Configuration (Optional - uses localStorage if not set)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it into your `.env` file as `VITE_OPENAI_API_KEY`

**Important:** Keep your API key secure! Never commit it to version control.

### 4. Run the Application

```bash
npm run dev
```

The application will start at http://localhost:5173

## AI Features

When OpenAI API key is configured, HireLoop will use real AI for:

### ✅ **Job Description Parsing**
- Automatically extracts job title, department, location, and type
- Identifies requirements and responsibilities
- Structured JSON output for consistency

### ✅ **Resume Parsing**
- Extracts candidate name, email, phone, and location
- Identifies skills, experience, and education
- Determines years of experience
- Summarizes professional background

### ✅ **AI-Powered Candidate Scoring**
- Calculates overall fit score (0-100)
- Breaks down by skills, experience, and education
- Provides reasoning for the score
- Lists strengths and potential concerns

### ✅ **Personalized Outreach Emails**
- Generates professional recruitment emails
- Tailored to candidate and position
- Ready to send with minimal editing

## How It Works

### Fallback Mode
If no OpenAI API key is configured, the app runs in **mock mode** with simulated AI features. You can still test all functionality.

### AI-Powered Mode
With an OpenAI API key configured:
1. **Upload a resume** → AI automatically extracts all information
2. **Create a job** → AI parses the description and extracts details
3. **View scores** → AI provides intelligent fit analysis
4. **Generate emails** → AI creates personalized outreach

## Cost Considerations

HireLoop uses **GPT-4o-mini** model which is very cost-effective:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens

Typical costs per operation:
- Resume parsing: ~$0.001-0.003 per resume
- Job parsing: ~$0.001-0.002 per job
- Fit scoring: ~$0.002-0.005 per candidate
- Email generation: ~$0.001-0.003 per email

**Example:** Processing 100 candidates would cost approximately $0.50-1.00

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables** - Don't hardcode API keys
3. **Rotate keys regularly** - Generate new keys periodically
4. **Monitor usage** - Check OpenAI dashboard for usage
5. **Set spending limits** - Configure limits in OpenAI dashboard

## Production Deployment

For production, move AI operations to a backend server instead of client-side:
- Protects your API key
- Better error handling
- Rate limiting control
- Usage monitoring

## Support

For issues or questions:
- OpenAI API: https://platform.openai.com/docs
- HireLoop: Check the application logs in browser console
