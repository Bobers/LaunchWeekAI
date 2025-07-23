'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function SamplePreviewPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlaybook = () => {
    alert('This is a sample preview page. Please start from the homepage to generate a real playbook.');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg inline-block mb-4">
            Sample Preview - For Testing Only
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Launch Strategy Will Include:
          </h1>
          <p className="text-xl text-gray-600">
            6 actionable sections with ready-to-execute plans for your launch
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
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 inline-flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Your Strategy...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Generate My Launch Playbook
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            This typically takes 30-60 seconds
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to homepage
          </button>
        </div>
      </div>
    </div>
  );
}