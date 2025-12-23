'use client';

import type { PricingPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Check, BadgeInfo } from "lucide-react";
import { PlanForm } from "./plan-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { deletePlan } from './actions';
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
import { Badge } from "@/components/ui/badge";

interface PricingClientPageProps {
    initialPlans: PricingPlan[];
}

export function PricingClientPage({ initialPlans }: PricingClientPageProps) {
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

    const openFormForEdit = (plan: PricingPlan) => {
        setSelectedPlan(plan);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedPlan(null);
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
            setSelectedPlan(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        const result = await deletePlan(id);
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
                        <CardTitle>Qiymət Planları</CardTitle>
                        <CardDescription>
                            Marketinq saytındakı qiymət planlarını idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                         {initialPlans.map((plan) => (
                              <Card key={plan.id} className={plan.isPopular ? "border-primary border-2 relative" : ""}>
                                {plan.isPopular && <Badge className="absolute top-0 right-4 -mt-3">POPULYAR</Badge>}
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start">
                                        {plan.title}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openFormForEdit(plan)}>
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
                                                            Bu əməliyyat geri qaytarıla bilməz. Bu, "{plan.title}" planını sistemdən həmişəlik siləcək.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(plan.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Bəli, Sil
                                                        </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardTitle>
                                    <div className="flex items-baseline gap-2 pt-2">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
))}
                                    </ul>
                                </CardContent>
                            </Card>
                         ))}
                         {initialPlans.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <BadgeInfo className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Heç bir plan tapılmadı.</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Başlamaq üçün yeni bir qiymət planı əlavə edin.</p>
                            </div>
                        )}
                       </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Plan Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedPlan ? "Planı Redaktə Et" : "Yeni Plan Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedPlan ? `"${selectedPlan.title}" məlumatlarını yeniləyin.` : `Yeni plan məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <PlanForm 
                        initialData={selectedPlan}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
