'use client';

import { useUser, useCollection, useFirebase, useMemoFirebase } from "@/firebase";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, Pill, Download } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/utils";

export function PharmacistsClientPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pharmacistToDelete, setPharmacistToDelete] = useState<Pharmacist | null>(null);

    const { firestore } = useFirebase();

    const pharmacistsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "pharmacists"), orderBy("lastName"));
    }, [firestore]);

    const pharmaciesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "pharmacies"), orderBy("name"));
    }, [firestore]);

    const { data: pharmacists, isLoading: isLoadingPharmacists } = useCollection<Pharmacist>(pharmacistsQuery);
    const { data: pharmacies, isLoading: isLoadingPharmacies } = useCollection<Pharmacy>(pharmaciesQuery);


    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const pharmacyMap = useMemo(() => {
        if (!pharmacies) return {};
        return pharmacies.reduce((acc, pharmacy) => {
            acc[pharmacy.id] = pharmacy.name;
            return acc;
        }, {} as Record<string, string>);
    }, [pharmacies]);


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
    };

    const handleExport = () => {
        if (pharmacists) {
            const dataToExport = pharmacists.map(p => ({
                id: p.id,
                ad: p.firstName,
                soyad: p.lastName,
                email: p.email,
                aptek: pharmacyMap[p.pharmacyId] || 'Təyin edilməyib',
                rol: p.role === 'head_pharmacist' ? 'Baş Əczaçı' : 'Əczaçı',
            }));
            exportToCsv(dataToExport, 'eczacilar');
        }
    };
    
    if (user?.profile?.role !== 'system_admin') {
        return null;
    }
    
    const isLoading = isLoadingPharmacists || isLoadingPharmacies;

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Pill className="h-6 w-6"/> Əczaçı İdarəçiliyi</CardTitle>
                             <Button variant="outline" size="sm" onClick={handleExport} disabled={!pharmacists || pharmacists.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Məlumatları CSV olaraq ixrac et
                            </Button>
                        </div>
                        <CardDescription>
                            Sistemdəki əczaçıları və baş əczaçıları idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
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
                                {isLoading && Array.from({length: 3}).map((_, i) => (
                                     <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {pharmacists?.map((pharmacist) => (
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
                                {!isLoading && pharmacists?.length === 0 && (
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
                        <Button onClick={openFormForNew} disabled={!pharmacies || pharmacies.length === 0}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Əczaçı Əlavə Et
                        </Button>
                         {(!pharmacies || pharmacies.length === 0) && <p className="text-sm text-destructive ml-4">Əczaçı əlavə etmək üçün əvvəlcə aptek yaratmalısınız.</p>}
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
                        key={selectedPharmacist?.id || 'new'}
                        initialData={selectedPharmacist}
                        pharmacies={pharmacies || []}
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
