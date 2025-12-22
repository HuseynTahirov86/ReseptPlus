import { User } from 'firebase/auth';

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
    role: 'patient';
};

export type PrescribedMedication = {
    medicationName: string;
    dosage: string;
    instructions: string;
}

export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  hospitalId: string; // Denormalized for easier querying by head_doctor
  pharmacyId: string;
  datePrescribed: string; // ISO date string
  verificationCode: string;
  status: 'Təhvil verildi' | 'Gözləmədə' | 'Ləğv edildi';
  complaint?: string;
  diagnosis?: string;
  medications: PrescribedMedication[];
  totalCost?: number;
  paymentReceived?: number;
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

export type Hospital = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    email: string;
};

export type Pharmacy = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    email: string;
    latitude: number;
    longitude: number;
};

export type Inventory = {
    id: string;
    pharmacyId: string;
    name: string;
    dosage: string;
    unit: string;
    form: string;
    quantity: number;
    expirationDate: string; // ISO date string
};


// Marketing site content types
export type SupportingOrganization = {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
};

export type ClientCompany = {
    id: string;
    name: string;
    description: string;
    logoUrl: string;
};

export type BlogPost = {
    id: string;
    title: string;
    description: string;
    content: string;
    imageUrl: string;
    imageHint?: string;
    author: string;
    datePublished: string; // ISO date string
};

export type PricingPlan = {
    id: string;
    title: string;
    description: string;
    price: string;
    period?: string;
    features: string[];
    isPopular: boolean;
};

export type ProductFeature = {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
};

export type TeamMember = {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    imageHint?: string;
};


// Represents the combined user profile, which could be any of the defined roles.
export type UserProfile = (Doctor | Admin | SystemAdmin | Pharmacist | Patient | Hospital | Pharmacy | SupportingOrganization | ClientCompany | BlogPost | PricingPlan | ProductFeature | TeamMember | Inventory);


// Custom user data including role
export type AppUser = User & {
    profile?: Partial<UserProfile>;
};

    