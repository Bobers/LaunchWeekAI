'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VersionIndicator from '@/components/VersionIndicator';

const GENERATION_STEPS = [
  {
    id: 'target-user-analysis',
    title: 'Target User Analysis',
    icon: '👤',
    description: 'Creating detailed user personas and journey mapping',
    estimatedTime: 15
  },
  {
    id: 'launch-timeline', 
    title: '7-Day Launch Timeline',
    icon: '📅',
    description: 'Building step-by-step daily action plan',
    estimatedTime: 20
  },
  {
    id: 'platform-strategy',
    title: 'Platform Strategy', 
    icon: '🎯',
    description: 'Developing channel-specific tactics',
    estimatedTime: 18
  },
  {
    id: 'content-templates',
    title: 'Content Templates',
    icon: '✍️', 
    description: 'Creating ready-to-use posts and copy',
    estimatedTime: 25
  },
  {
    id: 'metrics-dashboard',
    title: 'Metrics Dashboard',
    icon: '📊',
    description: 'Setting up tracking and success criteria',
    estimatedTime: 12
  }
] as const;

type GenerationStep = typeof GENERATION_STEPS[number];

interface StepResult {
  step: string;
  result: string;
  completed: boolean;
  error?: string;
}

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<Record<string, StepResult>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Load context and markdown on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedMarkdown = sessionStorage.getItem(`markdown-${sessionId}`);
    const storedContext = sessionStorage.getItem(`context-${sessionId}`);
    
    if (!storedMarkdown || !storedContext) {
      router.push('/');
      return;
    }
    
    setMarkdown(storedMarkdown);
    setContext(JSON.parse(storedContext));
    setStartTime(new Date());
    
    // Start generation automatically
    startGeneration(storedMarkdown, JSON.parse(storedContext));
  }, [sessionId, router]);

  const startGeneration = async (docMarkdown: string, docContext: any) => {
    setIsGenerating(true);
    
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setCurrentStepIndex(i);
      const step = GENERATION_STEPS[i];
      
      try {
        // Get previous step results for context
        const previousSteps: Record<string, string> = {};
        for (let j = 0; j < i; j++) {
          const prevStep = GENERATION_STEPS[j];
          if (stepResults[prevStep.id]?.result) {
            previousSteps[prevStep.id] = stepResults[prevStep.id].result;
          }
        }
        
        const response = await fetch('/api/generate-step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            markdown: docMarkdown,
            context: docContext,
            step: step.id,
            previousSteps
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Generation failed');
        }

        // Update step result
        setStepResults(prev => ({
          ...prev,
          [step.id]: {
            step: step.id,
            result: data.result,
            completed: true
          }
        }));

      } catch (error) {
        console.error(`Step ${step.id} failed:`, error);
        setStepResults(prev => ({
          ...prev,
          [step.id]: {
            step: step.id,
            result: '',
            completed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
        setError(`Failed to generate ${step.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsGenerating(false);
        return;
      }
    }
    
    setIsGenerating(false);
    setCurrentStepIndex(GENERATION_STEPS.length);
    
    // Generate final playbook and redirect
    await generateFinalPlaybook(docMarkdown, docContext);
  };

  const generateFinalPlaybook = async (docMarkdown: string, docContext: any) => {
    try {
      // Combine all step results into final playbook
      const allResults = GENERATION_STEPS.map(step => {
        const result = stepResults[step.id];
        return `# ${step.title.toUpperCase()}\n\n${result?.result || 'Generation failed'}`;
      }).join('\n\n---\n\n');

      const finalPlaybook = `# Launch Playbook for ${docContext.productName || 'Your Product'}

*Generated on ${new Date().toLocaleDateString()}*

## Context Summary
- **Product:** ${docContext.productName || 'Not specified'} - ${docContext.coreValueProposition || 'Not specified'}
- **Category:** ${docContext.productCategory || 'Not specified'}  
- **Stage:** ${docContext.productStage || 'Not specified'}
- **Target Market:** ${docContext.targetMarketSize || 'Not specified'}

---

${allResults}

---

*This playbook was generated by Launch Week AI. For questions or feedback, contact support@launchweek.ai*`;

      // Create a playbook entry using the original generate API structure
      // We'll pass the original markdown to satisfy the API, but the result will be our combined playbook
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          markdown: docMarkdown // Original markdown for API compatibility
        }),
      });

      const data = await response.json();
      
      if (data.playbookId) {
        // Store our custom playbook content directly (hack the storage)
        // We'll need to update the playbook storage with our combined content
        await fetch(`/api/generate?id=${data.playbookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            playbook: finalPlaybook 
          }),
        });
        
        // Clear session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(`markdown-${sessionId}`);
          sessionStorage.removeItem(`context-${sessionId}`);
        }
        // Redirect to final playbook
        window.location.href = `/playbook/${data.playbookId}`;
      }
    } catch (error) {
      console.error('Failed to generate final playbook:', error);
      setError('Failed to create final playbook');
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return 0;
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  const getTotalEstimatedTime = () => {
    return GENERATION_STEPS.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const getCompletedTime = () => {
    return GENERATION_STEPS.slice(0, currentStepIndex).reduce((total, step) => total + step.estimatedTime, 0);
  };

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
              {isGenerating ? (
                <span>Step {currentStepIndex + 1} of {GENERATION_STEPS.length}</span>
              ) : (
                <span>Complete! Finalizing your playbook...</span>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${isGenerating ? (getCompletedTime() / getTotalEstimatedTime()) * 100 : 100}%` 
              }}
            ></div>
          </div>
          
          {/* Time Estimate */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Elapsed: {getElapsedTime()}s</span>
            <span>
              {isGenerating ? (
                `Est. ${getTotalEstimatedTime() - getCompletedTime()}s remaining`
              ) : (
                'Redirecting to your playbook...'
              )}
            </span>
          </div>
        </div>

        {/* Step Details */}
        <div className="space-y-4">
          {GENERATION_STEPS.map((step, index) => {
            const result = stepResults[step.id];
            const isCurrentStep = index === currentStepIndex && isGenerating;
            const isCompleted = result?.completed;
            const hasError = result?.error;
            const isPending = index > currentStepIndex;
            
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
                    {hasError && (
                      <div className="text-red-600 text-2xl">❌</div>
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
                      🤖 AI is analyzing your product context and generating personalized content...
                    </p>
                  </div>
                )}
                
                {hasError && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      Error: {result.error}
                    </p>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Generated {Math.floor(result.result.length / 100)} sections with actionable content
                    </p>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Estimated time: {step.estimatedTime} seconds
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!isGenerating && !error && (
          <div className="text-center mt-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-600 text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Launch Strategy Complete!
              </h3>
              <p className="text-green-700">
                Redirecting to your personalized playbook...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}