'use server';

import { z } from 'zod';
import {
  smartMedicationSuggestions,
  SmartMedicationSuggestionsOutput,
} from '@/ai/flows/smart-medication-suggestions';

const SmartMedicationSuggestionsInputSchema = z.object({
  patientHistory: z.string().min(10, 'Xəstə tarixçəsi ən azı 10 simvol olmalıdır.'),
  currentMedications: z.string().min(3, 'Cari dərmanlar ən azı 3 simvol olmalıdır.'),
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
      message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
      fields: Object.fromEntries(formData.entries()),
      issues: errors.map((issue) => issue.message),
    };
  }

  try {
    const result = await smartMedicationSuggestions(validatedFields.data);
    return { message: 'Təkliflər uğurla yaradıldı.', data: result };
  } catch (error) {
    console.error(error);
    return {
      message: 'Gözlənilməz bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
      fields: Object.fromEntries(formData.entries()),
    };
  }
}
