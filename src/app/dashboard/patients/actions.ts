'use server';
import { z } from 'zod';
import { db } from '@/firebase/server-init';
import type { Prescription, Patient, Doctor } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const PrescribedMedicationSchema = z.object({
  medicationName: z.string().min(3, 'Dərman adı ən azı 3 simvol olmalıdır.'),
  dosage: z.string().min(1, 'Doza qeyd edilməlidir.'),
  instructions: z.string().min(5, 'Təlimat ən azı 5 simvol olmalıdır.'),
});

const PrescriptionSchema = z.object({
  patientId: z.string(),
  patientName: z.string(),
  complaint: z.string().min(5, 'Şikayət ən azı 5 simvol olmalıdır.'),
  diagnosis: z.string().min(5, 'Diaqnoz ən azı 5 simvol olmalıdır.'),
  medications: z.array(PrescribedMedicationSchema).min(1, 'Ən azı bir dərman əlavə edilməlidir.'),
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
  issues?: Record<string, any>;
  fields?: Record<string, any>;
};

export async function addPrescription(
  doctorId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {

  const rawData: any = {
      patientId: formData.get('patientId'),
      patientName: formData.get('patientName'),
      complaint: formData.get('complaint'),
      diagnosis: formData.get('diagnosis'),
      medications: [],
  };

  // Manually construct the medications array from FormData
  let i = 0;
  while(formData.get(`medications[${i}].medicationName`) !== null) {
      rawData.medications.push({
          medicationName: formData.get(`medications[${i}].medicationName`),
          dosage: formData.get(`medications[${i}].dosage`),
          instructions: formData.get(`medications[${i}].instructions`),
      });
      i++;
  }

  const validatedFields = PrescriptionSchema.safeParse(rawData);

  if (!validatedFields.success) {
      return {
          type: 'error',
          message: "Məlumatları yoxlayın.",
          issues: validatedFields.error.flatten().fieldErrors,
      };
  }

  try {
    const doctorRef = db.collection('doctors').doc(doctorId);
    const doctorSnap = await doctorRef.get();
    if (!doctorSnap.exists) {
        throw new Error("Həkim profili tapılmadı.");
    }
    const doctorData = doctorSnap.data() as Doctor;
    const hospitalId = doctorData.hospitalId;

    if (!hospitalId) {
        throw new Error("Həkimə bağlı xəstəxana ID-si tapılmadı.");
    }

    const newPrescription: Omit<Prescription, 'id'> = {
      ...validatedFields.data,
      doctorId: doctorId,
      hospitalId: hospitalId,
      pharmacyId: 'apteka_id_placeholder', 
      datePrescribed: new Date().toISOString(),
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'Gözləmədə',
    };

    const collectionRef = db.collection('prescriptions');
    const docRef = await collectionRef.add(newPrescription);
    await docRef.update({ id: docRef.id });

    revalidatePath(`/dashboard/patients/${validatedFields.data.patientId}`);

    return { type: 'success', message: 'Resept uğurla əlavə edildi.' };
  } catch (error) {
    console.error("Add Prescription Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return {
      type: 'error',
      message: `Resept əlavə edilərkən gözlənilməz bir xəta baş verdi: ${errorMessage}`,
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
