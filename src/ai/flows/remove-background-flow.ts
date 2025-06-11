'use server';
/**
 * @fileOverview A flow to remove the background from an image using Eden AI.
 *
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  imageDataUri: z.string().describe(
    "The image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  processedImageUri: z.string().describe('The processed image as a data URI or a public URL from Eden AI.'),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundEdenAIFlow(input);
}

async function dataURItoBlob(dataURI: string): Promise<Blob> {
  const base64 = dataURI.split(',')[1];
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const byteString = globalThis.atob(base64); // Use globalThis.atob for Node.js
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

const removeBackgroundEdenAIFlow = ai.defineFlow(
  {
    name: 'removeBackgroundEdenAIFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async ({ imageDataUri }) => {
    const apiKey = process.env.EDEN_AI_API_KEY;
    if (!apiKey) {
      throw new Error('EDEN_AI_API_KEY is not set in environment variables.');
    }

    try {
      const imageBlob = await dataURItoBlob(imageDataUri);
      const formData = new FormData();
      formData.append('providers', 'clipdrop');
      formData.append('file', imageBlob, 'image.png'); 
      formData.append('response_as_dict', 'true');
      formData.append('attributes_as_list', 'false');
      formData.append('output_format', 'png');

      const response = await fetch('https://api.edenai.run/v2/image/background_removal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Eden AI API Error:', errorBody);
        throw new Error(`Eden AI API request failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json() as any; 

      const providerResult = result.clipdrop; 
      if (!providerResult || providerResult.status !== 'success' || !providerResult.image_resource_url) {
        console.error('Eden AI did not return a successful result or image_resource_url:', result);
        throw new Error('Failed to process image with Eden AI or missing image_resource_url.');
      }
      
      return { processedImageUri: providerResult.image_resource_url };

    } catch (error) {
      console.error('Error in removeBackgroundEdenAIFlow:', error);
      if (error instanceof Error) {
        throw new Error(`Background removal failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during background removal.');
    }
  }
);
