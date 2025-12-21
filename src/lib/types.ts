export type Prescription = {
  id: string;
  patientName: string;
  date: string;
  medication: string;
  status: 'Təhvil verildi' | 'Gözləmədə' | 'Ləğv edildi';
};
