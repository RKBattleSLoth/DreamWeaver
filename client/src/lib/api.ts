import { apiRequest } from "./queryClient";
import type { ChildProfile, InsertChildProfile, Story, StoryGenerationRequest, InsertStoryGenerationRequest } from "@shared/schema";

export const childProfilesApi = {
  getAll: async (): Promise<ChildProfile[]> => {
    const res = await apiRequest("GET", "/api/child-profiles");
    return res.json();
  },

  getActive: async (): Promise<ChildProfile> => {
    const res = await apiRequest("GET", "/api/child-profiles/active");
    return res.json();
  },

  create: async (profile: InsertChildProfile): Promise<ChildProfile> => {
    const res = await apiRequest("POST", "/api/child-profiles", profile);
    return res.json();
  },

  update: async (id: string, updates: Partial<InsertChildProfile>): Promise<ChildProfile> => {
    const res = await apiRequest("PUT", `/api/child-profiles/${id}`, updates);
    return res.json();
  },

  activate: async (id: string): Promise<ChildProfile> => {
    const res = await apiRequest("POST", `/api/child-profiles/${id}/activate`);
    return res.json();
  },
};

export const storiesApi = {
  getForChild: async (childProfileId: string): Promise<Story[]> => {
    const res = await apiRequest("GET", `/api/stories?childProfileId=${childProfileId}`);
    return res.json();
  },

  getFavorites: async (childProfileId: string): Promise<Story[]> => {
    const res = await apiRequest("GET", `/api/stories/favorites?childProfileId=${childProfileId}`);
    return res.json();
  },

  getById: async (id: string): Promise<Story> => {
    const res = await apiRequest("GET", `/api/stories/${id}`);
    return res.json();
  },

  toggleFavorite: async (id: string): Promise<Story> => {
    const res = await apiRequest("POST", `/api/stories/${id}/favorite`);
    return res.json();
  },

  markAsRead: async (id: string): Promise<Story> => {
    const res = await apiRequest("POST", `/api/stories/${id}/read`);
    return res.json();
  },
};

export const storyGenerationApi = {
  generate: async (request: InsertStoryGenerationRequest): Promise<{ requestId: string; message: string }> => {
    const res = await apiRequest("POST", "/api/generate-story", request);
    return res.json();
  },

  getStatus: async (requestId: string): Promise<StoryGenerationRequest> => {
    const res = await apiRequest("GET", `/api/generate-story/${requestId}/status`);
    return res.json();
  },
};
