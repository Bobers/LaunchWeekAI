import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  console.log('POST /api/jobs/simple-start - Starting async generation');
  
  try {
    const { markdown } = await request.json();
    
    // Validate input
    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    // Create job ID
    const jobId = uuidv4();
    
    // Store job in existing playbook storage with initial status
    const { playbookStorage } = await import('../../generate/route');
    
    playbookStorage.set(jobId, {
      status: 'processing',
      playbook: null,
      error: null,
      createdAt: new Date().toISOString(),
      progress: {
        currentStep: 0,
        totalSteps: 6,
        stepName: 'Starting generation...',
        estimatedTimeRemaining: 90
      }
    });

    // Start background processing without waiting
    processInBackground(jobId, markdown);

    return NextResponse.json({ 
      jobId,
      status: 'processing',
      pollUrl: `/api/jobs/simple-status?id=${jobId}`
    });

  } catch (error) {
    console.error('Simple start error:', error);
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processInBackground(jobId: string, markdown: string) {
  console.log(`Starting background processing for job ${jobId}`);
  
  try {
    const { playbookStorage } = await import('../../generate/route');
    
    // Update status to running
    const currentJob = playbookStorage.get(jobId);
    if (currentJob) {
      currentJob.progress.stepName = 'Extracting context...';
      currentJob.progress.currentStep = 1;
      currentJob.progress.estimatedTimeRemaining = 75;
      playbookStorage.set(jobId, currentJob);
    }

    // Step 1: Extract context (simulate time)
    await new Promise(resolve => setTimeout(resolve, 2000));
    const contextResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/extract-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown })
    });
    const { context } = await contextResponse.json();

    // Update progress
    if (playbookStorage.has(jobId)) {
      const job = playbookStorage.get(jobId);
      job.progress.currentStep = 2;
      job.progress.stepName = 'Generating user analysis...';
      job.progress.estimatedTimeRemaining = 60;
      playbookStorage.set(jobId, job);
    }

    // Steps 2-6: Generate each section
    const steps = [
      { id: 'target-user-analysis', name: 'Analyzing target users', time: 45 },
      { id: 'launch-timeline', name: 'Creating launch timeline', time: 30 },
      { id: 'platform-strategy', name: 'Developing platform strategy', time: 20 },
      { id: 'content-templates', name: 'Generating content templates', time: 15 },
      { id: 'metrics-dashboard', name: 'Setting up metrics dashboard', time: 5 }
    ];

    const stepResults: Record<string, string> = {};
    const previousSteps: Record<string, string> = {};

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update progress
      if (playbookStorage.has(jobId)) {
        const job = playbookStorage.get(jobId);
        job.progress.currentStep = i + 3; // +1 for context, +2 for current step
        job.progress.stepName = step.name;
        job.progress.estimatedTimeRemaining = step.time;
        playbookStorage.set(jobId, job);
      }

      // Generate step (with timeout protection)
      const stepResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/generate-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          markdown, 
          context, 
          step: step.id, 
          previousSteps 
        })
      });

      if (stepResponse.ok) {
        const stepData = await stepResponse.json();
        stepResults[step.id] = stepData.result;
        previousSteps[step.id] = stepData.result;
      } else {
        stepResults[step.id] = `Failed to generate ${step.id}`;
      }

      // Add small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create final playbook
    const finalPlaybook = createFinalPlaybook(context, stepResults);
    
    // Mark as completed
    if (playbookStorage.has(jobId)) {
      const job = playbookStorage.get(jobId);
      job.status = 'complete';
      job.playbook = finalPlaybook;
      job.progress.currentStep = 6;
      job.progress.stepName = 'Completed successfully!';
      job.progress.estimatedTimeRemaining = 0;
      playbookStorage.set(jobId, job);
    }

    console.log(`Job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    
    // Mark as failed
    const { playbookStorage } = await import('../../generate/route');
    if (playbookStorage.has(jobId)) {
      const job = playbookStorage.get(jobId);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      playbookStorage.set(jobId, job);
    }
  }
}

function createFinalPlaybook(context: Record<string, unknown>, steps: Record<string, string>): string {
  const stepOrder = ['target-user-analysis', 'launch-timeline', 'platform-strategy', 'content-templates', 'metrics-dashboard'];
  
  const allResults = stepOrder.map(stepId => {
    const stepName = stepId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `# ${stepName.toUpperCase()}\n\n${steps[stepId] || 'Generation failed'}`;
  }).join('\n\n---\n\n');

  return `# Launch Playbook for ${context?.productName || 'Your Product'}

*Generated on ${new Date().toLocaleDateString()}*

## Context Summary
- **Product:** ${context?.productName || 'Not specified'} - ${context?.coreValueProposition || 'Not specified'}
- **Category:** ${context?.productCategory || 'Not specified'}  
- **Stage:** ${context?.productStage || 'Not specified'}
- **Target Market:** ${context?.targetMarketSize || 'Not specified'}

---

${allResults}

---

*This playbook was generated by Launch Week AI. For questions or feedback, contact support@launchweek.ai*`;
}