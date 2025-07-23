'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VersionIndicator from '@/components/VersionIndicator';

const GENERATION_STEPS = [
  {
    id: 0,
    title: 'Context Extraction',
    icon: '🔍',
    description: 'Analyzing your product documentation'
  },
  {
    id: 1,
    title: 'Target User Analysis',
    icon: '👤',
    description: 'Creating detailed user personas'
  },
  {
    id: 2,
    title: '7-Day Launch Timeline',
    icon: '📅',
    description: 'Building step-by-step action plan'
  },
  {
    id: 3,
    title: 'Platform Strategy',
    icon: '🎯',
    description: 'Developing channel-specific tactics'
  },
  {
    id: 4,
    title: 'Content Templates',
    icon: '✍️',
    description: 'Creating ready-to-use posts and copy'
  },
  {
    id: 5,
    title: 'Metrics Dashboard',
    icon: '📊',
    description: 'Setting up tracking and success criteria'
  }
] as const;

interface JobStatus {
  jobId: string;
  status: 'processing' | 'complete' | 'failed';
  progress: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    estimatedTimeRemaining: number;
  };
  error?: string;
  playbookUrl?: string;
}

export default function AsyncGeneratePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const startPolling = useCallback(async (jobId: string) => {
    const poll = async (): Promise<boolean> => {
      try {
        setPollCount(prev => prev + 1);
        
        const response = await fetch(`/api/jobs/simple-status?id=${jobId}`);
        const data: JobStatus = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get job status');
        }
        
        setJobStatus(data);
        
        // If completed, redirect to playbook
        if (data.status === 'complete' && data.playbookUrl) {
          // Clear session storage
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(`markdown-${sessionId}`);
            sessionStorage.removeItem(`context-${sessionId}`);
            sessionStorage.removeItem(`job-${sessionId}`);
          }
          
          // Redirect to playbook
          window.location.href = data.playbookUrl;
          return false; // Stop polling
        }
        
        // If failed, show error
        if (data.status === 'failed') {
          setError(data.error || 'Generation failed');
          return false; // Stop polling
        }
        
        return true; // Continue polling
        
      } catch (error) {
        console.error('Polling error:', error);
        setPollCount(prev => prev + 1);
        
        // Stop polling after too many failures
        if (pollCount > 60) { // 5 minutes of polling
          setError('Generation timed out. Please try again.');
          return false;
        }
        return true; // Continue polling
      }
    };
    
    // Initial poll
    const shouldContinue = await poll();
    
    if (shouldContinue) {
      // Poll every 2 seconds
      const pollInterval = setInterval(async () => {
        const continuePolling = await poll();
        if (!continuePolling) {
          clearInterval(pollInterval);
        }
      }, 2000);
      
      // Return cleanup function
      return () => clearInterval(pollInterval);
    }
    
    return () => {}; // No cleanup needed
  }, [pollCount, sessionId]);

  // Load job ID and start polling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const jobId = sessionStorage.getItem(`job-${sessionId}`);
    
    if (!jobId) {
      router.push('/');
      return;
    }
    
    setStartTime(new Date());
    
    const startPollingAsync = async () => {
      await startPolling(jobId);
    };
    
    startPollingAsync();
  }, [sessionId, router, startPolling]);

  const getElapsedTime = () => {
    if (!startTime) return 0;
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  // Remove unused function
  // const getCurrentStepInfo = () => {
  //   if (!jobStatus) return GENERATION_STEPS[0];
  //   return GENERATION_STEPS[Math.min(jobStatus.progress.currentStep, GENERATION_STEPS.length - 1)];
  // };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
        <VersionIndicator />
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Generation Failed</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              ← Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <VersionIndicator />
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Generating Your Launch Strategy
          </h1>
          <p className="text-xl text-gray-600">
            AI is creating personalized, actionable content for each section
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
            <div className="text-sm text-gray-600">
              {jobStatus ? (
                <span>Step {jobStatus.progress.currentStep + 1} of {jobStatus.progress.totalSteps}</span>
              ) : (
                <span>Starting...</span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
              style={{ 
                width: jobStatus 
                  ? `${Math.min((jobStatus.progress.currentStep / jobStatus.progress.totalSteps) * 100, 100)}%`
                  : '0%'
              }}
            ></div>
          </div>
          
          {/* Time and Status */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Elapsed: {getElapsedTime()}s</span>
            <span>
              {jobStatus && jobStatus.progress.estimatedTimeRemaining > 0 
                ? `~${jobStatus.progress.estimatedTimeRemaining}s remaining`
                : 'Finalizing...'
              }
            </span>
          </div>
          
          {/* Current Step */}
          {jobStatus && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                🤖 {jobStatus.progress.stepName}
              </p>
            </div>
          )}
        </div>

        {/* Step Details */}
        <div className="space-y-4">
          {GENERATION_STEPS.map((step, index) => {
            const isCurrentStep = jobStatus && index === jobStatus.progress.currentStep;
            const isCompleted = jobStatus && index < jobStatus.progress.currentStep;
            const isPending = !jobStatus || index > jobStatus.progress.currentStep;
            
            return (
              <div 
                key={step.id}
                className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ${
                  isCurrentStep ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{step.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isCompleted && (
                      <div className="text-green-600 text-2xl">✅</div>
                    )}
                    {isCurrentStep && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    )}
                    {isPending && (
                      <div className="text-gray-400 text-2xl">⏳</div>
                    )}
                  </div>
                </div>
                
                {isCurrentStep && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🤖 AI is working on this section...
                    </p>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Section completed successfully
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <strong>Debug Info:</strong>
            <br />
            Poll Count: {pollCount}
            <br />
            Job Status: {jobStatus ? JSON.stringify(jobStatus, null, 2) : 'Loading...'}
          </div>
        )}
      </div>
    </div>
  );
}