import React from 'react';
import { useStories, useDeleteStory, useToggleFavorite } from '../hooks/useStories';
import { formatDistanceToNow } from 'date-fns';
import type { Story } from '../shared/types';

interface StoryCardProps {
  story: Story;
  onView: (story: Story) => void;
}

function StoryCard({ story, onView }: StoryCardProps) {
  const deleteStory = useDeleteStory();
  const toggleFavorite = useToggleFavorite();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory.mutateAsync(story.id);
      } catch (error) {
        console.error('Failed to delete story:', error);
      }
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite.mutateAsync(story.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <div
      onClick={() => onView(story)}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {story.title}
        </h3>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              story.is_favorite ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
        {story.content}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex space-x-4">
          {story.theme && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {story.theme}
            </span>
          )}
          {story.reading_level && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize">
              {story.reading_level}
            </span>
          )}
          <span className="text-gray-500">
            {story.word_count} words
          </span>
        </div>
        <span>
          {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

interface StoryListProps {
  onViewStory: (story: Story) => void;
}

export function StoryList({ onViewStory }: StoryListProps) {
  const { data: stories, isLoading, error } = useStories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Failed to load stories</div>
        <p className="text-gray-500">Please try refreshing the page</p>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
        <p className="text-gray-500">Generate your first story to get started!</p>
      </div>
    );
  }

  const favoriteStories = stories.filter(story => story.is_favorite);
  const regularStories = stories.filter(story => !story.is_favorite);

  return (
    <div className="space-y-8">
      {favoriteStories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Favorite Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteStories.map((story) => (
              <StoryCard key={story.id} story={story} onView={onViewStory} />
            ))}
          </div>
        </section>
      )}

      {regularStories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {favoriteStories.length > 0 ? 'Other Stories' : 'Your Stories'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularStories.map((story) => (
              <StoryCard key={story.id} story={story} onView={onViewStory} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}