import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { childProfilesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { InsertChildProfile } from "@shared/schema";

export function useChildProfiles() {
  return useQuery({
    queryKey: ["/api/child-profiles"],
    queryFn: childProfilesApi.getAll,
  });
}

export function useActiveChildProfile() {
  return useQuery({
    queryKey: ["/api/child-profiles/active"],
    queryFn: childProfilesApi.getActive,
    retry: false,
  });
}

export function useCreateChildProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: childProfilesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Profile Created",
        description: "Child profile has been successfully created!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateChildProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertChildProfile> }) =>
      childProfilesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles/active"] });
      toast({
        title: "Profile Updated",
        description: "Child profile has been successfully updated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update child profile. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useActivateChildProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: childProfilesApi.activate,
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles/active"] });
      toast({
        title: "Profile Activated",
        description: `${profile.name}'s profile is now active!`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate profile. Please try again.",
        variant: "destructive",
      });
    },
  });
}
