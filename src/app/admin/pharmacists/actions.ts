'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { auth as adminAuth } from 'firebase-admin';

// Schema for creating a pharmacist
const CreatePharmacistSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 simvol olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.'),
  pharmacyId: z.string({ required_error: 'Aptek seçilməlidir.' }).min(1, 'Aptek seçilməlidir.'),
  role: z.enum(['employee', 'head_pharmacist'], {
    errorMap: () => ({ message: 'Rol seçilməlidir.' }),
  }),
});

// Schema for updating a pharmacist (password is optional)
const UpdatePharmacistSchema = CreatePharmacistSchema.omit({ password: true }).extend({
  id: z.string().min(1, 'Əczaçı ID-si təyin edilməyib.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.').optional().or(z.literal('')).transform(e => e === '' ? undefined : e),
});


export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};

export async function addPharmacist(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = CreatePharmacistSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.',
      fields: Object.fromEntries(formData.entries()),
      issues: fieldErrors,
    };
  }
  
  const { email, password, ...pharmacistData } = validatedFields.data;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await adminAuth().createUser({
      email,
      password,
      displayName: `${pharmacistData.firstName} ${pharmacistData.lastName}`,
    });

    // 2. Create pharmacist profile in Firestore with the same UID
    const pharmacistRef = db.collection('pharmacists').doc(userRecord.uid);
    await pharmacistRef.set({
        id: userRecord.uid,
        email,
        ...pharmacistData
    });
    
    return { type: 'success', message: 'Əczaçı uğurla yaradıldı.' };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
         return {
            type: 'error',
            message: 'Bu email adresi artıq başqa bir istifadəçi tərəfindən istifadə olunur.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
    console.error("Əczaçı yaratma xətası:", error);
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${error.message || 'Bilinməyən xəta'}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updatePharmacist(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = UpdatePharmacistSchema.safeParse(
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

    const { id, password, ...pharmacistData } = validatedFields.data;
    
    try {
        // Update Firestore document
        const docRef = db.collection('pharmacists').doc(id);
        await docRef.update({ ...pharmacistData });
        
        // Update Firebase Auth user if needed
        const authUpdates: Partial<adminAuth.UpdateRequest> = {
             email: pharmacistData.email,
             displayName: `${pharmacistData.firstName} ${pharmacistData.lastName}`
        };

        if (password) {
            authUpdates.password = password;
        }

        await adminAuth().updateUser(id, authUpdates);

        return { type: 'success', message: 'Əczaçı məlumatları uğurla yeniləndi.' };

    } catch (error: any) {
        console.error("Əczaçı yeniləmə xətası:", error);
        return {
            type: 'error',
            message: `Gözlənilməz bir xəta baş verdi: ${error.message || 'Bilinməyən xəta'}`,
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deletePharmacist(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    // Delete from Firestore
    await db.collection('pharmacists').doc(id).delete();
    
    // Delete from Firebase Auth
    await adminAuth().deleteUser(id);

    return { type: 'success', message: 'Əczaçı uğurla sistemdən silindi.' };
  } catch (error: any) {
     const errorMessage = error.message || 'Bilinməyən xəta';
    return { type: 'error', message: `Əczaçını silmək mümkün olmadı: ${errorMessage}` };
  }
}
