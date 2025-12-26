'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Prescription } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Loader2, Search, MessageSquare, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function PrescriptionsPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const [searchTerm, setSearchTerm] = useState('');
    
    const userRole = user?.profile?.role;
    const uid = user?.uid;
    const hospitalId = user?.profile?.hospitalId;

    const prescriptionsQuery = useMemoFirebase(() => {
        if (!firestore || !uid) return null;

        if (userRole === 'head_doctor' && hospitalId) {
            return query(collection(firestore, 'prescriptions'), where('hospitalId', '==', hospitalId), orderBy('datePrescribed', 'desc'));
        }
        if (userRole === 'doctor') {
            return query(collection(firestore, 'prescriptions'), where('doctorId', '==', uid), orderBy('datePrescribed', 'desc'));
        }
        if (userRole === 'patient') {
            return query(collection(firestore, 'prescriptions'), where('patientId', '==', uid), orderBy('datePrescribed', 'desc'));
        }
        return null;
    }, [firestore, userRole, hospitalId, uid]);

    const { data: prescriptions, isLoading } = useCollection<Prescription>(prescriptionsQuery);
    
    const filteredPrescriptions = useMemo(() => {
        if (!prescriptions) return [];
        return prescriptions.filter(p => 
            (p.patientName && p.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.diagnosis && p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.doctorName && p.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            p.medications.some(m => m.medicationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [prescriptions, searchTerm]);

    const showLoading = isUserLoading || isLoading;
    const isPatient = userRole === 'patient';

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <ClipboardList /> {isPatient ? "Reseptlərim" : "Reseptlər"}
                        </div>
                        <div className="relative w-full max-w-sm">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder={isPatient ? "Həkim, diaqnoz və ya dərman adı ilə axtar..." : "Xəstə adı, diaqnoz və ya ID ilə axtar..."}
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {isPatient ? 'Bütün resept tarixçəniz.' : (userRole === 'head_doctor' ? 'Xəstəxanada yazılmış bütün reseptlər.' : 'Yazdığınız bütün reseptlərin siyahısı.')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isPatient ? <TableHead>Həkim</TableHead> : <TableHead>Xəstə</TableHead>}
                                <TableHead>Tarix</TableHead>
                                <TableHead>Diaqnoz</TableHead>
                                <TableHead>Dərmanlar</TableHead>
                                <TableHead>Status</TableHead>
                                {isPatient && <TableHead className="text-right">Rəy</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {showLoading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    {isPatient && <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>}
                                </TableRow>
                            ))}
                            {!showLoading && filteredPrescriptions.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{isPatient ? `Dr. ${p.doctorName || 'Naməlum'}` : p.patientName}</TableCell>
                                    <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                    <TableCell>{p.diagnosis}</TableCell>
                                    <TableCell>
                                        {p.medications.map(m => m.medicationName).join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                                    </TableCell>
                                    {isPatient && (
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/prescriptions/feedback?prescriptionId=${p.id}`}>
                                                    <Star className="mr-2 h-4 w-4" /> Rəy Bildir
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {!showLoading && filteredPrescriptions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isPatient ? 6 : 5} className="h-24 text-center">
                                        {searchTerm ? 'Axtarışa uyğun resept tapılmadı.' : 'Heç bir resept tapılmadı.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
