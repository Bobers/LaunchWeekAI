import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Import shared storage
import { playbookStorage } from '../../../lib/storage';

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

interface ExtractedContext {
  productName?: string;
  productStage?: string;
  productDescription?: string;
  primaryUser?: string;
  problemSolved?: string;
  marketSize?: string;
  competitors?: string;
  monetization?: string;
  pricing?: string;
  targetMetrics?: string;
  teamSize?: string;
  timeline?: string;
  uniqueAdvantages?: string;
}

async function extractContext(markdown: string): Promise<ExtractedContext> {
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
      // Remove markdown code blocks if present
      let cleanJson = response.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse context JSON:', e);
      console.error('Raw response:', response);
      return {};
    }
  } catch (error) {
    console.error('Context extraction error:', error);
    return {};
  }
}

async function generatePlaybook(markdown: string, context: ExtractedContext): Promise<string> {
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

  const prompt = `You are a launch strategy expert specializing in go-to-market strategies. Create a comprehensive launch playbook covering these 6 critical areas:

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

Create a comprehensive launch playbook covering these 6 critical areas:

# Launch Playbook for ${productName}

## 1. USER PERSONA
Create 3 detailed user personas for ${primaryUser} market:

### Primary Persona
- Demographics
- Job title/role
- Daily challenges
- Goals and motivations
- Where they hang out online
- Decision-making process
- Budget authority

### Secondary Personas
- Alternative user types
- Different use cases
- Varying sophistication levels

## 2. POSITIONING
### Positioning Statement
Create a clear positioning using this framework:
"For [target customer] who [statement of need], ${productName} is a [product category] that [key benefit]. Unlike [primary competitive alternative], our product [key differentiator]."

### Competitive Positioning Map
- Position vs ${competitors || 'alternatives'}
- Key differentiators
- Unique value proposition
- Market gaps you fill

## 3. BRAND MARKETING
### Brand Strategy
- Brand personality traits
- Voice and tone guidelines
- Visual identity direction
- Core brand values

### Brand Messaging Hierarchy
- Tagline options
- Elevator pitch (30 seconds)
- One-paragraph description
- Full brand story

## 4. MARKETING COPY
### Website Copy
#### Hero Section
- Headline (7-10 words)
- Subheadline (15-20 words)
- CTA button text

#### Features Section
- 3 key features with:
  - Feature name
  - Benefit-focused description
  - Use case example

#### Social Proof Section
- Types of proof to collect
- Testimonial templates
- Case study structure

### Email Copy Templates
- Welcome email
- Feature announcement
- Re-engagement campaign

## 5. USER ACQUISITION
### Channel Strategy for ${primaryUser} Audience
${primaryUser === 'developer' ? `
#### Developer Channels
1. **Hacker News**
   - Post title formula
   - Optimal posting time
   - Comment strategy

2. **GitHub**
   - README optimization
   - Community engagement
   - Open source strategy

3. **Developer Communities**
   - Reddit: r/programming, r/${productName.toLowerCase().replace(/\s+/g, '')}
   - dev.to article topics
   - Discord/Slack communities

4. **Technical Content**
   - Tutorial series plan
   - API documentation
   - Code examples` : 
primaryUser === 'business' ? `
#### Business Channels
1. **LinkedIn Strategy**
   - Thought leadership topics
   - Post frequency
   - Engagement tactics

2. **ProductHunt Launch**
   - Pre-launch preparation
   - Launch day tactics
   - Post-launch momentum

3. **B2B Outreach**
   - Cold email templates
   - Webinar topics
   - Partnership opportunities

4. **Content Marketing**
   - Whitepaper topics
   - Case study framework
   - ROI calculators` :
primaryUser === 'consumer' ? `
#### Consumer Channels
1. **Social Media**
   - Platform priorities
   - Content calendar
   - Influencer outreach

2. **Paid Advertising**
   - Ad copy variations
   - Targeting parameters
   - Budget allocation

3. **Viral Mechanisms**
   - Referral program design
   - Social sharing features
   - Community building` :
`#### Mixed Audience Approach
1. **Content Strategy**
   - Blog post topics
   - Video content ideas
   - Podcast opportunities

2. **Community Building**
   - Platform selection
   - Engagement tactics
   - Moderation guidelines`}

### Acquisition Funnel
- Awareness tactics
- Consideration content
- Conversion optimization
- Retention strategies

## 6. OFFER AUDIT
### Pricing Strategy
- Current: ${pricing || 'Not specified'}
- Competitor pricing analysis
- Value-based pricing recommendation
- Pricing psychology tactics

### Offer Structure
${monetization === 'freemium' ? `
#### Freemium Tiers
- **Free Tier**
  - Features included
  - Usage limits
  - Upgrade triggers
  
- **Paid Tiers**
  - Tier names and pricing
  - Feature differentiation
  - Value justification` :
monetization === 'subscription' ? `
#### Subscription Plans
- Plan names and pricing
- Billing frequency options
- Feature comparison
- Upgrade incentives` :
`#### Pricing Model
- Recommended model for ${productStage}
- Price points to test
- Bundling opportunities
- Promotional strategies`}

### Launch Offers
- Early bird discount
- Beta user benefits
- Referral incentives
- Time-limited promotions

### Objection Handling
- Common objections
- Response strategies
- Risk reversal options
- Social proof placement

## Implementation Timeline
### Week 1-2: Foundation
- Finalize personas and positioning
- Create brand guidelines
- Write core marketing copy

### Week 3-4: Channel Setup
- Set up acquisition channels
- Create content calendar
- Prepare launch materials

### Launch Week
- Execute channel strategy
- Monitor and optimize
- Gather feedback

### Post-Launch
- Analyze performance
- Iterate on messaging
- Scale winning channels

Be EXTREMELY specific and actionable based on the product context provided.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a go-to-market strategy expert specializing in product launches. 
          
CRITICAL INSTRUCTIONS:
1. USER PERSONA: Create detailed, specific personas with names, backgrounds, and real pain points
2. POSITIONING: Write the actual positioning statement, not just a template
3. BRAND MARKETING: Provide specific brand personality traits (e.g., "Bold, Technical, Approachable")
4. MARKETING COPY: Write actual copy, not just descriptions of what to write
5. USER ACQUISITION: Give specific tactics with examples (e.g., "Post on HN at 9am PST on Tuesday")
6. OFFER AUDIT: Recommend specific price points and offer structures

Make everything actionable and specific to their product, not generic advice.`
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

// PUT endpoint to update playbook content (for sequential generation)
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playbookId = searchParams.get('id');
  
  if (!playbookId) {
    return NextResponse.json(
      { error: 'Playbook ID required' },
      { status: 400 }
    );
  }

  try {
    const { playbook } = await request.json();
    
    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook content required' },
        { status: 400 }
      );
    }

    // Update the playbook content
    const existingPlaybook = playbookStorage.get(playbookId);
    
    if (!existingPlaybook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    playbookStorage.set(playbookId, {
      ...existingPlaybook,
      playbook,
      status: 'complete'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update playbook error:', error);
    return NextResponse.json(
      { error: 'Failed to update playbook' },
      { status: 500 }
    );
  }
}

// Storage is now imported from shared module