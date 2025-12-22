'use server';
import { z } from 'zod';
import { db } from '@/firebase/server-init';
import type { Prescription, Patient } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

const PrescriptionSchema = z.object({
  patientId: z.string(),
  patientName: z.string(),
  complaint: z.string().min(5, 'Şikayət ən azı 5 simvol olmalıdır.'),
  diagnosis: z.string().min(5, 'Diaqnoz ən azı 5 simvol olmalıdır.'),
  medicationName: z.string().min(3, 'Dərman adı ən azı 3 simvol olmalıdır.'),
  dosage: z.string().min(1, 'Doza qeyd edilməlidir.'),
  instructions: z.string().min(5, 'Təlimat ən azı 5 simvol olmalıdır.'),
});

const PatientSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır.'),
  finCode: z.string().length(7, 'FİN kod 7 simvol olmalıdır.'),
  dateOfBirth: z.string().nonempty('Doğum tarixi tələb olunur.'),
  gender: z.enum(['Kişi', 'Qadın'], { errorMap: () => ({ message: 'Cins seçilməlidir.' }) }),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.').optional().or(z.literal('')),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.').optional().or(z.literal('')),
});


export type FormState = {
  message: string;
  type: 'success' | 'error';
  issues?: Record<string, string[] | undefined>;
  fields?: Record<string, any>;
};

export async function addPrescription(
  doctorId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = PrescriptionSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: "Məlumatları yoxlayın: " + validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newPrescription: Omit<Prescription, 'id'> = {
      ...validatedFields.data,
      doctorId: doctorId,
      pharmacyId: 'apteka_id_placeholder', // Bu hissə daha sonra dinamik olacaq
      medicationId: 'derman_id_placeholder', // Bu hissə daha sonra dinamik olacaq
      datePrescribed: new Date().toISOString(),
      quantity: 1, // Placeholder
      refills: 0, // Placeholder
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'Gözləmədə',
    };

    const collectionRef = db.collection('prescriptions');
    const docRef = await collectionRef.add(newPrescription);
    await docRef.update({ id: docRef.id });

    return { type: 'success', message: 'Resept uğurla əlavə edildi.' };
  } catch (error) {
    console.error("Add Prescription Error:", error);
    return {
      type: 'error',
      message: 'Resept əlavə edilərkən gözlənilməz bir xəta baş verdi.',
    };
  }
}

export async function addPatient(prevState: FormState, formData: FormData): Promise<FormState> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = PatientSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        return {
            type: 'error',
            message: "Doğrulama uğursuz oldu. Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın.",
            fields: rawData,
            issues: fieldErrors,
        };
    }

    const { finCode, dateOfBirth, ...patientData } = validatedFields.data;

    try {
        const patientQuery = db.collection('patients').where('finCode', '==', finCode.toUpperCase());
        const querySnapshot = await patientQuery.get();

        if (!querySnapshot.empty) {
            return {
                type: 'error',
                message: 'Bu FİN kod artıq sistemdə mövcuddur.',
                fields: rawData,
            };
        }

        const newPatient: Omit<Patient, 'id'> = {
            ...patientData,
            finCode: finCode.toUpperCase(),
            dateOfBirth: dateOfBirth,
            role: 'patient',
        };

        const collectionRef = db.collection('patients');
        const docRef = await collectionRef.add(newPatient);
        await docRef.update({ id: docRef.id });

        return { type: 'success', message: 'Xəstə uğurla qeydiyyata alındı.' };
    } catch (error) {
        console.error("Add Patient Error:", error);
        return {
            type: 'error',
            message: 'Xəstə əlavə edilərkən gözlənilməz bir xəta baş verdi.',
            fields: rawData,
        };
    }
}
