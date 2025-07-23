import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Checkout request received:', { bodyKeys: Object.keys(body), markdownLength: body.markdown?.length });
    
    const { markdown } = body;

    // Basic validation
    if (!markdown || typeof markdown !== 'string') {
      console.error('Validation failed: markdown missing or not string', { markdown: !!markdown, type: typeof markdown });
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    if (markdown.length > 50000) {
      console.error('Validation failed: content too long', { length: markdown.length });
      return NextResponse.json(
        { error: 'Markdown content exceeds 50,000 character limit' },
        { status: 400 }
      );
    }

    if (markdown.trim().length < 100) {
      console.error('Validation failed: content too short', { trimmedLength: markdown.trim().length });
      return NextResponse.json(
        { error: 'Markdown content too short. Please provide more detailed documentation.' },
        { status: 400 }
      );
    }

    // Log Stripe configuration
    console.log('Stripe config check:', {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPriceId: !!process.env.STRIPE_PRICE_ID,
      hasPublicUrl: !!process.env.NEXT_PUBLIC_URL,
      priceId: process.env.STRIPE_PRICE_ID
    });

    // Generate unique playbook ID
    const playbookId = uuidv4();

    // Store markdown in KV (using session metadata as fallback for now)
    // In production, you would use Vercel KV here:
    // await kv.set(playbookId, { status: 'pending', markdown }, { ex: 3600 });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/playbook/${playbookId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}`,
      metadata: {
        playbookId,
        // Store first 500 chars of markdown in metadata (Stripe limit)
        markdownPreview: markdown.substring(0, 500),
      },
    });

    // For now, we'll store the full markdown in a simple way
    // In production, you'd use Vercel KV or similar
    console.log(`Playbook ${playbookId} created for session ${session.id}`);

    return NextResponse.json({ 
      url: session.url,
      playbookId 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}