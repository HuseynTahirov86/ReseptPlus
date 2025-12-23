'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';

const TeamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Ad ən azı 3 simvol olmalıdır.'),
  role: z.string().min(3, 'Vəzifə ən azı 3 simvol olmalıdır.'),
  imageUrl: z.string().url('Düzgün bir şəkil URL-i daxil edin.'),
  imageHint: z.string().optional().default(''),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};

export async function addTeamMember(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = TeamMemberSchema.safeParse(
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
    const collectionRef = db.collection('teamMembers');
    const docRef = await collectionRef.add(validatedFields.data);
    await docRef.update({ id: docRef.id });

    return { type: 'success', message: 'Komanda üzvü uğurla əlavə edildi.' };
  } catch (error) {
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updateTeamMember(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = TeamMemberSchema.safeParse(
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
    
    if (!id) {
        return {
            type: 'error',
            message: 'Yeniləmə üçün ID təyin edilməyib.',
            fields: Object.fromEntries(formData.entries()),
        };
    }

    try {
        const docRef = db.collection('teamMembers').doc(id);
        await docRef.update(dataToUpdate);

        return { type: 'success', message: 'Komanda üzvü uğurla yeniləndi.' };
    } catch (error) {
        return {
            type: 'error',
            message: `Gözlənilməz bir xəta baş verdi: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`,
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deleteTeamMember(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    const docRef = db.collection('teamMembers').doc(id);
    await docRef.delete();

    return { type: 'success', message: 'Komanda üzvü uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: `Üzvü silmək mümkün olmadı: ${error instanceof Error ? error.message : "Bilinməyən xəta"}` };
  }
}
