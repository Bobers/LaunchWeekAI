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

    // Generate playbook immediately (no payment required)
    try {
      console.log(`Generating playbook ${playbookId}...`);
      const playbook = await generatePlaybook(markdown);
      
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

async function generatePlaybook(markdown: string): Promise<string> {
  const prompt = `You are a launch strategy expert. Based on the following AI product documentation, create a comprehensive launch playbook. 

Product Documentation:
${markdown}

Create a detailed launch playbook that includes:

# Launch Playbook for [Product Name]

## Executive Summary
- Brief overview of the product
- Key value propositions
- Target market

## Pre-Launch Strategy (Weeks 1-4)
### Market Research & Validation
- Target audience analysis
- Competitive landscape
- Market positioning

### Product Readiness
- Feature completeness checklist
- Quality assurance steps
- Documentation requirements

### Team Preparation
- Role assignments
- Communication protocols
- Contingency planning

## Launch Strategy (Launch Week)
### Announcement Sequence
- Pre-announcement teasers
- Main launch event
- Follow-up communications

### Channel Strategy
- Primary launch channels
- Content distribution plan
- Community engagement

### Technical Preparation
- Infrastructure scaling
- Monitoring setup
- Support systems

## Post-Launch Strategy (Weeks 1-8)
### Performance Monitoring
- Key metrics to track
- Success criteria
- Feedback collection

### Growth Acceleration
- User acquisition tactics
- Feature iteration plan
- Community building

### Long-term Strategy
- Roadmap priorities
- Market expansion
- Partnership opportunities

## Risk Mitigation
- Potential challenges
- Mitigation strategies
- Crisis communication plan

## Success Metrics
- Quantitative KPIs
- Qualitative measures
- Milestone timeline

Format the response in clean markdown with proper headers, bullet points, and actionable items.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a launch strategy expert who creates comprehensive, actionable launch playbooks for AI products.'
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