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
import { ClipboardList, Users, RefreshCw } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const statusVariant: { [key in Prescription['status']]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function DashboardPage() {
  const { firestore, user } = useFirebase();

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "prescriptions"), where("doctorId", "==", user.uid));
  }, [firestore, user]);

  const { data: prescriptions, isLoading } = useCollection<Prescription>(prescriptionsQuery);
  
  const welcomeMessage = user ? `Xoş gəlmisiniz, ${user.displayName || user.email}!` : "Xoş gəlmisiniz!";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
        <p className="text-muted-foreground">Bugünkü fəaliyyətinizin xülasəsi.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yeni Reseptlər</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : prescriptions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">bu ay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gözləyən Təkrarlar</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 təcili diqqət tələb edir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktiv Xəstələr</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">keçən həftədən +3</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Son Reseptlər</CardTitle>
          <CardDescription>Ən son yazdığınız reseptlərin siyahısı.</CardDescription>
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
                  <TableCell colSpan={5} className="text-center">Yüklənir...</TableCell>
                </TableRow>
              )}
              {!isLoading && prescriptions?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id.substring(0,8)}</TableCell>
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
                  <TableCell colSpan={5} className="text-center">Heç bir resept tapılmadı.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
