'use server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/firebase/server-init';

// Bütün server tərəfi funksiyaları bu faylda olacaq

export async function createDoctorUser(email: string, password: string): Promise<{ uid: string } | { error: string }> {
    try {
        const auth = getAuth();
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: email.split('@')[0],
        });

        // Firestore-da həkim üçün profil yaradırıq
        const doctorProfile = {
            id: userRecord.uid,
            email: userRecord.email,
            firstName: userRecord.displayName || 'Test',
            lastName: 'Həkim',
            specialization: 'Ümumi',
            hospitalId: 'test_hospital_id', // Bu müvəqqətidir, admin paneli qurulanda dinamik olacaq
            role: 'doctor',
        };

        await db.collection('doctors').doc(userRecord.uid).set(doctorProfile);

        return { uid: userRecord.uid };
    } catch (error: any) {
        console.error('Həkim istifadəçisi yaradılarkən xəta:', error);
        
        let errorMessage = 'Gözlənilməz bir xəta baş verdi.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Bu email artıq qeydiyyatdan keçib.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Zəhmət olmasa, düzgün bir email daxil edin.';
        } else if (error.code === 'auth/weak-password') {
             errorMessage = 'Şifrə çox zəifdir. Ən azı 6 simvol olmalıdır.';
        }
        
        return { error: errorMessage };
    }
}
