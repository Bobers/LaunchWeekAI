'use client';

export default function VersionIndicator() {
  // Update this version string when making significant changes
  const VERSION = "v2.3";
  const LAST_UPDATED = "Jul 23, 2025";
  
  return (
    <div className="fixed top-4 left-4 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm z-50 border border-gray-200">
      <span className="font-medium">{VERSION}</span>
      <span className="mx-1">•</span>
      <span>{LAST_UPDATED}</span>
    </div>
  );
}