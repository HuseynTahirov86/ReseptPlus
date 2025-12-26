'use client';

import { useUser, useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Pill, Download } from "lucide-react";
import { MedicationForm } from "./medication-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { deleteMedication } from './actions';
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
import { Inventory } from "@/lib/types";
import { collection, orderBy, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/utils";

export function InventoryClientPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<Inventory | null>(null);

    const { firestore } = useFirebase();

    const pharmacyId = user?.profile?.pharmacyId;

    const inventoryQuery = useMemoFirebase(() => {
        if (!firestore || !pharmacyId) return null;
        return query(collection(firestore, `pharmacies/${pharmacyId}/inventory`), orderBy("name"));
    }, [firestore, pharmacyId]);

    const { data: medications, isLoading } = useCollection<Inventory>(inventoryQuery);

    useEffect(() => {
        if (user && user.profile?.role !== 'head_pharmacist') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const openFormForEdit = (med: Inventory) => {
        setSelectedMed(med);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedMed(null);
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
            setSelectedMed(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        if(!user?.profile?.pharmacyId) return;
        const result = await deleteMedication(user.profile.pharmacyId, id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };
    
    const handleExport = () => {
        if (medications) {
            const dataToExport = medications.map(m => ({
                id: m.id,
                ad: m.name,
                doza: m.dosage,
                vahid: m.unit,
                forma: m.form,
                miqdar: m.quantity,
                son_istifade: m.expirationDate,
            }));
            exportToCsv(dataToExport, 'aptek_inventari');
        }
    };

     if (user?.profile?.role !== 'head_pharmacist') {
        return null;
    }

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                             <CardTitle className="flex items-center gap-2"><Pill className="h-6 w-6"/> Aptek İnventarı</CardTitle>
                             <Button variant="outline" size="sm" onClick={handleExport} disabled={!medications || medications.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                Məlumatları CSV olaraq ixrac et
                            </Button>
                        </div>
                        <CardDescription>
                            Aptekinizdə olan dərmanları və onların miqdarını idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ad</TableHead>
                                    <TableHead>Doza</TableHead>
                                    <TableHead>Miqdar</TableHead>
                                    <TableHead>İstifadə Müddəti</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && Array.from({length: 4}).map((_, i) => (
                                     <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {medications?.map((med) => (
                                    <TableRow key={med.id}>
                                        <TableCell className="font-medium">{med.name}</TableCell>
                                        <TableCell>{med.dosage} {med.unit}</TableCell>
                                        <TableCell>{med.quantity}</TableCell>
                                        <TableCell>{new Date(med.expirationDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(med)}>
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
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, "{med.name}" dərmanını inventardan siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(med.id)} className="bg-destructive hover:bg-destructive/90">
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
                                {!isLoading && medications?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            İnventarda heç bir dərman tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Dərman Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedMed ? "Dərmanı Redaktə Et" : "Yeni Dərman Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedMed ? `"${selectedMed.name}" məlumatlarını yeniləyin.` : `Yeni dərman məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    {user?.profile?.pharmacyId && (
                         <MedicationForm
                            pharmacyId={user.profile.pharmacyId}
                            initialData={selectedMed}
                            onFormSubmit={onFormSubmit}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
