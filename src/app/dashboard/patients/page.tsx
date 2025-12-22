'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Patient } from '@/lib/types';
import { PatientList } from './patient-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PatientForm } from './patient-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const searchSchema = z.object({
  finCode: z.string().min(7, 'FİN kod 7 simvol olmalıdır.').max(7, 'FİN kod 7 simvol olmalıdır.'),
  birthDate: z.string().nonempty('Doğum tarixi boş ola bilməz.'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function PatientsPage() {
  const [searchCriteria, setSearchCriteria] = useState<SearchFormValues | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const patientsQuery = useMemoFirebase(() => {
    // Axtarış kriteriyaları təyin edilməyibsə, sorğu göndərmə
    if (!firestore || !searchCriteria) return null;
    
    // Yalnız təyin edilmiş kriteriyalara uyğun xəstələri axtar
    return query(
      collection(firestore, 'patients'),
      where('finCode', '==', searchCriteria.finCode.toUpperCase()), // FİN kodu böyük hərflərlə yoxla
      where('dateOfBirth', '==', searchCriteria.birthDate)
    );
  }, [firestore, searchCriteria]);

  const { data: patients, isLoading, error } = useCollection<Patient>(patientsQuery);

  const onSearch: SubmitHandler<SearchFormValues> = (data) => {
    setSearchCriteria(data);
    setHasSearched(true); // Axtarış edildiyini qeyd et
  };
  
  const onFormSubmit = (state: { type: 'success' | 'error', message: string, issues?: any }) => {
        toast({
            title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
            description: state.message,
            variant: state.type === 'success' ? 'default' : 'destructive',
        });
        if (state.type === 'success') {
            setIsFormOpen(false);
            // Re-run the search with the same criteria to show the newly added patient
            if (searchCriteria) {
              setSearchCriteria({ ...searchCriteria });
            }
        }
    };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Xəstə Axtarışı</CardTitle>
          <CardDescription>
            Xəstənin profilinə baxmaq üçün FİN kodu və doğum tarixini daxil edin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSearch)} className="flex flex-col sm:flex-row gap-4 items-start">
            <div className='flex-1 w-full'>
              <Input {...register('finCode')} placeholder="FİN Kod (məs., 1ABC2DE)" />
              {errors.finCode && <p className="text-destructive text-sm mt-1">{errors.finCode.message}</p>}
            </div>
            <div className='flex-1 w-full'>
              <Input {...register('birthDate')} type="date" />
              {errors.birthDate && <p className="text-destructive text-sm mt-1">{errors.birthDate.message}</p>}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Axtar
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/> 
            <span className="ml-4">Xəstə axtarılır...</span>
        </div>
      )}

      {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xəta</AlertTitle>
            <AlertDescription>Xəstə axtarışı zamanı bir problem yarandı. Zəhmət olmasa, konsolu və təhlükəsizlik qaydalarını yoxlayın.</AlertDescription>
          </Alert>
      )}

      {hasSearched && !isLoading && !error && (
        <PatientList patients={patients} onRegisterNew={() => setIsFormOpen(true)}/>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Yeni Xəstə Qeydiyyatı</DialogTitle>
            <DialogDescription>
              Sistemdə tapılmayan xəstə üçün yeni profil yaradın.
            </DialogDescription>
          </DialogHeader>
          <PatientForm
            initialFinCode={getValues('finCode')}
            initialBirthDate={getValues('birthDate')}
            onFormSubmit={onFormSubmit}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}
