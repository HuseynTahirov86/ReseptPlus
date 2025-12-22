'use client';

import { useUser, useFirebase } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Users, Building, FileText, Hospital, Pill, ShieldCheck, Microscope } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Link href="/admin/blog">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Blog</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/partners">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Partnyorlar</CardTitle>
              </CardHeader>
            </Card>
          </Link>
           <Link href="/admin/pricing">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Qiymətlər</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>
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
        <StatCard title="Apteklər" icon={<Building className="h-4 w-4 text-muted-foreground" />} value={counts.pharmacies} description="sistemdə qeydiyyatda" isLoading={isLoading} />
        <StatCard title="Xəstələr" icon={<Users className="h-4 w-4 text-muted-foreground" />} value={counts.patients} description="sistemdə qeydiyyatda" isLoading={isLoading} />
      </div>
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Əsas İdarəetmə Funksiyaları</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Link href="/admin/hospitals">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Hospital className="h-5 w-5 text-primary" /> Xəstəxanalar</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/doctors">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Microscope className="h-5 w-5 text-primary" /> Həkimlər</CardTitle>
              </CardHeader>
            </Card>
          </Link>
           <Link href="/admin/pharmacies">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Apteklər</CardTitle>
              </CardHeader>
            </Card>
          </Link>
           <Link href="/admin/pharmacists">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Pill className="h-5 w-5 text-primary" /> Əczaçılar</CardTitle>
              </CardHeader>
            </Card>
          </Link>
           <Link href="/admin/users">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> İstifadəçilər</CardTitle>
              </CardHeader>
            </Card>
          </Link>
           <Link href="/admin/security">
             <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Təhlükəsizlik</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function AdminDashboardPage() {
  const { user } = useUser();

  // Sistem admini həm də sayt admini funksiyalarına giriş əldə edə bilər,
  // lakin onun üçün əsas panel sistem panelidir.
  if (user?.profile?.role === 'system_admin') {
    return <SystemAdminDashboard />;
  }

  // Sayt admini yalnız öz panelini görür.
  if (user?.profile?.role === 'admin') {
    return <SiteAdminDashboard />;
  }

  // Yüklənərkən və ya rol təyin edilməyibsə göstəriləcək skelet.
  return (
    <div className="space-y-8">
       <div>
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-6 w-2/3" />
      </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
       <div>
        <Skeleton className="h-8 w-1/4 mb-4" />
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
         </div>
      </div>
    </div>
  );
}
