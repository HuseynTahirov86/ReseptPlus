'use client';

import { useUser, useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy } from "firebase/firestore";
import type { Prescription } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Search } from "lucide-react";

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function AdminPrescriptionsPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isUserLoading && user?.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, isUserLoading, router]);

    const prescriptionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'prescriptions'), orderBy('datePrescribed', 'desc'));
    }, [firestore]);

    const { data: prescriptions, isLoading } = useCollection<Prescription>(prescriptionsQuery);
    
    const filteredPrescriptions = useMemo(() => {
        if (!prescriptions) return [];
        return prescriptions.filter(p => 
            p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [prescriptions, searchTerm]);

    const showLoading = isUserLoading || isLoading;
    
    if (isUserLoading || (user && user.profile?.role !== 'system_admin')) {
         return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-96 w-full" />
            </div>
         );
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <ClipboardList /> Bütün Reseptlər
                        </div>
                        <div className="relative w-full max-w-sm">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Xəstə, həkim, diaqnoz və ya ID ilə axtar..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Sistemdə olan bütün reseptlərin siyahısı.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Xəstə</TableHead>
                                <TableHead>Həkim</TableHead>
                                <TableHead>Tarix</TableHead>
                                <TableHead>Diaqnoz</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Resept ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {showLoading && Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                                </TableRow>
                            ))}
                            {!showLoading && filteredPrescriptions.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.patientName}</TableCell>
                                    <TableCell>Dr. {p.doctorName || 'Naməlum'}</TableCell>
                                    <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                    <TableCell>{p.diagnosis}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
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
