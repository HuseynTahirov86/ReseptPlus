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

const prescriptions: Prescription[] = [
  { id: "RX789012", patientName: "Əli Vəliyev", date: "2024-07-21", medication: "Aspirin 100mg", status: "Təhvil verildi" },
  { id: "RX789013", patientName: "Zeynəb Qaya", date: "2024-07-21", medication: "Metformin 500mg", status: "Gözləmədə" },
  { id: "RX789014", patientName: "Mustafa Dəmir", date: "2024-07-20", medication: "Lisinopril 10mg", status: "Təhvil verildi" },
  { id: "RX789015", patientName: "Elif Şahin", date: "2024-07-20", medication: "Atorvastatin 20mg", status: "Ləğv edildi" },
  { id: "RX789016", patientName: "Həsən Çelik", date: "2024-07-19", medication: "Amoxicillin 500mg", status: "Təhvil verildi" },
];

const statusVariant: { [key in Prescription['status']]: 'default' | 'secondary' | 'destructive' } = {
    'Təhvil verildi': 'default',
    'Gözləmədə': 'secondary',
    'Ləğv edildi': 'destructive'
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Xoş gəlmisiniz, Dr. Aydın!</h1>
        <p className="text-muted-foreground">Bugünkü fəaliyyətinizin xülasəsi.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yeni Reseptlər</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">dünəndən +5</p>
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
              {prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.patientName}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.medication}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
