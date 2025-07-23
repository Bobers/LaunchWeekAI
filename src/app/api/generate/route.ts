import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// In-memory storage for demo
interface PlaybookData {
  status: 'processing' | 'complete' | 'failed';
  playbook?: string;
  error?: string;
  createdAt?: string;
}

const playbookStorage = new Map<string, PlaybookData>();

export async function POST(request: NextRequest) {
  console.log('POST /api/generate - Request received');
  
  try {
    const { markdown } = await request.json();
    
    // Basic validation
    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    if (markdown.length > 50000) {
      return NextResponse.json(
        { error: 'Markdown content exceeds 50,000 character limit' },
        { status: 400 }
      );
    }

    if (markdown.trim().length < 100) {
      return NextResponse.json(
        { error: 'Markdown content too short. Please provide more detailed documentation.' },
        { status: 400 }
      );
    }

    // Generate unique playbook ID
    const playbookId = uuidv4();
    
    // Set initial status
    playbookStorage.set(playbookId, {
      status: 'processing',
      createdAt: new Date().toISOString(),
    });

    // Generate playbook with AI-extracted context
    try {
      console.log(`Generating playbook ${playbookId}...`);
      
      // Step 1: Extract context from markdown
      const context = await extractContext(markdown);
      console.log('Extracted context:', context);
      
      // Step 2: Generate personalized playbook
      const playbook = await generatePlaybook(markdown, context);
      
      // Store completed playbook
      playbookStorage.set(playbookId, {
        status: 'complete',
        playbook,
        createdAt: new Date().toISOString(),
      });

      console.log(`Playbook ${playbookId} generated successfully`);
      
      // Return the playbook URL
      return NextResponse.json({ 
        playbookId,
        url: `${process.env.NEXT_PUBLIC_URL}/playbook/${playbookId}`
      });

    } catch (error) {
      console.error(`Failed to generate playbook ${playbookId}:`, error);
      
      // Store error status
      playbookStorage.set(playbookId, {
        status: 'failed',
        error: 'Generation failed',
        createdAt: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'Failed to generate playbook' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function extractContext(markdown: string): Promise<any> {
  const extractionPrompt = `Analyze the following AI product documentation and extract key information. Return a JSON object with these fields:

{
  "productName": "extracted product name",
  "productStage": "concept|mvp|beta|production",
  "productDescription": "one-line description of what it does",
  "primaryUser": "developer|business|consumer|other",
  "problemSolved": "specific problem it solves",
  "marketSize": "niche|medium|large|massive",
  "competitors": "list of competitors if mentioned",
  "monetization": "free|freemium|subscription|onetime|usage|unknown",
  "pricing": "pricing details if mentioned",
  "targetMetrics": "any mentioned goals or KPIs",
  "teamSize": "solo|small|large|unknown",
  "timeline": "days|weeks|months|unknown",
  "uniqueAdvantages": "any mentioned advantages, partnerships, etc"
}

Documentation to analyze:
${markdown}

Return ONLY the JSON object, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing product documentation and extracting key business information. Always return valid JSON.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse context JSON:', e);
      return {};
    }
  } catch (error) {
    console.error('Context extraction error:', error);
    return {};
  }
}

async function generatePlaybook(markdown: string, context: any): Promise<string> {
  const { 
    productName = 'Your Product',
    productStage = 'unknown',
    productDescription = '',
    primaryUser = 'unknown',
    problemSolved = '',
    marketSize = 'unknown',
    competitors = '',
    monetization = 'unknown',
    pricing = '',
    targetMetrics = '',
    teamSize = 'unknown',
    timeline = 'unknown',
    uniqueAdvantages = ''
  } = context;

  const prompt = `You are a launch strategy expert. Create a HIGHLY SPECIFIC and ACTIONABLE launch playbook based on the following AI product.

## Extracted Context
- **Product:** ${productName} - ${productDescription}
- **Stage:** ${productStage}
- **Target User:** ${primaryUser}
- **Problem Solved:** ${problemSolved}
- **Market Size:** ${marketSize}
- **Competitors:** ${competitors || 'None identified'}
- **Business Model:** ${monetization} ${pricing ? `(${pricing})` : ''}
- **Goals:** ${targetMetrics || 'Not specified'}
- **Team:** ${teamSize}
- **Timeline:** ${timeline}
- **Advantages:** ${uniqueAdvantages || 'None identified'}

## Full Product Documentation
${markdown}

Create a comprehensive launch playbook that includes:

# Launch Playbook for ${productName}

## Executive Summary
- Brief overview tailored to ${productStage} stage
- Key value propositions for ${primaryUser} users
- Realistic goals based on ${teamSize} team

## Pre-Launch Strategy (Weeks 1-4)
### Market Research & Validation
- Specific research tactics for ${primaryUser} audience
- Competitor analysis of ${competitors || 'similar products'}
- Positioning strategy for ${marketSize} market

### Product Readiness
- Critical features for ${primaryUser} users
- MVP vs full feature decisions based on ${productStage}
- Documentation priorities

### Team Preparation
- Role distribution for ${teamSize} team
- Key skills needed
- Contingency planning

## Launch Strategy (Launch Week)
### Channel Strategy for ${primaryUser} Audience
${primaryUser === 'developer' ? `- Hacker News launch post
- GitHub repository optimization
- dev.to article series
- Reddit (r/programming, r/MachineLearning)
- Twitter developer community` : 
primaryUser === 'business' ? `- ProductHunt launch
- LinkedIn thought leadership
- Industry publication outreach
- Webinar/demo strategy
- Cold email campaigns` :
primaryUser === 'consumer' ? `- Social media campaigns
- Influencer partnerships
- App store optimization
- Content marketing
- Community building` :
`- Mixed channel approach
- Community identification
- Content strategy`}

### Launch Sequence
- Soft launch tactics for ${teamSize} team
- Main announcement timing
- Follow-up campaigns

## Growth Strategy (Post-Launch)
### Based on ${monetization} Model
${monetization === 'free' ? `- Focus on user acquisition
- Community building
- Future monetization planning` :
monetization === 'freemium' ? `- Free tier optimization
- Conversion funnel design
- Premium feature highlights` :
monetization === 'subscription' ? `- Trial optimization
- Onboarding flow
- Retention strategies` :
`- Pricing validation
- Revenue optimization
- Customer feedback loops`}

### Metrics & KPIs
- Specific metrics for ${productStage} stage
- ${targetMetrics ? `Focus on: ${targetMetrics}` : 'Standard SaaS metrics'}
- Weekly tracking plan

## Resource Allocation
### For ${teamSize} Team
- Task prioritization
- Automation opportunities
- Outsourcing decisions

## Risk Mitigation
- Common pitfalls for ${primaryUser} market
- Contingency plans
- Crisis communication

## 30-60-90 Day Plan
- Specific milestones
- Resource requirements
- Success criteria

Remember to be EXTREMELY specific with tactics, channels, and actions based on the extracted context.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a launch strategy expert. Create actionable, specific strategies based on the product context. 
          
CRITICAL: 
- Be very specific about channels and tactics for the identified user type
- Consider team size and resources when making recommendations
- Provide concrete examples and templates where helpful
- Focus on what's realistic for their stage and timeline`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Failed to generate playbook content.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI generation failed');
  }
}

// GET endpoint to check playbook status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playbookId = searchParams.get('id');

  if (!playbookId) {
    return NextResponse.json(
      { error: 'Playbook ID required' },
      { status: 400 }
    );
  }

  const playbook = playbookStorage.get(playbookId);
  
  if (!playbook) {
    return NextResponse.json(
      { error: 'Playbook not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(playbook);
}