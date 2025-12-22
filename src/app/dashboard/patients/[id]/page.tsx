'use client';
import { useParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
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

    const fetchData = async () => {
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

    useEffect(() => {
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
            fetchData(); // Refetch data to show the new prescription
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarix</TableHead>
                                <TableHead>Diaqnoz</TableHead>
                                <TableHead>Dərmanlar</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && prescriptions?.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{new Date(p.datePrescribed).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                    <TableCell className="font-medium">{p.diagnosis}</TableCell>
                                    <TableCell>
                                        <ul className="list-disc pl-4">
                                            {p.medications.map((med, i) => <li key={i}>{med.medicationName} ({med.dosage})</li>)}
                                        </ul>
                                    </TableCell>
                                    <TableCell>
                                         <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && prescriptions?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Bu xəstə üçün heç bir resept tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
