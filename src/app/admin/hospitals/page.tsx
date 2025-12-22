'use client';

import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Hospital } from "@/lib/types";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Building } from "lucide-react";
import { HospitalForm } from "./hospital-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { deleteHospital } from './actions';
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


export default function AdminHospitalsPage() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

    // Redirect if not a system admin
    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const hospitalsQuery = useMemoFirebase(
        () => firestore && query(collection(firestore, "hospitals"), orderBy("name")), 
        [firestore]
    );
    const { data: hospitals, isLoading } = useCollection<Hospital>(hospitalsQuery);

    const openFormForEdit = (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedHospital(null);
        setIsFormOpen(true);
    }

    const onFormSubmit = (state: { type: 'success' | 'error', message: string }) => {
        if (state.type === 'success') {
            toast({
                title: 'Uğurlu',
                description: state.message,
            });
            setIsFormOpen(false);
            setSelectedHospital(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        const result = await deleteHospital(id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };
    
     if (user?.profile?.role !== 'system_admin') {
        return null; // Or a loading/unauthorized component
    }

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6"/> Xəstəxana İdarəçiliyi</CardTitle>
                        <CardDescription>
                            Sistemdəki xəstəxanaları idarə edin. Yeni xəstəxanalar yaradın, mövcud olanları redaktə edin və ya silin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad</TableHead>
                                    <TableHead>Ünvan</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Əlaqə Nömrəsi</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Yüklənir...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && hospitals?.map((hospital) => (
                                    <TableRow key={hospital.id}>
                                        <TableCell className="font-medium">{hospital.name}</TableCell>
                                        <TableCell>{hospital.address}</TableCell>
                                        <TableCell>{hospital.email}</TableCell>
                                        <TableCell>{hospital.contactNumber}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(hospital)}>
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
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, "{hospital.name}" adlı xəstəxananı sistemdən həmişəlik siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(hospital.id)} className="bg-destructive hover:bg-destructive/90">
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
                                {!isLoading && hospitals?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Heç bir xəstəxana tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Xəstəxana Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedHospital ? "Xəstəxananı Redaktə Et" : "Yeni Xəstəxana Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedHospital ? `"${selectedHospital.name}" məlumatlarını yeniləyin.` : `Yeni xəstəxana məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <HospitalForm 
                        initialData={selectedHospital}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
