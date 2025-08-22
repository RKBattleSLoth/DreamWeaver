import { ChildProfile } from '../../shared/types/index.js';
import { STORY_LENGTHS } from '../../shared/constants/index.js';
import { 
  compileStoryPrinciples, 
  formatPrinciplesForPrompt,
  validateStoryStructure 
} from './invisible-ink-principles.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();

console.log('OpenRouter API Key loaded:', {
  keyPresent: !!OPENROUTER_API_KEY,
  keyLength: OPENROUTER_API_KEY?.length || 0
});

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY not found in environment variables');
}

interface StoryGenerationParams {
  childProfile: ChildProfile;
  theme?: string;
  customPrompt?: string;
  storyLength?: 'short' | 'medium' | 'long' | 'custom';
  customWordCount?: number;
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  storyAbout?: 'child' | 'other_character';
  customCharacterName?: string;
}

export async function generateStoryWithOpenRouter({
  childProfile,
  theme,
  customPrompt,
  storyLength = 'medium',
  customWordCount,
  readingLevel,
  storyAbout = 'child',
  customCharacterName
}: StoryGenerationParams): Promise<{ title: string; content: string; prompt: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  // Use child's reading level if not specified
  const targetReadingLevel = readingLevel || childProfile.reading_level || 'intermediate';
  const wordCount = storyLength === 'custom' && customWordCount 
    ? customWordCount 
    : STORY_LENGTHS[storyLength].words;

  // Determine the main character and story focus
  const isAboutChild = storyAbout === 'child';
  const mainCharacterName = isAboutChild ? childProfile.name : (customCharacterName || 'the main character');

  // Compile Invisible Ink storytelling principles
  const storyPrinciples = compileStoryPrinciples(
    mainCharacterName,
    theme || 'adventure',
    childProfile.age || 6,
    wordCount,
    targetReadingLevel !== 'beginner' // Include subtext for intermediate/advanced
  );

  const principlesPrompt = formatPrinciplesForPrompt(storyPrinciples);

  // Build the story generation prompt with Invisible Ink principles
  const systemPrompt = `You are a master storyteller trained in Brian McDonald's "Invisible Ink" principles of narrative construction. You create children's stories that resonate on multiple levels through careful attention to theme, character arc, and story structure.

Your stories should be:
- Appropriate for a ${childProfile.age || 6} year old child
- Written at a ${targetReadingLevel} reading level
- Safe and positive with ${childProfile.content_safety || 'strict'} content guidelines
- EXACTLY ${wordCount} words long (count carefully)
- Structured using the three-act format (Setup 25%, Confrontation 50%, Resolution 25%)

${principlesPrompt}

Remember: Every element must serve the central theme. Create invisible connections that make the story feel complete and satisfying without being obvious.`;
  
  const userPromptParts = [
    isAboutChild 
      ? `Write a bedtime story for ${childProfile.name}. The story should be about ${childProfile.name}.`
      : `Write a bedtime story for ${childProfile.name}. The story should be about a character named ${mainCharacterName}.`
  ];

  // Subtly incorporate interests - only sometimes and not always directly
  if (childProfile.interests && childProfile.interests.length > 0) {
    const shouldIncludeInterests = Math.random() < 0.4; // Only 40% of stories include interests
    if (shouldIncludeInterests) {
      const selectedInterest = childProfile.interests[Math.floor(Math.random() * childProfile.interests.length)];
      if (isAboutChild) {
        userPromptParts.push(`You may optionally incorporate ${selectedInterest} into the story if it fits naturally with the theme and plot.`);
      } else {
        userPromptParts.push(`If it fits naturally, you may include references to ${selectedInterest} since that's something ${childProfile.name} enjoys.`);
      }
    }
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
    const requestBody = {
      model: 'anthropic/claude-3-haiku', // Fast and cost-effective for stories
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8, // More creative for stories
      max_tokens: 2000,
      stream: false
    };

    console.log('OpenRouter request details:', {
      url: OPENROUTER_API_URL,
      authHeaderLength: OPENROUTER_API_KEY?.length,
      authHeaderStart: OPENROUTER_API_KEY?.substring(0, 20),
      model: requestBody.model
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://storytime-ai.com',
        'X-Title': 'StoryTime AI'
      },
      body: JSON.stringify(requestBody)
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

    // Validate story structure against Invisible Ink principles
    const validation = validateStoryStructure(content, storyPrinciples);
    if (!validation.valid) {
      console.log('Story structure validation feedback:', validation.feedback);
      // Log feedback but don't fail - the story is still usable
    }

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

// Simple wrapper for backward compatibility
export async function generateStorySimple(
  prompt: string,
  options: {
    reading_level?: string;
    word_count?: number;
    theme?: string;
  } = {}
): Promise<{ title: string; content: string }> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const targetWordCount = options.word_count || 500;
  // Estimate tokens needed (roughly 1.3 tokens per word for English text, plus title/formatting)
  const estimatedTokens = Math.ceil(targetWordCount * 1.5) + 200;
  
  // Generate basic principles even without a child profile
  const basicPrinciples = compileStoryPrinciples(
    'the hero',
    options.theme || 'adventure',
    8, // Default age
    targetWordCount,
    options.reading_level !== 'beginner'
  );
  
  const principlesPrompt = formatPrinciplesForPrompt(basicPrinciples);
  
  const systemPrompt = `You are a master storyteller trained in Brian McDonald's "Invisible Ink" principles. Create an engaging, age-appropriate bedtime story with strong thematic consistency and character development.

${principlesPrompt}`;
  
  const userPrompt = `${prompt}
  
Requirements:
- Reading level: ${options.reading_level || 'beginner'}
- Target word count: EXACTLY ${targetWordCount} words (the story content only, not including title)
${options.theme ? `- Theme: ${options.theme}` : ''}
- Follow three-act structure (Setup 25%, Confrontation 50%, Resolution 25%)

IMPORTANT: The story must be ${targetWordCount} words long. Please count carefully.

Please format your response as:
TITLE: [Story Title]
---
[Story Content of exactly ${targetWordCount} words]`;

  try {
    const requestBody = {
      model: 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: estimatedTokens,
      stream: false
    };

    console.log('OpenRouter simple generation request:', {
      model: requestBody.model,
      targetWordCount: targetWordCount,
      maxTokens: estimatedTokens,
      promptLength: userPrompt.length
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://storytime-ai.com',
        'X-Title': 'StoryTime AI'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${error.error?.message || error.message || response.statusText}`);
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

    return { title, content };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// DALL-E 3 Image Generation via OpenRouter
interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export async function generateImageWithDALLE3({
  prompt,
  model = 'openai/dall-e-3',
  size = '1024x1024',
  quality = 'standard',
  style = 'vivid'
}: ImageGenerationRequest): Promise<{ url: string; revised_prompt?: string }> {
  console.log('Image generation request (redirecting to Replicate):', {
    model,
    size,
    quality,
    style,
    promptLength: prompt.length
  });

  try {
    // Use Replicate for image generation
    const { generateImageWithReplicate } = await import('./replicate.js');
    
    return await generateImageWithReplicate({
      prompt,
      model: 'sdxl', // Using SDXL model from Replicate
      width: parseInt(size.split('x')[0]),
      height: parseInt(size.split('x')[1]),
      guidance_scale: quality === 'hd' ? 10 : 7.5,
      num_inference_steps: quality === 'hd' ? 30 : 20
    });
  } catch (error) {
    console.error('Error in image generation:', error);
    throw error;
  }
}

// Generate multiple variations with different prompts
export async function generateImageVariations(
  basePrompt: string,
  variations: Array<{
    style: string;
    perspective: string;
    mood: string;
    modifier: string;
  }>
): Promise<Array<{
  url: string;
  prompt: string;
  variation: typeof variations[0];
  revised_prompt?: string;
}>> {
  console.log(`Generating ${variations.length} image variations (using Replicate)`);
  
  try {
    // Import and use Replicate for variations
    const { generateImageVariationsWithReplicate } = await import('./replicate.js');
    
    return await generateImageVariationsWithReplicate(basePrompt, variations, 'sdxl');
  } catch (error) {
    console.error('Error generating image variations:', error);
    throw new Error('Failed to generate image variations');
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