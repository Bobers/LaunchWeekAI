'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MARKETING_BLOCKS = [
  {
    id: 'user-persona',
    title: 'User Persona',
    icon: '👤',
    description: 'Detailed user personas with demographics, challenges, and online behavior',
    details: [
      'Primary persona with name, role, and background',
      'Daily challenges and pain points',
      'Where they spend time online',
      'Decision-making process',
      'Secondary personas for different use cases'
    ]
  },
  {
    id: 'positioning',
    title: 'Positioning',
    icon: '🎯',
    description: 'Clear positioning statement and competitive differentiation',
    details: [
      'Complete positioning statement',
      'Competitive positioning map',
      'Unique value proposition',
      'Market gaps you fill',
      'Key differentiators'
    ]
  },
  {
    id: 'brand-marketing',
    title: 'Brand Marketing',
    icon: '🎨',
    description: 'Brand personality, voice, tone, and messaging hierarchy',
    details: [
      'Brand personality traits',
      'Voice and tone guidelines',
      'Visual identity direction',
      'Tagline options',
      'Elevator pitch'
    ]
  },
  {
    id: 'marketing-copy',
    title: 'Marketing Copy',
    icon: '✍️',
    description: 'Ready-to-use website copy, email templates, and social proof',
    details: [
      'Website hero headline and subheadline',
      'Feature descriptions',
      'Call-to-action buttons',
      'Email templates',
      'Social proof structure'
    ]
  },
  {
    id: 'user-acquisition',
    title: 'User Acquisition',
    icon: '🚀',
    description: 'Channel-specific strategies and tactics for your target audience',
    details: [
      'Platform-specific tactics',
      'Content calendar',
      'Launch sequence',
      'Growth hacking techniques',
      'Community building'
    ]
  },
  {
    id: 'offer-audit',
    title: 'Offer Audit',
    icon: '💰',
    description: 'Pricing strategy, offer structure, and launch promotions',
    details: [
      'Pricing recommendations',
      'Tier structure',
      'Launch discounts',
      'Objection handling',
      'Risk reversal options'
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
            6 comprehensive marketing deliverables tailored to your AI product
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
            Our AI will analyze your documentation and create actionable strategies for each area
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