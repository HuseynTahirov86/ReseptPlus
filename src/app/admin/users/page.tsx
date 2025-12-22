'use client';

import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Admin, SystemAdmin } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, ShieldAlert, Users, UserCog } from "lucide-react";
import { UserForm } from "./user-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { deleteUser } from './actions';
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

type UserType = Admin | SystemAdmin;
type UserRole = 'admin' | 'system_admin';

function UsersTable({ title, icon, data, isLoading, type, currentUser }: { title: string, icon: React.ReactNode, data: UserType[] | null, isLoading: boolean, type: UserRole, currentUser: any }) {
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const onFormSubmit = (state: { type: 'success' | 'error', message: string }) => {
        toast({
            title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: state.message,
            variant: state.type === 'success' ? 'default' : 'destructive',
        });
        if (state.type === 'success') {
            setIsFormOpen(false);
        }
    }
    
    const handleDelete = async (id: string) => {
        const result = await deleteUser(type, id);
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
                    <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Hesab ID</TableHead>
                                <TableHead className="text-right">Əməliyyatlar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Yüklənir...</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && data?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                    disabled={user.id === currentUser.uid}
                                                    title={user.id === currentUser.uid ? "Öz hesabınızı silə bilməzsiniz" : "İstifadəçini sil"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bu əməliyyat geri qaytarıla bilməz. Bu, "{user.email}" emailinə sahib admini və onun giriş hesabını sistemdən həmişəlik siləcək.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Bəli, Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && data?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Heç bir istifadəçi tapılmadı.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Yeni {type === 'admin' ? 'Sayt Admini' : 'Sistem Admini'} Əlavə Et
                    </Button>
                </CardFooter>
            </Card>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Admin Yarat</DialogTitle>
                    <DialogDescription>
                        Yeni {type === 'admin' ? 'Sayt Admini' : 'Sistem Admini'} üçün məlumatları daxil edin.
                    </DialogDescription>
                </DialogHeader>
                <UserForm role={type} onFormSubmit={onFormSubmit} />
            </DialogContent>
        </Dialog>
    );
}

export default function AdminUsersPage() {
    const { firestore } = useFirebase();
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user && user.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, isUserLoading, router]);

    const adminsQuery = useMemoFirebase(() => firestore && query(collection(firestore, "admins"), orderBy("email")), [firestore]);
    const systemAdminsQuery = useMemoFirebase(() => firestore && query(collection(firestore, "systemAdmins"), orderBy("email")), [firestore]);

    const { data: admins, isLoading: loadingAdmins } = useCollection<Admin>(adminsQuery);
    const { data: systemAdmins, isLoading: loadingSystemAdmins } = useCollection<SystemAdmin>(systemAdminsQuery);

    if (isUserLoading || user?.profile?.role !== 'system_admin') {
        return null;
    }

    return (
        <div className="space-y-8">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Users className="w-8 h-8"/>İstifadəçi İdarəçiliyi</h1>
                <p className="text-muted-foreground">
                    Sistem və sayt adminlərini idarə edin.
                </p>
            </div>
            <UsersTable 
                title="Sayt Adminləri"
                icon={<UserCog className="w-5 h-5 text-muted-foreground"/>}
                data={admins} 
                isLoading={loadingAdmins} 
                type="admin"
                currentUser={user}
            />
            <UsersTable 
                title="Sistem Adminləri"
                icon={<ShieldAlert className="w-5 h-5 text-muted-foreground"/>}
                data={systemAdmins} 
                isLoading={loadingSystemAdmins} 
                type="system_admin"
                currentUser={user}
            />
        </div>
    );
}
