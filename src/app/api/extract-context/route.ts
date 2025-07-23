import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  console.log('POST /api/extract-context - Request received');
  
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

    // Extract context from markdown
    const context = await extractContext(markdown);
    
    return NextResponse.json({ context });

  } catch (error) {
    console.error('Context extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract context' },
      { status: 500 }
    );
  }
}

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

async function extractContext(markdown: string): Promise<ExtractedContext> {
  const extractionPrompt = `Analyze the following AI product documentation and extract key information for launch planning. Return a JSON object with these fields:

{
  "productName": "extracted product name",
  "productCategory": "specific category like 'AI Writing Assistant', 'Developer Tool', 'Business Analytics', etc.",
  "coreValueProposition": "main benefit in one clear sentence",
  "targetMarketSize": "describe the market opportunity (niche/medium/large/massive) with reasoning",
  "competitiveLandscape": "main competitors and how this product differs",
  "monetizationModel": "free|freemium|subscription|one-time|usage-based|enterprise",
  "pricingSignals": "any pricing information mentioned or pricing strategy hints",
  "primaryUserPersona": "detailed description of the main user (role, experience level, needs)",
  "userBehavior": "where they hang out online, how they discover tools, decision process",
  "painPoints": "specific problems this product solves for users",
  "productStage": "concept|mvp|beta|production with details",
  "timeline": "development timeline or launch timeline if mentioned"
}

Documentation to analyze:
${markdown}

Focus on extracting specific, actionable information that would be useful for creating launch strategies. If information isn't clearly stated, make reasonable inferences based on the product description but mark them as inferences.

Return ONLY the JSON object, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing product documentation and extracting key business information for launch planning. Always return valid JSON with detailed, specific information.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
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