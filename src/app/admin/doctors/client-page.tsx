'use client';

import { useUser, useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { Doctor, Hospital } from "@/lib/types";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Microscope, Download } from "lucide-react";
import { DoctorForm } from "./doctor-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { deleteDoctor } from './actions';
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
import { Badge } from "@/components/ui/badge";
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from '@/lib/utils';


export function DoctorsClientPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

    const { firestore } = useFirebase();

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "doctors"), orderBy("lastName"));
    }, [firestore]);

    const hospitalsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "hospitals"), orderBy("name"));
    }, [firestore]);

    const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsQuery);
    const { data: hospitals, isLoading: isLoadingHospitals } = useCollection<Hospital>(hospitalsQuery);

    // Redirect if not a system admin
    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const hospitalMap = useMemo(() => {
        if (!hospitals) return {};
        return hospitals.reduce((acc, hospital) => {
            acc[hospital.id] = hospital.name;
            return acc;
        }, {} as Record<string, string>);
    }, [hospitals]);

    const openFormForEdit = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedDoctor(null);
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
            setSelectedDoctor(null);
        }
    }

    const openDeleteDialog = (doctor: Doctor) => {
        setDoctorToDelete(doctor);
        setDeleteDialogOpen(true);
    }
    
    const handleDelete = async () => {
        if (!doctorToDelete) return;
        
        const result = await deleteDoctor(doctorToDelete.id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
        
        setDeleteDialogOpen(false);
        setDoctorToDelete(null);
    };

    const handleExport = () => {
        if (doctors) {
            const dataToExport = doctors.map(d => ({
                id: d.id,
                ad: d.firstName,
                soyad: d.lastName,
                email: d.email,
                ixtisas: d.specialization,
                xestexana: hospitalMap[d.hospitalId] || 'Təyin edilməyib',
                rol: d.role === 'head_doctor' ? 'Baş Həkim' : 'Həkim',
            }));
            exportToCsv(dataToExport, 'hekimler');
        }
    };
    
    if (user?.profile?.role !== 'system_admin') {
        return null;
    }
    
    const isLoading = isLoadingDoctors || isLoadingHospitals;

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Microscope className="h-6 w-6"/> Həkim İdarəçiliyi
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={handleExport} disabled={!doctors || doctors.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Məlumatları CSV olaraq ixrac et
                            </Button>
                        </div>
                        <CardDescription>
                            Sistemdəki həkimləri və baş həkimləri idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>İxtisas</TableHead>
                                    <TableHead>Xəstəxana</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && Array.from({length: 4}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {doctors?.map((doctor) => (
                                    <TableRow key={doctor.id}>
                                        <TableCell className="font-medium">
                                            {doctor.firstName} {doctor.lastName}
                                        </TableCell>
                                        <TableCell>{doctor.email}</TableCell>
                                        <TableCell>{doctor.specialization}</TableCell>
                                        <TableCell>
                                            {hospitalMap[doctor.hospitalId] || 'Təyin edilməyib'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={doctor.role === 'head_doctor' ? 'default' : 'secondary'}>
                                                {doctor.role === 'head_doctor' ? 'Baş Həkim' : 'Həkim'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(doctor)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Redaktə et
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onSelect={() => openDeleteDialog(doctor)}
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
                                {!isLoading && doctors?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Heç bir həkim tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2">
                        <Button onClick={openFormForNew} disabled={!hospitals || hospitals.length === 0}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Həkim Əlavə Et
                        </Button>
                        {(!hospitals || hospitals.length === 0) && (
                            <p className="text-sm text-destructive">
                                Həkim əlavə etmək üçün əvvəlcə xəstəxana yaratmalısınız.
                            </p>
                        )}
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDoctor ? "Həkimi Redaktə Et" : "Yeni Həkim Yarat"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDoctor 
                                ? `Dr. ${selectedDoctor.lastName} məlumatlarını yeniləyin.` 
                                : `Yeni həkim məlumatlarını və giriş hesabını yaradın.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DoctorForm 
                        key={selectedDoctor?.id || 'new'}
                        initialData={selectedDoctor}
                        hospitals={hospitals || []}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz. Bu, Dr. {doctorToDelete?.lastName} adlı həkimi və onun giriş hesabını sistemdən həmişəlik siləcək.
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
