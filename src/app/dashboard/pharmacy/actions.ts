'use server';

import { db } from '@/firebase/server-init';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export type FormState = {
  message: string;
  type: 'success' | 'error';
};

export async function fulfillPrescription(
    prescriptionId: string, 
    totalCost: number, 
    paymentReceived: number
): Promise<FormState> {
    if (!prescriptionId) {
        return { type: 'error', message: 'Resept ID təyin edilməyib.' };
    }

    try {
        const presRef = db.collection('prescriptions').doc(prescriptionId);
        const dataToUpdate = {
            status: 'Təhvil verildi',
            dateFulfilled: new Date().toISOString(),
            totalCost: totalCost,
            paymentReceived: paymentReceived
        };
        await presRef.update(dataToUpdate).catch(err => {
            throw new FirestorePermissionError({
                operation: 'update',
                path: presRef.path,
                requestResourceData: dataToUpdate
            })
        });
        return { type: 'success', message: 'Resept uğurla təhvil verildi.' };
    } catch (error) {
        console.error("Fulfill Prescription Error:", error);
         if(error instanceof FirestorePermissionError) {
          errorEmitter.emit('permission-error', error);
        }
        return { type: 'error', message: 'Resept statusunu yeniləyərkən xəta baş verdi.' };
    }
}
