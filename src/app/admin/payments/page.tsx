'use client';

import { useUser, useFirebase, useMemoFirebase, useCollection } from "@/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy } from "firebase/firestore";
import type { Hospital, Pharmacy } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Wallet, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { updateOrganizationStatus } from "./actions";

type Organization = Hospital & { paymentStatus?: string };

const statusConfig = {
    'Aktiv': { variant: 'default', icon: CheckCircle, label: 'Aktiv' },
    'Sınaq Müddəti': { variant: 'secondary', icon: Clock, label: 'Sınaq' },
    'Ödəniş Gözlənilir': { variant: 'destructive', icon: AlertTriangle, label: 'Gözləyir' },
    'Deaktiv': { variant: 'outline', icon: XCircle, label: 'Deaktiv' },
} as const;

type StatusKey = keyof typeof statusConfig;

function OrganizationsTable({
    title,
    collectionName,
    paymentModel
}: {
    title: string;
    collectionName: 'hospitals' | 'pharmacies';
    paymentModel: string;
}) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();

    const orgsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, collectionName), orderBy("name"));
    }, [firestore, collectionName]);

    const { data: organizations, isLoading } = useCollection<Organization>(orgsQuery);

    const handleStatusChange = async (id: string, newStatus: StatusKey) => {
        const result = await updateOrganizationStatus(collectionName, id, newStatus);
        toast({
            title: result.success ? 'Uğurlu' : 'Xəta',
            description: result.message,
            variant: result.success ? 'default' : 'destructive'
        });
        if (result.success) {
            router.refresh();
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {collectionName === 'hospitals' ? 'Xəstəxanaların abunəlik statusları.' : 'Apteklərin ödəniş statusları.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ödəniş Modeli</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Əməliyyatlar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 2 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && organizations?.map((org) => {
                            const currentStatusKey = (org.paymentStatus as StatusKey) || 'Sınaq Müddəti';
                            const currentStatus = statusConfig[currentStatusKey];
                            
                            return (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{paymentModel}</TableCell>
                                    <TableCell>
                                        <Badge variant={currentStatus.variant}>
                                            <currentStatus.icon className="mr-2 h-4 w-4" />
                                            {currentStatus.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {Object.keys(statusConfig).map(statusKey => {
                                                    const status = statusConfig[statusKey as StatusKey];
                                                    return (
                                                         <DropdownMenuItem key={statusKey} onSelect={() => handleStatusChange(org.id, statusKey as StatusKey)}>
                                                            <status.icon className="mr-2 h-4 w-4" />
                                                            Statusu dəyiş: {status.label}
                                                        </DropdownMenuItem>
                                                    )
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                         {!isLoading && organizations?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Heç bir qurum tapılmadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function PaymentsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user?.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user?.profile?.role !== 'system_admin') {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Wallet className="w-8 h-8"/> Ödənişlər və Abunəliklər
                </h1>
                <p className="text-muted-foreground mt-2">
                    Xəstəxanaların və apteklərin abunəlik statuslarını idarə edin.
                </p>
            </div>
            
            <OrganizationsTable 
                title="Xəstəxana Abunəlikləri"
                collectionName="hospitals"
                paymentModel="Ayda 20 AZN (+50 AZN ilkin)"
            />

            <OrganizationsTable 
                title="Aptek Ödənişləri"
                collectionName="pharmacies"
                paymentModel="Hər reseptdən 3%"
            />
        </div>
    );
}
