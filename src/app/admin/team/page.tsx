'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react";
import { TeamMemberForm } from "./team-member-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { deleteTeamMember } from './actions';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";


function MemberSkeleton() {
    return (
        <Card className="flex flex-col items-center p-4 text-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="mt-4 w-full space-y-2">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
             <div className="mt-4 w-full">
                <Skeleton className="h-8 w-full" />
            </div>
        </Card>
    );
}


export default function AdminTeamPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const teamQuery = useMemoFirebase(
        () => firestore && query(collection(firestore, "teamMembers"), orderBy("name")), 
        [firestore]
    );
    const { data: members, isLoading } = useCollection<TeamMember>(teamQuery);

    const openFormForEdit = (member: TeamMember) => {
        setSelectedMember(member);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedMember(null);
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
            setSelectedMember(null);
        }
    }
    
     const handleDelete = async (id: string) => {
        const result = await deleteTeamMember(id);
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
                        <CardTitle>Komanda Üzvləri</CardTitle>
                        <CardDescription>
                            "Haqqımızda" səhifəsində göstərilən komanda üzvlərini idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {isLoading && Array.from({length: 4}).map((_, i) => <MemberSkeleton key={i}/>)}
                            {!isLoading && members?.map((member) => (
                                <Card key={member.id} className="flex flex-col items-center p-4 text-center">
                                    <Avatar className="h-24 w-24 mb-4 border-2 border-muted">
                                        <AvatarImage src={member.imageUrl} alt={member.name} data-ai-hint={member.imageHint} />
                                        <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold">{member.name}</h3>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild className="mt-4">
                                            <Button variant="outline" className="w-full">
                                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                                İdarə et
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onSelect={() => openFormForEdit(member)}>
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
                                                        Bu əməliyyat geri qaytarıla bilməz. Bu, "{member.name}" adlı üzvü sistemdən həmişəlik siləcək.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Bəli, Sil
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </Card>
                            ))}
                            {!isLoading && members?.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-muted-foreground">Heç bir komanda üzvü tapılmadı.</p>
                                </div>
                            )}
                       </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Üzv Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedMember ? "Üzvü Redaktə Et" : "Yeni Üzv Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedMember ? `"${selectedMember.name}" məlumatlarını yeniləyin.` : `Yeni üzv məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <TeamMemberForm 
                        initialData={selectedMember}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
