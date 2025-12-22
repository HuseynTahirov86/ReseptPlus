'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';

const HospitalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Ad ən azı 3 simvol olmalıdır.'),
  address: z.string().min(10, 'Ünvan ən azı 10 simvol olmalıdır.'),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  type: 'success' | 'error';
};

async function addOrUpdateHospital(
  action: 'add' | 'update',
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = HospitalSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu.',
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.flatten().fieldErrors.name,
    };
  }

  const { id, ...dataToSave } = validatedFields.data;

  try {
    if (action === 'add') {
      const collectionRef = db.collection('hospitals');
      const docRef = await collectionRef.add(dataToSave);
      await docRef.update({ id: docRef.id });
      return { type: 'success', message: 'Xəstəxana uğurla əlavə edildi.' };
    } else {
      if (!id) {
        return { type: 'error', message: 'Yeniləmə üçün ID təyin edilməyib.' };
      }
      const docRef = db.collection('hospitals').doc(id);
      await docRef.set(dataToSave, { merge: true });
      return { type: 'success', message: 'Xəstəxana uğurla yeniləndi.' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${errorMessage}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export const addHospital = addOrUpdateHospital.bind(null, 'add');
export const updateHospital = addOrUpdateHospital.bind(null, 'update');


export async function deleteHospital(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    const docRef = db.collection('hospitals').doc(id);
    await docRef.delete();
    return { type: 'success', message: 'Xəstəxana uğurla silindi.' };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return { type: 'error', message: `Xəstəxananı silmək mümkün olmadı: ${errorMessage}` };
  }
}
