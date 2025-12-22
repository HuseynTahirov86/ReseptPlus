'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Prescription } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

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
    const hospitalId = user?.profile?.hospitalId;
    const doctorId = user?.uid;

    const prescriptionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;

        if (userRole === 'head_doctor' && hospitalId) {
            return query(collection(firestore, 'prescriptions'), where('hospitalId', '==', hospitalId), orderBy('datePrescribed', 'desc'));
        }
        if (userRole === 'doctor' && doctorId) {
            return query(collection(firestore, 'prescriptions'), where('doctorId', '==', doctorId), orderBy('datePrescribed', 'desc'));
        }
        return null;
    }, [firestore, userRole, hospitalId, doctorId]);

    const { data: prescriptions, isLoading } = useCollection<Prescription>(prescriptionsQuery);
    
    const filteredPrescriptions = useMemo(() => {
        if (!prescriptions) return [];
        return prescriptions.filter(p => 
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [prescriptions, searchTerm]);

    const showLoading = isUserLoading || isLoading;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <ClipboardList /> Reseptlər
                        </div>
                        <div className="relative w-full max-w-sm">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Xəstə adı və ya ID ilə axtar..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {userRole === 'head_doctor' ? 'Xəstəxanada yazılmış bütün reseptlər.' : 'Yazdığınız bütün reseptlərin siyahısı.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Resept ID</TableHead>
                                <TableHead>Xəstə</TableHead>
                                <TableHead>Tarix</TableHead>
                                <TableHead>Diaqnoz</TableHead>
                                <TableHead>Dərmanlar</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {showLoading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                            {!showLoading && filteredPrescriptions.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                                    <TableCell>{p.patientName}</TableCell>
                                    <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                    <TableCell>{p.diagnosis}</TableCell>
                                    <TableCell>
                                        {p.medications.map(m => m.medicationName).join(', ')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!showLoading && filteredPrescriptions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
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
