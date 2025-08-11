import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface IllustrationSessionControlsProps {
  selectedFavorite: string | null;
  currentRound: number;
  onAction: (illustrationId: string, action: 'make_canon' | 'iterate') => void;
  onReroll: () => void;
  onStartNew: () => void;
  disabled: boolean;
}

export function IllustrationSessionControls({
  selectedFavorite,
  currentRound,
  onAction,
  onReroll,
  onStartNew,
  disabled
}: IllustrationSessionControlsProps) {

  if (!selectedFavorite) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-3">👆</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Select your favorite illustration above
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Once selected, you can either make it your final choice or generate more variations
          </p>
          
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Don't like any of these options?
            </p>
            <Button
              onClick={onReroll}
              disabled={disabled}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reroll 4 New Variations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Round indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <span>Round {currentRound}</span>
      </div>

      {/* Action buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What would you like to do next?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You've selected your favorite from round {currentRound}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Make Canon Button */}
            <Button
              onClick={() => onAction(selectedFavorite, 'make_canon')}
              disabled={disabled}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Make It Canonical
              <div className="text-xs opacity-75 ml-1">(Final Choice)</div>
            </Button>

            {/* Try More Button */}
            <Button
              onClick={() => onAction(selectedFavorite, 'iterate')}
              disabled={disabled}
              variant="outline"
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try 3 More Variations
              <div className="text-xs opacity-75 ml-1">
                (Round {currentRound + 1})
              </div>
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-gray-600 dark:text-gray-300">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Make Canonical:</strong> This becomes the final illustration and can be linked to your story</li>
                  <li><strong>Try More:</strong> Generate 3 new variations + keep your current favorite</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start new session */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-center">
            <Button
              onClick={onStartNew}
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Scene Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}