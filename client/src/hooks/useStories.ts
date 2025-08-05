import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase-auth';
import type { 
  Story, 
  GenerateStoryRequest, 
  CreateStoryRequest,
  UpdateStoryRequest,
  GenerateStoryResponse,
  ApiResponse 
} from '../shared/types';

// Get all stories
export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/stories', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const result: ApiResponse<Story[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch stories');
      }

      return result.data || [];
    }
  });
}

// Get single story
export function useStory(id: string) {
  return useQuery({
    queryKey: ['stories', id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch story');
      }

      const result: ApiResponse<Story> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch story');
      }

      return result.data;
    },
    enabled: !!id
  });
}

// Generate story with AI
export function useGenerateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateStoryRequest) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const result: ApiResponse<GenerateStoryResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate story');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });
}

// Create story manually
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyData: CreateStoryRequest) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(storyData)
      });

      if (!response.ok) {
        throw new Error('Failed to create story');
      }

      const result: ApiResponse<Story> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create story');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });
}

// Update story
export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateStoryRequest }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/stories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update story');
      }

      const result: ApiResponse<Story> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update story');
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['stories', data?.id] });
    }
  });
}

// Delete story
export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete story');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });
}

// Toggle favorite
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/stories/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const result: ApiResponse<Story> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to toggle favorite');
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['stories', data?.id] });
    }
  });
}