import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import type { Illustration } from '../../shared/types';

interface IllustrationGridProps {
  illustrations: Illustration[];
  onIllustrationClick: (illustration: Illustration) => void;
}

export function IllustrationGrid({ illustrations, onIllustrationClick }: IllustrationGridProps) {
  const getImageUrl = (illustration: Illustration): string => {
    // Check if we already have a constructed URL from the backend
    if (illustration.image_url) {
      return illustration.image_url;
    }
    // Fallback to constructing URL from image_path
    if (illustration.image_path) {
      return `/api/illustrations/image/${illustration.image_path}`;
    }
    // Return placeholder if no image
    return '/api/placeholder/400/400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {illustrations.map((illustration) => (
        <div
          key={illustration.id}
          onClick={() => onIllustrationClick(illustration)}
          className="group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={getImageUrl(illustration)}
              alt={illustration.title || 'Generated illustration'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                console.error('Image failed to load:', {
                  src: (e.target as HTMLImageElement).src,
                  illustration_id: illustration.id,
                  image_path: illustration.image_path
                });
                // Fallback for broken images
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            
            {/* Overlay with badges */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200">
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {illustration.is_canonical && (
                  <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                    ⭐ Canonical
                  </Badge>
                )}
                {illustration.art_style && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {illustration.art_style}
                  </Badge>
                )}
              </div>
              
              {/* Round indicator */}
              {illustration.iteration_round && illustration.iteration_round > 1 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-blue-500 text-white text-xs">
                    R{illustration.iteration_round}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                {illustration.title || 'Untitled Illustration'}
              </h3>
            </div>
            
            {illustration.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {illustration.description}
              </p>
            )}
            
            {/* Generation info */}
            {illustration.generation_prompt && (
              <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1 mb-2">
                "{illustration.generation_prompt.substring(0, 50)}..."
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {formatDistanceToNow(new Date(illustration.created_at), { addSuffix: true })}
              </span>
              
              {/* Session indicator */}
              {illustration.generation_batch_id && (
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  Batch
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}