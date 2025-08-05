import React, { useState } from 'react';
import { StoryGenerator } from '../components/StoryGenerator';
import { StoryList } from '../components/StoryList';
import { StoryViewer } from '../components/StoryViewer';
import type { Story } from '../shared/types';

export function Stories() {
  const [activeTab, setActiveTab] = useState<'generate' | 'browse'>('browse');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleViewStory = (story: Story) => {
    setSelectedStory(story);
  };

  const handleCloseViewer = () => {
    setSelectedStory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Stories</h1>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'browse'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Browse Stories
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'generate'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Generate New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {activeTab === 'generate' ? (
          <div className="max-w-2xl mx-auto">
            <StoryGenerator />
          </div>
        ) : (
          <StoryList onViewStory={handleViewStory} />
        )}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}