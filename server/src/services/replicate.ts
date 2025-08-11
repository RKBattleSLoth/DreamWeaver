import Replicate from 'replicate';
import { Readable } from 'stream';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN?.trim();

console.log('Replicate service loading...');
console.log('Replicate API Token loaded:', {
  tokenPresent: !!REPLICATE_API_TOKEN,
  tokenLength: REPLICATE_API_TOKEN?.length || 0
});
console.log('Replicate service initialized');

if (!REPLICATE_API_TOKEN) {
  console.warn('REPLICATE_API_TOKEN not found in environment variables');
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN || '',
});

// Replicate Image Generation Request interface
interface ReplicateImageGenerationRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  scheduler?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
}

// Available Stable Diffusion models on Replicate
const AVAILABLE_MODELS = {
  'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  'sd-1.5': 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
  'playground': 'playgroundai/playground-v2-1024px-aesthetic:42fe626e41cc811eaf02c94b892774839268ce1994ea778eba97103fe1ef51b8',
  'leonardo': 'fofr/sdxl-leonardo:79dab4ca9eb867ad8c93fc52e28b8e8ad91c6e11a20d3d8b1cee8e0d880a85a1'
};

export async function generateImageWithReplicate({
  prompt,
  model = 'sdxl',
  width = 1024,
  height = 1024,
  num_outputs = 1,
  scheduler = 'K_EULER',
  guidance_scale = 7.5,
  num_inference_steps = 20,
  seed
}: ReplicateImageGenerationRequest): Promise<{ url: string; revised_prompt?: string }> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('Replicate API token not configured');
  }

  const modelId = AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS] || AVAILABLE_MODELS.sdxl;

  console.log('Replicate image generation request:', {
    model: modelId,
    width,
    height,
    num_outputs,
    scheduler,
    guidance_scale,
    num_inference_steps,
    promptLength: prompt.length,
    seed
  });

  try {
    // Create prediction instead of using run to get better control
    const prediction = await replicate.predictions.create({
      version: modelId.split(':')[1], // Extract version from model ID
      input: {
        prompt,
        width,
        height,
        num_outputs,
        scheduler,
        guidance_scale,
        num_inference_steps,
        ...(seed && { seed })
      }
    });

    console.log('Created prediction:', prediction.id, 'Status:', prediction.status);

    // Wait for the prediction to complete
    let currentPrediction = prediction;
    while (currentPrediction.status !== 'succeeded' && currentPrediction.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      currentPrediction = await replicate.predictions.get(currentPrediction.id);
      console.log('Prediction status:', currentPrediction.status);
    }

    if (currentPrediction.status === 'failed') {
      throw new Error(`Prediction failed: ${currentPrediction.error || 'Unknown error'}`);
    }

    const output = currentPrediction.output;
    console.log('Prediction output type:', typeof output, 'isArray:', Array.isArray(output));

    // Handle different response formats from different models
    let imageUrl: string;
    
    if (Array.isArray(output) && output.length > 0) {
      // Most models return an array of URLs
      imageUrl = output[0];
      console.log('Got URL from array response:', imageUrl);
    } else if (typeof output === 'string') {
      // Some models return a single URL string
      imageUrl = output;
      console.log('Got URL from string response:', imageUrl);
    } else if (output && typeof output === 'object' && 'url' in output) {
      // Some models return an object with url property
      imageUrl = (output as any).url;
      console.log('Got URL from object response:', imageUrl);
    } else {
      console.error('Unexpected response format:', output);
      throw new Error('Unexpected response format from Replicate');
    }

    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    return {
      url: imageUrl,
      revised_prompt: prompt // Replicate doesn't modify prompts like DALL-E
    };
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate multiple variations with different prompts for the collaborative workflow
export async function generateImageVariationsWithReplicate(
  basePrompt: string,
  variations: Array<{
    style: string;
    perspective: string;
    mood: string;
    modifier: string;
  }>,
  model: string = 'sdxl'
): Promise<Array<{
  url: string;
  prompt: string;
  variation: typeof variations[0];
  revised_prompt?: string;
}>> {
  console.log(`Generating ${variations.length} image variations with Replicate`);
  
  const generationPromises = variations.map(async (variation, index) => {
    const enhancedPrompt = `${basePrompt}

Style: ${variation.style}
Perspective: ${variation.perspective}  
Mood: ${variation.mood}
${variation.modifier}

High quality children's book illustration, safe for all ages, whimsical and engaging, digital art, colorful, detailed`;

    try {
      const result = await generateImageWithReplicate({
        prompt: enhancedPrompt,
        model,
        width: 1024,
        height: 1024,
        guidance_scale: 7.5,
        num_inference_steps: 20,
        seed: Math.floor(Math.random() * 1000000) // Random seed for variation
      });

      return {
        url: result.url,
        prompt: enhancedPrompt,
        variation,
        revised_prompt: result.revised_prompt
      };
    } catch (error) {
      console.error(`Failed to generate variation ${index + 1}:`, error);
      throw error;
    }
  });

  try {
    return await Promise.all(generationPromises);
  } catch (error) {
    console.error('Error generating image variations:', error);
    throw new Error('Failed to generate image variations');
  }
}

// List available models (for debugging/info)
export function getAvailableReplicateModels() {
  return Object.entries(AVAILABLE_MODELS).map(([name, id]) => ({
    name,
    id,
    description: getModelDescription(name)
  }));
}

function getModelDescription(modelName: string): string {
  const descriptions: Record<string, string> = {
    'sdxl': 'Stable Diffusion XL - High quality, versatile image generation',
    'sd-1.5': 'Stable Diffusion 1.5 - Fast and reliable, good for simple images',
    'playground': 'Playground v2 - Optimized for aesthetic and detailed images',
    'leonardo': 'Leonardo-style SDXL - Enhanced for artistic and stylized images'
  };
  
  return descriptions[modelName] || 'Image generation model';
}

// Test function to verify Replicate connection
export async function testReplicateConnection(): Promise<boolean> {
  if (!REPLICATE_API_TOKEN) {
    return false;
  }

  try {
    // Simple test with a basic prompt
    const result = await generateImageWithReplicate({
      prompt: 'a simple test image of a blue circle',
      width: 512,
      height: 512,
      num_inference_steps: 10 // Faster for testing
    });
    
    console.log('Replicate connection test successful:', result.url);
    return true;
  } catch (error) {
    console.error('Replicate connection test failed:', error);
    return false;
  }
}