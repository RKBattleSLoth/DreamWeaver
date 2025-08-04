import React from 'react';
import { useToggleFavorite, useDeleteStory } from '../hooks/useStories';
import { formatDistanceToNow } from 'date-fns';
import type { Story } from 'shared/types';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onEdit?: (story: Story) => void;
}

export function StoryViewer({ story, onClose, onEdit }: StoryViewerProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteStory = useDeleteStory();

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite.mutateAsync(story.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory.mutateAsync(story.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete story:', error);
      }
    }
  };

  const formatStoryContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {story.title}
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
              {story.theme && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  {story.theme}
                </span>
              )}
              {story.reading_level && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full capitalize">
                  {story.reading_level}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {story.word_count} words
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                story.is_favorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(story)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleteStory.isPending}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
              {formatStoryContent(story.content)}
            </div>
          </div>
          
          {/* Generation Prompt Section */}
          {story.generation_prompt && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <details className="cursor-pointer">
                <summary className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium">
                  View generation prompt
                </summary>
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {story.generation_prompt}
                  </p>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750 flex-shrink-0">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="text-xs">
              Created {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigator.share?.({ 
                  title: story.title, 
                  text: story.content 
                }) || navigator.clipboard.writeText(story.content)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([`${story.title}\n\n${story.content}`], {
                    type: 'text/plain'
                  });
                  element.href = URL.createObjectURL(file);
                  element.download = `${story.title}.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}