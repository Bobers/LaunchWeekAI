import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('GET /api/jobs/simple-status - Checking job status');
  
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job from existing playbook storage
    const { playbookStorage } = await import('../../generate/route');
    const job = playbookStorage.get(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Return status with progress
    return NextResponse.json({
      jobId,
      status: job.status,
      progress: job.progress,
      error: job.error,
      createdAt: job.createdAt,
      // Include playbook URL if completed
      playbookUrl: job.status === 'complete' ? `/playbook/${jobId}` : null,
      // For debugging
      hasPlaybook: !!job.playbook
    });

  } catch (error) {
    console.error('Get simple job status error:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}