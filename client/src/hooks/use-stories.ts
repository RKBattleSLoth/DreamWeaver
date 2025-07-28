import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesApi, storyGenerationApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { InsertStoryGenerationRequest } from "@shared/schema";

export function useStoriesForChild(childProfileId: string | undefined) {
  return useQuery({
    queryKey: ["/api/stories", childProfileId],
    queryFn: () => storiesApi.getForChild(childProfileId!),
    enabled: !!childProfileId,
  });
}

export function useFavoriteStories(childProfileId: string | undefined) {
  return useQuery({
    queryKey: ["/api/stories/favorites", childProfileId],
    queryFn: () => storiesApi.getFavorites(childProfileId!),
    enabled: !!childProfileId,
  });
}

export function useStory(id: string | undefined) {
  return useQuery({
    queryKey: ["/api/stories", id],
    queryFn: () => storiesApi.getById(id!),
    enabled: !!id,
  });
}

export function useToggleStoryFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: storiesApi.toggleFavorite,
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: story.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: `"${story.title}" has been ${story.isFavorite ? 'added to' : 'removed from'} your favorites!`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useMarkStoryAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storiesApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
    },
  });
}

export function useGenerateStory() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: storyGenerationApi.generate,
    onSuccess: () => {
      toast({
        title: "Story Generation Started",
        description: "Your personalized story is being created! This usually takes 2-3 minutes.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to start story generation. Please check your API keys and try again.",
        variant: "destructive",
      });
    },
  });
}

export function useStoryGenerationStatus(requestId: string | undefined) {
  return useQuery({
    queryKey: ["/api/generate-story", requestId, "status"],
    queryFn: () => storyGenerationApi.getStatus(requestId!),
    enabled: !!requestId,
    refetchInterval: (data) => {
      // Refetch every 2 seconds if still generating
      return data?.status === "generating" || data?.status === "pending" ? 2000 : false;
    },
  });
}
