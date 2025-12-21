'use server';
/**
 * @fileOverview AI-powered smart medication suggestion flow.
 *
 * - smartMedicationSuggestions - Provides medication suggestions based on patient history and current medications.
 * - SmartMedicationSuggestionsInput - The input type for the smartMedicationSuggestions function.
 * - SmartMedicationSuggestionsOutput - The return type for the smartMedicationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartMedicationSuggestionsInputSchema = z.object({
  patientHistory: z
    .string()
    .describe('The complete medical history of the patient.'),
  currentMedications: z
    .string()
    .describe('A list of the patient\'s current medications.'),
  doctorNotes: z
    .string()
    .describe('Any notes or observations from the doctor.'),
});
export type SmartMedicationSuggestionsInput = z.infer<
  typeof SmartMedicationSuggestionsInputSchema
>;

const SmartMedicationSuggestionsOutputSchema = z.object({
  suggestedDosage: z
    .string()
    .describe('Suggested medication dosages based on patient information.'),
  refillSuggestions: z
    .string()
    .describe('Suggestions for medication refills and timing.'),
  potentialInteractions: z
    .string()
    .describe(
      'Potential interactions between medications based on the patient\'s profile.'
    ),
});
export type SmartMedicationSuggestionsOutput = z.infer<
  typeof SmartMedicationSuggestionsOutputSchema
>;

export async function smartMedicationSuggestions(
  input: SmartMedicationSuggestionsInput
): Promise<SmartMedicationSuggestionsOutput> {
  return smartMedicationSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartMedicationSuggestionsPrompt',
  input: {schema: SmartMedicationSuggestionsInputSchema},
  output: {schema: SmartMedicationSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide smart medication suggestions for doctors.

  Based on the patient\'s medical history, current medications, and doctor\'s notes, provide suggestions for medication dosages, refills, and potential interactions.

  Patient History: {{{patientHistory}}}
  Current Medications: {{{currentMedications}}}
  Doctor\'s Notes: {{{doctorNotes}}}

  Consider all available information to provide accurate and safe suggestions.

  Ensure that all suggestions are clearly explained and justified.
  Output should be formatted based on the descriptions of the output schema.
  `,
});

const smartMedicationSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartMedicationSuggestionsFlow',
    inputSchema: SmartMedicationSuggestionsInputSchema,
    outputSchema: SmartMedicationSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
