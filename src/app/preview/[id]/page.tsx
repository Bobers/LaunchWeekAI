'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const MARKETING_BLOCKS = [
  {
    id: 'context-extraction',
    title: 'Context Extraction',
    icon: '🔍',
    description: 'AI extracts your product DNA to create a foundation for everything else',
    details: [
      'Product category and core value proposition',
      'Target market size and competitive landscape',
      'Current development stage and timeline',
      'Monetization model and pricing signals',
      'Technical complexity and user onboarding needs'
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
    title: '7-Day Launch Timeline',
    icon: '📅',
    description: 'Step-by-step daily action plan from pre-launch to post-launch',
    details: [
      'Pre-launch prep checklist (48 hours before)',
      'Day 1-2: Soft launch and early feedback collection',
      'Day 3-4: Targeted outreach and community engagement',
      'Day 5-6: Product Hunt or major platform launch',
      'Day 7: Analysis and next phase planning'
    ]
  },
  {
    id: 'platform-strategy',
    title: 'Platform Strategy',
    icon: '🎯',
    description: 'Channel-specific tactics tailored to where your users actually hang out',
    details: [
      'Twitter/X strategy with hashtags and engagement tactics',
      'LinkedIn approach for B2B products',
      'Reddit communities and posting guidelines',
      'Discord/Slack community engagement plan',
      'Direct outreach templates and target lists'
    ]
  },
  {
    id: 'content-templates',
    title: 'Content Templates',
    icon: '✍️',
    description: 'Ready-to-copy templates for tweets, DMs, posts, and landing pages',
    details: [
      '10+ tweet variations for different audiences',
      'Personalized DM templates for outreach',
      'Community post templates (Reddit, Discord, etc.)',
      'Landing page headlines and copy blocks',
      'Email templates for user feedback and updates'
    ]
  },
  {
    id: 'metrics-dashboard',
    title: 'Metrics Dashboard',
    icon: '📊',
    description: 'Daily tracking plan with success criteria and contingency plans',
    details: [
      'Key metrics to track each day (traffic, signups, usage)',
      'Success benchmarks for each launch phase',
      'Warning signs and when to pivot tactics',
      'Tools for tracking (analytics, social monitoring)',
      'Weekly review checklist and next steps'
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
  const [isExtractingContext, setIsExtractingContext] = useState(true);
  const [context, setContext] = useState<ExtractedContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const sessionId = params.id as string;

  // Extract context when component mounts
  useEffect(() => {
    const extractContext = async () => {
      try {
        const markdown = sessionStorage.getItem(`markdown-${sessionId}`);
        
        if (!markdown) {
          router.push('/');
          return;
        }

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

    extractContext();
  }, [sessionId, router]);

  const handleGeneratePlaybook = async () => {
    setIsGenerating(true);
    
    try {
      // Retrieve markdown from session storage
      const markdown = sessionStorage.getItem(`markdown-${sessionId}`);
      
      if (!markdown) {
        alert('Session expired. Please start over.');
        router.push('/');
        return;
      }

      // Call generate API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Clear session storage
        sessionStorage.removeItem(`markdown-${sessionId}`);
        // Redirect to playbook page
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to generate playbook');
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

        {/* Context Extraction Results */}
        {isExtractingContext ? (
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
                  <p className="text-gray-700"><strong>{context.productName || 'Not specified'}</strong></p>
                  <p className="text-sm text-gray-600">{context.productCategory || 'Category not identified'}</p>
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
                  <p className="text-gray-700">{context.primaryUserPersona || 'Not clearly defined'}</p>
                  {context.userBehavior && (
                    <p className="text-sm text-gray-600 mt-1"><strong>Behavior:</strong> {context.userBehavior}</p>
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