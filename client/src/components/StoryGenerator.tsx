import React, { useState } from 'react';
import { useGenerateStory } from '../hooks/useStories';
import { useChildProfiles } from '../hooks/useChildProfiles';
import { STORY_THEMES, STORY_LENGTHS } from '../../shared/constants';
import type { GenerateStoryRequest } from '../../shared/types';

export function StoryGenerator() {
  const { data: profiles } = useChildProfiles();
  const generateStory = useGenerateStory();
  const activeProfile = profiles?.find(p => p.is_active);

  const [formData, setFormData] = useState<GenerateStoryRequest>({
    child_profile_id: activeProfile?.id,
    theme: '',
    custom_prompt: '',
    story_length: 'medium',
    reading_level: activeProfile?.reading_level
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await generateStory.mutateAsync(formData);
      // Reset form after successful generation
      setFormData({
        child_profile_id: activeProfile?.id,
        theme: '',
        custom_prompt: '',
        story_length: 'medium',
        reading_level: activeProfile?.reading_level
      });
    } catch (error) {
      console.error('Failed to generate story:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Generate a New Story</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child Profile Selection */}
        {profiles && profiles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              For Child
            </label>
            <select
              value={formData.child_profile_id || ''}
              onChange={(e) => setFormData({ ...formData, child_profile_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a child</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} {profile.is_active && '(Active)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Theme
          </label>
          <select
            value={formData.theme || ''}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Random theme</option>
            {STORY_THEMES.map((theme) => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Story Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STORY_LENGTHS).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({ ...formData, story_length: key as any })}
                className={`px-4 py-2 rounded-md transition-colors ${
                  formData.story_length === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                <span className="block text-xs opacity-75">{config.words} words</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reading Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reading Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, reading_level: level as any })}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  formData.reading_level === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            value={formData.custom_prompt || ''}
            onChange={(e) => setFormData({ ...formData, custom_prompt: e.target.value })}
            placeholder="Add any special requests for the story..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={generateStory.isPending}
          className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generateStory.isPending ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Story...
            </span>
          ) : (
            'Generate Story'
          )}
        </button>

        {/* Error Display */}
        {generateStory.isError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            Failed to generate story. Please try again.
          </div>
        )}

        {/* Success Message */}
        {generateStory.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Story generated successfully!
          </div>
        )}
      </form>
    </div>
  );
}