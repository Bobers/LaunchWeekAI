import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import OpenAI from 'openai';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// In-memory storage for demo (replace with Vercel KV in production)
interface PlaybookData {
  status: 'processing' | 'complete' | 'failed';
  playbook?: string;
  error?: string;
  sessionId?: string;
  createdAt?: string;
}

const playbookStorage = new Map<string, PlaybookData>();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const playbookId = session.metadata?.playbookId;
    const markdownPreview = session.metadata?.markdownPreview;

    if (!playbookId || !markdownPreview) {
      console.error('Missing playbookId or markdown in session metadata');
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    try {
      // Set initial status
      playbookStorage.set(playbookId, {
        status: 'processing',
        sessionId: session.id,
        createdAt: new Date().toISOString(),
      });

      // Generate playbook using AI (simplified for demo)
      const playbook = await generatePlaybook(markdownPreview);
      
      // Store completed playbook
      playbookStorage.set(playbookId, {
        status: 'complete',
        playbook,
        sessionId: session.id,
        createdAt: new Date().toISOString(),
      });

      console.log(`Playbook ${playbookId} generated successfully`);

    } catch (error) {
      console.error(`Failed to generate playbook ${playbookId}:`, error);
      
      // Store error status
      playbookStorage.set(playbookId, {
        status: 'failed',
        error: 'Generation failed',
        sessionId: session.id,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
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