'use client';

import { useUser } from "@/firebase";
import type { Pharmacist, Pharmacy } from "@/lib/types";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Pill } from "lucide-react";
import { PharmacistForm } from "./pharmacist-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { deletePharmacist } from './actions';
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

interface PharmacistsClientPageProps {
    initialPharmacists: Pharmacist[];
    initialPharmacies: Pharmacy[];
}

export function PharmacistsClientPage({ initialPharmacists, initialPharmacies }: PharmacistsClientPageProps) {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pharmacistToDelete, setPharmacistToDelete] = useState<Pharmacist | null>(null);


    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const pharmacyMap = useMemo(() => {
        return initialPharmacies.reduce((acc, pharmacy) => {
            acc[pharmacy.id] = pharmacy.name;
            return acc;
        }, {} as Record<string, string>);
    }, [initialPharmacies]);


    const openFormForEdit = (pharmacist: Pharmacist) => {
        setSelectedPharmacist(pharmacist);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedPharmacist(null);
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
            setSelectedPharmacist(null);
            router.refresh();
        }
    }
    
     const openDeleteDialog = (pharmacist: Pharmacist) => {
        setPharmacistToDelete(pharmacist);
        setDeleteDialogOpen(true);
    }

    const handleDelete = async () => {
        if (!pharmacistToDelete) return;
        const result = await deletePharmacist(pharmacistToDelete.id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
        setDeleteDialogOpen(false);
        setPharmacistToDelete(null);
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
                        <CardTitle className="flex items-center gap-2"><Pill className="h-6 w-6"/> Əczaçı İdarəçiliyi</CardTitle>
                        <CardDescription>
                            Sistemdəki əczaçıları və baş əczaçıları idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Aptek</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialPharmacists.map((pharmacist) => (
                                    <TableRow key={pharmacist.id}>
                                        <TableCell className="font-medium">{pharmacist.firstName} {pharmacist.lastName}</TableCell>
                                        <TableCell>{pharmacist.email}</TableCell>
                                        <TableCell>{pharmacyMap[pharmacist.pharmacyId] || 'Təyin edilməyib'}</TableCell>
                                        <TableCell>
                                            <Badge variant={pharmacist.role === 'head_pharmacist' ? 'default' : 'secondary'}>
                                                {pharmacist.role === 'head_pharmacist' ? 'Baş Əczaçı' : 'Əczaçı'}
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
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(pharmacist)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Redaktə et
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onSelect={() => openDeleteDialog(pharmacist)}
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
                                {initialPharmacists.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Heç bir əczaçı tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew} disabled={initialPharmacies.length === 0}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Əczaçı Əlavə Et
                        </Button>
                         {initialPharmacies.length === 0 && <p className="text-sm text-destructive ml-4">Əczaçı əlavə etmək üçün əvvəlcə aptek yaratmalısınız.</p>}
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedPharmacist ? "Əczaçını Redaktə Et" : "Yeni Əczaçı Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedPharmacist ? `${selectedPharmacist.firstName} ${selectedPharmacist.lastName} məlumatlarını yeniləyin.` : `Yeni əczaçı məlumatlarını və giriş hesabını yaradın.`}
                        </DialogDescription>
                    </DialogHeader>
                    <PharmacistForm 
                        initialData={selectedPharmacist}
                        pharmacies={initialPharmacies}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>

             <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz. Bu, {pharmacistToDelete?.firstName} {pharmacistToDelete?.lastName} adlı əczaçını və onun giriş hesabını sistemdən həmişəlik siləcək.
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
