'use server';

import { z } from 'zod';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getSdks } from '@/firebase/index';

const PostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Başlıq ən azı 3 simvol olmalıdır.'),
  description: z.string().min(10, 'Qısa təsvir ən azı 10 simvol olmalıdır.'),
  content: z.string().min(50, 'Məzmun ən azı 50 simvol olmalıdır.'),
  author: z.string().min(3, 'Müəllif adı ən azı 3 simvol olmalıdır.'),
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

export async function addPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = PostSchema.safeParse(
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
    const collectionRef = collection(firestore, 'blogPosts');
    const dataToAdd = {
        ...validatedFields.data,
        datePublished: new Date().toISOString()
    };
    addDocumentNonBlocking(collectionRef, dataToAdd);
    return { type: 'success', message: 'Yazı uğurla əlavə edildi.' };
  } catch (error) {
    return {
      type: 'error',
      message: 'Gözlənilməz bir xəta baş verdi.',
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updatePost(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = PostSchema.safeParse(
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
        const docRef = doc(firestore, 'blogPosts', id);
        // We keep the original published date, only content is updated
        setDocumentNonBlocking(docRef, dataToUpdate, { merge: true });
        return { type: 'success', message: 'Yazı uğurla yeniləndi.' };
    } catch (error) {
        return {
            type: 'error',
            message: 'Gözlənilməz bir xəta baş verdi.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deletePost(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  const firestore = await getDb();

  try {
    const docRef = doc(firestore, 'blogPosts', id);
    deleteDocumentNonBlocking(docRef);
    return { type: 'success', message: 'Yazı uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Yazını silmək mümkün olmadı.' };
  }
}

    