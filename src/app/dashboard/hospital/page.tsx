'use client';
import { useUser, useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc, getDoc } from 'firebase/firestore';
import type { Doctor, Hospital } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Hospital as HospitalIcon, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/utils';

export default function HospitalManagementPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const router = useRouter();
    const [hospital, setHospital] = useState<Hospital | null>(null);

    // Redirect if user is not a head_doctor
    useEffect(() => {
        if (!isUserLoading && user?.profile?.role !== 'head_doctor') {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    const hospitalId = user?.profile?.hospitalId;

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore || !hospitalId) return null;
        return collection(firestore, 'doctors');
    }, [firestore, hospitalId]);
    
    // Note: This fetches ALL doctors. For real-world use, you'd add a `where("hospitalId", "==", hospitalId)`
    // However, this requires a composite index in Firestore. For this demo, we filter client-side.
    const { data: allDoctors, isLoading: isLoadingDoctors, error } = useCollection<Doctor>(doctorsQuery);

    const hospitalDoctors = allDoctors?.filter(doctor => doctor.hospitalId === hospitalId);
    
    useEffect(() => {
        if (firestore && hospitalId && !hospital) {
            getDoc(doc(firestore, 'hospitals', hospitalId)).then(docSnap => {
                if (docSnap.exists()) {
                    setHospital(docSnap.data() as Hospital);
                }
            });
        }
    }, [firestore, hospitalId, hospital]);

    const handleExport = () => {
        if (hospitalDoctors) {
            const dataToExport = hospitalDoctors.map(d => ({
                id: d.id,
                ad: d.firstName,
                soyad: d.lastName,
                email: d.email,
                ixtisas: d.specialization,
                rol: d.role === 'head_doctor' ? 'Baş Həkim' : 'Həkim',
            }));
            exportToCsv(dataToExport, `${hospital?.name || 'xestexana'}_hekimler`);
        }
    };

    const isLoading = isUserLoading || isLoadingDoctors;

    if (isLoading) {
        return (
             <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="flex items-center space-x-4 p-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (user?.profile?.role !== 'head_doctor') {
        return null;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardTitle className="flex items-center gap-2">
                            <HospitalIcon /> {hospital?.name || "Xəstəxana İdarəçiliyi"}
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={handleExport} disabled={!hospitalDoctors || hospitalDoctors.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Məlumatları CSV olaraq ixrac et
                        </Button>
                    </div>
                    <CardDescription>
                        Xəstəxananızda qeydiyyatda olan həkimlərin siyahısı.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ad Soyad</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>İxtisas</TableHead>
                                <TableHead>Rol</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hospitalDoctors && hospitalDoctors.map((doctor) => (
                                <TableRow key={doctor.id}>
                                    <TableCell className="font-medium">{doctor.firstName} {doctor.lastName}</TableCell>
                                    <TableCell>{doctor.email}</TableCell>
                                    <TableCell>{doctor.specialization}</TableCell>
                                    <TableCell>
                                        <Badge variant={doctor.role === 'head_doctor' ? 'default' : 'secondary'}>
                                            {doctor.role === 'head_doctor' ? 'Baş Həkim' : 'Həkim'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {hospitalDoctors?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Xəstəxanada həkim tapılmadı.</TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
