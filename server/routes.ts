import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChildProfileSchema, insertStoryGenerationRequestSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, createUser, verifyUser, generateToken, type AuthRequest } from "./auth";
import cookieParser from "cookie-parser";

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "";
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.VITE_REPLICATE_API_TOKEN || "";

async function generateStoryWithOpenRouter(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "StoryTime AI"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: "You are a creative children's story writer. Create engaging, age-appropriate bedtime stories with positive messages and vivid imagery suitable for illustrations. Keep language simple and magical."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw new Error("Failed to generate story content");
  }
}

async function generateIllustrationsWithReplicate(prompts: string[]): Promise<string[]> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error("Replicate API token not configured");
  }

  const illustrations: string[] = [];

  try {
    for (const prompt of prompts) {
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e45",
          input: {
            prompt: `${prompt}, children's book illustration, watercolor style, bright colors, friendly and magical, safe for children`,
            negative_prompt: "scary, dark, violent, inappropriate, adult content",
            width: 768,
            height: 512,
            num_inference_steps: 20,
            guidance_scale: 7.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      // Poll for completion
      let result = prediction;
      while (result.status === "starting" || result.status === "processing") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            "Authorization": `Token ${REPLICATE_API_TOKEN}`
          }
        });
        
        result = await pollResponse.json();
      }

      if (result.status === "succeeded" && result.output) {
        illustrations.push(result.output[0]);
      }
    }

    return illustrations;
  } catch (error) {
    console.error("Replicate API error:", error);
    return []; // Return empty array if illustration generation fails
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await createUser(email, password);
      const token = generateToken(user.id);
      
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await verifyUser(email, password);
      const token = generateToken(user.id);
      
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("authToken");
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json({
      id: req.user!.userId,
      email: req.user!.email,
      createdAt: new Date().toISOString(),
    });
  });

  // Child Profile routes - temporarily unprotected for development
  app.get("/api/child-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllChildProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child profiles" });
    }
  });

  app.get("/api/child-profiles/active", async (req, res) => {
    try {
      const profile = await storage.getActiveChildProfile();
      if (!profile) {
        return res.status(404).json({ message: "No active child profile found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active child profile" });
    }
  });

  app.post("/api/child-profiles", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const profileData = insertChildProfileSchema.parse(req.body);
      const profile = await storage.createChildProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create child profile" });
    }
  });

  app.put("/api/child-profiles/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = insertChildProfileSchema.partial().parse(req.body);
      const profile = await storage.updateChildProfile(id, updates);
      
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update child profile" });
    }
  });

  app.post("/api/child-profiles/:id/activate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.setActiveChildProfile(id);
      const profile = await storage.getChildProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to activate child profile" });
    }
  });

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const { childProfileId } = req.query;
      
      if (!childProfileId || typeof childProfileId !== 'string') {
        return res.status(400).json({ message: "Child profile ID is required" });
      }
      
      const stories = await storage.getStoriesForChild(childProfileId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/favorites", async (req, res) => {
    try {
      const { childProfileId } = req.query;
      
      if (!childProfileId || typeof childProfileId !== 'string') {
        return res.status(400).json({ message: "Child profile ID is required" });
      }
      
      const stories = await storage.getFavoriteStories(childProfileId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const story = await storage.getStory(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories/:id/favorite", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const story = await storage.toggleStoryFavorite(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle story favorite" });
    }
  });

  app.post("/api/stories/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const story = await storage.markStoryAsRead(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark story as read" });
    }
  });

  // Story Generation routes
  app.post("/api/generate-story", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requestData = insertStoryGenerationRequestSchema.parse(req.body);
      
      // Create the generation request
      const generationRequest = await storage.createStoryGenerationRequest(requestData);
      
      // Start generation process (async)
      generateStoryAsync(generationRequest.id);
      
      res.json({ 
        requestId: generationRequest.id,
        message: "Story generation started"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid generation request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start story generation" });
    }
  });

  app.get("/api/generate-story/:requestId/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { requestId } = req.params;
      const request = await storage.getStoryGenerationRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Generation request not found" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generation status" });
    }
  });

  // Async story generation function
  async function generateStoryAsync(requestId: string) {
    try {
      // Update status to generating
      await storage.updateStoryGenerationRequest(requestId, { status: "generating" });
      
      const request = await storage.getStoryGenerationRequest(requestId);
      if (!request) return;

      const childProfile = await storage.getChildProfile(request.childProfileId);
      if (!childProfile) return;

      // Create story prompt
      const characterName = request.customCharacter?.name || childProfile.name;
      const prompt = `Write a ${request.length} bedtime story for a ${childProfile.age}-year-old child named ${characterName}. 
        Theme: ${request.theme}
        Reading level: ${childProfile.readingLevel}
        Child's interests: ${childProfile.interests?.join(", ")}
        Special interests for this story: ${request.specialInterests || "none"}
        Moral lessons to include: ${request.moralLessons?.join(", ") || "friendship and kindness"}
        
        Make it magical, age-appropriate, and include vivid descriptions suitable for illustrations. 
        The story should be about ${request.length === 'short' ? '5' : request.length === 'medium' ? '10' : '15'} minutes of reading time.
        Include natural break points where illustrations would fit perfectly.`;

      // Generate story content
      const storyContent = await generateStoryWithOpenRouter(prompt);
      
      // Extract illustration prompts from the story
      const illustrationPrompts = [
        `${characterName} beginning their adventure, ${request.theme} setting`,
        `${characterName} meeting new friends, magical ${request.theme} scene`,
        `${characterName} facing a gentle challenge, ${request.theme} environment`,
        `${characterName} learning about ${request.moralLessons?.[0] || 'friendship'}, happy scene`
      ];

      // Generate illustrations
      const illustrations = await generateIllustrationsWithReplicate(illustrationPrompts);

      // Create the story
      const story = await storage.createStory({
        title: `${characterName}'s ${request.theme.charAt(0).toUpperCase() + request.theme.slice(1)} Adventure`,
        content: storyContent,
        theme: request.theme,
        characterName,
        length: request.length,
        readingTime: request.length === 'short' ? 5 : request.length === 'medium' ? 10 : 15,
        illustrations,
        moralLessons: request.moralLessons || [],
        childProfileId: request.childProfileId,
        isFavorite: false,
        isGenerating: false,
      });

      // Update generation request with success
      await storage.updateStoryGenerationRequest(requestId, {
        status: "completed",
        storyId: story.id
      });

    } catch (error) {
      console.error("Story generation error:", error);
      
      // Update generation request with error
      await storage.updateStoryGenerationRequest(requestId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
