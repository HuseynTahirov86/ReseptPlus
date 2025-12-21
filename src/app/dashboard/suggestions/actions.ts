'use server';

import { z } from 'zod';
import {
  smartMedicationSuggestions,
  SmartMedicationSuggestionsOutput,
} from '@/ai/flows/smart-medication-suggestions';

const SmartMedicationSuggestionsInputSchema = z.object({
  patientHistory: z.string().min(10, 'Patient history must be at least 10 characters.'),
  currentMedications: z.string().min(3, 'Current medications must be at least 3 characters.'),
  doctorNotes: z.string(),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: SmartMedicationSuggestionsOutput;
};

export async function getSuggestions(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SmartMedicationSuggestionsInputSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const { errors } = validatedFields.error;

    return {
      message: "Validation failed. Please check your input.",
      fields: Object.fromEntries(formData.entries()),
      issues: errors.map((issue) => issue.message),
    };
  }

  try {
    const result = await smartMedicationSuggestions(validatedFields.data);
    return { message: 'Suggestions generated successfully.', data: result };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred. Please try again.',
      fields: Object.fromEntries(formData.entries()),
    };
  }
}
