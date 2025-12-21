'use server';

import { z } from 'zod';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index';

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
  issues?: string[];
  type: 'success' | 'error';
};

async function getDb() {
    const { firestore } = getSdks(undefined as any);
    return firestore;
}

export async function addTeamMember(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = TeamMemberSchema.safeParse(
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
    const collectionRef = collection(firestore, 'teamMembers');
    addDocumentNonBlocking(collectionRef, validatedFields.data);
    return { type: 'success', message: 'Komanda üzvü uğurla əlavə edildi.' };
  } catch (error) {
    return {
      type: 'error',
      message: 'Gözlənilməz bir xəta baş verdi.',
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
        const docRef = doc(firestore, 'teamMembers', id);
        setDocumentNonBlocking(docRef, dataToUpdate, { merge: true });
        return { type: 'success', message: 'Komanda üzvü uğurla yeniləndi.' };
    } catch (error) {
        return {
            type: 'error',
            message: 'Gözlənilməz bir xəta baş verdi.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deleteTeamMember(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  const firestore = await getDb();

  try {
    const docRef = doc(firestore, 'teamMembers', id);
    deleteDocumentNonBlocking(docRef);
    return { type: 'success', message: 'Komanda üzvü uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Üzvü silmək mümkün olmadı.' };
  }
}