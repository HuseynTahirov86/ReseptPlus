'use client';

import { useUser, useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy } from "firebase/firestore";
import type { Prescription } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deletePrescription, type FormState } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionForm } from "./prescription-form";


const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function AdminPrescriptionsPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);

    useEffect(() => {
        if (!isUserLoading && user?.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, isUserLoading, router]);

    const prescriptionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'prescriptions'), orderBy('datePrescribed', 'desc'));
    }, [firestore]);

    const { data: prescriptions, isLoading } = useCollection<Prescription>(prescriptionsQuery);
    
    const filteredPrescriptions = useMemo(() => {
        if (!prescriptions) return [];
        return prescriptions.filter(p => 
            p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [prescriptions, searchTerm]);

    const handleEdit = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (prescription: Prescription) => {
        setPrescriptionToDelete(prescription);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!prescriptionToDelete) return;
        const result = await deletePrescription(prescriptionToDelete.id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
        setIsDeleteDialogOpen(false);
        setPrescriptionToDelete(null);
    };

    const onFormSubmit = (state: FormState) => {
        toast({
            title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: state.message,
            variant: state.type === 'success' ? 'default' : 'destructive',
        });
        if (state.type === 'success') {
            setIsFormOpen(false);
            setSelectedPrescription(null);
        }
    };


    const showLoading = isUserLoading || isLoading;
    
    if (isUserLoading || (user && user.profile?.role !== 'system_admin')) {
         return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-96 w-full" />
            </div>
         );
    }

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                            <ClipboardList /> Bütün Reseptlər
                            </div>
                            <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                    placeholder="Xəstə, həkim, diaqnoz və ya ID ilə axtar..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Sistemdə olan bütün reseptlərin siyahısı.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Xəstə</TableHead>
                                    <TableHead>Həkim</TableHead>
                                    <TableHead>Tarix</TableHead>
                                    <TableHead>Diaqnoz</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {showLoading && Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                                {!showLoading && filteredPrescriptions.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.patientName}</TableCell>
                                        <TableCell>Dr. {p.doctorName || 'Naməlum'}</TableCell>
                                        <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                        <TableCell>{p.diagnosis}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleEdit(p)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Redaktə et
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleDeleteClick(p)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!showLoading && filteredPrescriptions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            {searchTerm ? 'Axtarışa uyğun resept tapılmadı.' : 'Heç bir resept tapılmadı.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Resepti Redaktə Et</DialogTitle>
                        <DialogDescription>
                            Reseptin məlumatlarını və statusunu yeniləyin.
                        </DialogDescription>
                    </DialogHeader>
                    <PrescriptionForm
                        key={selectedPrescription?.id} 
                        initialData={selectedPrescription} 
                        onFormSubmit={onFormSubmit}
                     />
                </DialogContent>
            </Dialog>

             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz. Bu, resepti sistemdən həmişəlik siləcək.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm} 
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
