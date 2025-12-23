'use server';

import { db, auth as adminAuth } from '@/firebase/server-init';
import type { Hospital, Pharmacy, Doctor, Pharmacist, Patient, Inventory } from '@/lib/types';
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
        console.log('Starting database seed process...');

        const hospitalId = 'demo_hospital_01';
        const pharmacyId = 'demo_pharmacy_01';

        // 1. Create Hospital
        const hospitalRef = db.collection('hospitals').doc(hospitalId);
        const hospitalData: Hospital = {
            id: hospitalId,
            name: 'Naxçıvan Diaqnostika Müalicə Mərkəzi',
            address: 'Naxçıvan şəh., Heydər Əliyev pr.',
            contactNumber: '(036) 545-01-01',
            email: 'info@ndmc.az'
        };
        await hospitalRef.set(hospitalData);
        console.log(`Created Hospital: ${hospitalData.name}`);

        // 2. Create Pharmacy
        const pharmacyRef = db.collection('pharmacies').doc(pharmacyId);
        const pharmacyData: Pharmacy = {
            id: pharmacyId,
            name: 'Zeytun Aptek №5',
            address: 'Bakı şəh., Nizami küç. 12',
            contactNumber: '(012) 498-76-54',
            email: 'info@zeytunpharma.az',
            latitude: 40.375,
            longitude: 49.845
        };
        await pharmacyRef.set(pharmacyData);
        console.log(`Created Pharmacy: ${pharmacyData.name}`);

        // 3. Create Inventory for the Pharmacy
        const inventoryBatch = db.batch();
        const inventoryItems: Omit<Inventory, 'id' | 'pharmacyId'>[] = [
            { name: 'Paracetamol', dosage: '500', unit: 'mg', form: 'tablet', quantity: 150, expirationDate: '2025-12-31' },
            { name: 'Ibuprofen', dosage: '200', unit: 'mg', form: 'tablet', quantity: 80, expirationDate: '2026-06-30' },
            { name: 'Amoksisilin', dosage: '250', unit: 'mg', form: 'kapsul', quantity: 120, expirationDate: '2025-08-01' },
        ];
        inventoryItems.forEach(item => {
            const inventoryRef = db.collection(`pharmacies/${pharmacyId}/inventory`).doc();
            inventoryBatch.set(inventoryRef, { ...item, pharmacyId, id: inventoryRef.id });
        });
        await inventoryBatch.commit();
        console.log(`Created ${inventoryItems.length} inventory items for ${pharmacyData.name}`);

        // 4. Create Users (Auth + Firestore)
        // Head Doctor
        const headDoctorUid = await createUser('aysel.quliyeva@reseptplus.az', 'password', 'Aysel Quliyeva');
        const headDoctorData: Doctor = { id: headDoctorUid, firstName: 'Aysel', lastName: 'Quliyeva', email: 'aysel.quliyeva@reseptplus.az', specialization: 'Baş Həkim', hospitalId, role: 'head_doctor' };
        await db.collection('doctors').doc(headDoctorUid).set(headDoctorData);
        console.log(`Created Head Doctor: ${headDoctorData.firstName}`);

        // Doctor
        const doctorUid = await createUser('elvin.agayev@reseptplus.az', 'password', 'Elvin Ağayev');
        const doctorData: Doctor = { id: doctorUid, firstName: 'Elvin', lastName: 'Ağayev', email: 'elvin.agayev@reseptplus.az', specialization: 'Kardioloq', hospitalId, role: 'doctor' };
        await db.collection('doctors').doc(doctorUid).set(doctorData);
        console.log(`Created Doctor: ${doctorData.firstName}`);

        // Head Pharmacist
        const headPharmacistUid = await createUser('leyla.hesenova@reseptplus.az', 'password', 'Leyla Həsənova');
        const headPharmacistData: Pharmacist = { id: headPharmacistUid, firstName: 'Leyla', lastName: 'Həsənova', email: 'leyla.hesenova@reseptplus.az', pharmacyId, role: 'head_pharmacist' };
        await db.collection('pharmacists').doc(headPharmacistUid).set(headPharmacistData);
        console.log(`Created Head Pharmacist: ${headPharmacistData.firstName}`);

        // Pharmacist (Employee)
        const pharmacistUid = await createUser('anar.memmedov@reseptplus.az', 'password', 'Anar Məmmədov');
        const pharmacistData: Pharmacist = { id: pharmacistUid, firstName: 'Anar', lastName: 'Məmmədov', email: 'anar.memmedov@reseptplus.az', pharmacyId, role: 'employee' };
        await db.collection('pharmacists').doc(pharmacistUid).set(pharmacistData);
        console.log(`Created Pharmacist: ${pharmacistData.firstName}`);

        // Patient
        const patientUid = await createUser('orxan.veliyev@reseptplus.az', 'password', 'Orxan Vəliyev');
        const patientData: Patient = { id: patientUid, firstName: 'Orxan', lastName: 'Vəliyev', email: 'orxan.veliyev@reseptplus.az', finCode: '1A2B3C4', dateOfBirth: '1988-05-15', gender: 'Kişi', contactNumber: '+994501234567', address: 'Bakı şəh., Azadlıq pr. 1', role: 'patient' };
        await db.collection('patients').doc(patientUid).set(patientData);
        console.log(`Created Patient: ${patientData.firstName}`);

        return { type: 'success', message: 'Bütün nümunə məlumatlar və hesablar uğurla yaradıldı!' };
    } catch (error) {
        console.error('Database seeding failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinməyən server xətası';
        return { type: 'error', message: `Xəta baş verdi: ${errorMessage}` };
    }
}
