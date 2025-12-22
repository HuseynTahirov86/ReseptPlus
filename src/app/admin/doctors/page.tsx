'use client';

import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
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
import { useState, useEffect } from "react";
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

export default function AdminDoctorsPage() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    // Redirect if not a system admin
    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const doctorsQuery = useMemoFirebase(
        () => firestore && query(collection(firestore, "doctors"), orderBy("lastName")), 
        [firestore]
    );
    const { data: doctors, isLoading: loadingDoctors } = useCollection<Doctor>(doctorsQuery);

    const hospitalsQuery = useMemoFirebase(
        () => firestore && query(collection(firestore, "hospitals"), orderBy("name")),
        [firestore]
    );
    const { data: hospitals, isLoading: loadingHospitals } = useCollection<Hospital>(hospitalsQuery);

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

    const onFormSubmit = (state: { type: 'success' | 'error', message: string }) => {
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
    
     const handleDelete = async (id: string) => {
        const result = await deleteDoctor(id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };
    
     if (user?.profile?.role !== 'system_admin') {
        return null;
    }

    const isLoading = loadingDoctors || loadingHospitals;

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Microscope className="h-6 w-6"/> Həkim İdarəçiliyi</CardTitle>
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
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Yüklənir...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && doctors?.map((doctor) => (
                                    <TableRow key={doctor.id}>
                                        <TableCell className="font-medium">{doctor.firstName} {doctor.lastName}</TableCell>
                                        <TableCell>{doctor.email}</TableCell>
                                        <TableCell>{doctor.specialization}</TableCell>
                                        <TableCell>{hospitalMap[doctor.hospitalId] || 'Təyin edilməyib'}</TableCell>
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
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                             <Button variant="ghost" className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full justify-start px-2 py-1.5 text-sm h-auto relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Sil
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, Dr. {doctor.lastName} adlı həkimi və onun giriş hesabını sistemdən həmişəlik siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(doctor.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Bəli, Sil
                                                            </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
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
                    <CardFooter>
                        <Button onClick={openFormForNew} disabled={!hospitals || hospitals.length === 0}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Həkim Əlavə Et
                        </Button>
                         {(!hospitals || hospitals.length === 0) && <p className="text-sm text-destructive ml-4">Həkim əlavə etmək üçün əvvəlcə xəstəxana yaratmalısınız.</p>}
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedDoctor ? "Həkimi Redaktə Et" : "Yeni Həkim Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedDoctor ? `Dr. ${selectedDoctor.lastName} məlumatlarını yeniləyin.` : `Yeni həkim məlumatlarını və giriş hesabını yaradın.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DoctorForm 
                        initialData={selectedDoctor}
                        hospitals={hospitals || []}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
