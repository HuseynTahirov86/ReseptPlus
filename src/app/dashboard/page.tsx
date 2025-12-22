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
import type { Prescription, Doctor, Patient } from "@/lib/types";
import { ClipboardList, Users, RefreshCw, UserCheck } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { useEffect, useState } from "react";

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function DashboardPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const userRole = user?.profile?.role;
  const userId = user?.uid;
  // Safely access hospitalId only if the profile is a Doctor type
  const hospitalId = (user?.profile as Doctor)?.hospitalId;
  
  const [stats, setStats] = useState({
      prescriptions: 0,
      patients: 0,
      doctors: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Query for prescriptions based on user role
  const prescriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !userId || !userRole) {
        return null;
    }
    
    if (userRole === 'doctor') {
        return query(collection(firestore, "prescriptions"), where("doctorId", "==", userId));
    }
    
    if (userRole === 'head_doctor') {
        // CRITICAL FIX: Only create the query if hospitalId is available.
        if (!hospitalId) return null;
        return query(collection(firestore, "prescriptions"), where("hospitalId", "==", hospitalId));
    }
    
    return null;
  }, [firestore, userId, userRole, hospitalId]); // hospitalId is now a dependency
  
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useCollection<Prescription>(prescriptionsQuery);
  
   useEffect(() => {
    const fetchStats = async () => {
      // Wait until all required data is available
      if (!firestore || isUserLoading || !userRole || !userId) return;
      if (userRole === 'head_doctor' && !hospitalId) return;

      setLoadingStats(true);
      
      try {
        let presCount = 0;
        let patientCount = 0;
        let docCount = 0;

        if (userRole === 'doctor') {
            const presQuery = query(collection(firestore, "prescriptions"), where("doctorId", "==", userId));
            presCount = (await getCountFromServer(presQuery)).data().count;
        } else if (userRole === 'head_doctor' && hospitalId) {
             const presQuery = query(collection(firestore, "prescriptions"), where("hospitalId", "==", hospitalId));
             presCount = (await getCountFromServer(presQuery)).data().count;
             
             const docQuery = query(collection(firestore, "doctors"), where("hospitalId", "==", hospitalId));
             docCount = (await getCountFromServer(docQuery)).data().count;
        }
        
        // This is still total patients in the system.
        const patientQuery = collection(firestore, "patients");
        patientCount = (await getCountFromServer(patientQuery)).data().count;
        
        setStats({
          prescriptions: presCount,
          patients: patientCount,
          doctors: docCount,
        });

      } catch (e) {
          console.error("Error fetching stats: ", e);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [firestore, userRole, userId, hospitalId, isUserLoading]);


  const welcomeMessage = user ? `Xoş gəlmisiniz, Dr. ${user.profile?.lastName || user.email}!` : "Xoş gəlmisiniz!";
  const isLoading = isLoadingPrescriptions || loadingStats || isUserLoading;

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
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.prescriptions}</div>
              <p className="text-xs text-muted-foreground">bütün xəstəxana üzrə</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Xəstəxanadakı Həkimlər</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.doctors}</div>
              <p className="text-xs text-muted-foreground">sistemdə qeydiyyatda</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Xəstələr</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.patients}</div>
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
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.prescriptions}</div>
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
              <div className="text-2xl font-bold">{isLoading ? "..." : "N/A"}</div>
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
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Məlumatlar yüklənir...</TableCell>
                </TableRow>
              )}
              {!isLoading && prescriptions?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id.substring(0,8)}...</TableCell>
                  <TableCell>{p.patientName}</TableCell>
                  <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                  <TableCell>{p.medicationName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && prescriptions?.length === 0 && (
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
