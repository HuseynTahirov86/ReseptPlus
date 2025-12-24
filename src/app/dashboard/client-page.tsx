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
import type { Prescription, AppUser } from "@/lib/types";
import { ClipboardList, Users, RefreshCw, UserCheck, Pill, Building, Loader2, Hospital, Stethoscope, HeartPulse } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirebase } from "@/firebase";
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import Link from 'next/link';
import { MonthlyPrescriptionsChart } from './charts/monthly-prescriptions-chart';
import { DiagnosisDistributionChart } from './charts/diagnosis-distribution-chart';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

interface Stats {
    prescriptions: number;
    patients: number;
    doctors: number;
    inventoryCount: number;
    pendingPrescriptions: number;
    hospitalName?: string;
    activeMedications?: number;
}

function PatientDashboard({ user, stats, prescriptions, isLoading }: { user: AppUser | null, stats: Stats, prescriptions: Prescription[], isLoading: boolean }) {
    const welcomeMessage = user ? `Xoş gəlmisiniz, ${user.profile?.firstName || user.email}!` : "Xoş gəlmisiniz!";
    
    return (
         <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
                <p className="text-muted-foreground">
                    Səhiyyə məlumatlarınız bir yerdə.
                </p>
            </div>
             <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Aktiv Reseptlər</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.pendingPrescriptions}</div>}
                        <p className="text-xs text-muted-foreground">gözləmə rejimində</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ümumi Reseptlər</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.prescriptions}</div>}
                        <p className="text-xs text-muted-foreground">bütün tarixçəniz üzrə</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Aktiv Dərmanlar</CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.activeMedications}</div>}
                        <p className="text-xs text-muted-foreground">aktiv reseptlərinizdə</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Son Reseptləriniz</CardTitle>
                        <CardDescription>
                            Ən son yazılmış reseptlərin siyahısı.
                        </CardDescription>
                    </div>
                    <Link href="/dashboard/prescriptions" className="text-sm font-medium text-primary hover:underline">
                        Hamısına bax
                    </Link>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Diaqnoz</TableHead>
                        <TableHead>Tarix</TableHead>
                        <TableHead>Dərmanlar</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading && (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-[70px] ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    )}
                    {!isLoading && prescriptions.slice(0, 3).map((p) => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.diagnosis}</TableCell>
                            <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                            <TableCell>
                                {p.medications.map(m => m.medicationName).join(', ')}
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && prescriptions.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">Heç bir resept tapılmadı.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function DoctorDashboard({ user, stats, prescriptions, isLoading }: { user: AppUser | null, stats: Stats, prescriptions: Prescription[], isLoading: boolean }) {
    const userRole = user?.profile?.role;
    const welcomeMessage = user ? `Xoş gəlmisiniz, Dr. ${user.profile?.lastName || user.email}!` : "Xoş gəlmisiniz!";
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
                <p className="text-muted-foreground">
                {userRole === 'head_doctor' 
                    ? `${stats.hospitalName || 'Xəstəxananın'} ümumi fəaliyyətinin xülasəsi.` 
                    : 'Bugünkü fəaliyyətinizin xülasəsi.'}
                </p>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {userRole === 'head_doctor' ? 'Ümumi Reseptlər' : 'Yazdığınız Reseptlər'}
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.prescriptions}</div>}
                        <p className="text-xs text-muted-foreground">
                            {userRole === 'head_doctor' ? 'bütün xəstəxana üzrə' : 'ümumi'}
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                        {userRole === 'head_doctor' ? 'Xəstəxanadakı Həkimlər' : 'Unikal Xəstələr'}
                    </CardTitle>
                    {userRole === 'head_doctor' ? <Stethoscope className="h-4 w-4 text-muted-foreground" /> : <Users className="h-4 w-4 text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{userRole === 'head_doctor' ? stats.doctors : stats.patients}</div>}
                        <p className="text-xs text-muted-foreground">{userRole === 'head_doctor' ? 'sistemdə qeydiyyatda' : 'sizin tərəfinizdən yazılmış'}</p>
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
                    <CardTitle className="text-sm font-medium">Aktiv Xəstələr</CardTitle>
                    <HeartPulse className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.patients}</div>}
                    <p className="text-xs text-muted-foreground">hazırda müalicə alan</p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                <MonthlyPrescriptionsChart prescriptions={prescriptions} isLoading={isLoading} />
                <DiagnosisDistributionChart prescriptions={prescriptions} isLoading={isLoading} />
            </div>
        </div>
    )
}

function PharmacistDashboard({ user, stats, isLoading }: { user: AppUser | null, stats: Stats, isLoading: boolean }) {
    const userRole = user?.profile?.role;
    const welcomeMessage = user ? `Xoş gəlmisiniz, ${user.profile?.firstName || user.email}!` : "Xoş gəlmisiniz!";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
                <p className="text-muted-foreground">
                    {userRole === 'head_pharmacist' 
                        ? 'Aptekin ümumi fəaliyyətinin xülasəsi.' 
                        : 'Bugünkü fəaliyyətinizin xülasəsi.'}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Təhvil Verilən Reseptlər</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.prescriptions}</div>}
                        <p className="text-xs text-muted-foreground">bu gün (simulyasiya)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Gözləyən Reseptlər</CardTitle>
                        <Loader2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.pendingPrescriptions}</div>}
                        <p className="text-xs text-muted-foreground">hazırda sistemdə</p>
                    </CardContent>
                </Card>
                {userRole === 'head_pharmacist' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">İnventar</CardTitle>
                            <Pill className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.inventoryCount}</div>}
                            <p className="text-xs text-muted-foreground">fərqli dərman növü</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Son Əməliyyatlar</CardTitle>
                    <CardDescription>Aptekdə təhvil verilən ən son reseptlər.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground text-center py-8">Son əməliyyatlar üçün funksionallıq hazırlanır.</p>
                </CardContent>
            </Card>
        </div>
    );
}


export function DashboardClientPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const [stats, setStats] = useState<Stats>({ prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0, pendingPrescriptions: 0, activeMedications: 0 });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndPrescriptions = async () => {
        if (!firestore || !user?.profile) return;
        
        setIsLoading(true);

        const profile = user.profile;
        let newStats: Stats = { prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0, pendingPrescriptions: 0, activeMedications: 0 };
        let newPrescriptions: Prescription[] = [];

        try {
            const presCollection = collection(firestore, "prescriptions");
            if (profile.role === 'doctor' || profile.role === 'head_doctor') {
                let presQuery;
                 if (profile.role === 'head_doctor' && profile.hospitalId) {
                    presQuery = query(presCollection, where("hospitalId", "==", profile.hospitalId));
                    const hospitalDoctorsQuery = query(collection(firestore, "doctors"), where("hospitalId", "==", profile.hospitalId));
                    newStats.doctors = (await getCountFromServer(hospitalDoctorsQuery)).data().count;
                } else {
                    presQuery = query(presCollection, where("doctorId", "==", user.uid));
                }

                const presSnapshot = await getDocs(presQuery);
                newPrescriptions = presSnapshot.docs.map(doc => doc.data() as Prescription).sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime());
                newStats.prescriptions = newPrescriptions.length;
                
                const patientIds = [...new Set(newPrescriptions.map(doc => doc.patientId))];
                newStats.patients = patientIds.length;

            } else if (profile.role === 'employee' || profile.role === 'head_pharmacist') {
                if (profile.pharmacyId) {
                    const fulfilledQuery = query(presCollection, where("pharmacyId", "==", profile.pharmacyId), where("status", "==", "Təhvil verildi"));
                    const pendingQuery = query(presCollection, where("pharmacyId", "==", profile.pharmacyId), where("status", "==", "Gözləmədə"));
                    
                    newStats.prescriptions = (await getCountFromServer(fulfilledQuery)).data().count; // Simulating "today" for now
                    newStats.pendingPrescriptions = (await getCountFromServer(pendingQuery)).data().count;

                    if (profile.role === 'head_pharmacist') {
                        const inventoryQuery = collection(firestore, `pharmacies/${profile.pharmacyId}/inventory`);
                        newStats.inventoryCount = (await getCountFromServer(inventoryQuery)).data().count;
                    }
                }
            } else if (profile.role === 'patient') {
                const presQuery = query(presCollection, where("patientId", "==", user.uid));
                const pendingQuery = query(presQuery, where("status", "==", "Gözləmədə"));
                
                const presSnapshot = await getDocs(presQuery);
                newPrescriptions = presSnapshot.docs.map(doc => doc.data() as Prescription).sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime());

                newStats.prescriptions = newPrescriptions.length;
                newStats.pendingPrescriptions = (await getCountFromServer(pendingQuery)).data().count;
                
                const activeMeds = new Set<string>();
                newPrescriptions.filter(p => p.status === 'Gözləmədə').forEach(p => {
                    p.medications.forEach(med => activeMeds.add(med.medicationName));
                });
                newStats.activeMedications = activeMeds.size;
            }
        } catch (error) {
            console.error("Error fetching live stats:", error);
        }

        setStats(newStats);
        setPrescriptions(newPrescriptions);
        setIsLoading(false);
    };

    if (!isUserLoading && user) {
        fetchStatsAndPrescriptions();
    } else if (!isUserLoading && !user) {
        setIsLoading(false);
    }
  }, [user, isUserLoading, firestore]);


  const userRole = user?.profile?.role;

  if (isUserLoading || !user) {
      return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-10 w-1/2 mb-2"/>
                <Skeleton className="h-5 w-3/4"/>
            </div>
             <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-28 w-full"/>
                <Skeleton className="h-28 w-full"/>
                <Skeleton className="h-28 w-full"/>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3"/>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full"/>
                </CardContent>
            </Card>
        </div>
      )
  }
  
  if (userRole === 'doctor' || userRole === 'head_doctor') {
      return <DoctorDashboard user={user} stats={stats} prescriptions={prescriptions} isLoading={isLoading} />;
  }
  
  if (userRole === 'employee' || userRole === 'head_pharmacist') {
      return <PharmacistDashboard user={user} stats={stats} isLoading={isLoading} />;
  }

  if (userRole === 'patient') {
      return <PatientDashboard user={user} stats={stats} prescriptions={prescriptions} isLoading={isLoading} />;
  }

  // Fallback for other roles or while loading
  return <div><h1 className="text-2xl">Panelə Xoş Gəlmisiniz!</h1><p>Rolunuz üçün xüsusi panel hazırlanır.</p></div>;
}
