'use client';
import { useState } from 'react';
import type { Patient } from "@/lib/types";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PatientListProps {
    patients: Patient[] | null;
}

export function PatientList({ patients }: PatientListProps) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [otp, setOtp] = useState<string>('');
    const [generatedOtp, setGeneratedOtp] = useState<string>('');
    const [otpError, setOtpError] = useState<string | null>(null);
    const router = useRouter();

    const openOtpModal = (patient: Patient) => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setSelectedPatient(patient);
        setOtp('');
        setOtpError(null);
    };

    const handleVerifyOtp = () => {
        if (otp === generatedOtp) {
            router.push(`/dashboard/patients/${selectedPatient?.id}`);
        } else {
            setOtpError('Yanlış təsdiq kodu. Zəhmət olmasa, yenidən cəhd edin.');
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ad Soyad</TableHead>
                                <TableHead>Cins</TableHead>
                                <TableHead>Əlaqə Nömrəsi</TableHead>
                                <TableHead className="text-right">Əməliyyat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients && patients.length > 0 ? (
                                patients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{`${patient.firstName} ${patient.lastName}`}</TableCell>
                                        <TableCell>{patient.gender}</TableCell>
                                        <TableCell>{patient.contactNumber}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" onClick={() => openOtpModal(patient)}>Profilə Bax</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Axtarışa uyğun xəstə tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ShieldCheck/> Təhlükəsizlik Doğrulaması</DialogTitle>
                        <DialogDescription>
                            Xəstənin profilinə giriş etmək üçün onun telefonuna göndərilən təsdiq kodunu daxil edin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-700 dark:text-blue-300">Təcrübi Rejim</AlertTitle>
                            <AlertDescription className="text-blue-600 dark:text-blue-400">
                                Bu bir simulyasiyadır. Real SMS göndərilmir. Təsdiq kodu: <strong className="font-mono">{generatedOtp}</strong>
                            </AlertDescription>
                        </Alert>
                        <Input 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6 rəqəmli kodu daxil edin"
                        />
                        {otpError && <p className="text-destructive text-sm">{otpError}</p>}
                        <Button className="w-full" onClick={handleVerifyOtp}>Təsdiqlə</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
