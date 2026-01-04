'use server';

import { z } from 'zod';
import { db, auth as adminAuth } from '@/firebase/server-init';

const PatientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır.'),
  finCode: z.string().length(7, 'FİN kod 7 simvol olmalıdır.').transform(val => val.toUpperCase()),
  dateOfBirth: z.string().nonempty('Doğum tarixi tələb olunur.'),
  gender: z.enum(['Kişi', 'Qadın'], { errorMap: () => ({ message: 'Cins seçilməlidir.' }) }),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined>;
  type: 'success' | 'error';
};

async function addOrUpdatePatient(action: 'add' | 'update', prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PatientSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
      fields: rawData,
      issues: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, finCode, ...patientData } = validatedFields.data;

  try {
    if (action === 'add') {
      const patientQuery = db.collection('patients').where('finCode', '==', finCode);
      const querySnapshot = await patientQuery.get();
      if (!querySnapshot.empty) {
        return { type: 'error', message: 'Bu FİN kod artıq sistemdə mövcuddur.', fields: rawData };
      }

      const userRecord = await adminAuth.createUser({
          email: patientData.email,
          password: 'password', // Default password, user should change it
          displayName: `${patientData.firstName} ${patientData.lastName}`,
          phoneNumber: patientData.contactNumber,
      });

      const docRef = db.collection('patients').doc(userRecord.uid);
      await docRef.set({
        id: userRecord.uid,
        ...patientData,
        finCode,
        role: 'patient' as const,
      });

      return { type: 'success', message: 'Xəstə uğurla yaradıldı.' };

    } else { // Update
      if (!id) {
        return { type: 'error', message: 'Yeniləmə üçün ID təyin edilməyib.' };
      }
      
      const docRef = db.collection('patients').doc(id);
      await docRef.update({ ...patientData, finCode });

      await adminAuth.updateUser(id, {
          email: patientData.email,
          displayName: `${patientData.firstName} ${patientData.lastName}`,
          phoneNumber: patientData.contactNumber
      });
      
      return { type: 'success', message: 'Xəstə məlumatları uğurla yeniləndi.' };
    }
  } catch (error) {
    const err = error as { code?: string, message: string };
     if (err.code?.includes('already-exists')) {
         return { type: 'error', message: 'Bu email və ya telefon nömrəsi artıq istifadə olunur.', fields: rawData };
     }
    return {
      type: 'error',
      message: `Xəta baş verdi: ${err.message}`,
      fields: rawData,
    };
  }
}

export const addPatient = addOrUpdatePatient.bind(null, 'add');
export const updatePatient = addOrUpdatePatient.bind(null, 'update');


export async function deletePatient(id: string): Promise<FormState> {
  if (!id) {
    return { type: 'error', message: 'ID təyin edilməyib.' };
  }
  try {
    const docRef = db.collection('patients').doc(id);
    await docRef.delete();
    await adminAuth.deleteUser(id);
    return { type: 'success', message: 'Xəstə uğurla silindi.' };
  } catch (error) {
    const err = error as Error;
    return { type: 'error', message: `Xəstəni silmək mümkün olmadı: ${err.message}` };
  }
}
