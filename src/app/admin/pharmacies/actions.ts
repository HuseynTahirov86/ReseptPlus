'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';

const PharmacySchema = z.object({
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

async function addOrUpdatePharmacy(
  action: 'add' | 'update',
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = PharmacySchema.safeParse(
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
      const collectionRef = db.collection('pharmacies');
      const docRef = await collectionRef.add(dataToSave);
      await docRef.update({ id: docRef.id });
      return { type: 'success', message: 'Aptek uğurla əlavə edildi.' };
    } else {
      if (!id) {
        return { type: 'error', message: 'Yeniləmə üçün ID təyin edilməyib.' };
      }
      const docRef = db.collection('pharmacies').doc(id);
      await docRef.set(dataToSave, { merge: true });
      return { type: 'success', message: 'Aptek uğurla yeniləndi.' };
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

export const addPharmacy = addOrUpdatePharmacy.bind(null, 'add');
export const updatePharmacy = addOrUpdatePharmacy.bind(null, 'update');


export async function deletePharmacy(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    // TODO: Consider what happens to pharmacists in this pharmacy.
    const docRef = db.collection('pharmacies').doc(id);
    await docRef.delete();
    return { type: 'success', message: 'Aptek uğurla silindi.' };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return { type: 'error', message: `Apteki silmək mümkün olmadı: ${errorMessage}` };
  }
}
