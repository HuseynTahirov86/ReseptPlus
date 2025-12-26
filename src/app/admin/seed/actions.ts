'use server';

import { db, auth as adminAuth } from '@/firebase/server-init';
import type { Hospital, Pharmacy, Doctor, Pharmacist, Patient, Inventory, Prescription } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

async function createUser(email: string, password = 'password', displayName: string) {
    try {
        const userRecord = await adminAuth.createUser({ email, password, displayName });
        return userRecord.uid;
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            console.log(`User ${email} already exists. Fetching existing user.`);
            return (await adminAuth.getUserByEmail(email)).uid;
        }
        throw error;
    }
}

export async function seedDatabase() {
    try {
        console.log('Starting database seed process for functional data...');
        const batch = db.batch();

        // 1. Create Hospital
        const hospitalId = 'demo_hospital_01';
        const hospitalRef = db.collection('hospitals').doc(hospitalId);
        const hospitalData: Hospital = {
            id: hospitalId,
            name: 'Naxçıvan Diaqnostika Müalicə Mərkəzi',
            address: 'Naxçıvan şəh., Heydər Əliyev pr.',
            contactNumber: '(036) 545-01-01',
            email: 'info@ndmc.az',
            paymentStatus: 'Aktiv',
        };
        batch.set(hospitalRef, hospitalData);
        console.log(`Prepared Hospital: ${hospitalData.name}`);

        // 2. Create Pharmacy
        const pharmacyId = 'demo_pharmacy_01';
        const pharmacyRef = db.collection('pharmacies').doc(pharmacyId);
        const pharmacyData: Pharmacy = {
            id: pharmacyId,
            name: 'Zeytun Aptek №5',
            address: 'Bakı şəh., Nizami küç. 12',
            contactNumber: '(012) 498-76-54',
            email: 'info@zeytunpharma.az',
            latitude: 40.375,
            longitude: 49.845,
            paymentStatus: 'Aktiv',
        };
        batch.set(pharmacyRef, pharmacyData);
        console.log(`Prepared Pharmacy: ${pharmacyData.name}`);

        // 3. Create Inventory for the Pharmacy
        const inventoryItems: Omit<Inventory, 'id' | 'pharmacyId'>[] = [
            { name: 'Paracetamol', dosage: '500', unit: 'mg', form: 'tablet', quantity: 150, expirationDate: '2025-12-31' },
            { name: 'Ibuprofen', dosage: '200', unit: 'mg', form: 'tablet', quantity: 80, expirationDate: '2026-06-30' },
            { name: 'Amoksisilin', dosage: '250', unit: 'mg', form: 'kapsul', quantity: 120, expirationDate: '2025-08-01' },
        ];
        inventoryItems.forEach(item => {
            const inventoryRef = db.collection(`pharmacies/${pharmacyId}/inventory`).doc();
            batch.set(inventoryRef, { ...item, pharmacyId, id: inventoryRef.id });
        });
        console.log(`Prepared ${inventoryItems.length} inventory items for ${pharmacyData.name}`);

        // 4. Create Users (Auth is handled separately, just prepare Firestore docs)
        const headDoctorUid = await createUser('aysel.quliyeva@reseptplus.az', 'password', 'Aysel Quliyeva');
        const headDoctorData: Doctor = { id: headDoctorUid, firstName: 'Aysel', lastName: 'Quliyeva', email: 'aysel.quliyeva@reseptplus.az', specialization: 'Baş Həkim', hospitalId, role: 'head_doctor' };
        batch.set(db.collection('doctors').doc(headDoctorUid), headDoctorData);
        console.log(`Prepared Head Doctor: ${headDoctorData.firstName}`);

        const doctorUid = await createUser('elvin.agayev@reseptplus.az', 'password', 'Elvin Ağayev');
        const doctorData: Doctor = { id: doctorUid, firstName: 'Elvin', lastName: 'Ağayev', email: 'elvin.agayev@reseptplus.az', specialization: 'Kardioloq', hospitalId, role: 'doctor' };
        batch.set(db.collection('doctors').doc(doctorUid), doctorData);
        console.log(`Prepared Doctor: ${doctorData.firstName}`);
        
        const headPharmacistUid = await createUser('leyla.hesenova@reseptplus.az', 'password', 'Leyla Həsənova');
        const headPharmacistData: Pharmacist = { id: headPharmacistUid, firstName: 'Leyla', lastName: 'Həsənova', email: 'leyla.hesenova@reseptplus.az', pharmacyId, role: 'head_pharmacist' };
        batch.set(db.collection('pharmacists').doc(headPharmacistUid), headPharmacistData);
        console.log(`Prepared Head Pharmacist: ${headPharmacistData.firstName}`);

        const pharmacistUid = await createUser('anar.memmedov@reseptplus.az', 'password', 'Anar Məmmədov');
        const pharmacistData: Pharmacist = { id: pharmacistUid, firstName: 'Anar', lastName: 'Məmmədov', email: 'anar.memmedov@reseptplus.az', pharmacyId, role: 'employee' };
        batch.set(db.collection('pharmacists').doc(pharmacistUid), pharmacistData);
        console.log(`Prepared Pharmacist: ${pharmacistData.firstName}`);
        
        const patientUid = await createUser('orxan.veliyev@reseptplus.az', 'password', 'Orxan Vəliyev');
        const patientData: Patient = { id: patientUid, firstName: 'Orxan', lastName: 'Vəliyev', email: 'orxan.veliyev@reseptplus.az', finCode: '1A2B3C4', dateOfBirth: '1988-05-15', gender: 'Kişi', contactNumber: '+994501234567', address: 'Bakı şəh., Azadlıq pr. 1', role: 'patient' };
        batch.set(db.collection('patients').doc(patientUid), patientData);
        console.log(`Prepared Patient: ${patientData.firstName}`);

        // 5. Create Sample Prescription
        const prescriptionRef = db.collection('prescriptions').doc();
        const prescriptionData: Omit<Prescription, 'id'> = {
            patientId: patientUid,
            patientName: `${patientData.firstName} ${patientData.lastName}`,
            doctorId: doctorUid,
            doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
            hospitalId: hospitalId,
            datePrescribed: new Date().toISOString(),
            diagnosis: 'Kəskin bronxit',
            complaint: '3 gündür davam edən quru öskürək və hərarət.',
            medications: [
                { medicationName: 'Amoksisilin', dosage: '250mg', instructions: 'Gündə 3 dəfə yeməkdən sonra.' },
                { medicationName: 'Paracetamol', dosage: '500mg', instructions: 'Yalnız hərarət 38.5-dən yuxarı olduqda.' },
            ],
            status: 'Gözləmədə',
            verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
            pharmacyId: '',
            totalCost: 0,
            paymentReceived: 0,
        };
        batch.set(prescriptionRef, { ...prescriptionData, id: prescriptionRef.id });
        console.log(`Prepared Prescription for ${patientData.firstName}`);

        // Commit all changes at once
        await batch.commit();
        console.log('Batch commit successful.');

        return { type: 'success', message: 'Bütün nümunə funksional məlumatlar və hesablar uğurla yaradıldı!' };
    } catch (error) {
        console.error('Database seeding failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinməyən server xətası';
        return { type: 'error', message: `Xəta baş verdi: ${errorMessage}` };
    }
}
