'use client';
import { useParams } from 'next/navigation';
import { useDoc, useCollection, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Patient, Prescription } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePlus2, Loader2, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { PrescriptionForm } from './prescription-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function PatientDetailPage() {
    const params = useParams();
    const { id } = params;
    const { firestore, user: doctor } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();

    const [isFormOpen, setIsFormOpen] = useState(false);

    const patientRef = useMemoFirebase(
        () => (firestore && id ? doc(firestore, 'patients', id as string) : null),
        [firestore, id]
    );
    const { data: patient, isLoading: patientLoading } = useDoc<Patient>(patientRef);

    const prescriptionsQuery = useMemoFirebase(
        () => (firestore && id ? query(
            collection(firestore, 'prescriptions'),
            where('patientId', '==', id),
            orderBy('datePrescribed', 'desc')
        ) : null),
        [firestore, id]
    );
    const { data: prescriptions, isLoading: prescriptionsLoading } = useCollection<Prescription>(prescriptionsQuery);
    
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
    
    const getAIRecommendations = () => {
        if (!patient || !prescriptions) return;

        const patientHistory = `Doğum tarixi: ${patient.dateOfBirth}, Cins: ${patient.gender}. Keçmiş diaqnozlar: ${prescriptions.map(p => p.diagnosis).join(', ') || 'Məlumat yoxdur'}`;
        const currentMedications = `Hazırkı dərmanlar: ${prescriptions.map(p => p.medicationName).join(', ') || 'Məlumat yoxdur'}`;
        
        const queryParams = new URLSearchParams({
            patientHistory,
            currentMedications,
            doctorNotes: '', // Həkim bu sahəni özü doldura bilər
        });

        router.push(`/dashboard/suggestions?${queryParams.toString()}`);
    }

    if (patientLoading) {
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
                        <Button variant="outline" onClick={getAIRecommendations}>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            AI Məsləhəti
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
                   <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarix</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dərman</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diaqnoz</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {prescriptionsLoading && (
                                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                                )}
                                {!prescriptionsLoading && prescriptions?.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.datePrescribed).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.medicationName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.diagnosis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge></td>
                                    </tr>
                                ))}
                                {!prescriptionsLoading && prescriptions?.length === 0 && (
                                     <tr><td colSpan={4} className="p-8 text-center text-gray-500">Bu xəstə üçün heç bir resept tapılmadı.</td></tr>
                                )}
                            </tbody>
                        </table>
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
