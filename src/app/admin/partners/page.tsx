'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { ClientCompany, SupportingOrganization } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { PartnerForm } from "./partner-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { deletePartner } from './actions';
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
} from "@/components/ui/alert-dialog"

type Partner = SupportingOrganization | ClientCompany;
type PartnerType = 'supportingOrganizations' | 'clientCompanies';

function PartnersTable({ title, data, isLoading, type }: { title: string, data: Partner[] | null, isLoading: boolean, type: PartnerType }) {
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    const openFormForEdit = (partner: Partner) => {
        setSelectedPartner(partner);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedPartner(null);
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
            setSelectedPartner(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        const result = await deletePartner(type, id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {type === 'supportingOrganizations' ? 'Sizə dəstək olan təşkilatları idarə edin.' : 'Sistemi istifadə edən müştəriləri idarə edin.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Logo</TableHead>
                                <TableHead>Ad</TableHead>
                                <TableHead>Təsvir</TableHead>
                                <TableHead className="text-right">Əməliyyatlar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Yüklənir...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && data?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Image src={item.logoUrl} alt={item.name} width={64} height={32} className="object-contain" />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openFormForEdit(item)}>
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
                                                            Bu əməliyyat geri qaytarıla bilməz. Bu, "{item.name}" adlı partnyoru sistemdən həmişəlik siləcək.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
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
                            {!isLoading && data?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Heç bir partnyor tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button onClick={openFormForNew}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Yeni Partnyor Əlavə Et
                    </Button>
                </CardFooter>
            </Card>

            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>{selectedPartner ? "Partnyoru Redaktə Et" : "Yeni Partnyor Əlavə Et"}</DialogTitle>
                    <DialogDescription>
                       {selectedPartner ? `"${selectedPartner.name}" məlumatlarını yeniləyin.` : `Yeni partnyor məlumatlarını daxil edin.`}
                    </DialogDescription>
                </DialogHeader>
                <PartnerForm 
                    partnerType={type} 
                    initialData={selectedPartner}
                    onFormSubmit={onFormSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}


export default function AdminPartnersPage() {
    const { firestore } = useFirebase();

    const supportingOrgsQuery = useMemoFirebase(() => firestore && collection(firestore, "supportingOrganizations"), [firestore]);
    const clientCompaniesQuery = useMemoFirebase(() => firestore && collection(firestore, "clientCompanies"), [firestore]);

    const { data: supportingOrganizations, isLoading: loadingSupporters } = useCollection<SupportingOrganization>(supportingOrgsQuery);
    const { data: clientCompanies, isLoading: loadingClients } = useCollection<ClientCompany>(clientCompaniesQuery);

    return (
        <div className="space-y-8">
            <PartnersTable title="Dəstəkçi Təşkilatlar" data={supportingOrganizations} isLoading={loadingSupporters} type="supportingOrganizations" />
            <PartnersTable title="Müştəri Şirkətlər" data={clientCompanies} isLoading={loadingClients} type="clientCompanies" />
        </div>
    );
}
