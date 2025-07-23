'use client';

import { useState } from 'react';
import LaunchStrategyWizard from '@/components/LaunchStrategyWizard';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlaybook = async (context: any) => {
    setIsLoading(true);
    
    try {
      // Call generate API with full context
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to playbook page
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to generate playbook');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Turn Your AI Docs Into a Launch Strategy
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Get a personalized launch playbook tailored to your specific situation
          </p>
          <p className="text-lg text-gray-500">
            Answer a few questions and receive actionable strategies for your AI product launch
          </p>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Your Custom Launch Strategy
            </h2>
            <p className="text-gray-600">
              Our AI is analyzing your inputs and creating a personalized playbook...
            </p>
          </div>
        ) : (
          <LaunchStrategyWizard onComplete={handleGeneratePlaybook} />
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Questions? Contact us at support@launchweek.ai
          </p>
        </div>
      </div>
    </div>
  );
}