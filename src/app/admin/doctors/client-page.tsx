'use client';

import { useUser } from "@/firebase";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Microscope } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface DoctorsClientPageProps {
    initialDoctors: Doctor[];
    initialHospitals: Hospital[];
}

export function DoctorsClientPage({ initialDoctors, initialHospitals }: DoctorsClientPageProps) {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

    // Redirect if not a system admin
    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const hospitalMap = useMemo(() => {
        return initialHospitals.reduce((acc, hospital) => {
            acc[hospital.id] = hospital.name;
            return acc;
        }, {} as Record<string, string>);
    }, [initialHospitals]);

    const openFormForEdit = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedDoctor(null);
        setIsFormOpen(true);
    }

    const onFormSubmit = (state: { type: 'success' | 'error', message: string, issues?: any }) => {
        if (state.type === 'success' || (state.type === 'error' && !state.issues)) {
            toast({
                title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
                description: state.message,
                variant: state.type === 'success' ? 'default' : 'destructive',
            });
        }
        if (state.type === 'success') {
            setIsFormOpen(false);
            setSelectedDoctor(null);
            router.refresh();
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
         if (result.type === 'success') {
            router.refresh();
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
                        <CardTitle className="flex items-center gap-2">
                            <Microscope className="h-6 w-6"/> Həkim İdarəçiliyi
                        </CardTitle>
                        <CardDescription>
                            Sistemdəki həkimləri və baş həkimləri idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                {initialDoctors.map((doctor) => (
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
                                {initialDoctors.length === 0 && (
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
                        <Button onClick={openFormForNew} disabled={initialHospitals.length === 0}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Həkim Əlavə Et
                        </Button>
                        {initialHospitals.length === 0 && (
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
                        initialData={selectedDoctor}
                        hospitals={initialHospitals}
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
