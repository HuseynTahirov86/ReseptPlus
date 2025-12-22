'use client';

import { useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Users, Building, FileText, Hospital, Microscope, Pill, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';


function StatCard({ title, icon, value, description, isLoading }: { title: string, icon: React.ReactNode, value: string | number, description: string, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className='h-8 w-20 mb-2' />
            <Skeleton className='h-4 w-32' />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}


function SiteAdminDashboard() {
  const { firestore } = useFirebase();
  const [counts, setCounts] = useState({ blogPosts: 0, partners: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      if (!firestore) return;
      try {
        const blogPostsSnap = await getCountFromServer(collection(firestore, "blogPosts"));
        const clientCompaniesSnap = await getCountFromServer(collection(firestore, "clientCompanies"));
        const supportingOrgsSnap = await getCountFromServer(collection(firestore, "supportingOrganizations"));
        
        setCounts({
          blogPosts: blogPostsSnap.data().count,
          partners: clientCompaniesSnap.data().count + supportingOrgsSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching site admin counts: ", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCounts();
  }, [firestore]);


  return (
     <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sayt İdarə Paneli</h1>
        <p className="text-muted-foreground">
          Marketinq saytının məzmununu buradan idarə edin.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Bloq Yazıları" icon={<FileText className="h-4 w-4 text-muted-foreground" />} value={counts.blogPosts} description="ümumi yazı" isLoading={isLoading}/>
        <StatCard title="Partnyor Şirkətlər" icon={<Building className="h-4 w-4 text-muted-foreground" />} value={counts.partners} description="aktiv partnyor" isLoading={isLoading} />
        <StatCard title="Sayta Baxış" icon={<BarChart className="h-4 w-4 text-muted-foreground" />} value="1,234" description="son 30 gündə (təcrübi)" isLoading={false} />
        <StatCard title="Yeni Ziyarətçilər" icon={<Users className="h-4 w-4 text-muted-foreground" />} value="+25" description="bu həftə (təcrübi)" isLoading={false} />
      </div>
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Sürətli Keçidlər</h2>
        <p className="text-muted-foreground">
            Tez-tez istifadə olunan bölmələrə sürətli keçid.
        </p>
        {/* Future Quick Links will go here */}
      </div>
     </div>
  );
}

function SystemAdminDashboard() {
  const { firestore } = useFirebase();
  const [counts, setCounts] = useState({ hospitals: 0, doctors: 0, pharmacies: 0, patients: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      if (!firestore) return;
      try {
        const hospitalsSnap = await getCountFromServer(collection(firestore, "hospitals"));
        const doctorsSnap = await getCountFromServer(collection(firestore, "doctors"));
        const pharmaciesSnap = await getCountFromServer(collection(firestore, "pharmacies"));
        const patientsSnap = await getCountFromServer(collection(firestore, "patients"));
        
        setCounts({
          hospitals: hospitalsSnap.data().count,
          doctors: doctorsSnap.data().count,
          pharmacies: pharmaciesSnap.data().count,
          patients: patientsSnap.data().count,
        });
      } catch (error) {
        console.error("Error fetching system admin counts: ", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCounts();
  }, [firestore]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sistem İdarə Paneli</h1>
        <p className="text-muted-foreground">
          Sistemin əsas komponentlərini (xəstəxanalar, apteklər, istifadəçilər) buradan idarə edin.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Xəstəxanalar" icon={<Hospital className="h-4 w-4 text-muted-foreground" />} value={counts.hospitals} description="sistemdə qeydiyyatda" isLoading={isLoading} />
        <StatCard title="Həkimlər" icon={<Microscope className="h-4 w-4 text-muted-foreground" />} value={counts.doctors} description="sistemdə qeydiyyatda" isLoading={isLoading} />
        <StatCard title="Apteklər" icon={<Pill className="h-4 w-4 text-muted-foreground" />} value={counts.pharmacies} description="sistemdə qeydiyyatda" isLoading={isLoading} />
        <StatCard title="Xəstələr" icon={<Users className="h-4 w-4 text-muted-foreground" />} value={counts.patients} description="sistemdə qeydiyyatda" isLoading={isLoading} />
      </div>
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Əsas İdarəetmə Funksiyaları</h2>
        <p className="text-muted-foreground">
           Sistemin əsas varlıqlarını yaratmaq və idarə etmək üçün aşağıdakı bölmələrə keçin.
        </p>
        {/* Future Quick Links will go here */}
      </div>
    </div>
  );
}


export default function AdminDashboardPage() {
  const { user } = useUser();

  if (user?.profile?.role === 'system_admin') {
    return <SystemAdminDashboard />;
  }

  if (user?.profile?.role === 'admin') {
    return <SiteAdminDashboard />;
  }

  // Default fallback or a skeleton loader
  return (
    <div className="flex h-full items-center justify-center">
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
