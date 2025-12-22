'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { auth as adminAuth } from 'firebase-admin';

type UserRole = 'admin' | 'system_admin';

const CreateUserSchema = z.object({
  email: z.string().email('Düzgün email daxil edin.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  type: 'success' | 'error';
};

export async function addUser(
  role: UserRole,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = CreateUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu.',
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.flatten().fieldErrors.name,
    };
  }
  
  const { email, password } = validatedFields.data;
  const collectionName = role === 'admin' ? 'admins' : 'systemAdmins';

  try {
    const userRecord = await adminAuth().createUser({
      email,
      password,
      displayName: email.split('@')[0],
    });

    const userRef = db.collection(collectionName).doc(userRecord.uid);
    await userRef.set({
        id: userRecord.uid,
        email,
        role,
    });
    
    return { type: 'success', message: `${role === 'admin' ? 'Sayt admini' : 'Sistem admini'} uğurla yaradıldı.` };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
         return {
            type: 'error',
            message: 'Bu email adresi artıq başqa bir istifadəçi tərəfindən istifadə olunur.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
    console.error("Admin yaratma xətası:", error);
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${error.message || 'Bilinməyən xəta'}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function deleteUser(role: UserRole, id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  const collectionName = role === 'admin' ? 'admins' : 'systemAdmins';

  try {
    await db.collection(collectionName).doc(id).delete();
    await adminAuth().deleteUser(id);

    return { type: 'success', message: 'Admin uğurla sistemdən silindi.' };
  } catch (error: any) {
    const errorMessage = error.message || 'Bilinməyən xəta';
    return { type: 'error', message: `İstifadəçini silmək mümkün olmadı: ${errorMessage}` };
  }
}
