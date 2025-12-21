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
