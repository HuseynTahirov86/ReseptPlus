'use server';

import { z } from 'zod';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

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

async function getDb() {
    const { firestore } = initializeFirebase();
    return firestore;
}

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
  
  const firestore = await getDb();
  
  try {
    const collectionRef = collection(firestore, 'pricingPlans');
    addDocumentNonBlocking(collectionRef, validatedFields.data);
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
    const firestore = await getDb();

    try {
        const docRef = doc(firestore, 'pricingPlans', id);
        setDocumentNonBlocking(docRef, dataToUpdate, { merge: true });
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
  
  const firestore = await getDb();

  try {
    const docRef = doc(firestore, 'pricingPlans', id);
    deleteDocumentNonBlocking(docRef);
    return { type: 'success', message: 'Plan uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Planı silmək mümkün olmadı.' };
  }
}
