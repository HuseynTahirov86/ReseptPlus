'use client';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Prescription, Doctor, AppUser } from "@/lib/types";
import { ClipboardList, Users, RefreshCw, UserCheck } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

interface DashboardClientPageProps {
    initialUser: AppUser | null;
    initialPrescriptions: Prescription[];
    initialStats: {
        prescriptions: number;
        patients: number;
        doctors: number;
    }
}

export function DashboardClientPage({ initialUser, initialPrescriptions, initialStats }: DashboardClientPageProps) {
  const [user, setUser] = useState(initialUser);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [stats, setStats] = useState(initialStats);
  
  const userRole = user?.profile?.role;

  const welcomeMessage = user ? `Xoş gəlmisiniz, Dr. ${user.profile?.lastName || user.email}!` : "Xoş gəlmisiniz!";
  
  const isLoading = !user; // Show skeleton if user data is not yet available

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
        <p className="text-muted-foreground">
          {userRole === 'head_doctor' 
            ? 'Xəstəxananın ümumi fəaliyyətinin xülasəsi.' 
            : 'Bugünkü fəaliyyətinizin xülasəsi.'}
        </p>
      </div>

      {userRole === 'head_doctor' ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Reseptlər</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.prescriptions}</div>}
              <p className="text-xs text-muted-foreground">bütün xəstəxana üzrə</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Xəstəxanadakı Həkimlər</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.doctors}</div>}
              <p className="text-xs text-muted-foreground">sistemdə qeydiyyatda</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Xəstələr</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.patients}</div>}
              <p className="text-xs text-muted-foreground">bütün sistem üzrə</p>
            </CardContent>
          </Card>
        </div>
      ) : (
         <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yazdığınız Reseptlər</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.prescriptions}</div>}
              <p className="text-xs text-muted-foreground">ümumi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gözləyən Təkrarlar</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Bu funksiya hazırlanır</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktiv Xəstələriniz</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">N/A</div>
              <p className="text-xs text-muted-foreground">Bu funksiya hazırlanır</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Son Reseptlər</CardTitle>
          <CardDescription>
            {userRole === 'head_doctor' 
                ? 'Xəstəxanada yazılmış ən son reseptlər.'
                : 'Ən son yazdığınız reseptlərin siyahısı.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resept ID</TableHead>
                <TableHead>Xəstə</TableHead>
                <TableHead>Tarix</TableHead>
                <TableHead>Dərman</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-[70px] ml-auto" /></TableCell>
                    </TableRow>
                ))
              )}
              {!isLoading && prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id.substring(0,8)}...</TableCell>
                  <TableCell>{p.patientName}</TableCell>
                  <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                  <TableCell>{p.medicationName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && prescriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Heç bir resept tapılmadı.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
