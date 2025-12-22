'use server';

import { db } from '@/firebase/server-init';
import { doc, updateDoc } from 'firebase/firestore';

export type FormState = {
  message: string;
  type: 'success' | 'error';
};

export async function fulfillPrescription(prescriptionId: string): Promise<FormState> {
    if (!prescriptionId) {
        return { type: 'error', message: 'Resept ID təyin edilməyib.' };
    }

    try {
        const presRef = doc(db, 'prescriptions', prescriptionId);
        await updateDoc(presRef, {
            status: 'Təhvil verildi'
        });
        return { type: 'success', message: 'Resept uğurla təhvil verildi.' };
    } catch (error) {
        console.error("Fulfill Prescription Error:", error);
        return { type: 'error', message: 'Resept statusunu yeniləyərkən xəta baş verdi.' };
    }
}
