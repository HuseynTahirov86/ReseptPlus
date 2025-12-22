'use server';

import { z } from 'zod';
import { db } from '@/firebase/server-init';
import { auth as adminAuth } from 'firebase-admin';

// Schema for creating a doctor
const CreateDoctorSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 simvol olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.'),
  specialization: z.string().min(3, 'İxtisas ən azı 3 simvol olmalıdır.'),
  hospitalId: z.string().min(1, 'Xəstəxana seçilməlidir.'),
  role: z.enum(['doctor', 'head_doctor'], {
    errorMap: () => ({ message: 'Rol seçilməlidir.' }),
  }),
});

// Schema for updating a doctor (password is optional)
const UpdateDoctorSchema = CreateDoctorSchema.omit({ password: true }).extend({
  id: z.string().min(1, 'Həkim ID-si təyin edilməyib.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.').optional().or(z.literal('')),
});


export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  type: 'success' | 'error';
};

export async function addDoctor(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = CreateDoctorSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.',
      fields: Object.fromEntries(formData.entries()),
      issues: validatedFields.error.flatten().fieldErrors.name,
    };
  }
  
  const { email, password, ...doctorData } = validatedFields.data;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await adminAuth().createUser({
      email,
      password,
      displayName: `${doctorData.firstName} ${doctorData.lastName}`,
    });

    // 2. Create doctor profile in Firestore with the same UID
    const doctorRef = db.collection('doctors').doc(userRecord.uid);
    await doctorRef.set({
        id: userRecord.uid,
        email,
        ...doctorData
    });
    
    return { type: 'success', message: 'Həkim uğurla yaradıldı.' };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
         return {
            type: 'error',
            message: 'Bu email adresi artıq başqa bir istifadəçi tərəfindən istifadə olunur.',
            fields: Object.fromEntries(formData.entries()),
        };
    }
    console.error("Həkim yaratma xətası:", error);
    return {
      type: 'error',
      message: `Gözlənilməz bir xəta baş verdi: ${error.message || 'Bilinməyən xəta'}`,
      fields: Object.fromEntries(formData.entries()),
    };
  }
}

export async function updateDoctor(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = UpdateDoctorSchema.safeParse(
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

    const { id, password, ...doctorData } = validatedFields.data;
    
    try {
        // Update Firestore document
        const docRef = db.collection('doctors').doc(id);
        await docRef.set(doctorData, { merge: true });
        
        // Update Firebase Auth user if needed
        const authUpdates: adminAuth.UpdateRequest = {
             email: doctorData.email,
             displayName: `${doctorData.firstName} ${doctorData.lastName}`
        };

        if (password) {
            authUpdates.password = password;
        }

        await adminAuth().updateUser(id, authUpdates);

        return { type: 'success', message: 'Həkim məlumatları uğurla yeniləndi.' };

    } catch (error: any) {
        console.error("Həkim yeniləmə xətası:", error);
        return {
            type: 'error',
            message: `Gözlənilməz bir xəta baş verdi: ${error.message || 'Bilinməyən xəta'}`,
            fields: Object.fromEntries(formData.entries()),
        };
    }
}


export async function deleteDoctor(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  
  try {
    // Delete from Firestore
    await db.collection('doctors').doc(id).delete();
    
    // Delete from Firebase Auth
    await adminAuth().deleteUser(id);

    return { type: 'success', message: 'Həkim uğurla sistemdən silindi.' };
  } catch (error: any) {
     const errorMessage = error.message || 'Bilinməyən xəta';
    return { type: 'error', message: `Həkimi silmək mümkün olmadı: ${errorMessage}` };
  }
}
