export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  pharmacyId: string;
  medicationId: string;
  medicationName: string; // Added for convenience
  datePrescribed: string; // ISO date string
  dosage: string;
  quantity: number;
  refills: number;
  instructions: string;
  verificationCode: string;
  status: 'Təhvil verildi' | 'Gözləmədə' | 'Ləğv edildi';
};

export type Doctor = {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
    hospitalId: string;
    role: 'doctor' | 'head_doctor' | 'admin';
};

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
  imageHint: string;
  author: string;
  datePublished: string; // ISO String
};

export type PricingPlan = {
  id: string;
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  isPopular: boolean;
};

export type ProductFeature = {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide-react icon name
};
