'use client';

import { useUser, useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Users, Download, Search } from "lucide-react";
import { PatientForm } from "./patient-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { deletePatient } from './actions';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PatientsClientPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { firestore } = useFirebase();

    const patientsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "patients"), orderBy("lastName"));
    }, [firestore]);

    const { data: patients, isLoading } = useCollection<Patient>(patientsQuery);

    const filteredPatients = useMemo(() => {
        if (!patients) return [];
        return patients.filter(p =>
            p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.finCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [patients, searchTerm]);


    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const openFormForEdit = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedPatient(null);
        setIsFormOpen(true);
    }

    const onFormSubmit = (state: { type: 'success' | 'error', message: string, issues?: any }) => {
        toast({
            title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: state.message,
            variant: state.type === 'success' ? 'default' : 'destructive',
        });
        if (state.type === 'success') {
            setIsFormOpen(false);
            setSelectedPatient(null);
        }
    }
    
     const openDeleteDialog = (patient: Patient) => {
        setPatientToDelete(patient);
        setDeleteDialogOpen(true);
    }

    const handleDelete = async () => {
        if (!patientToDelete) return;
        const result = await deletePatient(patientToDelete.id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
    };

    const handleExport = () => {
        if (filteredPatients) {
            const dataToExport = filteredPatients.map(p => ({
                id: p.id,
                ad: p.firstName,
                soyad: p.lastName,
                fin_kod: p.finCode,
                dogum_tarixi: p.dateOfBirth,
                cins: p.gender,
                elaqe_nomresi: p.contactNumber,
                email: p.email,
                unvan: p.address,
            }));
            exportToCsv(dataToExport, 'xesteler');
        }
    };
    
    if (user?.profile?.role !== 'system_admin') {
        return null;
    }

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div className='space-y-1.5'>
                                <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6"/> Xəstə İdarəçiliyi</CardTitle>
                                <CardDescription>Sistemdəki bütün xəstə profillərini idarə edin.</CardDescription>
                            </div>
                             <div className="flex items-center gap-2">
                                <div className="relative w-full max-w-sm">
                                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                   <Input 
                                        placeholder="Ad, Soyad, FİN, Email ilə axtar..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                                </div>
                                <Button variant="outline" size="sm" onClick={handleExport} disabled={!filteredPatients || filteredPatients.length === 0}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                             </div>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead>FIN Kod</TableHead>
                                    <TableHead>Doğum Tarixi</TableHead>
                                    <TableHead>Əlaqə Nömrəsi</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && Array.from({length: 5}).map((_, i) => (
                                     <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {filteredPatients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                                        <TableCell className="font-mono text-xs">{patient.finCode}</TableCell>
                                        <TableCell>{patient.dateOfBirth}</TableCell>
                                        <TableCell>{patient.contactNumber}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(patient)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Redaktə et
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onSelect={() => openDeleteDialog(patient)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && filteredPatients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                           {searchTerm ? "Axtarışa uyğun xəstə tapılmadı." : "Heç bir xəstə tapılmadı."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Xəstə Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{selectedPatient ? "Xəstəni Redaktə Et" : "Yeni Xəstə Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedPatient ? `"${selectedPatient.firstName} ${selectedPatient.lastName}" məlumatlarını yeniləyin.` : `Yeni xəstə məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <PatientForm 
                        key={selectedPatient?.id || 'new'}
                        initialData={selectedPatient}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz. Bu, {patientToDelete?.firstName} {patientToDelete?.lastName} adlı xəstəni və onunla bağlı bütün məlumatları sistemdən həmişəlik siləcək.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Bəli, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
