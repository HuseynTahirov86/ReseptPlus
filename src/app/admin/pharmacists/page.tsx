'use client';

import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
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

export default function AdminPharmacistsPage() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);

    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const pharmacistsQuery = useMemoFirebase(
        () => firestore && query(collection(firestore, "pharmacists"), orderBy("lastName")), 
        [firestore]
    );
    const { data: pharmacists, isLoading: loadingPharmacists } = useCollection<Pharmacist>(pharmacistsQuery);

    const pharmaciesQuery = useMemoFirebase(
        () => firestore && query(collection(firestore, "pharmacies"), orderBy("name")),
        [firestore]
    );
    const { data: pharmacies, isLoading: loadingPharmacies } = useCollection<Pharmacy>(pharmaciesQuery);

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

    const onFormSubmit = (state: { type: 'success' | 'error', message: string }) => {
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
    
     const handleDelete = async (id: string) => {
        const result = await deletePharmacist(id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };
    
     if (user?.profile?.role !== 'system_admin') {
        return null;
    }

    const isLoading = loadingPharmacists || loadingPharmacies;

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
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Yüklənir...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && pharmacists?.map((pharmacist) => (
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
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, {pharmacist.firstName} {pharmacist.lastName} adlı əczaçını və onun giriş hesabını sistemdən həmişəlik siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(pharmacist.id)} className="bg-destructive hover:bg-destructive/90">
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
                        initialData={selectedPharmacist}
                        pharmacies={pharmacies || []}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
