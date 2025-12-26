'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};

const PrescriptionUpdateSchema = z.object({
  id: z.string().min(1, 'ID təyin edilməyib.'),
  diagnosis: z.string().min(3, 'Diaqnoz ən azı 3 simvol olmalıdır.'),
  status: z.enum(['Təhvil verildi', 'Gözləmədə', 'Ləğv edildi']),
});

export async function updatePrescription(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = PrescriptionUpdateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { id, ...dataToUpdate } = validatedFields.data;

  try {
    const docRef = db.collection('prescriptions').doc(id);
    await docRef.update(dataToUpdate);
    
    return { type: 'success', message: 'Resept uğurla yeniləndi.' };
  } catch (error) {
    const err = error as Error;
    return {
      type: 'error',
      message: `Resepti yeniləmək mümkün olmadı: ${err.message}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function deletePrescription(id: string): Promise<{ type: 'success' | 'error', message: string }> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }

  try {
    const docRef = db.collection('prescriptions').doc(id);
    await docRef.delete();
    return { type: 'success', message: 'Resept uğurla silindi.' };
  } catch (error) {
    const err = error as Error;
    return { type: 'error', message: `Resepti silmək mümkün olmadı: ${err.message}` };
  }
}
