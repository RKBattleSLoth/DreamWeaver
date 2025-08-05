import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase-auth';
import type { 
  ChildProfile, 
  CreateChildProfileRequest, 
  UpdateChildProfileRequest,
  ApiResponse 
} from '../shared/types';

// Get all child profiles
export function useChildProfiles() {
  return useQuery({
    queryKey: ['child-profiles'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/profiles', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch child profiles');
      }

      const result: ApiResponse<ChildProfile[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch child profiles');
      }

      return result.data || [];
    },
    enabled: true
  });
}

// Get active child profile
export function useActiveChildProfile() {
  return useQuery({
    queryKey: ['child-profiles', 'active'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/profiles/active', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No active profile
        }
        throw new Error('Failed to fetch active child profile');
      }

      const result: ApiResponse<ChildProfile> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch active child profile');
      }

      return result.data || null;
    },
    enabled: true
  });
}

// Create child profile
export function useCreateChildProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: CreateChildProfileRequest) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to create child profile');
      }

      const result: ApiResponse<ChildProfile> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create child profile');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles'] });
    }
  });
}

// Update child profile
export function useUpdateChildProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateChildProfileRequest }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update child profile');
      }

      const result: ApiResponse<ChildProfile> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update child profile');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['child-profiles', 'active'] });
    }
  });
}

// Delete child profile
export function useDeleteChildProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete child profile');
      }

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete child profile');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['child-profiles', 'active'] });
    }
  });
}

// Set active child profile
export function useSetActiveChildProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/profiles/${id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to activate child profile');
      }

      const result: ApiResponse<ChildProfile> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to activate child profile');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['child-profiles', 'active'] });
    }
  });
}