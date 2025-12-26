'use client';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import type { Prescription, AppUser, Doctor, DoctorFeedback } from "@/lib/types";
import { ClipboardList, Users, RefreshCw, Pill, Loader2, Hospital, Stethoscope, Star, Wallet, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirebase } from "@/firebase";
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy, collectionGroup, doc, getDoc } from "firebase/firestore";
import Link from 'next/link';
import { MonthlyPrescriptionsChart } from './charts/monthly-prescriptions-chart';
import { DiagnosisDistributionChart } from './charts/diagnosis-distribution-chart';
import { Button } from "@/components/ui/button";

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
    pendingPrescriptionsCount: number;
    activeMedications?: number;
    todayPrescriptions?: number;
    todayPatients?: number;
    averageRating?: number;
    todayFulfilledCount: number;
    todayFulfilledRevenue: number;
    pendingPrescriptionsRevenue: number;
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
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.pendingPrescriptionsCount}</div>}
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
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Rəy</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading && (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-[70px]" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
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
                            <TableCell>
                                <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/dashboard/prescriptions/feedback?prescriptionId=${p.id}`}>
                                        <Star className="mr-2 h-4 w-4" /> Rəy Bildir
                                    </Link>
                                </Button>
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

function DoctorDashboard({ user, stats, prescriptions, isLoading }: { user: AppUser | null, stats: Stats, prescriptions: Prescription[], isLoading: boolean }) {
    const userRole = user?.profile?.role;
    const welcomeMessage = user ? `Xoş gəlmisiniz, Dr. ${user.profile?.lastName || user.email}!` : "Xoş gəlmisiniz!";
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
                <p className="text-muted-foreground">
                {userRole === 'head_doctor' 
                    ? `${user.profile.hospitalName || 'Xəstəxananın'} ümumi fəaliyyətinin xülasəsi.` 
                    : 'Bugünkü fəaliyyətinizin xülasəsi.'}
                </p>
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Bu Gün Yazılan Reseptlər</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.todayPrescriptions}</div>}
                        <p className="text-xs text-muted-foreground">
                            {userRole === 'head_doctor' ? 'bütün xəstəxana üzrə' : 'sizin tərəfinizdən'}
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Bu Gün Baxılan Xəstələr</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.todayPatients}</div>}
                        <p className="text-xs text-muted-foreground">{userRole === 'head_doctor' ? 'unikal xəstə sayı' : 'sizin tərəfinizdən'}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ümumi Reytinq</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || 'N/A'}</div>}
                        <p className="text-xs text-muted-foreground">xəstə rəyləri əsasında</p>
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
            </div>
             <div className="grid gap-6 lg:grid-cols-2">
                <MonthlyPrescriptionsChart prescriptions={prescriptions} isLoading={isLoading} />
                <DiagnosisDistributionChart prescriptions={prescriptions} isLoading={isLoading} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Son Reseptlər</CardTitle>
                    <CardDescription>Yazdığınız ən son 5 resept.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Xəstə</TableHead>
                                <TableHead>Tarix</TableHead>
                                <TableHead>Diaqnoz</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-6 w-20 rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                prescriptions.slice(0, 5).map(p => (
                                     <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.patientName}</TableCell>
                                        <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                        <TableCell>{p.diagnosis}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                             {!isLoading && prescriptions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Heç bir resept tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/prescriptions">Bütün Reseptlərə Bax</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function PharmacistDashboard({ user, stats, prescriptions, isLoading }: { user: AppUser | null, stats: Stats, prescriptions: Prescription[], isLoading: boolean }) {
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Bu Gün Təhvil Verilən</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.todayFulfilledCount}</div>}
                        <p className="text-xs text-muted-foreground">
                            {isLoading ? <Skeleton className="h-4 w-24"/> : `+${stats.todayFulfilledRevenue.toFixed(2)} AZN gəlir`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Gözləyən Reseptlər</CardTitle>
                        <Loader2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-20 mb-1"/> : <div className="text-2xl font-bold">{stats.pendingPrescriptionsCount}</div>}
                         <p className="text-xs text-muted-foreground">
                            {isLoading ? <Skeleton className="h-4 w-24"/> : `~${stats.pendingPrescriptionsRevenue.toFixed(2)} AZN gözlənilən gəlir`}
                        </p>
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
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ümumi Gəlir (Ay)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.00 <span className="text-sm">AZN</span></div>
                        <p className="text-xs text-muted-foreground">Bu funksiya hazırlanır</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Son Əməliyyatlar</CardTitle>
                    <CardDescription>Aptekdə təhvil verilən ən son 5 resept.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Xəstə</TableHead>
                                <TableHead>Həkim</TableHead>
                                <TableHead>Tarix</TableHead>
                                <TableHead className="text-right">Məbləğ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                prescriptions
                                    .filter(p => p.status === 'Təhvil verildi')
                                    .slice(0, 5)
                                    .map(p => (
                                     <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.patientName}</TableCell>
                                        <TableCell>Dr. {p.doctorName}</TableCell>
                                        <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right font-mono">{p.totalCost?.toFixed(2)} AZN</TableCell>
                                    </TableRow>
                                ))
                            )}
                             {!isLoading && prescriptions.filter(p => p.status === 'Təhvil verildi').length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Heç bir təhvil verilmiş resept tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}


export function DashboardClientPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const [stats, setStats] = useState<Stats>({ prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0, pendingPrescriptionsCount: 0, activeMedications: 0, todayPrescriptions: 0, todayPatients: 0, averageRating: 0, todayFulfilledCount: 0, todayFulfilledRevenue: 0, pendingPrescriptionsRevenue: 0 });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndPrescriptions = async () => {
        if (!firestore || !user?.profile) return;
        
        setIsLoading(true);

        const profile = user.profile;
        let newStats: Stats = { prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0, pendingPrescriptionsCount: 0, activeMedications: 0, todayPrescriptions: 0, todayPatients: 0, averageRating: 0, todayFulfilledCount: 0, todayFulfilledRevenue: 0, pendingPrescriptionsRevenue: 0 };
        let newPrescriptions: Prescription[] = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        try {
            const presCollection = collection(firestore, "prescriptions");
            if (profile.role === 'doctor' || profile.role === 'head_doctor') {
                let presQuery, feedbackQuery, doctorsQuery;
                
                if (profile.role === 'head_doctor' && profile.hospitalId) {
                    presQuery = query(presCollection, where("hospitalId", "==", profile.hospitalId));
                    doctorsQuery = query(collection(firestore, "doctors"), where("hospitalId", "==", profile.hospitalId));
                    
                    const hospitalDoctorsSnapshot = await getDocs(doctorsQuery);
                    const hospitalDoctors = hospitalDoctorsSnapshot.docs.map(d => d.data());
                    newStats.doctors = hospitalDoctors.length;

                    // Fetch hospital name
                    const hospitalDoc = await getDoc(doc(firestore, `hospitals/${profile.hospitalId}`));
                    if(hospitalDoc.exists()) {
                       profile.hospitalName = hospitalDoc.data().name;
                    }


                    const hospitalDoctorIds = hospitalDoctors.map(d => d.id);
                    if (hospitalDoctorIds.length > 0) {
                        feedbackQuery = query(collectionGroup(firestore, 'feedback'), where('doctorId', 'in', hospitalDoctorIds));
                    }
                } else {
                    presQuery = query(presCollection, where("doctorId", "==", user.uid));
                    feedbackQuery = query(collection(firestore, `doctors/${user.uid}/feedback`));
                }

                const presSnapshot = await getDocs(presQuery);
                newPrescriptions = presSnapshot.docs.map(doc => doc.data() as Prescription).sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime());
                newStats.prescriptions = newPrescriptions.length;
                
                const patientIds = [...new Set(newPrescriptions.map(doc => doc.patientId))];
                newStats.patients = patientIds.length;

                newStats.todayPrescriptions = newPrescriptions.filter(p => p.datePrescribed >= todayISO).length;
                newStats.todayPatients = [...new Set(newPrescriptions.filter(p => p.datePrescribed >= todayISO).map(p => p.patientId))].length;

                // Calculate average rating
                if (feedbackQuery) {
                    const feedbackSnapshot = await getDocs(feedbackQuery);
                    const feedbacks = feedbackSnapshot.docs.map(doc => doc.data() as DoctorFeedback);
                    if (feedbacks.length > 0) {
                        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
                        newStats.averageRating = totalRating / feedbacks.length;
                    } else {
                        newStats.averageRating = 0;
                    }
                }

            } else if (profile.role === 'employee' || profile.role === 'head_pharmacist') {
                if (profile.pharmacyId) {
                    const presQuery = query(presCollection, where("pharmacyId", "==", profile.pharmacyId));
                    const presSnapshot = await getDocs(presQuery);
                    newPrescriptions = presSnapshot.docs.map(doc => doc.data() as Prescription).sort((a, b) => new Date(b.datePrescribed).getTime() - new Date(a.datePrescribed).getTime());
                    
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);

                    const fulfilledToday = newPrescriptions.filter(p => p.status === 'Təhvil verildi' && p.dateFulfilled && new Date(p.dateFulfilled) >= todayStart);
                    newStats.todayFulfilledCount = fulfilledToday.length;
                    newStats.todayFulfilledRevenue = fulfilledToday.reduce((sum, p) => sum + (p.totalCost || 0), 0);
                    
                    const pending = newPrescriptions.filter(p => p.status === 'Gözləmədə');
                    newStats.pendingPrescriptionsCount = pending.length;
                    newStats.pendingPrescriptionsRevenue = pending.reduce((sum, p) => sum + (p.totalCost || 0), 0);


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
                newStats.pendingPrescriptionsCount = (await getCountFromServer(pendingQuery)).data().count;
                
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
      return <PharmacistDashboard user={user} stats={stats} prescriptions={prescriptions} isLoading={isLoading} />;
  }

  if (userRole === 'patient') {
      return <PatientDashboard user={user} stats={stats} prescriptions={prescriptions} isLoading={isLoading} />;
  }

  // Fallback for other roles or while loading
  return <div><h1 className="text-2xl">Panelə Xoş Gəlmisiniz!</h1><p>Rolunuz üçün xüsusi panel hazırlanır.</p></div>;
}
