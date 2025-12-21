'use server';

import { z } from 'zod';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index';

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

async function getDb() {
    const { firestore } = getSdks(undefined as any);
    return firestore;
}

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
  
  const firestore = await getDb();
  
  try {
    const collectionRef = collection(firestore, partnerType);
    addDocumentNonBlocking(collectionRef, validatedFields.data);
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
    const firestore = await getDb();

    try {
        const docRef = doc(firestore, partnerType, id);
        setDocumentNonBlocking(docRef, dataToUpdate, { merge: true });
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
  
  const firestore = await getDb();

  try {
    const docRef = doc(firestore, partnerType, id);
    deleteDocumentNonBlocking(docRef);
    return { type: 'success', message: 'Partnyor uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Partnyoru silmək mümkün olmadı.' };
  }
}

    