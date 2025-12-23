'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';

const BasePartnerSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  description: z.string().min(3, 'Təsvir ən azı 3 simvol olmalıdır.'),
  logoUrl: z.string().url('Düzgün bir URL daxil edin.'),
});

const AddPartnerSchema = BasePartnerSchema;
const UpdatePartnerSchema = BasePartnerSchema.extend({
  id: z.string().min(1, "ID təyin edilməyib."),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};

export async function addPartner(
  partnerType: 'supportingOrganizations' | 'clientCompanies',
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = AddPartnerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      type: 'error',
      message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
      fields: Object.fromEntries(formData.entries()),
      issues: fieldErrors,
    };
  }
  
  try {
    const collectionRef = db.collection(partnerType);
    const docRef = await collectionRef.add(validatedFields.data);
    
    await docRef.update({ id: docRef.id });
    
    return { type: 'success', message: 'Partnyor uğurla əlavə edildi.' };
  } catch (error) {
    console.error("Add Partner Error:", error);
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${error instanceof Error ? error.message : 'Unknown'}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updatePartner(
  partnerType: 'supportingOrganizations' | 'clientCompanies',
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = UpdatePartnerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      type: 'error',
      message: "Doğrulama uğursuz oldu və ya ID təyin edilməyib.",
      fields: Object.fromEntries(formData.entries()),
      issues: fieldErrors,
    };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  try {
    const docRef = db.collection(partnerType).doc(id);
    await docRef.set(dataToUpdate, { merge: true });
    
    return { type: 'success', message: 'Partnyor uğurla yeniləndi.' };
  } catch (error) {
    console.error("Update Partner Error:", error);
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${error instanceof Error ? error.message : 'Unknown'}`,
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
    const docRef = db.collection(partnerType).doc(id);
    await docRef.delete();
    
    return { type: 'success', message: 'Partnyor uğurla silindi.' };
  } catch (error) {
    console.error("Delete Partner Error:", error);
    return { 
      type: 'error', 
      message: `Partnyoru silmək mümkün olmadı: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}
