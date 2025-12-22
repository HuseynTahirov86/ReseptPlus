'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';

const MedicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  dosage: z.string().min(1, 'Doza daxil edilməlidir.'),
  unit: z.string().min(1, 'Vahid daxil edilməlidir.'),
  form: z.string().min(3, 'Forma daxil edilməlidir (məs: tablet).'),
  quantity: z.coerce.number().min(0, 'Miqdar mənfi ola bilməz.'),
  expirationDate: z.string().nonempty('İstifadə müddəti seçilməlidir.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string | number>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};

async function addOrUpdateMedication(
  pharmacyId: string,
  action: 'add' | 'update',
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = MedicationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu. Sahələri yoxlayın.',
      fields: Object.fromEntries(formData.entries()) as any,
      issues: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...dataToSave } = validatedFields.data;
  const collectionRef = db.collection(`pharmacies/${pharmacyId}/inventory`);

  try {
    if (action === 'add') {
      const docRef = await collectionRef.add(dataToSave);
      await docRef.update({ id: docRef.id });
    } else {
      if (!id) {
        return { type: 'error', message: 'Yeniləmə üçün ID təyin edilməyib.' };
      }
      const docRef = collectionRef.doc(id);
      await docRef.set(dataToSave, { merge: true });
    }

    revalidatePath('/dashboard/pharmacy/inventory');
    return { type: 'success', message: `Dərman uğurla ${action === 'add' ? 'əlavə edildi' : 'yeniləndi'}.` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return {
      type: 'error',
      message: `Gözlənilməz xəta: ${errorMessage}`,
      fields: Object.fromEntries(formData.entries()) as any,
    };
  }
}

export const addMedication = addOrUpdateMedication.bind(null);
export const updateMedication = addOrUpdateMedication.bind(null);


export async function deleteMedication(pharmacyId: string, id: string): Promise<{type: 'success' | 'error', message: string}> {
  if (!id || !pharmacyId) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    const docRef = db.collection(`pharmacies/${pharmacyId}/inventory`).doc(id);
    await docRef.delete();
    revalidatePath('/dashboard/pharmacy/inventory');
    return { type: 'success', message: 'Dərman uğurla silindi.' };
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return { type: 'error', message: `Dərmanı silmək mümkün olmadı: ${errorMessage}` };
  }
}
