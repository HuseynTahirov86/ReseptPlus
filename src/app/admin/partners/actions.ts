'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';

const PartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  description: z.string().min(10, 'Təsvir ən azı 10 simvol olmalıdır.'),
  logoUrl: z.string().url('Düzgün bir URL daxil edin.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  type: 'success' | 'error';
};

export async function addPartner(
  partnerType: 'supportingOrganizations' | 'clientCompanies',
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = PartnerSchema.safeParse(
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
    const collectionRef = collection(db, partnerType);
    const docRef = await addDoc(collectionRef, validatedFields.data);
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    return { type: 'success', message: 'Partnyor uğurla əlavə edildi.' };
  } catch (error) {
    return {
      type: 'error',
      message: 'Gözlənilməz bir xəta baş verdi.',
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updatePartner(
    partnerType: 'supportingOrganizations' | 'clientCompanies',
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = PartnerSchema.safeParse(
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
        const docRef = doc(db, partnerType, id);
        await setDoc(docRef, dataToUpdate, { merge: true });
        return { type: 'success', message: 'Partnyor uğurla yeniləndi.' };
    } catch (error) {
        return {
            type: 'error',
            message: 'Gözlənilməz bir xəta baş verdi.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deletePartner(
  partnerType: 'supportingOrganizations' | 'clientCompanies',
  id: string
): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    const docRef = doc(db, partnerType, id);
    await deleteDoc(docRef);
    return { type: 'success', message: 'Partnyor uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Partnyoru silmək mümkün olmadı.' };
  }
}
