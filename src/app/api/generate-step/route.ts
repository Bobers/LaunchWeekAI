import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Step definitions in sequential order
const GENERATION_STEPS = [
  'target-user-analysis',
  'launch-timeline', 
  'platform-strategy',
  'content-templates',
  'metrics-dashboard'
] as const;

type GenerationStep = typeof GENERATION_STEPS[number];

interface ExtractedContext {
  productName?: string;
  productCategory?: string;
  coreValueProposition?: string;
  targetMarketSize?: string;
  competitiveLandscape?: string;
  monetizationModel?: string;
  pricingSignals?: string;
  primaryUserPersona?: string;
  userBehavior?: string;
  painPoints?: string;
  productStage?: string;
  timeline?: string;
}

interface StepGenerationRequest {
  markdown: string;
  context: ExtractedContext;
  step: GenerationStep;
  previousSteps?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  console.log('POST /api/generate-step - Request received');
  
  try {
    const { markdown, context, step, previousSteps = {} }: StepGenerationRequest = await request.json();
    
    // Validate inputs
    if (!markdown || !context || !step) {
      return NextResponse.json(
        { error: 'Missing required fields: markdown, context, step' },
        { status: 400 }
      );
    }

    if (!GENERATION_STEPS.includes(step)) {
      return NextResponse.json(
        { error: `Invalid step. Must be one of: ${GENERATION_STEPS.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate the specific step
    const stepResult = await generateStep(markdown, context, step, previousSteps);
    
    return NextResponse.json({ 
      step,
      result: stepResult,
      nextStep: getNextStep(step)
    });

  } catch (error) {
    console.error('Generate step error:', error);
    return NextResponse.json(
      { error: 'Failed to generate step' },
      { status: 500 }
    );
  }
}

function getNextStep(currentStep: GenerationStep): GenerationStep | null {
  const currentIndex = GENERATION_STEPS.indexOf(currentStep);
  const nextIndex = currentIndex + 1;
  return nextIndex < GENERATION_STEPS.length ? GENERATION_STEPS[nextIndex] : null;
}

async function generateStep(
  markdown: string, 
  context: ExtractedContext, 
  step: GenerationStep, 
  previousSteps: Record<string, string>
): Promise<string> {
  
  const baseContext = `
## Product Context
- **Product:** ${context.productName || 'Not specified'} - ${context.coreValueProposition || 'Not specified'}
- **Category:** ${context.productCategory || 'Not specified'}
- **Stage:** ${context.productStage || 'Not specified'}
- **Market:** ${context.targetMarketSize || 'Not specified'}
- **Competition:** ${context.competitiveLandscape || 'Not specified'}
- **Business Model:** ${context.monetizationModel || 'Not specified'}
- **Pricing:** ${context.pricingSignals || 'Not specified'}
- **Primary User:** ${context.primaryUserPersona || 'Not specified'}
- **Pain Points:** ${context.painPoints || 'Not specified'}

## Previous Steps Context
${Object.entries(previousSteps).map(([stepName, result]) => 
  `### ${stepName.replace('-', ' ').toUpperCase()}\n${result}`
).join('\n\n')}

## Full Documentation
${markdown}
`;

  const prompts: Record<GenerationStep, string> = {
    'target-user-analysis': `${baseContext}

Create a detailed Target User Analysis section. Be extremely specific and actionable.

# TARGET USER ANALYSIS

## Primary User Persona
Create a detailed persona with:
- **Name & Role:** [Give them a real name and specific job title]
- **Demographics:** Age, location, company size, experience level
- **Daily Workflow:** What their typical day looks like
- **Pain Points:** Specific problems they face (not generic ones)
- **Goals:** What they want to achieve professionally
- **Decision Process:** How they evaluate and buy tools
- **Budget Authority:** Who approves purchases, typical budget range
- **Online Behavior:** Where they hang out, what they read, who they follow
- **Trust Signals:** What makes them trust a new tool
- **Communication Style:** How they prefer to be approached

## Secondary User Personas
Create 2 additional personas representing:
- Different seniority levels (junior vs senior)
- Different use cases or departments
- Different company sizes or stages

## User Journey Mapping
Map out the complete journey:
1. **Problem Recognition:** When do they realize they need a solution?
2. **Research Phase:** Where do they go to learn about options?
3. **Evaluation Phase:** How do they compare solutions?
4. **Decision Phase:** What final factors influence their choice?
5. **Onboarding:** What do they need to get started successfully?

Be extremely specific to this product and market, not generic advice.`,

    'launch-timeline': `${baseContext}

Create a detailed 7-Day Launch Timeline with specific daily actions.

# 7-DAY LAUNCH TIMELINE

## Pre-Launch (48 Hours Before)
### Technical Preparation
- [ ] Specific checklist items for this product
- [ ] Testing scenarios relevant to the target users
- [ ] Performance benchmarks to hit
- [ ] Error handling for expected edge cases

### Content Preparation  
- [ ] Specific posts/content for each channel
- [ ] Asset creation checklist
- [ ] Outreach list preparation

### Community Preparation
- [ ] Specific communities/people to engage
- [ ] Relationship building tasks

## Day 1 (Monday) - Soft Launch
### Morning (9 AM - 12 PM)
- **9:00 AM:** [Specific first action]
- **10:00 AM:** [Second action with details]
- **11:00 AM:** [Third action]

### Afternoon (12 PM - 6 PM)  
- **12:00 PM:** [Lunch break action]
- **2:00 PM:** [Afternoon activities]
- **4:00 PM:** [Late afternoon tasks]

### Evening Review
- Metrics to check
- Success criteria
- Adjustments for Day 2

## Day 2-7
[Continue with specific daily breakdowns]

## Success Metrics by Day
- Day 1: [Specific numbers to hit]
- Day 2: [Specific numbers to hit]
- etc.

## Contingency Plans
- If low traffic: [Specific backup tactics]
- If high traffic: [Scaling actions]
- If negative feedback: [Response strategy]

Make everything actionable with specific times, actions, and metrics.`,

    'platform-strategy': `${baseContext}

Create platform-specific strategies based on where the target users actually spend time.

# PLATFORM STRATEGY

## Primary Platforms Analysis
Based on the user personas, prioritize and detail strategies for:

### Platform 1: [Most relevant platform]
- **Why this platform:** Connection to user behavior
- **Content Strategy:** Types of posts that work
- **Posting Schedule:** Optimal times and frequency  
- **Engagement Tactics:** How to build relationships
- **Success Metrics:** What to track
- **Example Posts:** 3-5 ready-to-post examples
- **Hashtags/Communities:** Specific ones to target

### Platform 2: [Second most relevant]
[Same detailed breakdown]

### Platform 3: [Third platform]
[Same detailed breakdown]

## Channel-Specific Tactics

### Organic Growth Tactics
- **Community Engagement:** Which communities, how to engage
- **Content Marketing:** Blog topics, video ideas, podcast pitches
- **SEO Strategy:** Keywords to target, content to create
- **Partnership Opportunities:** Who to collaborate with

### Paid Options (if budget allows)
- **Platform Ads:** Where to advertise, targeting parameters
- **Influencer Outreach:** Who to contact, what to offer
- **Sponsored Content:** Publications/newsletters to consider

## Cross-Platform Integration
- How platforms work together
- Content repurposing strategy
- Unified messaging approach

Focus on specific tactics that work for this exact product and user base.`,

    'content-templates': `${baseContext}

Create ready-to-use content templates tailored to the specific product and audience.

# CONTENT TEMPLATES

## Social Media Templates

### Twitter/X Posts (10 variations)
1. **Problem/Solution Hook:**
   "[Specific problem user faces] → [Product] solves this in [specific way]. [Call to action]"
   
2. **Feature Highlight:**
   "[Specific feature] means [specific benefit]. [User type] love this because [specific reason]."
   
3. **Social Proof:**
   "[User type] just [specific achievement] using [product]. [Quote/result] [Link]"

[Continue with 7 more specific templates]

### LinkedIn Posts (5 variations)
[Professional, detailed posts for B2B audience]

### Reddit/Community Posts (3 variations)
[Community-specific language and approach]

## Email Templates

### Welcome Email
**Subject:** [Specific subject line]
**Body:** [Complete email with personalization]

### Feature Announcement
**Subject:** [Specific subject line]  
**Body:** [Complete email]

### Re-engagement Campaign
**Subject:** [Specific subject line]
**Body:** [Complete email]

## Website Copy Templates

### Hero Section
- **Headline:** [7-10 words that hook the target user]
- **Subheadline:** [15-20 words explaining the benefit]
- **CTA Button:** [3-4 words that compel action]

### Feature Descriptions (3 key features)
Each with:
- Feature name
- Benefit-focused description  
- Use case example
- Social proof element

### Landing Page Copy
Complete sections for:
- Problem/solution fit
- How it works
- Social proof
- Pricing/offer
- FAQ responses

## Outreach Templates

### Cold Email (3 variations)
Personalized for different user types

### DM Templates (Twitter, LinkedIn)
Platform-specific approaches

### Community Introduction Posts
How to introduce the product in communities

All templates should be immediately usable with minimal customization.`,

    'metrics-dashboard': `${baseContext}

Create a comprehensive metrics tracking plan with specific KPIs and tools.

# METRICS DASHBOARD

## Key Performance Indicators (KPIs)

### Acquisition Metrics
- **Traffic Sources:** Specific channels to track
- **Conversion Rates:** By source and user type  
- **Cost Per Acquisition:** If using paid channels
- **Time to First Value:** User onboarding success
- **Signup/Trial Conversion:** Funnel optimization

### Engagement Metrics  
- **Feature Usage:** Which features drive retention
- **User Actions:** Key behaviors that predict success
- **Session Duration:** Quality of engagement
- **Return Visits:** Indication of product-market fit

### Business Metrics
- **Revenue:** Specific to the monetization model
- **Customer Lifetime Value:** User worth calculation
- **Churn Rate:** Retention tracking
- **Net Promoter Score:** User satisfaction

## Daily Tracking Plan

### Day 1-3 Focus
- **Primary:** [Top 3 metrics to watch]
- **Secondary:** [Supporting metrics]
- **Warning Signs:** [What indicates problems]
- **Action Triggers:** [When to pivot tactics]

### Day 4-7 Focus
- **Primary:** [Shifted focus metrics]
- **Growth:** [Metrics indicating momentum]
- **Optimization:** [What to improve]

## Tools and Setup

### Free Tools
- **Google Analytics:** Specific events to track
- **Social Media Analytics:** Native platform insights
- **Email Analytics:** Open/click tracking
- **Customer Feedback:** Simple survey tools

### Paid Tools (if budget allows)
- **Advanced Analytics:** Mixpanel, Amplitude
- **Social Monitoring:** Brand24, Mention
- **Email Advanced:** ConvertKit, Mailchimp
- **Customer Success:** Intercom, Zendesk

## Success Benchmarks

### Week 1 Targets
- **Traffic:** [Specific numbers]
- **Signups:** [Specific numbers]  
- **Engagement:** [Specific metrics]
- **Revenue:** [If applicable]

### Warning Thresholds
- **Low Performance:** [When to worry]
- **Technical Issues:** [What to monitor]
- **User Feedback:** [Negative signals]

## Reporting Schedule
- **Daily:** [What to check every day]
- **Weekly:** [Weekly review items]
- **Monthly:** [Long-term trend analysis]

## Action Plans
- **Above Target:** [How to capitalize]
- **On Target:** [How to maintain]
- **Below Target:** [Specific recovery tactics]

Focus on metrics that actually matter for this specific product and business model.`
  };

  const prompt = prompts[step];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a launch strategy expert creating ${step.replace('-', ' ')} for a specific product. 

CRITICAL INSTRUCTIONS:
1. Be extremely specific - no generic advice
2. Create actionable, immediately usable content
3. Reference the specific product context provided
4. Build upon insights from previous steps when available
5. Use the exact product details, user personas, and market context
6. Provide ready-to-execute plans with specific times, metrics, and actions
7. Include real examples, templates, and copy that can be used immediately

Make everything tailored to this exact product and market, not general startup advice.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || `Failed to generate ${step} content.`;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`AI generation failed for ${step}`);
  }
}