'use server';

import { z } from 'zod';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

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

async function getDb() {
    const { firestore } = initializeFirebase();
    return firestore;
}

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
  
  const firestore = await getDb();
  
  try {
    const collectionRef = collection(firestore, 'productFeatures');
    addDocumentNonBlocking(collectionRef, validatedFields.data);
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
    const firestore = await getDb();

    try {
        const docRef = doc(firestore, 'productFeatures', id);
        setDocumentNonBlocking(docRef, dataToUpdate, { merge: true });
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
  
  const firestore = await getDb();

  try {
    const docRef = doc(firestore, 'productFeatures', id);
    deleteDocumentNonBlocking(docRef);
    return { type: 'success', message: 'Xüsusiyyət uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Xüsusiyyəti silmək mümkün olmadı.' };
  }
}
