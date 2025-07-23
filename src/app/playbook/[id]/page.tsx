'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface PlaybookData {
  status: 'processing' | 'complete' | 'failed';
  playbook?: string;
  error?: string;
  sessionId?: string;
  createdAt?: string;
}

export default function PlaybookPage() {
  const params = useParams();
  const playbookId = params.id as string;
  const [data, setData] = useState<PlaybookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaybook = async () => {
      try {
        const response = await fetch(`/api/generate?id=${playbookId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch playbook');
        }

        const playbookData = await response.json();
        setData(playbookData);
        
        // If still processing, poll every 5 seconds
        if (playbookData.status === 'processing') {
          setTimeout(fetchPlaybook, 5000);
        }
      } catch (err) {
        console.error('Error fetching playbook:', err);
        setError('Failed to load playbook');
      } finally {
        setLoading(false);
      }
    };

    if (playbookId) {
      fetchPlaybook();
    }
  }, [playbookId]);

  const downloadPlaybook = () => {
    if (!data?.playbook) return;

    const blob = new Blob([data.playbook], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launch-playbook-${playbookId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (markdown: string) => {
    // CRITICAL SECURITY: Sanitize HTML before rendering
    const unsafeHtml = marked.parse(markdown) as string;
    const cleanHtml = DOMPurify.sanitize(unsafeHtml);
    return { __html: cleanHtml };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Your Launch Playbook
            </h1>
            <p className="text-gray-600">
              This usually takes 30-60 seconds. Please don&apos;t close this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Playbook Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The playbook you&apos;re looking for doesn&apos;t exist or has expired.
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg inline-block"
            >
              Create New Playbook
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Still Processing...
            </h1>
            <p className="text-gray-600">
              Your playbook is being generated. This page will update automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Generation Failed
            </h1>
            <p className="text-gray-600 mb-6">
              Your playbook is taking longer than expected. Please email 
              support@launchweek.ai with your payment receipt for assistance.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Reference ID: {playbookId}
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg inline-block"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success case - display the playbook
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                🚀 Your Launch Playbook is Ready!
              </h1>
              <p className="text-gray-600">
                Generated on {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'today'}
              </p>
            </div>
            <button
              onClick={downloadPlaybook}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <span className="mr-2">📄</span>
              Download .md
            </button>
          </div>
        </div>

        {/* Playbook Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900 
              prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-ul:text-gray-700 prose-ol:text-gray-700
              prose-li:mb-1
              prose-strong:text-gray-900
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic"
            dangerouslySetInnerHTML={renderMarkdown(data.playbook!)}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Questions about your playbook? Contact support@launchweek.ai
          </p>
        </div>
      </div>
    </div>
  );
}