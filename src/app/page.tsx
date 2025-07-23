'use client';

import { useState } from 'react';

export default function Home() {
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 50000) {
      setMarkdown(value);
      setCharCount(value.length);
    }
  };

  const handleGeneratePlaybook = async () => {
    if (!markdown.trim()) {
      alert('Please paste your markdown documentation first.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call generate API (no payment required for POC)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown }),
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
          <p className="text-xl text-gray-600 mb-8">
            Get your comprehensive launch playbook in minutes
          </p>
          
          {/* 2-step process for POC */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-2">1</div>
              <span className="text-gray-700">Paste</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-2">2</div>
              <span className="text-gray-700">Generate</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-2">3</div>
              <span className="text-gray-700">Download</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label htmlFor="markdown" className="block text-sm font-medium text-gray-700 mb-2">
              Paste your AI product documentation (Markdown format)
            </label>
            <textarea
              id="markdown"
              value={markdown}
              onChange={handleMarkdownChange}
              placeholder="Paste your markdown documentation here...

Example:
# My AI Product
## Features
- Feature 1: AI-powered analysis
- Feature 2: Real-time processing
## Technical Architecture
..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                Characters: {charCount.toLocaleString()} / 50,000
              </span>
              {charCount > 45000 && (
                <span className="text-sm text-orange-600">
                  Approaching limit
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={handleGeneratePlaybook}
              disabled={isLoading || !markdown.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Generate Playbook (Free POC)'
              )}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              AI-powered playbook generation
            </p>
          </div>
        </div>

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