import React, { useState } from 'react';
import { useGenerateStory } from '../hooks/useStories';
import { useChildProfiles } from '../hooks/useChildProfiles';
import { STORY_THEMES, STORY_LENGTHS } from '../shared/constants';
import type { GenerateStoryRequest } from '../shared/types';

export function StoryGenerator() {
  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useChildProfiles();
  const generateStory = useGenerateStory();
  const activeProfile = profiles?.find(p => p.is_active);


  const [formData, setFormData] = useState<GenerateStoryRequest>({
    child_profile_id: undefined,
    theme: undefined,
    custom_prompt: undefined,
    story_length: 'medium',
    reading_level: undefined,
    story_about: 'child'
  });

  const [customWordCount, setCustomWordCount] = useState<string>('500');
  const [customCharacterName, setCustomCharacterName] = useState<string>('');

  // Update form data when active profile becomes available
  React.useEffect(() => {
    if (activeProfile && !formData.child_profile_id) {
      setFormData(prev => ({
        ...prev,
        child_profile_id: activeProfile.id,
        reading_level: activeProfile.reading_level
      }));
    }
  }, [activeProfile, formData.child_profile_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const storyRequest = {
        ...formData,
        custom_word_count: formData.story_length === 'custom' ? parseInt(customWordCount) : undefined,
        custom_character_name: formData.story_about === 'other_character' ? customCharacterName : undefined
      };
      await generateStory.mutateAsync(storyRequest);
      // Reset only custom prompt after successful generation (keep selections for easy re-use)
      setFormData(prev => ({
        ...prev,
        custom_prompt: undefined
      }));
    } catch (error) {
      console.error('Failed to generate story:', error);
    }
  };

  // Show loading state
  if (profilesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Generate a New Story</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (profilesError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Generate a New Story</h2>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading profiles</div>
          <p className="text-gray-600">Please try refreshing the page</p>
          <p className="text-sm text-gray-500 mt-2">Error: {profilesError.message}</p>
        </div>
      </div>
    );
  }

  // Show no profiles state
  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Generate a New Story</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No child profiles found</h3>
          <p className="text-gray-600 mb-4">You need to create a child profile first to generate personalized stories.</p>
          <a
            href="/profiles"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Child Profile
          </a>
        </div>
      </div>
    );
  }

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
              onChange={(e) => setFormData({ ...formData, child_profile_id: e.target.value || undefined })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.child_profile_id 
                  ? 'border-blue-300 bg-blue-50 text-blue-900' 
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <option value="" disabled className="text-gray-400">
                {profiles.length > 0 ? 'Select a child' : 'No children available'}
              </option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id} className="text-gray-900">
                  {profile.name} {profile.is_active && '✓ Active'}
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
            onChange={(e) => setFormData({ ...formData, theme: e.target.value || undefined })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.theme 
                ? 'border-purple-300 bg-purple-50 text-purple-900' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <option value="" className="text-gray-600">
              {formData.theme ? '✨ Random theme' : '✨ Random theme (default)'}
            </option>
            {STORY_THEMES.length > 0 ? STORY_THEMES.map((theme) => (
              <option key={theme} value={theme} className="text-gray-900">
                {theme.charAt(0).toUpperCase() + theme.slice(1).replace('_', ' ')}
              </option>
            )) : (
              <option disabled>No themes available</option>
            )}
          </select>
        </div>

        {/* Story Character */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Character
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, story_about: 'child' })}
                className={`px-4 py-3 rounded-md transition-colors ${
                  formData.story_about === 'child'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                About {profiles?.find(p => p.id === formData.child_profile_id)?.name || 'the Child'}
                <span className="block text-xs opacity-75">Personalized story</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, story_about: 'other_character' })}
                className={`px-4 py-3 rounded-md transition-colors ${
                  formData.story_about === 'other_character'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Other Character
                <span className="block text-xs opacity-75">Custom character</span>
              </button>
            </div>
            
            {/* Custom Character Name Input */}
            {formData.story_about === 'other_character' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Character Name
                </label>
                <input
                  type="text"
                  value={customCharacterName}
                  onChange={(e) => setCustomCharacterName(e.target.value)}
                  placeholder="Enter character name (e.g., Princess Luna, Captain Sam)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The story will be about this character instead of your child
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Story Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Length
          </label>
          <div className="grid grid-cols-4 gap-2">
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
                {key === 'custom' ? 'Other' : key.charAt(0).toUpperCase() + key.slice(1)}
                <span className="block text-xs opacity-75">
                  {key === 'custom' ? 'Custom' : `${config.words} words`}
                </span>
              </button>
            ))}
          </div>
          
          {/* Custom Word Count Input */}
          {formData.story_length === 'custom' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Custom Word Count
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                value={customWordCount}
                onChange={(e) => setCustomWordCount(e.target.value)}
                placeholder="Enter word count (50-2000)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 300-1000 words for most stories
              </p>
            </div>
          )}
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
            onChange={(e) => setFormData({ ...formData, custom_prompt: e.target.value || undefined })}
            placeholder="Add any special requests for the story..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
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