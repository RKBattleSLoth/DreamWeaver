import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Illustration } from '../../shared/types';

interface IllustrationDetailModalProps {
  illustration: Illustration;
  onClose: () => void;
}

export function IllustrationDetailModal({ illustration, onClose }: IllustrationDetailModalProps) {
  const getImageUrl = (illustration: Illustration): string => {
    return `/api/illustrations/image/${illustration.image_path}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getImageUrl(illustration);
    link.download = `${illustration.title || 'illustration'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    const url = window.location.origin + getImageUrl(illustration);
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      alert('Image URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {illustration.title || 'Illustration Detail'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <img
                  src={getImageUrl(illustration)}
                  alt={illustration.title || 'Generated illustration'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/600/600';
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <Button onClick={handleDownload} className="flex-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </Button>
                <Button variant="outline" onClick={handleCopyUrl} className="flex-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy URL
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    {illustration.is_canonical && (
                      <Badge className="bg-yellow-500 text-yellow-900">
                        ⭐ Canonical
                      </Badge>
                    )}
                    {illustration.art_style && (
                      <Badge variant="secondary" className="capitalize">
                        {illustration.art_style}
                      </Badge>
                    )}
                    {illustration.iteration_round && (
                      <Badge className="bg-blue-500 text-white">
                        Round {illustration.iteration_round}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {illustration.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {illustration.description}
                      </p>
                    </div>
                  )}

                  {/* Creation time */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Created</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDistanceToNow(new Date(illustration.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Technical details */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Technical Info</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {illustration.session_id && (
                        <p>Session: {illustration.session_id.slice(0, 8)}...</p>
                      )}
                      {illustration.generation_batch_id && (
                        <p>Batch: {illustration.generation_batch_id.slice(0, 8)}...</p>
                      )}
                      {illustration.parent_illustration_id && (
                        <p>Based on previous selection</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generation prompt */}
              {illustration.generation_prompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generation Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {illustration.generation_prompt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* DALL-E revised prompt */}
              {illustration.dalle_revised_prompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Revised Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        {illustration.dalle_revised_prompt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* World-building connections */}
              {(illustration.depicts_character_id || illustration.depicts_setting_id || illustration.depicts_element_id) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Story Connections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {illustration.target_entity_type && (
                        <p className="capitalize">Type: {illustration.target_entity_type}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        This illustration is connected to story elements for consistency
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}