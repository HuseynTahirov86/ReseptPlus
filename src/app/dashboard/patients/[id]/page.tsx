'use client';
import { useParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Patient, Prescription, PrescribedMedication } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePlus2, Loader2, BrainCircuit, Pill } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PrescriptionForm } from './prescription-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/client-init';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function PatientDetailPage() {
    const params = useParams();
    const { id } = params;
    const { user: doctor } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            if (id) {
                try {
                    const patientDoc = await getDoc(doc(db, 'patients', id as string));
                    if (patientDoc.exists()) {
                        setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient);
                    } else {
                         setPatient(null);
                    }

                    const q = query(
                        collection(db, 'prescriptions'),
                        where('patientId', '==', id)
                    );
                    const presDocs = await getDocs(q);
                    const fetchedPrescriptions = presDocs.docs.map(d => d.data() as Prescription);
                    
                    fetchedPrescriptions.sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime());

                    setPrescriptions(fetchedPrescriptions);
                } catch(e) {
                    console.error("Error fetching patient data: ", e);
                }
            }
            setIsLoading(false);
        }
        fetchData();
    }, [id]);
    
    const onFormSubmit = (state: { type: 'success' | 'error', message: string }) => {
        toast({
            title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: state.message,
            variant: state.type === 'success' ? 'default' : 'destructive',
        });
        if (state.type === 'success') {
            setIsFormOpen(false);
        }
    };
    
    const startAIConsultation = () => {
        if (!patient) return;
        
        const patientDiagnoses = prescriptions?.map(p => p.diagnosis).filter(Boolean) || [];
        const allMedications = prescriptions?.flatMap(p => p.medications.map(m => m.medicationName)) || [];

        const patientHistory = `
        - Ad: ${patient.firstName} ${patient.lastName}
        - Doğum tarixi: ${patient.dateOfBirth}
        - Cins: ${patient.gender}
        - Kontakt: ${patient.contactNumber}
        - Keçmiş Diaqnozlar: ${patientDiagnoses.length > 0 ? patientDiagnoses.join(', ') : 'Məlumat yoxdur'}
        - Keçmiş Dərmanlar: ${allMedications.length > 0 ? allMedications.join(', ') : 'Məlumat yoxdur'}
        `.trim();
        
        const queryParams = new URLSearchParams({
            patientHistory: patientHistory,
        });

        router.push(`/dashboard/suggestions?${queryParams.toString()}`);
    }

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!patient) {
        return <div className="text-center">Xəstə tapılmadı.</div>;
    }

    const patientInitials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 text-xl">
                            <AvatarFallback>{patientInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{patient.firstName} {patient.lastName}</CardTitle>
                            <CardDescription>FIN: {patient.finCode} • Doğum tarixi: {new Date(patient.dateOfBirth).toLocaleDateString()}</CardDescription>
                        </div>
                    </div>
                     <div className='flex gap-2'>
                        <Button variant="outline" onClick={startAIConsultation}>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            AI Konsultasiyası
                        </Button>
                        <Button onClick={() => setIsFormOpen(true)}>
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            Yeni Resept
                        </Button>
                     </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resept Tarixçəsi</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-6">
                       {isLoading && (
                           <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                       )}
                       {!isLoading && prescriptions?.map((p) => (
                           <Card key={p.id} className="p-4">
                               <div className="flex justify-between items-start">
                                   <div>
                                       <p className="font-semibold">{new Date(p.datePrescribed).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                       <p className="text-sm text-muted-foreground">Diaqnoz: {p.diagnosis}</p>
                                   </div>
                                   <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                               </div>
                               <div className="mt-4">
                                   <h4 className="font-medium flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> Dərmanlar</h4>
                                   <ul className="mt-2 pl-6 space-y-1 list-disc text-sm text-muted-foreground">
                                       {p.medications.map((med, index) => (
                                          <li key={index}>
                                              <span className="font-semibold text-foreground">{med.medicationName}</span> ({med.dosage}) - {med.instructions}
                                          </li>
                                       ))}
                                   </ul>
                               </div>
                           </Card>
                       ))}
                       {!isLoading && prescriptions?.length === 0 && (
                           <div className="p-8 text-center text-gray-500">Bu xəstə üçün heç bir resept tapılmadı.</div>
                       )}
                   </div>
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Resept Yarat</DialogTitle>
                        <DialogDescription>"{patient.firstName} {patient.lastName}" üçün yeni resept məlumatlarını daxil edin.</DialogDescription>
                    </DialogHeader>
                    {doctor && <PrescriptionForm patient={patient} doctorId={doctor.uid} onFormSubmit={onFormSubmit}/>}
                </DialogContent>
            </Dialog>
        </div>
    );
}
