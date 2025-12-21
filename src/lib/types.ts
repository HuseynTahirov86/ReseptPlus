export type Prescription = {
  id: string;
  patientName: string;
  date: string;
  medication: string;
  status: 'Filled' | 'Pending' | 'Canceled';
};
