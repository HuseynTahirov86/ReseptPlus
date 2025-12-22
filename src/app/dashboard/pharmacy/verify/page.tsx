'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient, Prescription } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { fulfillPrescription } from '../actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/firebase/client-init';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Label } from '@/components/ui/label';


const searchSchema = z.object({
  finCode: z.string().min(7, 'FİN kod 7 simvol olmalıdır.').max(7, 'FİN kod 7 simvol olmalıdır.'),
  birthDate: z.string().nonempty('Doğum tarixi boş ola bilməz.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const FulfillFormSchema = z.object({
  totalCost: z.coerce.number().min(0, "Məbləğ mənfi ola bilməz."),
  paymentReceived: z.coerce.number().min(0, "Məbləğ mənfi ola bilməz."),
});
type FulfillFormValues = z.infer<typeof FulfillFormSchema>;


export default function VerifyPrescriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isFulfilling, setIsFulfilling] = useState(false);
  
  const { toast } = useToast();

  const { register, handleSubmit: handleSearchSubmit, formState: { errors: searchErrors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const { register: registerFulfill, handleSubmit: handleFulfillSubmit, formState: { errors: fulfillErrors }, reset: resetFulfillForm } = useForm<FulfillFormValues>({
    resolver: zodResolver(FulfillFormSchema),
  });
  

  const onSearch: SubmitHandler<SearchFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setPatient(null);
    setVerifiedPatient(null);

    const q = query(
      collection(db, 'patients'),
      where('finCode', '==', data.finCode.toUpperCase()),
      where('dateOfBirth', '==', data.birthDate)
    );

    try {
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            setError('Bu məlumatlara uyğun xəstə tapılmadı.');
            setIsLoading(false);
            return;
        }

        const foundPatient = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Patient;
        setPatient(foundPatient);
        
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setOtp('');
        setOtpError(null);
        setIsOtpModalOpen(true);

    } catch (e) {
        console.error(e);
        setError('Axtarış zamanı xəta baş verdi. Təhlükəsizlik qaydalarını yoxlayın.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const fetchPrescriptions = async (patientId: string) => {
    setLoadingPrescriptions(true);
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      where('status', '==', 'Gözləmədə')
    );
    try {
        const querySnapshot = await getDocs(q);
        const pres = querySnapshot.docs.map(doc => doc.data() as Prescription);
        setPrescriptions(pres);
    } catch(e) {
        console.error(e);
        setError("Reseptləri yükləyərkən xəta baş verdi.");
    } finally {
        setLoadingPrescriptions(false);
    }
  };


  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
        setVerifiedPatient(patient);
        setIsOtpModalOpen(false);
        if(patient?.id) {
          fetchPrescriptions(patient.id);
        }
    } else {
        setOtpError('Yanlış təsdiq kodu.');
    }
  };

  const openFulfillDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    resetFulfillForm({ totalCost: 0, paymentReceived: 0 });
    setFulfillModalOpen(true);
  };

  const onFulfillSubmit: SubmitHandler<FulfillFormValues> = async (data) => {
    if (!selectedPrescription) return;

    setIsFulfilling(true);
    const result = await fulfillPrescription(selectedPrescription.id, data.totalCost, data.paymentReceived);
    
    toast({
        title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
        description: result.message,
        variant: result.type === 'success' ? 'default' : 'destructive'
    });

    if (result.type === 'success') {
      setFulfillModalOpen(false);
      if (verifiedPatient?.id) {
          fetchPrescriptions(verifiedPatient.id);
      }
    }
    setIsFulfilling(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck/> Resept Yoxlama</CardTitle>
          <CardDescription>
            Xəstənin aktiv reseptlərinə baxmaq üçün FİN kodu və doğum tarixini daxil edin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit(onSearch)} className="flex flex-col sm:flex-row gap-4 items-start">
            <div className='flex-1 w-full'>
              <Input {...register('finCode')} placeholder="FİN Kod (məs., 1ABC2DE)" />
              {searchErrors.finCode && <p className="text-destructive text-sm mt-1">{searchErrors.finCode.message}</p>}
            </div>
            <div className='flex-1 w-full'>
              <Input {...register('birthDate')} type="date" />
              {searchErrors.birthDate && <p className="text-destructive text-sm mt-1">{searchErrors.birthDate.message}</p>}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Axtar
            </Button>
          </form>
           {error && <Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Xəta</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </CardContent>
      </Card>
      
      {verifiedPatient && (
        <Card>
            <CardHeader>
                <CardTitle>Aktiv Reseptlər: {verifiedPatient.firstName} {verifiedPatient.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Yazılma Tarixi</TableHead>
                            <TableHead>Diaqnoz</TableHead>
                            <TableHead>Dərmanlar</TableHead>
                            <TableHead className='text-right'>Əməliyyat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingPrescriptions && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loadingPrescriptions && prescriptions?.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{new Date(p.datePrescribed).toLocaleDateString()}</TableCell>
                                <TableCell>{p.diagnosis}</TableCell>
                                <TableCell className='font-medium'>{p.medications.map(m => m.medicationName).join(', ')}</TableCell>
                                <TableCell className='text-right'>
                                    <Button size="sm" onClick={() => openFulfillDialog(p)}>
                                        <CheckCircle className="mr-2 h-4 w-4"/>
                                        Təhvil Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!loadingPrescriptions && prescriptions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Bu xəstə üçün aktiv resept tapılmadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><ShieldCheck/> Təhlükəsizlik Doğrulaması</DialogTitle>
                <DialogDescription>
                    Xəstənin ({patient?.firstName} {patient?.lastName}) profilinə giriş etmək üçün təsdiq kodunu daxil edin.
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
      
       <Dialog open={fulfillModalOpen} onOpenChange={setFulfillModalOpen}>
        <DialogContent>
            <form onSubmit={handleFulfillSubmit(onFulfillSubmit)}>
                <DialogHeader>
                    <DialogTitle>Resepti Təhvil Ver</DialogTitle>
                    <DialogDescription>
                        Dərmanların ümumi məbləğini və alınan ödənişi qeyd edin.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="totalCost">Dərmanların Ümumi Məbləği (AZN)</Label>
                        <Input id="totalCost" type="number" step="0.01" {...registerFulfill('totalCost')} />
                        {fulfillErrors.totalCost && <p className="text-destructive text-sm">{fulfillErrors.totalCost.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="paymentReceived">Alınan Ödəniş (AZN)</Label>
                        <Input id="paymentReceived" type="number" step="0.01" {...registerFulfill('paymentReceived')} />
                        {fulfillErrors.paymentReceived && <p className="text-destructive text-sm">{fulfillErrors.paymentReceived.message}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setFulfillModalOpen(false)} disabled={isFulfilling}>Ləğv et</Button>
                    <Button type="submit" disabled={isFulfilling}>
                        {isFulfilling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Təsdiqlə
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
