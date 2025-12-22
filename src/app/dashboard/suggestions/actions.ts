'use server';

import { z } from 'zod';
import {
  continueConsultation,
  type ChatMessage,
} from '@/ai/flows/consultation-flow';

const ContinueConsultationSchema = z.object({
  patientHistory: z.string().min(1, 'Xəstə tarixçəsi boş ola bilməz.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
});

export type FormState = {
  message: string;
  response?: string;
  issues?: string[];
};

export async function submitMessage(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    patientHistory: formData.get('patientHistory'),
    chatHistory: JSON.parse(formData.get('chatHistory') as string),
  };

  const validatedFields = ContinueConsultationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const { errors } = validatedFields.error;

    return {
      message: 'Doğrulama uğursuz oldu.',
      issues: errors.map((issue) => issue.message),
    };
  }

  try {
    const result = await continueConsultation(validatedFields.data);
    return { message: 'Cavab uğurla alındı.', response: result.response };
  } catch (error) {
    console.error('AI Consultation Error:', error);
    return {
      message: 'Gözlənilməz bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
    };
  }
}
