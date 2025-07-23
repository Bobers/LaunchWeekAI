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

Create a detailed 4-Week Launch Timeline following the data-backed pattern (Discord community FIRST).

# THE 4-WEEK LAUNCH TIMELINE

## Week -4: Discord Community Building
### Monday-Tuesday: Server Setup
- [ ] Create Discord server for ${context.productName}
- [ ] Set up channels: #welcome, #feedback, #showcase, #support
- [ ] Create onboarding flow with Carl-bot
- [ ] Design server icon and banner
- [ ] Write community guidelines

### Wednesday-Friday: Initial Members
- [ ] Invite 10-20 friends/colleagues personally
- [ ] Share in relevant Discord servers (not spam)
- [ ] Post valuable content daily (tips, insights)
- [ ] Run "The Discord Test": Share problem statement
- [ ] Success metric: 50+ reactions = validated idea

## Week -3: Soft Launch & Feedback
### Monday: Alpha Access
- [ ] Give Discord members exclusive access
- [ ] Create #alpha-testing channel
- [ ] Set up feedback forms
- [ ] Offer lifetime deals to first 10 users

### Tuesday-Thursday: Rapid Iteration
- [ ] Daily standup posts in Discord
- [ ] Implement top 3 requested features
- [ ] Fix critical bugs immediately
- [ ] Share progress transparently

### Friday: Waitlist Launch
- [ ] Create landing page with "10k free credits" hook
- [ ] Add "From the makers of [previous success]" if applicable
- [ ] Share waitlist in Discord first
- [ ] Goal: 100+ waitlist signups

## Week -2: Pre-Launch Momentum
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

### Friday: Content Creation
- [ ] Record 60-second demo video
- [ ] Create 5 Product Hunt gallery images
- [ ] Write 10 tweet variations
- [ ] Prepare Reddit post drafts
- [ ] Design carousel for LinkedIn

## Week -1: Pre-Launch Momentum
### Monday: Community Warming
- [ ] Share "Building [product] - Day X" posts
- [ ] Engage in target subreddits (no promotion)
- [ ] Answer questions in Discord communities
- [ ] Build relationships with micro-influencers
- [ ] Goal: Be known before launch

### Tuesday-Wednesday: Community Warming
- [ ] Engage in [specific subreddits/communities]
- [ ] Share valuable content (not promotional)
- [ ] Build relationships with active members
- [ ] Identify potential champions

### Thursday: Product Hunt & Tech Prep
- [ ] Find hunter with 500+ followers (or use your account)
- [ ] Upload all assets to PH draft
- [ ] Create Slack/Discord launch alerts
- [ ] Test payment flow 10x
- [ ] Set up monitoring alerts

### Friday: The 24-Hour Countdown
- [ ] Email waitlist: "Launching Monday, you get 24h early access"
- [ ] Discord announcement: "Big day Tuesday!"
- [ ] Final load testing
- [ ] Team briefing call
- [ ] Pre-write support macros

## Launch Week: The Big 6 Distribution
### Monday - Soft Launch (Email + Website)
- **9 AM:** Email to waitlist with exclusive access
- **10 AM:** Update website with launch messaging
- **11 AM:** First metrics check and adjustments
- **2 PM:** Follow-up email to non-openers
- **4 PM:** Gather initial feedback
- **Success Metric:** [X]% conversion from waitlist

### Tuesday - Product Hunt Launch (Optimal Day)
- **12:01 AM PST:** Go live (Tuesday = highest traffic)
- **5 AM:** Post in Discord with direct link
- **6 AM:** Share in 10+ Slack communities
- **8 AM:** Twitter thread with screenshots
- **10 AM:** Team responds to EVERY comment
- **12 PM:** Email blast "We're live on PH!"
- **2 PM:** LinkedIn post with backstory
- **4 PM:** Reddit soft mention if doing well
- **6 PM:** Final push in all channels
- **Success Metric:** Top 5 (gets newsletter feature)

### Wednesday - Reddit Domination
- **9 AM EST:** Post to r/artificial with success story
- **Title Formula:** "How I [specific achievement] in [timeframe] - [metric]"
- **10 AM:** Post different angle to r/SaaS
- **11 AM:** Share in niche subreddit
- **All Day:** Respond to EVERY comment helpfully
- **If asked:** Share link in comments, not post
- **Success Metric:** 100+ upvotes = validation

### Thursday - LinkedIn (If B2B) / AI Directories (If B2C)
**B2B Track:**
- **10 AM:** Publish "Lessons from launch week" post
- **Include:** Real metrics, failures, learnings
- **CTA:** "Happy to share what worked"
- **DM:** 20 target customers personally

**B2C Track:**
- **Morning:** Submit to Futurepedia, AI Tool Hunt
- **Include:** Video demo, discount code
- **Afternoon:** Submit to 5 more directories
- **Goal:** 3+ directory features by end of week

### Friday - Victory Lap & Next Steps
- **Morning:** Share week metrics transparently
  - Signups: [Actual number]
  - Revenue: [MRR if comfortable]
  - Best channel: [What worked]
  - Biggest surprise: [Learning]
- **Afternoon:** Discord celebration event
- **Evening:** Plan week 2 based on data
- **Success Check:** 
  - 1000+ signups = Scale what worked
  - 500-1000 = Optimize messaging
  - <500 = Pivot positioning weekend

## Post-Launch Week
### Monday: Analysis & Optimization
- Review all metrics against targets
- Identify top converting channels
- Plan resource allocation

### Tuesday-Friday: Double Down
- Scale what's working
- Fix what's broken
- Build on momentum

## The Success Checklist
### Week 1 Metrics (Data-Backed Benchmarks)
- **Signups:** 1,000+ = Strong launch
- **Discord members:** 500+ = Community traction  
- **Product Hunt:** Top 5 = PR opportunities
- **Reddit:** 100+ upvotes = Message resonates
- **Paying customers:** 50+ = Product-market fit signal

### The Pivot Decision Tree
**If <500 signups by Wednesday:**
1. Check conversion funnel for breaks
2. A/B test new headline (remove technical jargon)
3. Emphasize outcome over features
4. Add "No credit card required" if not present
5. Simplify onboarding to <2 minutes

**If <50 Discord members:**
1. You launched too early
2. Spend 2 more weeks building community
3. Share more valuable content
4. Run community challenges

**If negative feedback pattern:**
1. Address within 24 hours publicly
2. Ship fix within 72 hours
3. Turn critics into advocates
4. Document learnings openly

## The 10 Commandments for ${context.productName}
1. Never mention "GPT wrapper" or "AI-powered"
2. Launch Tuesday/Wednesday (data proves it)
3. Discord before product (community = moat)
4. Problem-first messaging (65% higher conversion)
5. Show, don't tell (GIFs > descriptions)
6. Credit-based > Subscription for AI tools
7. Week 1 pivot ready (have backup messaging)
8. Respond to every comment/message
9. Share real numbers (builds trust)
10. Ship daily during launch week

Every action tied to ${context.productName} helping ${context.primaryUserPersona} achieve ${context.coreValueProposition}.`,

    'platform-strategy': `${baseContext}

Create a platform strategy using data-backed distribution channels (Discord #1, Reddit #2 based on conversion data).

# PLATFORM STRATEGY - DATA-BACKED CHANNELS

## 1. Discord Strategy (200M ARR Proven - Midjourney)
### Community-First Approach
- **Create Discord Server:** 2-4 weeks BEFORE launch
- **Server Structure:**
  - #announcements (product updates)
  - #feedback (user input)
  - #showcase (user results)
  - #support (quick help)
  - #general (community building)

- **Growth Tactics:**
  - Share valuable insights daily
  - Host weekly office hours
  - Create exclusive beta channel
  - Reward active members with credits

- **The Discord Test:** Post problem statement, need 50+ reactions in 24h to validate

**Key Discord Servers to Join:**
${context.productCategory?.includes('AI') || context.productCategory?.includes('dev') ?
`- Midjourney (15M members)
- Leonardo AI (creator tools)
- Stable Foundation (technical)
- AI Entrepreneurs
- Your specific niche servers` :
`- Relevant industry servers
- Target audience communities
- Complementary tool servers`}

## 2. Reddit Strategy (1,328% Growth, 30% Higher Conversion)
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

## 4. X/Twitter Strategy (Declining but Still Relevant)
### Quick-Win Approach
- **Focus:** Build in public updates
- **Frequency:** 2-3 times daily during launch
- **Format:** Thread with progress + GIFs
- **Never:** Mention GPT/Claude in posts
- **Always:** Show results, not features

**Hook Templates:**
1. "Just helped a user [specific achievement] in [time]. Here's how:"
2. "The problem with [current solution]: [specific issue]. We fixed it:"
3. "Day [X] of launch: [metric] users, biggest learning: [insight]"

## 5. LinkedIn Strategy (B2B Only)
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

## 3. Product Hunt Strategy (Tuesday/Wednesday Optimal)
### Data-Backed Launch Approach
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

### The Reddit Playbook
**High-Converting Subreddits:**
- r/artificial (500k members, AI-friendly)
- r/SaaS (300k members, buyer intent)
${context.primaryUserPersona?.includes('developer') ? 
`- r/programming (4M members)
- r/webdev (2M members)` :
`- r/entrepreneur (3M members)
- r/productivity (1M members)`}
- Niche: r/${context.productCategory?.toLowerCase().replace(/\s+/g, '') || 'relevant'}

**The Winning Post Formula:**
Title: How I [achieved specific outcome] using [method] - [impressive metric]

Body:
1. Personal struggle story (2 paragraphs)
2. Failed attempts with other solutions
3. The 'aha' moment
4. Step-by-step solution
5. Results with numbers
6. "Built a tool to automate this"
7. Link in comments if people ask

**Timing:** Wednesday 9 AM EST (peak engagement)
**Success Metric:** 100+ upvotes = strong signal

## 6. AI Directories Strategy (Hidden Gems)
### High-Intent Traffic Sources
**Top Directories:**
- Futurepedia (500k+ monthly visitors)
- There's An AI For That
- AI Tool Hunt
- SaaS AI Tools
- AI Agents Directory

**Submission Tips:**
- Submit within 48h of launch
- Use video demos (3x higher CTR)
- Highlight unique use case
- Include discount code
- Update weekly with new features

**Success Metric:** 50+ upvotes = featured placement
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

## Email + SEO Strategy (Foundation)
### Long-Term Growth Engine

**Email Strategy:**
- **The Credit Hook:** "Get 10k free credits monthly"
- **Waitlist Builder:** "Launch week exclusive: 2x credits"
- **Segmentation:** By use case, not demographics
- **Automation:** Welcome series → Feature tips → Upgrade prompts

**SEO Quick Wins:**
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

## Channel Prioritization (Data-Backed Order)
${context.primaryUserPersona?.includes('developer') || context.productCategory?.includes('technical') ?
`1. **Discord** (40% effort) - Community before product
2. **Reddit** (25% effort) - r/programming, r/artificial
3. **Product Hunt** (15% effort) - Tuesday launch
4. **Twitter/X** (10% effort) - Build in public
5. **AI Directories** (10% effort) - Passive traffic` :
context.primaryUserPersona?.includes('business') || context.primaryUserPersona?.includes('enterprise') ?
`1. **LinkedIn** (30% effort) - Thought leadership
2. **Discord** (25% effort) - Private community
3. **Product Hunt** (20% effort) - Credibility
4. **Email** (15% effort) - Direct sales
5. **SEO** (10% effort) - Long-term` :
`1. **Discord** (35% effort) - Build community first
2. **Reddit** (30% effort) - Viral potential
3. **Product Hunt** (15% effort) - One-day spike
4. **AI Directories** (10% effort) - Consistent traffic
5. **Twitter/X** (10% effort) - Updates only`}

## The 4-Week Launch Timeline (Proven)
**Week -4:** Create Discord, start daily value posts
**Week -3:** Soft launch to Discord for feedback
**Week -2:** Build waitlist with "10k free credits" hook
**Week -1:** Recruit PH hunters, prep all assets

**Launch Week:**
- Monday: Email blast "24h early access"
- Tuesday: Product Hunt launch 12:01 AM PST
- Wednesday: Reddit posts (different angles)
- Thursday: LinkedIn thought leadership
- Friday: Week recap in Discord

**Success Metrics:**
- Week 1: 1,000+ signups = strong launch
- <500 signups = pivot messaging immediately
- Discord: 100+ active members pre-launch`,

    'content-templates': `${baseContext}

Create ready-to-use content following the Problem-First Positioning (65% higher adoption).

# CONTENT TEMPLATES - NO AI MENTIONS

## The Winning Hook Formula
**Structure:** [Specific Pain] → [Time/Money Saved] → [Without Complexity]

**${context.productName} Hooks:**
1. "${context.painPoints || 'Problem'} → Save ${context.coreValueProposition?.includes('hour') ? '2 hours daily' : '$1000s monthly'}"
2. "Turn ${context.productCategory} work from hours into seconds"
3. "${context.coreValueProposition} without ${context.competitiveLandscape ? 'the complexity of ' + context.competitiveLandscape : 'technical knowledge'}"

**NEVER Say:**
❌ "AI-powered tool for..."
❌ "GPT-4 wrapper that..."
❌ "Revolutionary AI solution..."
❌ "Leveraging artificial intelligence..."

**ALWAYS Say:**
✅ "Turn [X] into [Y] in 30 seconds"
✅ "Cut [specific cost] by 67%"
✅ "[Outcome] without [pain point]"
✅ "The fastest way to [result]"

## Social Media Templates

### Twitter/X Thread (Build in Public Format)
**Thread Starter:**
"We just hit ${context.productStage === 'beta' ? '100 beta users' : '1000 signups'} for ${context.productName}.

Here's exactly how we ${context.coreValueProposition}:

(real numbers inside 🧵)"

**Thread Body:**
"1/ The problem we kept hearing:
${context.painPoints || 'Users spending hours on repetitive tasks'}

This costs companies $[specific amount] yearly.

2/ We tried [existing solution] but:
- Too complex
- Too expensive  
- Didn't solve [specific issue]

3/ So we built a simple solution:
- [Feature 1]: [Specific benefit]
- [Feature 2]: [Time saved]
- [Feature 3]: [Cost reduced]

4/ Early results after 30 days:
📈 [Specific metric]
⏱️ Average time saved: [X hours]
💰 Average cost reduced: [$X]
😊 NPS score: [X]

5/ How to get started:
1. [Simple step]
2. [Simple step]
3. [Get result]

Takes <5 minutes.

6/ We're giving away 10k credits free:
[Link]

(limiting to first 1000 users)"

### LinkedIn Posts (Data-Driven Templates)

**Template 1 - The Success Metrics Post:**
"After 30 days of building ${context.productName}, here are the real numbers:

📊 Users: [X]
⏱️ Average time saved: [Y hours/week]
💰 Average money saved: [$Z/month]
🔄 Daily active users: [%]

Biggest surprise? ${context.primaryUserPersona} use it for [unexpected use case].

Biggest challenge? [Honest struggle].

What's working:
• [Specific feature] drives 60% of usage
• [Specific channel] brings highest quality users
• [Specific message] converts at 15%

What would you want to know about building [category] tools?

#SaaS #BuildInPublic #[Industry]"

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

Create a comprehensive playbook with data-backed pricing, metrics, and execution plans.

# METRICS & EXECUTION DASHBOARD

## Credit-Based Pricing (41% of Successful AI Companies)

### The Winning Model for ${context.productName}
**Credit System (Best for AI Tools):**
- **Free Tier:** 10,000 credits/month forever
- **Starter:** $19/month = 100,000 credits
- **Professional:** $49/month = 500,000 credits  
- **Business:** $99/month = 2,000,000 credits
- **Enterprise:** $299/month = unlimited credits

**Credit Usage Examples:**
- Basic [action]: 10 credits
- Advanced [action]: 50 credits
- Premium [action]: 100 credits

**Why Credits Work:**
✓ 17% trial-to-paid vs 5% traditional freemium
✓ Users understand value immediately
✓ Natural upgrade path when they run out
✓ Reduces "unlimited" abuse

### Hybrid Alternative (If High API Costs)
**Base + Usage Model:**
- **Free:** 1,000 credits/month
- **Starter:** $29/month + $0.01 per extra credit
- **Pro:** $99/month + $0.005 per extra credit
- **Volume discounts** at 1M+ credits

### Launch Week Offers (Data-Backed)
- **Discord Exclusive:** "First 100 members get 2x credits for life"
- **Product Hunt Special:** "PH users get 50k bonus credits"
- **Week 1 Only:** "Early adopters lock in 40% off forever"
- **Referral Bonus:** "Give 5k, Get 5k credits per referral"
- **No CC Required:** Always. 87% higher signup rate.

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

## Success Metrics (Data-Backed Benchmarks)

### Week 1: The Only Metrics That Matter
**1. Total Signups**
- Day 1: 100+ (soft launch to email/Discord)
- Day 2: 500+ (Product Hunt launch)
- Day 7: 1,000+ total
- **<500 by day 3 = PIVOT messaging**

**2. Activation (Key Action Completion)**
- Target: 40% complete [core action] in first session
- If <25%: Simplify onboarding immediately
- Track: Time to first [value moment]

**3. Daily Active Users**
- Day 1-3: 20% DAU/Signups
- Day 4-7: 15% DAU/Signups
- Week 2+: 13% DAU/MAU minimum

**4. Credit Usage (Health Indicator)**
- Free users: 20% use >50% of credits
- Shows real engagement vs tire kickers
- Predictor of future paid conversion

**5. Revenue Metrics**
- Week 1: 50+ paid customers ($1-3k MRR)
- Month 1: 100+ paid ($5-10k MRR)  
- Month 3: $10k+ MRR or pivot
- Credit ARPU: $40-60 typical

## The Launch Week Playbook

### Daily Standup (9 AM)
**Track & Share:**
1. Yesterday's numbers vs target
2. Top feedback theme (1 sentence)
3. Biggest bottleneck
4. Today's #1 priority
5. Help needed from team

### The 2-Hour Check (Every 2 Hours)
- **Signups:** Run rate vs daily goal
- **Activation:** % completing first action
- **Discord:** New members & activity
- **Support:** Any repeated issues?
- **Servers:** Load and performance

### Channel Performance Tracking
**Measure Everything:**
- Discord: Daily active members
- Reddit: Upvotes & comments
- PH: Rank & engagement
- Twitter: Impressions & clicks
- Email: Open & click rates
- **Winner:** Double down immediately

### The Pivot Decision (Wednesday 6 PM)
**If <500 signups:**
1. Emergency team meeting
2. Review all feedback
3. Pick ONE of these:
   - Simplify value prop
   - Change main hook
   - Target different persona
   - Add urgency/scarcity
4. Ship new messaging by Thursday AM

## The 10 Commandments (Proven by Data)

1. **Never mention AI/GPT** - Users don't care about tech
2. **Launch Tuesday/Wednesday** - 37% more traffic
3. **Credits > Subscriptions** - 17% vs 5% conversion
4. **Discord before product** - Community = retention
5. **Problem-first copy** - 65% higher conversion
6. **Show, don't tell** - GIFs get 3x engagement
7. **Price at $19-49** - Sweet spot for prosumers
8. **Pivot by day 3** - Don't wait if <500 signups
9. **Ship daily** - Momentum > perfection
10. **Share real numbers** - Transparency builds trust

## Quick Win Tactics

### If Low Signups
- Add "10k free credits" to headline
- Remove all technical jargon
- Simplify to 1-step signup
- Add social proof numbers
- Create FOMO: "First 1000 users only"

### If Low Activation  
- Add interactive demo
- Pre-fill with sample data
- Reduce to 1 click to value
- Add progress bar
- Send "Quick win" email

### If Low Revenue
- Show credit usage clearly
- Add "Running low" warnings
- Offer one-time credit packs
- Create usage-based urgency
- Add team/referral incentives

## Launch Stack (Copy This)

### Technical (1 Day Setup)
- **Analytics:** Posthog (free tier)
- **Payments:** Stripe with usage billing
- **Email:** Resend.com (cheap + API)
- **Support:** Discord (community support)
- **Monitoring:** Vercel Analytics
- **Status:** status.site (free)

### Growth Tools
- **Waitlist:** LaunchList or custom
- **Referrals:** ReferralCandy
- **Social Proof:** Testimonial.to
- **Email Capture:** Exit intent popup
- **Analytics:** Microsoft Clarity (free)

### Content Distribution
- **Discord:** Carl-bot for onboarding
- **Reddit:** Later for Reddit
- **Twitter:** Typefully for threads
- **LinkedIn:** Native scheduler
- **Cross-post:** Buffer (free tier)

## Your Specific Launch Plan for ${context.productName}

**Week -4:** Create "${context.productCategory} Builders" Discord
**Week -3:** Soft launch to Discord with 50% off lifetime
**Week -2:** Build waitlist with "10k free credits" hook
**Week -1:** Recruit PH hunter, prep all assets

**Launch Hook:** "${context.coreValueProposition} without ${context.painPoints?.split('.')[0] || 'the complexity'}"

**Success Metric:** 1,000 users who ${context.coreValueProposition} in week 1

**If <500:** Pivot to "${context.productCategory} Assistant" positioning`
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