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

Create a detailed Launch Timeline following the proven 2-week pattern (Week -2, Week -1, Launch Week).

# LAUNCH TIMELINE

## Week -2: Foundation Building
### Monday-Tuesday: Product Readiness
- [ ] Final bug fixes for [specific product features]
- [ ] Load testing for expected [user volume] concurrent users
- [ ] Set up monitoring for [specific metrics]
- [ ] Create backup/failover plan for [specific dependencies]

### Wednesday-Thursday: Asset Creation
- [ ] Product Hunt gallery images (5 required)
- [ ] 60-second demo video showing [key feature]
- [ ] Screenshot variations (light/dark mode)
- [ ] Social media carousel designs
- [ ] Email templates for launch sequence

### Friday: Early Access Program
- [ ] Identify 10-20 power users from [target audience]
- [ ] Send early access invites with specific asks
- [ ] Set up private feedback channel
- [ ] Document initial reactions and issues

## Week -1: Pre-Launch Momentum
### Monday: Waitlist Campaign
- **Goal:** Build list of [specific number] interested users
- **Tactics:** 
  - Teaser posts on [relevant platforms]
  - "Coming soon" landing page with value prop
  - Early bird incentive: [specific offer]

### Tuesday-Wednesday: Community Warming
- [ ] Engage in [specific subreddits/communities]
- [ ] Share valuable content (not promotional)
- [ ] Build relationships with active members
- [ ] Identify potential champions

### Thursday: Product Hunt Preparation
- [ ] Find hunter with 500+ followers
- [ ] Prepare launch day messaging
- [ ] Schedule team for launch day support
- [ ] Create tracking spreadsheet for supporters

### Friday: Final Preparations
- [ ] Test all systems under load
- [ ] Brief support team on FAQs
- [ ] Schedule social media posts
- [ ] Final email to waitlist

## Launch Week: The Big 6 Distribution
### Monday - Soft Launch (Email + Website)
- **9 AM:** Email to waitlist with exclusive access
- **10 AM:** Update website with launch messaging
- **11 AM:** First metrics check and adjustments
- **2 PM:** Follow-up email to non-openers
- **4 PM:** Gather initial feedback
- **Success Metric:** [X]% conversion from waitlist

### Tuesday - Product Hunt Launch
- **12:01 AM PST:** Go live on Product Hunt
- **6 AM:** Team begins commenting/upvoting
- **9 AM:** Reach out to network for support
- **12 PM:** Mid-day push to email list
- **3 PM:** Engage with every comment
- **6 PM:** Final push for West Coast
- **Success Metric:** Top 5 placement

### Wednesday - Reddit Activation
- **Morning:** Post to [specific subreddit] with value-first approach
- **Afternoon:** Engage with comments, provide helpful responses
- **Evening:** Cross-post to related communities if well-received
- **Success Metric:** [X] upvotes, positive sentiment

### Thursday - LinkedIn Thought Leadership
- **Morning:** Publish detailed case study post
- **Afternoon:** Engage with comments, connect with interested users
- **Evening:** Direct outreach to [specific user type]
- **Success Metric:** [X] meaningful conversations

### Friday - Twitter/X Momentum
- **9 AM:** Launch recap thread with metrics
- **12 PM:** Host Twitter Space on [relevant topic]
- **3 PM:** Share customer success stories
- **Success Metric:** [X] new followers, [Y] engagements

## Post-Launch Week
### Monday: Analysis & Optimization
- Review all metrics against targets
- Identify top converting channels
- Plan resource allocation

### Tuesday-Friday: Double Down
- Scale what's working
- Fix what's broken
- Build on momentum

## Contingency Plans
### If Below Target Traffic
- Activate paid ads on [best performing channel]
- Reach out to micro-influencers in [niche]
- Create viral contest with [specific prize]

### If Overwhelmed by Demand
- Implement queue system
- Hire temporary support
- Communicate transparently about delays

### If Negative Feedback on [Common Concern]
- Prepared response addressing concern
- Show roadmap for improvement
- Offer special support channel

Every action should be specific to ${context.productName} and ${context.primaryUserPersona}.`,

    'platform-strategy': `${baseContext}

Create a platform strategy using the Big 6 distribution channels, customized for the target audience.

# PLATFORM STRATEGY - THE BIG 6

## 1. X/Twitter Strategy
${context.primaryUserPersona?.includes('developer') || context.productCategory?.includes('dev') ? 
`### Developer Twitter Approach
- **Key Hashtags:** #buildinpublic #indiehackers #javascript #ai #devtools
- **Content Mix:**
  - 40% Technical insights/tutorials
  - 30% Product updates with GIFs
  - 20% Community engagement
  - 10% Personal founder story
- **Optimal Times:** 9 AM PST (devs starting work), 2 PM PST (post-lunch), 8 PM PST (evening builders)
- **Engagement Tactics:**
  - Reply to problems with helpful solutions
  - Share code snippets that showcase product
  - Host technical Twitter Spaces` : 
`### Business Twitter Approach  
- **Key Hashtags:** #saas #startup #productivity #ai #businessgrowth
- **Content Mix:**
  - 40% ROI/success stories
  - 30% Industry insights
  - 20% Product features
  - 10% Team culture
- **Optimal Times:** 8 AM EST (morning coffee), 12 PM EST (lunch break), 5 PM EST (commute)
- **Engagement Tactics:**
  - Share quick wins and time saved
  - Engage with industry thought leaders
  - Post compelling statistics`}

**Example Posts:**
1. "Just shipped [feature] that [specific benefit]. [User type] can now [achievement]. [Link]"
2. "The problem with [current solution] is [specific issue]. Here's how we solved it: [approach]"
3. "[Impressive metric] achieved by beta users. Here's what they're saying: [quote]"

## 2. LinkedIn Strategy
### Professional Network Approach
- **Content Types:**
  - Long-form case studies (1500+ words)
  - Data-driven insights posts
  - "Lessons learned" narratives
  - Team achievement spotlights
- **Targeting:** [Specific job titles] at [company size] companies
- **Groups to Join:** [5 specific LinkedIn groups]
- **Publishing Schedule:** Tuesday/Thursday 10 AM (peak engagement)

**LinkedIn Post Template:**
"I spent [time period] trying to solve [specific problem].

The existing solutions all had the same issue: [problem].

So we built [product] to [specific solution].

Results so far:
• [Metric 1]
• [Metric 2]  
• [Metric 3]

[Call to action]"

## 3. Product Hunt Strategy
### Launch Day Domination
- **Pre-Launch (1 week before):**
  - Build list of 50+ supporters
  - Create assets (gallery, GIF, description)
  - Find hunter with relevant audience
- **Launch Day Tactics:**
  - 12:01 AM PST launch
  - Team responds to every comment
  - Share in relevant Slack groups
  - Email blast at 6 AM, 12 PM, 5 PM
- **Success Factors:** Clear value prop, compelling visuals, active engagement

## 4. Reddit Strategy
### Community-First Approach
**Target Subreddits:**
${context.primaryUserPersona?.includes('developer') ? 
`- r/programming (technical discussions)
- r/webdev (if web-related)
- r/artificial (AI products)
- r/${context.productName?.toLowerCase().replace(/\s+/g, '')} (create dedicated sub)` :
`- r/entrepreneur (business focus)
- r/SaaS (software products)
- r/productivity (efficiency tools)
- r/smallbusiness (SMB focus)`}

**Content Strategy:**
- Lead with value, not promotion
- Share actionable insights
- Respond helpfully to questions
- Follow 9:1 rule (9 helpful comments per 1 mention)

**Example Post:**
"How we [specific achievement] - A technical deep dive"
[Detailed, valuable content]
[Soft mention of product at end]

## 5. Email Strategy  
### Direct Relationship Building
- **List Building:**
  - Exit intent popup: "Get our [specific valuable resource]"
  - Content upgrades on blog posts
  - Webinar registrations
- **Email Sequences:**
  - Welcome series (5 emails)
  - Feature announcements
  - Customer success stories
  - Educational content
- **Segmentation:** By user type, engagement level, feature usage

**Cold Outreach Template:**
"Hi [Name],

Noticed you [specific action showing interest in problem space].

[One sentence about their work/company]

We just launched [product] which helps [user type] [specific benefit].

[Specific relevant feature for them]

Worth a quick look? [Link to personalized demo]

[Your name]"

## 6. Website/SEO Strategy
### Organic Growth Engine
- **Target Keywords:**
  - "[problem] solution" (high intent)
  - "[competitor] alternative" (comparison)
  - "how to [specific task]" (educational)
- **Content Plan:**
  - 2 blog posts/week targeting long-tail keywords
  - Comparison pages for top 3 competitors
  - Use case pages for each persona
  - Technical documentation (if applicable)
- **Conversion Optimization:**
  - Above-fold value proposition
  - Social proof (logos, testimonials)
  - Clear CTAs throughout
  - Exit intent offers

## Cross-Channel Amplification
### How Channels Work Together
1. **Product Hunt → Twitter:** Live tweet progress, share milestones
2. **Reddit → Email:** Capture interested users from valuable posts
3. **LinkedIn → Website:** Drive traffic to detailed case studies
4. **Twitter → Product Hunt:** Mobilize followers for launch
5. **Email → All Channels:** Coordinate messaging across platforms

## Channel Prioritization
Based on ${context.productName} and ${context.primaryUserPersona}:
1. **Primary (60% effort):** [Top 2 channels]
2. **Secondary (30% effort):** [Next 2 channels]  
3. **Maintenance (10% effort):** [Remaining channels]

Focus resources where ${context.primaryUserPersona} actually spends time.`,

    'content-templates': `${baseContext}

Create ready-to-use content using the Hook Formula: [Problem] + [Time/Cost Saved] + [Unique Method]

# CONTENT TEMPLATES

## The Hook Formula
Core Hook: "${context.painPoints || 'Problem'} + ${context.coreValueProposition || 'Solution'} + [Specific Method]"

Example variations:
1. "Turn [input] into [output] in [timeframe] with [unique approach]"
2. "Cut [cost/time] by [percentage] using [specific method]"
3. "[Achieve outcome] without [common pain point] using [product]"

## Social Media Templates

### Twitter/X Thread (Viral Format)
**Thread Starter:**
"How ${context.productName} helps ${context.primaryUserPersona} ${context.coreValueProposition} in [specific timeframe]:

A thread 🧵"

**Thread Body:**
"1/ The problem: [Specific pain point with real example]

2/ Current solutions: [Why they fall short]

3/ Our approach: [Unique method/insight]

4/ Results so far: [Specific metrics/testimonials]

5/ How it works: [Simple 3-step explanation]

6/ What users say: [Powerful quote]

7/ Try it yourself: [Link with specific CTA]"

### LinkedIn Posts (5 Professional Templates)

**Template 1 - Problem/Solution Story:**
"I talked to 50+ ${context.primaryUserPersona} last month.

The #1 problem they face? ${context.painPoints}

Existing solutions ${context.competitiveLandscape ? 'like ' + context.competitiveLandscape : ''} don't work because [specific reason].

So we built ${context.productName} to [specific solution].

Early results:
• [Metric 1]
• [Metric 2]
• [Metric 3]

[Call to action with link]"

**Template 2 - Case Study Format:**
"Case Study: How [Customer Type] saved [specific metric] using ${context.productName}

Challenge: [Specific problem]
Solution: [How product helped]
Results: [Quantified outcome]

Key takeaway: [Broader lesson]

[Link to full case study]"

**Template 3 - Industry Insight:**
"The ${context.productCategory || 'industry'} is changing.

[Trend observation]

This means ${context.primaryUserPersona} need to [specific action].

Here's how forward-thinking teams are adapting: [3 bullet points]

[Soft product mention]"

### Reddit Posts (Community-First)

**Educational Post:**
"[How I/We] ${context.coreValueProposition} - A Technical Deep Dive

[Detailed valuable content about the problem/solution]
[Code examples or detailed methodology]
[Lessons learned]

PS: We turned this into a product called ${context.productName} if anyone's interested."

## Email Templates

### Welcome Email
**Subject:** "Your ${context.productName} account is ready - here's your quickstart guide"

**Body:**
"Hi [Name],

Welcome to ${context.productName}! You're joining [number] other ${context.primaryUserPersona} who are already ${context.coreValueProposition}.

Here's how to get your first win in the next 10 minutes:

1. [Specific first action]
2. [Second quick win]
3. [Third step to value]

[Button: Get Started]

P.S. Reply to this email if you need any help. I personally read every response.

[Founder name]"

### Launch Announcement
**Subject:** "${context.productName} is live - ${context.coreValueProposition} [${'freemium' === context.monetizationModel ? 'free to start' : 'with ' + context.pricingSignals || 'special launch pricing'}]"

**Body:**
[Compelling launch email based on product specifics]

## Website Copy

### Hero Section
**Headline Options:**
1. "${context.coreValueProposition} in [specific timeframe]"
2. "The [superlative] way to [achieve outcome] for ${context.primaryUserPersona}"
3. "[Achieve outcome] without [pain point]"

**Subheadline Options:**
1. "Join [number] ${context.primaryUserPersona} who [specific achievement] using ${context.productName}"
2. "[Specific method] that [specific benefit] for [user type]"
3. "Finally, a [product category] that actually [delivers promise]"

**CTA Buttons:**
- Free/Freemium: "Start Free" / "Get Started Free" / "Try It Now"
- Trial: "Start 7-Day Trial" / "Try Risk-Free"
- Demo: "See It In Action" / "Get Your Demo"

### Landing Page Sections

**Problem Section:**
"If you're a ${context.primaryUserPersona}, you know the struggle:
• [Pain point 1 with specific example]
• [Pain point 2 with emotional impact]
• [Pain point 3 with cost/time impact]

${context.competitiveLandscape ? 'Current solutions like ' + context.competitiveLandscape + ' fall short because [reason].' : 'Until now, there hasn\'t been a good solution.'}"

**Solution Section:**
"${context.productName} [does what] so you can [achieve outcome].

[3-step how it works]

No [common objection]. No [another objection]. Just [core benefit]."

**Social Proof Section:**
"${context.primaryUserPersona} love ${context.productName}:

'[Testimonial focusing on specific result]' - [Name, Title]

'[Testimonial addressing main objection]' - [Name, Title]

'[Testimonial about ease of use]' - [Name, Title]"

## Outreach Templates

### Cold DM (Twitter/LinkedIn)
"Hey [Name], saw your post about [relevant topic].

[One line showing you understand their problem]

We just launched ${context.productName} which helps ${context.primaryUserPersona} ${context.coreValueProposition}.

[Specific feature relevant to them]

Worth a quick look? [Link]"

### Community Introduction
"Hey everyone! 👋

I've been lurking here for a while and learning a ton about [relevant topic].

Based on discussions I've seen about [common problem], I built something that might help:

[Brief description of ${context.productName}]

[Specific value for this community]

Happy to answer any questions or get your feedback!

[Link]"

## Content Calendar (First Week)
- Monday: Welcome/launch announcement (Email + Twitter)
- Tuesday: Product Hunt launch assets
- Wednesday: Educational Reddit post
- Thursday: LinkedIn case study
- Friday: Twitter thread recap
- Weekend: Community engagement

All templates are customized for ${context.productName} targeting ${context.primaryUserPersona}.`,

    'metrics-dashboard': `${baseContext}

Create a comprehensive playbook including metrics, pricing strategy, and launch assets.

# METRICS & EXECUTION DASHBOARD

## Pricing Strategy

### Recommended Model: ${context.monetizationModel === 'freemium' ? 'Freemium' : context.monetizationModel === 'subscription' ? 'SaaS Trial' : 'Custom'}
${context.primaryUserPersona?.toLowerCase().includes('business') || context.primaryUserPersona?.toLowerCase().includes('enterprise') ?
`#### B2B Pricing Structure
**14-Day Free Trial → Paid Plans**
- **Starter:** $49/month (1-5 users, core features)
- **Professional:** $149/month (6-20 users, advanced features)
- **Enterprise:** $499/month (unlimited users, white-label, API)
- **Annual Discount:** 20% off (2.4 months free)

**Value Anchoring:**
- Compare to employee hours saved
- ROI calculator on pricing page
- Case studies showing 10x returns` :
`#### B2C/Developer Pricing Structure  
**Freemium Model**
- **Free Forever:** [Specific limits - e.g., 100 API calls/month]
- **Pro:** $29/month (unlimited usage, priority support)
- **Team:** $99/month (5 seats, collaboration features)
- **Annual Discount:** 20% off

**Psychological Triggers:**
- Most popular badge on Pro
- Limited-time launch pricing
- Usage-based fair pricing`}

### Offer Optimization
- **Launch Special:** ${context.productStage === 'beta' ? '50% off for beta users (lifetime)' : '30% off first 3 months'}
- **Urgency:** "Launch pricing ends [date]"
- **Risk Reversal:** ${context.monetizationModel === 'subscription' ? '30-day money-back guarantee' : 'No credit card required'}
- **Social Proof:** "Join [X] ${context.primaryUserPersona} already using ${context.productName}"

## Launch Asset Checklist

### Visual Assets ✅
- [ ] Logo variations (PNG): Light mode, dark mode, square icon
- [ ] Product screenshots (5): Dashboard, key feature, results, integrations, mobile
- [ ] Demo video (60 sec): Problem (10s) → Solution (40s) → CTA (10s)
- [ ] Product Hunt gallery: Cover image (1200x600), 3-5 feature images
- [ ] Social media templates: Twitter header, LinkedIn banner, OG images

### Copy Assets ✅  
- [ ] One-liner: "${context.coreValueProposition}"
- [ ] Elevator pitch (30 sec): Problem + solution + differentiator
- [ ] Product Hunt tagline (60 chars): Focus on outcome
- [ ] Email signatures: Team members with launch CTA
- [ ] Bio updates: All team social profiles

### Technical Assets ✅
- [ ] Landing page: Optimized for conversions
- [ ] Analytics/tracking: GA4, hotjar, attribution
- [ ] Live chat: Help Scout or Intercom ready
- [ ] Status page: status.${context.productName?.toLowerCase().replace(/\s+/g, '')}.com
- [ ] Documentation: Getting started guide

## Key Metrics (The Big 5)

### 1. Activation Rate
**Definition:** % of signups who ${context.coreValueProposition ? 'achieve first ' + context.coreValueProposition : 'complete key action'}
**Target:** ${context.primaryUserPersona?.includes('developer') ? '40%' : '60%'} within 24 hours
**Tracking:** Custom event when user [specific action]

### 2. Time to Value (TTV)
**Definition:** Minutes from signup to "aha moment"
**Target:** Under ${context.productCategory?.includes('simple') || context.productCategory?.includes('easy') ? '5 minutes' : '30 minutes'}
**Optimization:** Streamline onboarding, remove friction

### 3. Daily Active Users (DAU)
**Week 1 Targets:**
- Day 1: 50-100 users
- Day 3: 200-500 users  
- Day 7: 500-1000 users
**Growth Rate:** 20-30% daily during launch

### 4. Conversion Rate
**Funnel:** Visitor → Signup → Trial/Free → Paid
**Benchmarks:**
- Visitor → Signup: 3-5%
- Signup → Trial: ${context.monetizationModel === 'freemium' ? '100%' : '60-80%'}
- Trial → Paid: ${context.primaryUserPersona?.includes('business') ? '15-25%' : '2-5%'}

### 5. Revenue Metrics
- **MRR Growth:** Track daily during launch
- **ARPU:** $${context.pricingSignals?.match(/\d+/)?.[0] || '50'} target
- **CAC Payback:** Under 3 months
- **LTV:CAC Ratio:** Aim for 3:1

## Launch Week Dashboard

### Real-Time Monitoring
**Every 2 Hours Check:**
- Signup velocity and source
- Error rates and performance
- Support ticket themes
- Social sentiment

### Daily Review (6 PM)
1. **Numbers:** Compare to daily targets
2. **Feedback:** Categorize user comments
3. **Channels:** Identify top performers
4. **Tomorrow:** Adjust tactics based on data

### Success Criteria
**Green Light (exceeding targets):**
- Scale winning channels
- Increase ad spend
- Accelerate content schedule

**Yellow Light (meeting targets):**
- Maintain current efforts
- Test new channels
- Gather more feedback

**Red Light (below targets):**
- Diagnose bottlenecks
- Simplify onboarding
- Increase direct outreach
- Consider pivot in messaging

## Contingency Plans

### If Conversion Below Target
1. **Immediate:** Add exit intent survey
2. **Day 2:** Simplify signup flow
3. **Day 3:** Test new value proposition
4. **Day 4:** Offer extended trial

### If Servers Overloaded
1. **Immediate:** Scale infrastructure
2. **Communication:** Status page update
3. **Waitlist:** Convert to exclusive access
4. **PR:** "Overwhelming demand" story

### If Negative Feedback on [Specific Concern]
1. **Acknowledge:** Public response within 2 hours
2. **Fix:** Ship improvement within 48 hours
3. **Follow-up:** Personal reach out to critics
4. **Document:** Add to roadmap publicly

## Tools Setup
**Pre-Launch Setup:**
- [ ] Google Analytics 4 with conversion tracking
- [ ] Mixpanel/Amplitude for product analytics  
- [ ] Hotjar for user recordings
- [ ] Stripe with revenue tracking
- [ ] Customer.io for email automation
- [ ] Slack webhooks for real-time alerts

Every metric and action tied specifically to ${context.productName} and ${context.primaryUserPersona} success.`
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