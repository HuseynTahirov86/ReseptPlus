'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { collection, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';

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
  
  try {
    const collectionRef = collection(db, 'blogPosts');
    const dataToAdd = {
        ...validatedFields.data,
        datePublished: new Date().toISOString()
    };
    await addDoc(collectionRef, dataToAdd);
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

    try {
        const docRef = doc(db, 'blogPosts', id);
        // We keep the original published date, only content is updated
        await setDoc(docRef, dataToUpdate, { merge: true });
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
  
  try {
    const docRef = doc(db, 'blogPosts', id);
    await deleteDoc(docRef);
    return { type: 'success', message: 'Yazı uğurla silindi.' };
  } catch (error) {
    return { type: 'error', message: 'Yazını silmək mümkün olmadı.' };
  }
}
