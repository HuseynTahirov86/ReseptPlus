
export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date string
    gender: 'Kişi' | 'Qadın';
    contactNumber: string;
    email: string;
    address: string;
    finCode: string;
};

export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  pharmacyId: string;
  medicationId: string;
  medicationName: string; 
  datePrescribed: string; // ISO date string
  dosage: string;
  quantity: number;
  refills: number;
  instructions: string;
  verificationCode: string;
  status: 'Təhvil verildi' | 'Gözləmədə' | 'Ləğv edildi';
  complaint?: string;
  diagnosis?: string;
};

export type Doctor = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization: string;
    hospitalId: string;
    role: 'doctor' | 'head_doctor';
};

export type Pharmacist = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    pharmacyId: string;
    role: 'head_pharmacist' | 'employee';
};

export type Admin = {
    id: string;
    email: string;
    role: 'admin';
};

export type SystemAdmin = {
    id: string;
    email: string;
    role: 'system_admin';
};

// Represents the combined user profile, which could be any of the defined roles.
export type UserProfile = (Doctor | Admin | SystemAdmin | Pharmacist | Patient);
