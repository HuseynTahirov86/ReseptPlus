'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';

const PharmacySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.'),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  latitude: z.coerce.number().min(-90, "Enlik -90 və 90 arasında olmalıdır.").max(90, "Enlik -90 və 90 arasında olmalıdır."),
  longitude: z.coerce.number().min(-180, "Uzunluq -180 və 180 arasında olmalıdır.").max(180, "Uzunluq -180 və 180 arasında olmalıdır."),
});

export type FormState = {
  message: string;
  fields?: Record<string, string | number>;
  issues?: Record<string, string[] | undefined>;
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
     const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu. Zəhmət olmasa, sahələri yoxlayın.',
      fields: Object.fromEntries(formData.entries()) as any,
      issues: fieldErrors,
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
      fields: Object.fromEntries(formData.entries()) as any,
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

    