'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';

const HospitalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.'),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};


export async function addHospital(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = HospitalSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu. Zəhmət olmasa, sahələri yoxlayın.',
      fields: Object.fromEntries(formData.entries()),
      issues: fieldErrors,
    };
  }

  const { id, ...dataToSave } = validatedFields.data;

  try {
      const collectionRef = db.collection('hospitals');
      const docRef = await collectionRef.add(dataToSave);
      await docRef.update({ id: docRef.id });
      revalidatePath('/admin/hospitals');
      return { type: 'success', message: 'Xəstəxana uğurla əlavə edildi.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${errorMessage}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updateHospital(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = HospitalSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu. Zəhmət olmasa, sahələri yoxlayın.',
      fields: Object.fromEntries(formData.entries()),
      issues: fieldErrors,
    };
  }

  const { id, ...dataToSave } = validatedFields.data;

  if (!id) {
    return { type: 'error', message: 'Yeniləmə üçün ID təyin edilməyib.' };
  }

  try {
      const docRef = db.collection('hospitals').doc(id);
      await docRef.set(dataToSave, { merge: true });
      revalidatePath('/admin/hospitals');
      return { type: 'success', message: 'Xəstəxana uğurla yeniləndi.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${errorMessage}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}


export async function deleteHospital(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    // TODO: Consider what happens to doctors in this hospital.
    const docRef = db.collection('hospitals').doc(id);
    await docRef.delete();
    revalidatePath('/admin/hospitals');
    return { type: 'success', message: 'Xəstəxana uğurla silindi.' };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return { type: 'error', message: `Xəstəxananı silmək mümkün olmadı: ${errorMessage}` };
  }
}
