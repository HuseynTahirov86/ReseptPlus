'use server';
import { z } from 'zod';
import { db } from '@/firebase/server-init';
import type { Prescription } from '@/lib/types';
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

export type FormState = {
  message: string;
  type: 'success' | 'error';
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
