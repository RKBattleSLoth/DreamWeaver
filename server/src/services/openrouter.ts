import { ChildProfile } from '../../shared/types/index.js';
import { STORY_LENGTHS } from '../../shared/constants/index.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY not found in environment variables');
}

interface StoryGenerationParams {
  childProfile: ChildProfile;
  theme?: string;
  customPrompt?: string;
  storyLength?: 'short' | 'medium' | 'long';
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export async function generateStoryWithOpenRouter({
  childProfile,
  theme,
  customPrompt,
  storyLength = 'medium',
  readingLevel
}: StoryGenerationParams): Promise<{ title: string; content: string; prompt: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  // Use child's reading level if not specified
  const targetReadingLevel = readingLevel || childProfile.reading_level || 'intermediate';
  const wordCount = STORY_LENGTHS[storyLength].words;

  // Build the story generation prompt
  const systemPrompt = `You are a talented children's story writer who creates age-appropriate, engaging, and safe bedtime stories. 
Your stories should be:
- Appropriate for a ${childProfile.age || 6} year old child
- Written at a ${targetReadingLevel} reading level
- Safe and positive with ${childProfile.content_safety || 'strict'} content guidelines
- Approximately ${wordCount} words long
- Engaging and imaginative with a clear beginning, middle, and end
- Include a gentle moral or lesson when appropriate`;

  const userPromptParts = [
    `Write a bedtime story for ${childProfile.name}.`
  ];

  if (childProfile.interests && childProfile.interests.length > 0) {
    userPromptParts.push(`${childProfile.name} loves: ${childProfile.interests.join(', ')}.`);
  }

  if (theme) {
    userPromptParts.push(`The story theme should be: ${theme}.`);
  } else if (childProfile.favorite_themes && childProfile.favorite_themes.length > 0) {
    userPromptParts.push(`Choose from these favorite themes: ${childProfile.favorite_themes.join(', ')}.`);
  }

  if (customPrompt) {
    userPromptParts.push(`Additional requirements: ${customPrompt}`);
  }

  userPromptParts.push(`
Please format your response as:
TITLE: [Story Title]
---
[Story Content]`);

  const userPrompt = userPromptParts.join(' ');

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://storytime-ai.com',
        'X-Title': 'StoryTime AI'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Fast and cost-effective for stories
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // More creative for stories
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const storyText = data.choices[0]?.message?.content;

    if (!storyText) {
      throw new Error('No story generated');
    }

    // Parse the response to extract title and content
    const titleMatch = storyText.match(/TITLE:\s*(.+?)(?:\n|---)/);
    const contentMatch = storyText.match(/---\s*\n([\s\S]+)/);

    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Story';
    const content = contentMatch ? contentMatch[1].trim() : storyText;

    return {
      title,
      content,
      prompt: userPrompt
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error('Failed to generate story');
  }
}

// Get available models from OpenRouter (optional utility function)
export async function getAvailableModels() {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}