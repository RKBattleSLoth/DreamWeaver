import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Illustration } from '../../shared/types';

interface IllustrationVariationGridProps {
  variations: Illustration[];
  selectedFavorite: string | null;
  onSelectFavorite: (illustrationId: string) => void;
  currentRound: number;
}

export function IllustrationVariationGrid({ 
  variations, 
  selectedFavorite, 
  onSelectFavorite, 
  currentRound 
}: IllustrationVariationGridProps) {
  
  const getImageUrl = (illustration: Illustration): string => {
    // For local development, serve images from the local file storage
    // Use the authenticated API endpoint like the gallery does
    if (illustration.image_path && illustration.image_path.startsWith('http')) {
      return illustration.image_path;
    }
    // Use the same endpoint as the gallery
    return `/api/illustrations/image/${illustration.image_path}`;
  };

  const getVariationTypeLabel = (illustration: Illustration, index: number): string => {
    if (currentRound === 1) {
      // First round shows perspective variations within the same style
      const perspectives = ['Wide Shot', 'Medium Shot', 'Close-up', 'Dynamic Angle'];
      return perspectives[index] || 'Variation';
    } else {
      if (illustration.parent_illustration_id) {
        return 'Previous Favorite';
      }
      // Iteration rounds show different approaches
      const iterationTypes = ['Alternate Angle', 'Different Lighting', 'Added Details'];
      return iterationTypes[index - 1] || 'Variation';
    }
  };

  const isFavoriteFromPreviousRound = (illustration: Illustration): boolean => {
    return currentRound > 1 && illustration.parent_illustration_id !== null;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {currentRound === 1 
            ? 'Select your favorite from these 4 different perspectives:' 
            : `Round ${currentRound}: Pick your favorite from the variations below:`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variations.map((variation, index) => {
          const isSelected = selectedFavorite === variation.id;
          const isFavorite = isFavoriteFromPreviousRound(variation);
          
          return (
            <Card 
              key={variation.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02]' 
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => onSelectFavorite(variation.id)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={getImageUrl(variation)}
                    alt={variation.title || 'Generated illustration'}
                    className="w-full h-64 object-cover rounded-t-lg"
                    onError={(e) => {
                      // Fallback for broken images
                      (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                    }}
                  />
                  
                  {/* Style badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={isFavorite ? "default" : "secondary"}
                      className={`text-xs ${
                        isFavorite ? 'bg-yellow-500 text-yellow-900' : ''
                      }`}
                    >
                      {isFavorite ? '⭐ Favorite' : getVariationTypeLabel(variation, index)}
                    </Badge>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-200 rounded-t-lg flex items-center justify-center">
                    {!isSelected && (
                      <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <Button size="sm" variant="secondary">
                          Select This One
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {variation.title || `Variation ${index + 1}`}
                      </h3>
                      {variation.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {variation.description}
                        </p>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="ml-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Generation metadata */}
                  {variation.generation_prompt && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                        View prompt details
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                        <p className="line-clamp-3">{variation.generation_prompt}</p>
                      </div>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {variations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <p className="text-gray-500 dark:text-gray-400">
            No illustrations generated yet
          </p>
        </div>
      )}
    </div>
  );
}