'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';

const PlanSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Başlıq ən azı 3 simvol olmalıdır.'),
  description: z.string().min(10, 'Təsvir ən azı 10 simvol olmalıdır.'),
  price: z.string().min(1, 'Qiymət daxil edilməlidir.'),
  period: z.string().optional(),
  features: z.preprocess((val) => typeof val === 'string' ? val.split('\n') : [], z.array(z.string()).min(1, "Ən azı bir xüsusiyyət daxil edin.")),
  isPopular: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
});

export type FormState = {
  message: string;
  fields?: Record<string, string | boolean | string[]>;
  issues?: string[];
  type: 'success' | 'error';
};

export async function addPlan(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PlanSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
      fields: {
        ...rawData,
        isPopular: rawData.isPopular === 'on',
        features: (rawData.features as string).split('\n'),
      },
      issues: validatedFields.error.flatten().fieldErrors.name,
    };
  }
  
  try {
    const collectionRef = collection(db, 'pricingPlans');
    const docRef = await addDoc(collectionRef, validatedFields.data);
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    return { type: 'success', message: 'Plan uğurla əlavə edildi.' };
  } catch (error) {
    return {
      type: 'error',
      message: 'Gözlənilməz bir xəta baş verdi.',
      fields: {
        ...rawData,
        isPopular: rawData.isPopular === 'on',
        features: (rawData.features as string).split('\n'),
      },
    };
  }
}

export async function updatePlan(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = PlanSchema.safeParse(rawData);

    if (!validatedFields.success || !validatedFields.data.id) {
        return {
            type: 'error',
            message: "Doğrulama uğursuz oldu və ya ID təyin edilməyib.",
            fields: {
                ...rawData,
                isPopular: rawData.isPopular === 'on',
                features: (rawData.features as string).split('\n'),
            },
            issues: validatedFields.error?.flatten().fieldErrors.name,
        };
    }

    const { id, ...dataToUpdate } = validatedFields.data;

    try {
        const docRef = doc(db, 'pricingPlans', id);
        await setDoc(docRef, dataToUpdate, { merge: true });
        return { type: 'success', message: 'Plan uğurla yeniləndi.' };
    } catch (error) {
        return {
            type: 'error',
            message: 'Gözlənilməz bir xəta baş verdi.',
            fields: {
                ...rawData,
                isPopular: rawData.isPopular === 'on',
                features: (rawData.features as string).split('\n'),
            },
        };
    }
}


export async function deletePlan(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    const docRef = doc(db, 'pricingPlans', id);
    await deleteDoc(docRef);
    return { type: 'success', message: 'Plan uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Planı silmək mümkün olmadı.' };
  }
}
