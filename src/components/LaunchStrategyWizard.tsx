'use client';

import { useState } from 'react';

interface LaunchContext {
  // Step 1: Product Overview
  markdown: string;
  productStage: 'concept' | 'mvp' | 'beta' | 'production' | '';
  productDescription: string;
  
  // Step 2: Target Audience
  primaryUser: 'developer' | 'business' | 'consumer' | 'other' | '';
  problemSolved: string;
  marketSize: 'niche' | 'medium' | 'large' | 'massive' | '';
  competitors: string;
  
  // Step 3: Business Model
  monetization: 'free' | 'freemium' | 'subscription' | 'onetime' | 'usage' | '';
  pricing: string;
  threeMonthGoal: 'users' | 'revenue' | 'feedback' | 'other' | '';
  goalDetails: string;
  
  // Step 4: Resources
  teamSize: 'solo' | 'small' | 'large' | '';
  budget: 'none' | 'small' | 'medium' | 'large' | '';
  timeline: 'days' | 'weeks' | 'months' | '';
  advantages: {
    emailList: boolean;
    community: boolean;
    partnerships: boolean;
    mediaContacts: boolean;
    other: string;
  };
}

interface Props {
  onComplete: (context: LaunchContext) => void;
}

export default function LaunchStrategyWizard({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [context, setContext] = useState<LaunchContext>({
    markdown: '',
    productStage: '',
    productDescription: '',
    primaryUser: '',
    problemSolved: '',
    marketSize: '',
    competitors: '',
    monetization: '',
    pricing: '',
    threeMonthGoal: '',
    goalDetails: '',
    teamSize: '',
    budget: '',
    timeline: '',
    advantages: {
      emailList: false,
      community: false,
      partnerships: false,
      mediaContacts: false,
      other: '',
    },
  });

  const updateContext = (updates: Partial<LaunchContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return context.markdown.trim().length > 100 && context.productStage && context.productDescription;
      case 2:
        return context.primaryUser && context.problemSolved && context.marketSize;
      case 3:
        return context.monetization && context.threeMonthGoal;
      case 4:
        return context.teamSize && context.budget && context.timeline;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(context);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
          <span className="text-sm text-gray-500">
            {currentStep === 1 && 'Product Overview'}
            {currentStep === 2 && 'Target Audience'}
            {currentStep === 3 && 'Business Model'}
            {currentStep === 4 && 'Resources & Timeline'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Product Overview */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tell us about your AI product</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Documentation (Markdown)
            </label>
            <textarea
              value={context.markdown}
              onChange={(e) => updateContext({ markdown: e.target.value })}
              placeholder="Paste your AI product documentation here..."
              className="w-full h-48 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {context.markdown.length} / 50,000 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What stage is your product in?
            </label>
            <select
              value={context.productStage}
              onChange={(e) => updateContext({ productStage: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a stage...</option>
              <option value="concept">Concept/Idea</option>
              <option value="mvp">MVP (Minimum Viable Product)</option>
              <option value="beta">Beta Testing</option>
              <option value="production">Production Ready</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your product in one sentence
            </label>
            <input
              type="text"
              value={context.productDescription}
              onChange={(e) => updateContext({ productDescription: e.target.value })}
              placeholder="e.g., An AI coding assistant that helps developers write better code faster"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: Target Audience */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who is your target audience?</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary user type
            </label>
            <select
              value={context.primaryUser}
              onChange={(e) => updateContext({ primaryUser: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select user type...</option>
              <option value="developer">Developers/Technical Users</option>
              <option value="business">Business/Enterprise Users</option>
              <option value="consumer">General Consumers</option>
              <option value="other">Other/Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What specific problem does your product solve?
            </label>
            <textarea
              value={context.problemSolved}
              onChange={(e) => updateContext({ problemSolved: e.target.value })}
              placeholder="e.g., Developers waste hours debugging code that could be caught automatically..."
              className="w-full h-24 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated market size
            </label>
            <select
              value={context.marketSize}
              onChange={(e) => updateContext({ marketSize: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select market size...</option>
              <option value="niche">Niche (< 10K potential users)</option>
              <option value="medium">Medium (10K - 100K users)</option>
              <option value="large">Large (100K - 1M users)</option>
              <option value="massive">Massive (> 1M users)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main competitors (optional)
            </label>
            <input
              type="text"
              value={context.competitors}
              onChange={(e) => updateContext({ competitors: e.target.value })}
              placeholder="e.g., GitHub Copilot, Tabnine, Kite"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 3: Business Model */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How will you monetize?</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenue model
            </label>
            <select
              value={context.monetization}
              onChange={(e) => updateContext({ monetization: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select model...</option>
              <option value="free">Free (no monetization yet)</option>
              <option value="freemium">Freemium</option>
              <option value="subscription">Subscription/SaaS</option>
              <option value="onetime">One-time purchase</option>
              <option value="usage">Usage-based pricing</option>
            </select>
          </div>

          {context.monetization && context.monetization !== 'free' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing details (optional)
              </label>
              <input
                type="text"
                value={context.pricing}
                onChange={(e) => updateContext({ pricing: e.target.value })}
                placeholder="e.g., $20/month or $0.01 per API call"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary goal for first 3 months
            </label>
            <select
              value={context.threeMonthGoal}
              onChange={(e) => updateContext({ threeMonthGoal: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select goal...</option>
              <option value="users">Acquire users</option>
              <option value="revenue">Generate revenue</option>
              <option value="feedback">Gather feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          {context.threeMonthGoal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific target (optional)
              </label>
              <input
                type="text"
                value={context.goalDetails}
                onChange={(e) => updateContext({ goalDetails: e.target.value })}
                placeholder={
                  context.threeMonthGoal === 'users' ? 'e.g., 1,000 active users' :
                  context.threeMonthGoal === 'revenue' ? 'e.g., $10K MRR' :
                  context.threeMonthGoal === 'feedback' ? 'e.g., 100 user interviews' :
                  'Describe your goal...'
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 4: Resources & Timeline */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What resources do you have?</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team size
            </label>
            <select
              value={context.teamSize}
              onChange={(e) => updateContext({ teamSize: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select size...</option>
              <option value="solo">Solo founder</option>
              <option value="small">Small team (2-5 people)</option>
              <option value="large">Large team (6+ people)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Launch budget
            </label>
            <select
              value={context.budget}
              onChange={(e) => updateContext({ budget: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select budget...</option>
              <option value="none">No budget</option>
              <option value="small">$1 - $10,000</option>
              <option value="medium">$10,000 - $50,000</option>
              <option value="large">$50,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time until launch
            </label>
            <select
              value={context.timeline}
              onChange={(e) => updateContext({ timeline: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select timeline...</option>
              <option value="days">Within days</option>
              <option value="weeks">Within weeks</option>
              <option value="months">Within months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing advantages (check all that apply)
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={context.advantages.emailList}
                  onChange={(e) => updateContext({ 
                    advantages: { ...context.advantages, emailList: e.target.checked }
                  })}
                  className="mr-2"
                />
                Email list
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={context.advantages.community}
                  onChange={(e) => updateContext({ 
                    advantages: { ...context.advantages, community: e.target.checked }
                  })}
                  className="mr-2"
                />
                Existing community
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={context.advantages.partnerships}
                  onChange={(e) => updateContext({ 
                    advantages: { ...context.advantages, partnerships: e.target.checked }
                  })}
                  className="mr-2"
                />
                Strategic partnerships
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={context.advantages.mediaContacts}
                  onChange={(e) => updateContext({ 
                    advantages: { ...context.advantages, mediaContacts: e.target.checked }
                  })}
                  className="mr-2"
                />
                Media/press contacts
              </label>
            </div>
            <input
              type="text"
              value={context.advantages.other}
              onChange={(e) => updateContext({ 
                advantages: { ...context.advantages, other: e.target.value }
              })}
              placeholder="Other advantages..."
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {currentStep === 4 ? 'Generate Strategy' : 'Next'}
        </button>
      </div>
    </div>
  );
}