import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const childProfiles = pgTable("child_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  grade: text("grade"),
  interests: jsonb("interests").$type<string[]>().default([]),
  favoriteThemes: jsonb("favorite_themes").$type<string[]>().default([]),
  readingLevel: text("reading_level").notNull(),
  contentSafety: text("content_safety").notNull().default("strict"),
  illustrationStyle: text("illustration_style").notNull().default("watercolor"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  theme: text("theme").notNull(),
  characterName: text("character_name").notNull(),
  length: text("length").notNull(), // "short", "medium", "long"
  readingTime: integer("reading_time").notNull(), // in minutes
  illustrations: jsonb("illustrations").$type<string[]>().default([]),
  moralLessons: jsonb("moral_lessons").$type<string[]>().default([]),
  childProfileId: varchar("child_profile_id").references(() => childProfiles.id),
  isFavorite: boolean("is_favorite").default(false),
  isGenerating: boolean("is_generating").default(false),
  generationError: text("generation_error"),
  createdAt: timestamp("created_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
});

export const storyGenerationRequests = pgTable("story_generation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childProfileId: varchar("child_profile_id").references(() => childProfiles.id).notNull(),
  theme: text("theme").notNull(),
  length: text("length").notNull(),
  specialInterests: text("special_interests"),
  moralLessons: jsonb("moral_lessons").$type<string[]>().default([]),
  customCharacter: jsonb("custom_character").$type<{
    name: string;
    appearance: string;
    personality: string;
  }>(),
  status: text("status").notNull().default("pending"), // "pending", "generating", "completed", "failed"
  storyId: varchar("story_id").references(() => stories.id),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  lastReadAt: true,
});

export const insertStoryGenerationRequestSchema = createInsertSchema(storyGenerationRequests).omit({
  id: true,
  createdAt: true,
  storyId: true,
  status: true,
  errorMessage: true,
});

export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type StoryGenerationRequest = typeof storyGenerationRequests.$inferSelect;
export type InsertStoryGenerationRequest = z.infer<typeof insertStoryGenerationRequestSchema>;
