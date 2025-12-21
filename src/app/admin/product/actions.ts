'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';


const FeatureSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Başlıq ən azı 3 simvol olmalıdır.'),
  description: z.string().min(10, 'Təsvir ən azı 10 simvol olmalıdır.'),
  icon: z.string().min(2, 'İkon adı ən azı 2 simvol olmalıdır.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  type: 'success' | 'error';
};

export async function addFeature(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FeatureSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.flatten().fieldErrors.name,
    };
  }
  
  try {
    const collectionRef = collection(db, 'productFeatures');
    const docRef = await addDoc(collectionRef, validatedFields.data);
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    return { type: 'success', message: 'Xüsusiyyət uğurla əlavə edildi.' };
  } catch (error) {
    return {
      type: 'error',
      message: 'Gözlənilməz bir xəta baş verdi.',
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updateFeature(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = FeatureSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success || !validatedFields.data.id) {
        return {
            type: 'error',
            message: "Doğrulama uğursuz oldu və ya ID təyin edilməyib.",
            fields: Object.fromEntries(formData.entries()),
            issues: validatedFields.error?.flatten().fieldErrors.name,
        };
    }

    const { id, ...dataToUpdate } = validatedFields.data;

    try {
        const docRef = doc(db, 'productFeatures', id);
        await setDoc(docRef, dataToUpdate, { merge: true });
        return { type: 'success', message: 'Xüsusiyyət uğurla yeniləndi.' };
    } catch (error) {
        return {
            type: 'error',
            message: 'Gözlənilməz bir xəta baş verdi.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deleteFeature(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    const docRef = doc(db, 'productFeatures', id);
    await deleteDoc(docRef);
    return { type: 'success', message: 'Xüsusiyyət uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Xüsusiyyəti silmək mümkün olmadı.' };
  }
}
