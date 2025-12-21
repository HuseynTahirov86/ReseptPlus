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
  { id: "RX789012", patientName: "Ali Veli", date: "2024-07-21", medication: "Aspirin 100mg", status: "Filled" },
  { id: "RX789013", patientName: "Zeynep Kaya", date: "2024-07-21", medication: "Metformin 500mg", status: "Pending" },
  { id: "RX789014", patientName: "Mustafa Demir", date: "2024-07-20", medication: "Lisinopril 10mg", status: "Filled" },
  { id: "RX789015", patientName: "Elif Şahin", date: "2024-07-20", medication: "Atorvastatin 20mg", status: "Canceled" },
  { id: "RX789016", patientName: "Hasan Çelik", date: "2024-07-19", medication: "Amoxicillin 500mg", status: "Filled" },
];

const statusVariant: { [key in Prescription['status']]: 'default' | 'secondary' | 'destructive' } = {
    Filled: 'default',
    Pending: 'secondary',
    Canceled: 'destructive'
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Dr. Aydin!</h1>
        <p className="text-muted-foreground">Here's a summary of your activity today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Prescriptions</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+5 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Refills</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 need urgent attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+3 since last week</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
          <CardDescription>A list of your most recent prescriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prescription ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Medication</TableHead>
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
