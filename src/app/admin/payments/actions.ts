'use server';

import { db } from '@/firebase/server-init';

export async function updateOrganizationStatus(
  collection: 'hospitals' | 'pharmacies',
  docId: string,
  status: 'Aktiv' | 'Sınaq Müddəti' | 'Ödəniş Gözlənilir' | 'Deaktiv'
): Promise<{ success: boolean; message: string }> {
  try {
    if (!docId || !status) {
      return { success: false, message: 'ID və ya status təyin edilməyib.' };
    }
    const docRef = db.collection(collection).doc(docId);
    await docRef.update({ paymentStatus: status });
    return { success: true, message: 'Status uğurla yeniləndi.' };
  } catch (error) {
    console.error(`Error updating status for ${docId} in ${collection}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinməyən xəta';
    return { success: false, message: `Status yenilənərkən xəta baş verdi: ${errorMessage}` };
  }
}
