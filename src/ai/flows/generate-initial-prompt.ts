'use server';

/**
 * @fileOverview A flow to generate an initial prompt for the background removal feature.
 *
 * - generateInitialPrompt - A function that generates an example prompt.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function (empty object).
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  prompt: z.string().describe('An example prompt to use for the background removal feature.'),
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(_input: GenerateInitialPromptInput): Promise<GenerateInitialPromptOutput> {
  return generateInitialPromptFlow({});
}

const prompt = ai.definePrompt({
  name: 'generateInitialPromptPrompt',
  input: {schema: GenerateInitialPromptInputSchema},
  output: {schema: GenerateInitialPromptOutputSchema},
  prompt: `You are an AI assistant designed to provide example prompts for a background removal tool.

Generate a creative and effective example prompt that a user could use to remove the background from an image using the background removal tool. The prompt should be simple and easy to understand.

Example Prompt: Remove the background from this image and replace it with a tropical beach at sunset.
`,
});

const generateInitialPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialPromptFlow',
    inputSchema: GenerateInitialPromptInputSchema,
    outputSchema: GenerateInitialPromptOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
