'use server';
/**
 * @fileOverview AI-powered medical consultation chat flow.
 *
 * This file defines a Genkit flow that facilitates a conversation between
 * a doctor and an AI assistant about a patient's case.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single chat message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Define the input schema for the consultation flow
const ConsultationInputSchema = z.object({
  patientHistory: z
    .string()
    .describe(
      'A summary of the patient\'s medical history, including past diagnoses and medications.'
    ),
  chatHistory: z
    .array(ChatMessageSchema)
    .describe('The ongoing conversation history between the doctor and the AI.'),
});
export type ConsultationInput = z.infer<typeof ConsultationInputSchema>;

// Define the output schema for the consultation flow
const ConsultationOutputSchema = z.object({
  response: z.string().describe('The AI\'s response in the conversation.'),
});
export type ConsultationOutput = z.infer<typeof ConsultationOutputSchema>;

// Exported wrapper function to be called from server actions
export async function continueConsultation(
  input: ConsultationInput
): Promise<ConsultationOutput> {
  return consultationFlow(input);
}

// Define the prompt for the AI model
const consultationPrompt = ai.definePrompt({
  name: 'consultationPrompt',
  input: { schema: ConsultationInputSchema },
  output: { schema: ConsultationOutputSchema },

  // System message to set the AI's role and instructions
  system: `You are a highly knowledgeable and cautious AI medical assistant. 
  Your role is to consult with a qualified doctor. 
  NEVER give a diagnosis directly. Instead, provide information, suggest possibilities, ask clarifying questions, and mention potential risks or drug interactions based on the provided data. 
  Your tone should be professional, collaborative, and helpful. 
  Always address the doctor respectfully.
  Base your answers on the provided patient history and the conversation so far.
  Keep your answers concise and to the point.`,

  // Template for the prompt, using Handlebars syntax
  prompt: `
Patient's Medical History:
{{{patientHistory}}}

---
Conversation History:
{{#each chatHistory}}
**{{role}}**: {{{content}}}
{{/each}}
`,
});

// Define the main Genkit flow
const consultationFlow = ai.defineFlow(
  {
    name: 'consultationFlow',
    inputSchema: ConsultationInputSchema,
    outputSchema: ConsultationOutputSchema,
  },
  async (input) => {
    // Generate a response from the AI model using the defined prompt
    const { output } = await consultationPrompt(input);

    // If the model provides a valid output, return it.
    if (output) {
      return output;
    }

    // Fallback response if the model fails to generate output
    return {
      response:
        'Üzr istəyirəm, hazırda bir cavab hazırlaya bilmədim. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
    };
  }
);
