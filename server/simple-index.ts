import express from "express";
import { storage } from "./storage";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Basic API routes without auth
app.get("/api/child-profiles", async (req, res) => {
  try {
    const profiles = await storage.getAllChildProfiles();
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
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
    console.error("Error fetching active profile:", error);
    res.status(500).json({ message: "Failed to fetch active child profile" });
  }
});

app.get("/api/stories", async (req, res) => {
  try {
    const stories = await storage.getAllStories();
    res.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

async function startServer() {
  const server = createServer(app);
  
  // Setup Vite in development
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3005", 10);
  
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port}`);
  });
}

console.log("Starting simple server...");
startServer().catch(console.error);