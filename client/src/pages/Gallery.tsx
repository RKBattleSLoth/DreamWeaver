import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders, useAuth } from '../lib/jwt-auth';
import { IllustrationGrid } from '../components/gallery/IllustrationGrid';
import { IllustrationDetailModal } from '../components/gallery/IllustrationDetailModal';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select-radix';
import LoadingSpinner from '../components/loading-spinner';
import type { Illustration } from '../shared/types';

export function Gallery() {
  const { logout } = useAuth();
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);
  const [filterCanonical, setFilterCanonical] = useState<'all' | 'canonical' | 'variations'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Fetch illustrations from the gallery endpoint
  const { data: illustrations, isLoading, error } = useQuery({
    queryKey: ['illustrations', filterCanonical],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterCanonical === 'all') {
        params.append('include_all', 'true');
      }
      // For canonical and variations, we'll filter client-side since backend defaults to canonical
      
      const response = await fetch(`/api/illustrations/gallery?${params}`, {
        headers: {
          ...getAuthHeaders()
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - log out user to force fresh login
          logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Failed to fetch illustrations: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data?.illustrations || [];
    }
  });

  // Apply client-side filtering and sorting
  const filteredIllustrations = React.useMemo(() => {
    if (!illustrations) return [];
    
    let filtered = [...illustrations];
    
    // Apply canonical filter
    if (filterCanonical === 'canonical') {
      filtered = filtered.filter(ill => ill.is_canonical === true);
    } else if (filterCanonical === 'variations') {
      filtered = filtered.filter(ill => ill.is_canonical !== true);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  }, [illustrations, filterCanonical, sortBy]);

  const handleIllustrationClick = (illustration: Illustration) => {
    setSelectedIllustration(illustration);
  };

  const handleCloseDetail = () => {
    setSelectedIllustration(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">Failed to load illustrations</div>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Illustration Gallery</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse all your generated illustrations
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterCanonical} onValueChange={(value: 'all' | 'canonical' | 'variations') => setFilterCanonical(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Illustrations</SelectItem>
              <SelectItem value="canonical">Canonical Only</SelectItem>
              <SelectItem value="variations">Variations Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest') => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {illustrations?.length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Illustrations</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {illustrations?.filter(ill => ill.is_canonical).length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Canonical Images</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {illustrations?.filter(ill => !ill.is_canonical).length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Variations</div>
        </div>
      </div>

      {/* Illustration Grid */}
      {filteredIllustrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filterCanonical === 'canonical' 
              ? 'No canonical illustrations yet' 
              : filterCanonical === 'variations'
              ? 'No variation illustrations yet'
              : 'No illustrations yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Generate illustrations from your stories to see them here
          </p>
        </div>
      ) : (
        <IllustrationGrid 
          illustrations={filteredIllustrations}
          onIllustrationClick={handleIllustrationClick}
        />
      )}

      {/* Detail Modal */}
      {selectedIllustration && (
        <IllustrationDetailModal
          illustration={selectedIllustration}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}