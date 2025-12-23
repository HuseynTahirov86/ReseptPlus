'use client';

import type { ProductFeature } from "@/lib/types";
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
import { MoreHorizontal, PlusCircle, Trash2, Edit, AlertTriangle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { FeatureForm } from "./feature-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { deleteFeature } from './actions';
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

const IconComponent = ({ iconName }: { iconName: string }) => {
    const Icon = (LucideIcons as any)[iconName];
    if (!Icon) {
        return <AlertTriangle className="h-5 w-5 text-destructive" title={`İkon tapılmadı: ${iconName}`} />;
    }
    return <Icon className="h-5 w-5" />;
};

interface ProductClientPageProps {
    initialFeatures: ProductFeature[];
}

export function ProductClientPage({ initialFeatures }: ProductClientPageProps) {
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<ProductFeature | null>(null);

    const openFormForEdit = (feature: ProductFeature) => {
        setSelectedFeature(feature);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedFeature(null);
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
            setSelectedFeature(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        const result = await deleteFeature(id);
        toast({
            title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.type === 'success' ? 'default' : 'destructive',
        });
    };

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle>Məhsul Xüsusiyyətləri</CardTitle>
                        <CardDescription>
                            "Məhsulumuz" səhifəsində göstərilən xüsusiyyətləri idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>İkon</TableHead>
                                    <TableHead>Başlıq</TableHead>
                                    <TableHead>Təsvir</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialFeatures.map((feature) => (
                                    <TableRow key={feature.id}>
                                        <TableCell><IconComponent iconName={feature.icon} /></TableCell>
                                        <TableCell className="font-medium">{feature.title}</TableCell>
                                        <TableCell>{feature.description}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(feature)}>
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
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, "{feature.title}" başlıqlı xüsusiyyəti sistemdən həmişəlik siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(feature.id)} className="bg-destructive hover:bg-destructive/90">
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
                                {initialFeatures.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Heç bir xüsusiyyət tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Xüsusiyyət Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedFeature ? "Xüsusiyyəti Redaktə Et" : "Yeni Xüsusiyyət Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedFeature ? `"${selectedFeature.title}" məlumatlarını yeniləyin.` : `Yeni xüsusiyyət məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <FeatureForm 
                        initialData={selectedFeature}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
