import { 
  type ChildProfile, 
  type InsertChildProfile,
  type Story,
  type InsertStory,
  type StoryGenerationRequest,
  type InsertStoryGenerationRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Child Profile methods
  getChildProfile(id: string): Promise<ChildProfile | undefined>;
  getAllChildProfiles(): Promise<ChildProfile[]>;
  getActiveChildProfile(): Promise<ChildProfile | undefined>;
  createChildProfile(profile: InsertChildProfile): Promise<ChildProfile>;
  updateChildProfile(id: string, updates: Partial<InsertChildProfile>): Promise<ChildProfile | undefined>;
  deleteChildProfile(id: string): Promise<boolean>;
  setActiveChildProfile(id: string): Promise<void>;

  // Story methods
  getStory(id: string): Promise<Story | undefined>;
  getStoriesForChild(childProfileId: string): Promise<Story[]>;
  getFavoriteStories(childProfileId: string): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: string, updates: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<boolean>;
  toggleStoryFavorite(id: string): Promise<Story | undefined>;
  markStoryAsRead(id: string): Promise<Story | undefined>;

  // Story Generation Request methods
  createStoryGenerationRequest(request: InsertStoryGenerationRequest): Promise<StoryGenerationRequest>;
  getStoryGenerationRequest(id: string): Promise<StoryGenerationRequest | undefined>;
  updateStoryGenerationRequest(id: string, updates: Partial<StoryGenerationRequest>): Promise<StoryGenerationRequest | undefined>;
  getPendingGenerationRequests(): Promise<StoryGenerationRequest[]>;
}

export class MemStorage implements IStorage {
  private childProfiles: Map<string, ChildProfile>;
  private stories: Map<string, Story>;
  private storyGenerationRequests: Map<string, StoryGenerationRequest>;

  constructor() {
    this.childProfiles = new Map();
    this.stories = new Map();
    this.storyGenerationRequests = new Map();
    
    // Initialize with a sample child profile
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleProfile: ChildProfile = {
      id: randomUUID(),
      name: "Emma",
      age: 7,
      grade: "Grade 2",
      interests: ["unicorns", "castles", "dragons"],
      favoriteThemes: ["fantasy", "adventure"],
      readingLevel: "grade-2",
      contentSafety: "strict",
      illustrationStyle: "watercolor",
      avatarUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      isActive: true,
      createdAt: new Date(),
    };
    this.childProfiles.set(sampleProfile.id, sampleProfile);
  }

  async getChildProfile(id: string): Promise<ChildProfile | undefined> {
    return this.childProfiles.get(id);
  }

  async getAllChildProfiles(): Promise<ChildProfile[]> {
    return Array.from(this.childProfiles.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getActiveChildProfile(): Promise<ChildProfile | undefined> {
    return Array.from(this.childProfiles.values()).find(profile => profile.isActive);
  }

  async createChildProfile(insertProfile: InsertChildProfile): Promise<ChildProfile> {
    const id = randomUUID();
    const profile: ChildProfile = {
      ...insertProfile,
      id,
      createdAt: new Date(),
    };
    this.childProfiles.set(id, profile);
    return profile;
  }

  async updateChildProfile(id: string, updates: Partial<InsertChildProfile>): Promise<ChildProfile | undefined> {
    const profile = this.childProfiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...updates };
    this.childProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteChildProfile(id: string): Promise<boolean> {
    return this.childProfiles.delete(id);
  }

  async setActiveChildProfile(id: string): Promise<void> {
    // Set all profiles to inactive
    for (const [profileId, profile] of this.childProfiles) {
      this.childProfiles.set(profileId, { ...profile, isActive: false });
    }
    
    // Set the specified profile to active
    const profile = this.childProfiles.get(id);
    if (profile) {
      this.childProfiles.set(id, { ...profile, isActive: true });
    }
  }

  async getStory(id: string): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getStoriesForChild(childProfileId: string): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.childProfileId === childProfileId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getFavoriteStories(childProfileId: string): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.childProfileId === childProfileId && story.isFavorite)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = randomUUID();
    const story: Story = {
      ...insertStory,
      id,
      createdAt: new Date(),
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: string, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const updatedStory = { ...story, ...updates };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: string): Promise<boolean> {
    return this.stories.delete(id);
  }

  async toggleStoryFavorite(id: string): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const updatedStory = { ...story, isFavorite: !story.isFavorite };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async markStoryAsRead(id: string): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const updatedStory = { ...story, lastReadAt: new Date() };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async createStoryGenerationRequest(insertRequest: InsertStoryGenerationRequest): Promise<StoryGenerationRequest> {
    const id = randomUUID();
    const request: StoryGenerationRequest = {
      ...insertRequest,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.storyGenerationRequests.set(id, request);
    return request;
  }

  async getStoryGenerationRequest(id: string): Promise<StoryGenerationRequest | undefined> {
    return this.storyGenerationRequests.get(id);
  }

  async updateStoryGenerationRequest(id: string, updates: Partial<StoryGenerationRequest>): Promise<StoryGenerationRequest | undefined> {
    const request = this.storyGenerationRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...updates };
    this.storyGenerationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getPendingGenerationRequests(): Promise<StoryGenerationRequest[]> {
    return Array.from(this.storyGenerationRequests.values())
      .filter(request => request.status === "pending")
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }
}

export const storage = new MemStorage();
