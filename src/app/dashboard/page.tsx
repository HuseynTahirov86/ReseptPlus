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
import type { Prescription } from "@/lib/types";
import { ClipboardList, Users, RefreshCw, UserCheck } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function DashboardPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const userRole = user?.profile?.role;
  const hospitalId = (user?.profile as any)?.hospitalId;

  // Query for prescriptions based on user role
  const prescriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;

    // Head doctor sees prescriptions from all doctors in their hospital
    if (userRole === 'head_doctor' && hospitalId) {
        // This assumes that prescriptions will have a 'hospitalId' field denormalized.
        // For now, let's query by the current user's prescriptions as a fallback.
        // A more robust solution would be a separate query logic for head_doctor.
        // We will default to showing only their own prescriptions to avoid complex queries for now.
        return query(collection(firestore, "prescriptions"), where("doctorId", "==", user.uid));
    }
    
    // Regular doctor sees only their own prescriptions
    return query(collection(firestore, "prescriptions"), where("doctorId", "==", user.uid));
  }, [firestore, user?.uid, userRole, hospitalId]);
  

  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useCollection<Prescription>(prescriptionsQuery);
  
  // Example query for patients - adjust as needed
  const patientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "patients");
  }, [firestore]);
  const { data: patients, isLoading: isLoadingPatients } = useCollection(patientsQuery);
  
  const doctorsQuery = useMemoFirebase(() => {
      if(!firestore || !hospitalId) return null;
      return query(collection(firestore, "doctors"), where("hospitalId", "==", hospitalId));
  }, [firestore, hospitalId]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection(doctorsQuery);

  const welcomeMessage = user ? `Xoş gəlmisiniz, Dr. ${user.profile?.lastName || user.email}!` : "Xoş gəlmisiniz!";
  const isLoading = isLoadingPrescriptions || isLoadingPatients || isLoadingDoctors;

  const totalPrescriptions = prescriptions?.length || 0;
  const totalPatients = patients?.length || 0; // This is total system patients, needs refinement
  const totalDoctors = doctors?.length || 0;

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
              <div className="text-2xl font-bold">{isLoading ? "..." : totalPrescriptions}</div>
              <p className="text-xs text-muted-foreground">bütün xəstəxana üzrə (placeholder)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Xəstəxanadakı Həkimlər</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalDoctors}</div>
              <p className="text-xs text-muted-foreground">sistemdə qeydiyyatda</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Xəstələr</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : totalPatients}</div>
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
              <div className="text-2xl font-bold">{isLoading ? "..." : totalPrescriptions}</div>
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
