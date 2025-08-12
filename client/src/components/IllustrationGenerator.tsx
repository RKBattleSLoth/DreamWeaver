import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IllustrationVariationGrid } from './illustration/IllustrationVariationGrid';
import { IllustrationSessionControls } from './illustration/IllustrationSessionControls';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select-radix';
import LoadingSpinner from './loading-spinner';
import { getAuthHeaders, useAuth } from '../lib/jwt-auth';
import { ILLUSTRATION_STYLES } from '../shared/constants';
import type { Story, ChildProfile, Illustration } from '../shared/types';

interface IllustrationGeneratorProps {
  story?: Story;
  childProfile: ChildProfile;
  onClose: () => void;
}

type SceneType = 'character' | 'scene' | 'object' | 'setting';

interface GenerationSession {
  sessionId: string;
  currentRound: number;
  variations: Illustration[];
  status: 'generating' | 'selecting' | 'completed';
}

export function IllustrationGenerator({ story, childProfile, onClose }: IllustrationGeneratorProps) {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [scenePrompt, setScenePrompt] = useState('');
  const [sceneType, setSceneType] = useState<SceneType>('scene');
  const [artStyle, setArtStyle] = useState<string>(childProfile.preferred_art_style || 'storybook');
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<string | null>(null);

  const handleReroll = async () => {
    if (!session) return;

    setIsGenerating(true);
    setSelectedFavorite(null);
    try {
      const response = await fetch('/api/illustrations/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          story_id: story?.id,
          child_profile_id: childProfile.id,
          scene_prompt: scenePrompt.trim(),
          scene_type: sceneType,
          illustration_style: artStyle
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Failed to reroll illustrations');
      }

      const result = await response.json();
      setSession({
        sessionId: result.data.session_id,
        currentRound: session.currentRound, // Keep same round number
        variations: result.data.variations,
        status: 'selecting'
      });
    } catch (error) {
      console.error('Failed to reroll:', error);
      alert('Failed to generate new variations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setSession(null);
    setScenePrompt('');
    setSceneType('scene');
    setArtStyle(childProfile.preferred_art_style || 'storybook');
    setSelectedFavorite(null);
  };

  const handleStartSession = async () => {
    if (!scenePrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/illustrations/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          story_id: story?.id,
          child_profile_id: childProfile.id,
          scene_prompt: scenePrompt.trim(),
          scene_type: sceneType,
          illustration_style: artStyle
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        const errorData = await response.json();
        console.error('Illustration session error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to start illustration session');
      }

      const result = await response.json();
      setSession({
        sessionId: result.data.session_id,
        currentRound: 1,
        variations: result.data.variations,
        status: 'selecting'
      });
    } catch (error) {
      console.error('Failed to start illustration session:', error);
      alert('Failed to generate illustrations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectFavorite = async (illustrationId: string, action: 'make_canon' | 'iterate') => {
    if (!session) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/illustrations/select-favorite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          session_id: session.sessionId,
          selected_illustration_id: illustrationId,
          action,
          current_round: session.currentRound
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error('Failed to process selection');
      }

      const result = await response.json();

      if (action === 'make_canon') {
        setSession({
          ...session,
          status: 'completed'
        });
        
        // Invalidate the gallery query to refresh it
        queryClient.invalidateQueries({ queryKey: ['illustrations'] });
        
        alert('Illustration made canonical! You can now link it to your story.');
        // Reset the form after a short delay to show the success message
        setTimeout(resetForm, 2000);
      } else {
        // Continue with iteration
        setSession({
          sessionId: session.sessionId,
          currentRound: session.currentRound + 1,
          variations: result.data.newVariations,
          status: 'selecting'
        });
      }
    } catch (error) {
      console.error('Failed to process selection:', error);
      alert('Failed to process selection. Please try again.');
    } finally {
      setIsGenerating(false);
      setSelectedFavorite(null);
    }
  };

  const renderInitialForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 112.828 2.828L16 19m-2-2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2m0-4l4.586-4.586a2 2 0 112.828 2.828L12 14m-2-2v2a2 2 0 01-2 2H2a2 2 0 01-2-2v-2" />
            </svg>
            <span>Generate Illustrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {story && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Story:</strong> {story.title}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                Creating illustrations for <strong>{childProfile.name}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scene Type
            </label>
            <Select value={sceneType} onValueChange={(value: SceneType) => setSceneType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scene">Story Scene</SelectItem>
                <SelectItem value="character">Character Portrait</SelectItem>
                <SelectItem value="setting">Location/Setting</SelectItem>
                <SelectItem value="object">Important Object</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Art Style
            </label>
            <Select value={artStyle} onValueChange={setArtStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ILLUSTRATION_STYLES).map(([key, style]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-gray-500">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {artStyle && ILLUSTRATION_STYLES[artStyle as keyof typeof ILLUSTRATION_STYLES] 
                ? ILLUSTRATION_STYLES[artStyle as keyof typeof ILLUSTRATION_STYLES].description 
                : 'All variations will use this style consistently'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scene Description
            </label>
            <Textarea
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              placeholder={`Describe the ${sceneType} you want illustrated...`}
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Be specific about characters, setting, mood, and actions happening in this scene.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleStartSession}
              disabled={!scenePrompt.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Generating Images...
                </>
              ) : (
                'Generate 4 Variations'
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGenerationSession = () => {
    if (!session) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Round {session.currentRound} - Choose Your Favorite</span>
              <div className="text-sm text-gray-500">
                Session: {session.sessionId.slice(0, 8)}...
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner className="w-8 h-8 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Generating {session.currentRound === 1 ? '4 variations' : '3 new variations + your favorite'}...
                </p>
              </div>
            ) : (
              <>
                <IllustrationVariationGrid
                  variations={session.variations}
                  selectedFavorite={selectedFavorite}
                  onSelectFavorite={setSelectedFavorite}
                  currentRound={session.currentRound}
                />
                
                <IllustrationSessionControls
                  selectedFavorite={selectedFavorite}
                  currentRound={session.currentRound}
                  onAction={handleSelectFavorite}
                  onReroll={handleReroll}
                  onStartNew={resetForm}
                  disabled={isGenerating}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Illustration Generator
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-6">
          {session ? renderGenerationSession() : renderInitialForm()}
        </div>
      </div>
    </div>
  );
}