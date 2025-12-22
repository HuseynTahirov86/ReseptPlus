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
import { ClipboardList, Users, RefreshCw, UserCheck, Pill, Building, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirebase } from "@/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";

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
        inventoryCount: number;
    }
}

function DoctorDashboard({ user, stats, prescriptions, isLoading }: { user: AppUser | null, stats: any, prescriptions: Prescription[], isLoading: boolean }) {
    const userRole = user?.profile?.role;
    const welcomeMessage = user ? `Xoş gəlmisiniz, Dr. ${user.profile?.lastName || user.email}!` : "Xoş gəlmisiniz!";
    
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
             <div className="grid gap-6 md:grid-cols-3">
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
                {userRole === 'head_doctor' ? (
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
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Aktiv Xəstələr</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.patients}</div>}
                           <p className="text-xs text-muted-foreground">sizin tərəfinizdən yazılmış</p>
                        </CardContent>
                    </Card>
                )}
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
            </div>
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
                        <TableHead>Dərmanlar</TableHead>
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
                        <TableCell colSpan={5} className="text-center h-24">Heç bir resept tapılmadı.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function PharmacistDashboard({ user, stats, prescriptions, isLoading }: { user: AppUser | null, stats: any, prescriptions: Prescription[], isLoading: boolean }) {
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
                        <p className="text-xs text-muted-foreground">bu gün</p>
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
                    {/* Placeholder for recent activity table */}
                     <p className="text-sm text-muted-foreground text-center py-8">Son əməliyyatlar üçün funksionallıq hazırlanır.</p>
                </CardContent>
            </Card>
        </div>
    );
}


export function DashboardClientPage({ initialUser, initialPrescriptions, initialStats }: DashboardClientPageProps) {
  const { user: liveUser, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        if (!firestore || !liveUser?.profile) return;
        setIsLoading(true);

        const profile = liveUser.profile;
        let newStats = { ...initialStats };

        try {
            if (profile.role === 'doctor' || profile.role === 'head_doctor') {
                const presCollection = collection(firestore, "prescriptions");
                let presQuery;
                let patientQuery;

                if (profile.role === 'head_doctor' && profile.hospitalId) {
                    presQuery = query(presCollection, where("hospitalId", "==", profile.hospitalId));
                    newStats.doctors = (await getCountFromServer(collection(firestore, "doctors"))).data().count;
                } else {
                    presQuery = query(presCollection, where("doctorId", "==", liveUser.uid));
                    // Get unique patients for a specific doctor
                    const presSnapshot = await getDocs(presQuery);
                    const patientIds = [...new Set(presSnapshot.docs.map(doc => doc.data().patientId))];
                    newStats.patients = patientIds.length;
                }
                newStats.prescriptions = (await getCountFromServer(presQuery)).data().count;
            } else if (profile.role === 'employee' || profile.role === 'head_pharmacist') {
                const presCollection = collection(firestore, "prescriptions");
                const fulfilledQuery = query(presCollection, where("pharmacyId", "==", profile.pharmacyId), where("status", "==", "Təhvil verildi"));
                const pendingQuery = query(presCollection, where("pharmacyId", "==", profile.pharmacyId), where("status", "==", "Gözləmədə"));
                
                newStats.prescriptions = (await getCountFromServer(fulfilledQuery)).data().count;
                newStats.pendingPrescriptions = (await getCountFromServer(pendingQuery)).data().count;

                if (profile.role === 'head_pharmacist') {
                    const inventoryQuery = collection(firestore, `pharmacies/${profile.pharmacyId}/inventory`);
                    newStats.inventoryCount = (await getCountFromServer(inventoryQuery)).data().count;
                }
            }
        } catch (error) {
            console.error("Error fetching live stats:", error);
        }

        setStats(newStats);
        setIsLoading(false);
    };

    if (!isUserLoading) {
        fetchStats();
    }
  }, [liveUser, isUserLoading, firestore, initialStats]);


  const userRole = liveUser?.profile?.role;

  if (isUserLoading) {
      return <div><Skeleton className="w-full h-screen" /></div>
  }
  
  if (userRole === 'doctor' || userRole === 'head_doctor') {
      return <DoctorDashboard user={liveUser} stats={stats} prescriptions={initialPrescriptions} isLoading={isLoading} />;
  }
  
  if (userRole === 'employee' || userRole === 'head_pharmacist') {
      return <PharmacistDashboard user={liveUser} stats={stats} prescriptions={initialPrescriptions} isLoading={isLoading} />;
  }

  // Fallback for other roles or while loading
  return <DoctorDashboard user={liveUser} stats={stats} prescriptions={initialPrescriptions} isLoading={isLoading} />;
}
