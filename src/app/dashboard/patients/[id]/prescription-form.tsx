'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addPrescription, type FormState } from '../actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BrainCircuit, Loader2 } from 'lucide-react';
import type { Patient } from '@/lib/types';

const PrescriptionSchema = z.object({
  patientId: z.string(),
  patientName: z.string(),
  complaint: z.string().min(5, 'Şikayət ən azı 5 simvol olmalıdır.'),
  diagnosis: z.string().min(5, 'Diaqnoz ən azı 5 simvol olmalıdır.'),
  medicationName: z.string().min(3, 'Dərman adı ən azı 3 simvol olmalıdır.'),
  dosage: z.string().min(1, 'Doza qeyd edilməlidir.'),
  instructions: z.string().min(5, 'Təlimat ən azı 5 simvol olmalıdır.'),
});

type PrescriptionFormValues = z.infer<typeof PrescriptionSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yadda Saxla...</> : 'Resepti Yarat'}
    </Button>
  );
}

interface PrescriptionFormProps {
  patient: Patient;
  doctorId: string;
  onFormSubmit: (state: FormState) => void;
}

export function PrescriptionForm({ patient, doctorId, onFormSubmit }: PrescriptionFormProps) {
  const router = useRouter();
  const boundAddPrescription = addPrescription.bind(null, doctorId);
  const [state, formAction] = useActionState(boundAddPrescription, { message: '', type: 'error' });

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(PrescriptionSchema),
    defaultValues: {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      complaint: '',
      diagnosis: '',
      medicationName: '',
      dosage: '',
      instructions: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
    }
  }, [state, onFormSubmit]);

  const getAIRecommendations = () => {
    const values = form.getValues();
    const patientHistory = `Doğum tarixi: ${patient.dateOfBirth}, Cins: ${patient.gender}.`;
    const currentMedications = values.medicationName;
    const doctorNotes = `Şikayət: ${values.complaint}. Diaqnoz: ${values.diagnosis}`;
    
    const queryParams = new URLSearchParams({
        patientHistory,
        currentMedications,
        doctorNotes,
    });
    
    // Open in new tab to not lose form data
    window.open(`/dashboard/suggestions?${queryParams.toString()}`, '_blank');
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {state.type === 'error' && state.message && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xəta</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        
        <input type="hidden" {...form.register('patientId')} />
        <input type="hidden" {...form.register('patientName')} />

        <FormField
          control={form.control}
          name="complaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xəstənin Şikayəti</FormLabel>
              <FormControl>
                <Textarea placeholder="Məs., Yüksək hərarət, öskürək..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qoyulan Diaqnoz</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Kəskin bronxit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="medicationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dərmanın Adı</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Paracetamol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doza</FormLabel>
              <FormControl>
                <Input placeholder="Məs., 500mg, gündə 2 dəfə" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İstifadə Təlimatı</FormLabel>
              <FormControl>
                <Textarea placeholder="Məs., Yeməkdən sonra qəbul edilməlidir." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
            <SubmitButton />
            <Button type="button" variant="outline" onClick={getAIRecommendations}>
                <BrainCircuit className="mr-2 h-4 w-4" />
                AI Məsləhəti
            </Button>
        </div>
      </form>
    </Form>
  );
}
    