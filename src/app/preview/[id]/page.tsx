'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const MARKETING_BLOCKS = [
  {
    id: 'discord-community',
    title: 'Discord Community Strategy',
    icon: '💬',
    description: 'Build your community BEFORE launch (200M ARR proven - Midjourney)',
    details: [
      'Week -4: Create and grow Discord server',
      'Community-first validation approach',
      'Daily engagement tactics that work',
      'Convert members to beta testers',
      'The Discord Test: 50+ reactions = valid idea'
    ]
  },
  {
    id: 'target-user-analysis',
    title: 'Target User Analysis',
    icon: '👤',
    description: 'Specific user personas with behaviors, pain points, and online habits',
    details: [
      'Primary persona with name, role, and daily workflow',
      'Specific pain points your product solves',
      'Where they discover new tools (platforms, communities)',
      'Decision-making process and budget authority',
      'Communication preferences and trust signals'
    ]
  },
  {
    id: 'launch-timeline',
    title: '4-Week Launch Timeline',
    icon: '📅',
    description: 'Data-backed timeline: Discord → Waitlist → Launch → Scale',
    details: [
      'Week -4: Discord community building',
      'Week -3: Soft launch for feedback',
      'Week -2: Waitlist with 10k credit hook',
      'Week -1: Asset prep and hunter recruitment',
      'Launch Week: Tuesday PH, Wednesday Reddit'
    ]
  },
  {
    id: 'platform-strategy',
    title: 'The Big 6 Channels',
    icon: '🎯',
    description: 'Priority channels based on real conversion data',
    details: [
      '#1 Discord: 200M ARR without VC',
      '#2 Reddit: 1,328% growth proven',
      '#3 Product Hunt: Tuesday optimal',
      '#4 Twitter/X: Declining but relevant',
      '#5 LinkedIn: B2B thought leadership',
      '#6 AI Directories: Hidden traffic gems'
    ]
  },
  {
    id: 'content-templates',
    title: 'No-AI Content Templates',
    icon: '✍️',
    description: 'Problem-first hooks (65% higher conversion - never mention AI)',
    details: [
      'Hook Formula: Problem → Saved → Without complexity',
      'Twitter threads that show real metrics',
      'Reddit posts: Personal story + value first',
      'LinkedIn: Data-driven success posts',
      'Email: Credit-based incentive copy'
    ]
  },
  {
    id: 'pricing-metrics',
    title: 'Credit Pricing & Metrics',
    icon: '💳',
    description: 'Credit-based model (17% conversion vs 5% freemium)',
    details: [
      '10k free credits/month forever',
      '$19-49 starter tiers proven optimal',
      'Week 1: 1000+ signups or pivot',
      'Discord exclusive: 2x credits for life',
      'The 10 commandments of AI launches'
    ]
  }
];

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

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtractingContext, setIsExtractingContext] = useState(false);
  const [context, setContext] = useState<ExtractedContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [hasStartedExtraction, setHasStartedExtraction] = useState(false);
  const sessionId = params.id as string;

  // Helper function to safely render context values
  const renderContextValue = (value: unknown, fallback: string = 'Not specified'): string => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Check session on mount but don't extract context yet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const markdown = sessionStorage.getItem(`markdown-${sessionId}`);
    if (!markdown) {
      router.push('/');
    }
  }, [sessionId, router]);

  // Function to start context extraction
  const startContextExtraction = async () => {
    if (hasStartedExtraction) return;
    setHasStartedExtraction(true);
    setIsExtractingContext(true);
    
    try {
      const markdown = sessionStorage.getItem(`markdown-${sessionId}`);
      if (!markdown) {
        router.push('/');
        return;
      }

      console.log('Starting context extraction...');
      const response = await fetch('/api/extract-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
      });

      const data = await response.json();
      
      if (data.context) {
        setContext(data.context);
      } else {
        setContextError(data.error || 'Failed to extract context');
      }
    } catch (error) {
      console.error('Context extraction error:', error);
      setContextError('Failed to extract context');
    } finally {
      setIsExtractingContext(false);
    }
  };

  const handleGeneratePlaybook = async () => {
    setIsGenerating(true);
    
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') return;
      
      // Retrieve markdown from session storage
      const markdown = sessionStorage.getItem(`markdown-${sessionId}`);
      
      if (!markdown || !context) {
        alert('Session expired. Please start over.');
        router.push('/');
        return;
      }

      // Start async job
      const response = await fetch('/api/jobs/simple-start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
      });

      const data = await response.json();
      
      if (data.jobId) {
        // Store context for the generation page
        sessionStorage.setItem(`context-${sessionId}`, JSON.stringify(context));
        sessionStorage.setItem(`job-${sessionId}`, data.jobId);
        
        // Redirect to async generation page
        window.location.href = `/generate-async/${sessionId}`;
      } else {
        throw new Error(data.error || 'Failed to start generation');
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Review Your Product Context
          </h1>
          <p className="text-xl text-gray-600">
            AI extracted this information from your documentation. Please verify before generating your playbook.
          </p>
        </div>

        {/* Context Extraction Section */}
        {!hasStartedExtraction ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Analyze Your Documentation
            </h2>
            <p className="text-gray-600 mb-6">
              Click below to start AI analysis of your product documentation
            </p>
            <button
              onClick={startContextExtraction}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              🔍 Start Context Analysis
            </button>
          </div>
        ) : isExtractingContext ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mb-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Analyzing Your Documentation</h3>
            <p className="text-blue-700">AI is extracting key information about your product...</p>
          </div>
        ) : contextError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center mb-12">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Context Extraction Failed</h3>
            <p className="text-red-700 mb-4">{contextError}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              ← Back to edit documentation
            </button>
          </div>
        ) : context ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Extracted Product Context</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Basics */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🏷️ Product Name & Category</h3>
                  <p className="text-gray-700"><strong>{renderContextValue(context.productName)}</strong></p>
                  <p className="text-sm text-gray-600">{renderContextValue(context.productCategory, 'Category not identified')}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Core Value Proposition</h3>
                  <p className="text-gray-700">{context.coreValueProposition || 'Not clearly identified'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Target Market Size</h3>
                  <p className="text-gray-700">{context.targetMarketSize || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🏆 Competitive Landscape</h3>
                  <p className="text-gray-700">{context.competitiveLandscape || 'Not identified'}</p>
                </div>
              </div>
              
              {/* Business Model & Users */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">💰 Monetization Model</h3>
                  <p className="text-gray-700">{context.monetizationModel || 'Not specified'}</p>
                  {context.pricingSignals && (
                    <p className="text-sm text-gray-600 mt-1">{context.pricingSignals}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">👤 Primary User Persona</h3>
                  <p className="text-gray-700">
                    {typeof context.primaryUserPersona === 'string' 
                      ? context.primaryUserPersona 
                      : context.primaryUserPersona 
                        ? JSON.stringify(context.primaryUserPersona) 
                        : 'Not clearly defined'}
                  </p>
                  {context.userBehavior && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Behavior:</strong> {typeof context.userBehavior === 'string' 
                        ? context.userBehavior 
                        : JSON.stringify(context.userBehavior)}
                    </p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Pain Points Solved</h3>
                  <p className="text-gray-700">{context.painPoints || 'Not clearly identified'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🚀 Product Stage & Timeline</h3>
                  <p className="text-gray-700">{context.productStage || 'Not specified'}</p>
                  {context.timeline && (
                    <p className="text-sm text-gray-600 mt-1">{context.timeline}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Review this information carefully. The quality of your launch playbook depends on accurate context. 
                If anything looks wrong, go back and add more details to your documentation.
              </p>
            </div>
          </div>
        ) : null}

        {/* Marketing Blocks Preview */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Launch Strategy Will Include:
          </h2>
          <p className="text-lg text-gray-600">
            6 actionable sections with ready-to-execute plans
          </p>
        </div>

        {/* Marketing Blocks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {MARKETING_BLOCKS.map((block) => (
            <div 
              key={block.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">{block.icon}</span>
                <h3 className="text-xl font-bold text-gray-900">{block.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{block.description}</p>
              
              <ul className="space-y-2">
                {block.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span className="text-sm text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Generate Your Launch Strategy?
          </h2>
          <p className="text-gray-600 mb-6">
            Our AI will analyze your documentation and create step-by-step execution plans
          </p>
          
          <button
            onClick={handleGeneratePlaybook}
            disabled={isGenerating || isExtractingContext || !context}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Your Strategy...
              </>
            ) : isExtractingContext ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing Documentation...
              </>
            ) : !context ? (
              <>
                <span className="mr-2">❌</span>
                Cannot Generate (Context Missing)
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Generate My Launch Playbook
              </>
            )}
          </button>
          
          {context && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Context verified - Ready to generate personalized playbook
            </p>
          )}
          
          {!isExtractingContext && context && (
            <p className="text-sm text-gray-500 mt-4">
              This typically takes 30-60 seconds
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to edit documentation
          </button>
        </div>
      </div>
    </div>
  );
}