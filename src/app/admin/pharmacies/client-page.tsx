'use client';

import { useUser, useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { Pharmacy } from "@/lib/types";
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
import { PharmacyForm } from "./pharmacy-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { deletePharmacy } from './actions';
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
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


export function PharmaciesClientPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

    const { firestore } = useFirebase();
    const pharmaciesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "pharmacies"), orderBy("name"));
    }, [firestore]);

    const { data: pharmacies, isLoading } = useCollection<Pharmacy>(pharmaciesQuery);

    useEffect(() => {
        if (user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const openFormForEdit = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedPharmacy(null);
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
            setSelectedPharmacy(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        const result = await deletePharmacy(id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };
    
     if (user?.profile?.role !== 'system_admin') {
        return null;
    }

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6"/> Aptek İdarəçiliyi</CardTitle>
                        <CardDescription>
                            Sistemdəki aptekləri idarə edin. Yenilərini yaradın, mövcud olanları redaktə edin və ya silin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
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
                                {isLoading && Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {pharmacies?.map((pharmacy) => (
                                    <TableRow key={pharmacy.id}>
                                        <TableCell className="font-medium">{pharmacy.name}</TableCell>
                                        <TableCell>{pharmacy.address}</TableCell>
                                        <TableCell>{pharmacy.email}</TableCell>
                                        <TableCell>{pharmacy.contactNumber}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(pharmacy)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Redaktə et
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                             <button className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full justify-start px-2 py-1.5 text-sm h-auto relative flex cursor-pointer select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Sil
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, "{pharmacy.name}" adlı apteki sistemdən həmişəlik siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(pharmacy.id)} className="bg-destructive hover:bg-destructive/90">
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
                                {!isLoading && pharmacies?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Heç bir aptek tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Aptek Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedPharmacy ? "Apteki Redaktə Et" : "Yeni Aptek Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedPharmacy ? `"${selectedPharmacy.name}" məlumatlarını yeniləyin.` : `Yeni aptek məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <PharmacyForm 
                        initialData={selectedPharmacy}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
