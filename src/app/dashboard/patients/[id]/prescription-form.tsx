'use client';

import { useActionState, useEffect } from 'react';
import { useForm, useFieldArray, useFormStatus } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addPrescription, type FormState } from '../actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BrainCircuit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const PrescribedMedicationSchema = z.object({
  medicationName: z.string().min(3, 'Dərman adı ən azı 3 simvol olmalıdır.'),
  dosage: z.string().min(1, 'Doza qeyd edilməlidir.'),
  instructions: z.string().min(5, 'Təlimat ən azı 5 simvol olmalıdır.'),
});

const PrescriptionSchema = z.object({
  patientId: z.string(),
  patientName: z.string(),
  complaint: z.string().min(5, 'Şikayət ən azı 5 simvol olmalıdır.'),
  diagnosis: z.string().min(5, 'Diaqnoz ən azı 5 simvol olmalıdır.'),
  medications: z.array(PrescribedMedicationSchema).min(1, 'Ən azı bir dərman əlavə edilməlidir.'),
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
  const boundAddPrescription = addPrescription.bind(null, doctorId);
  const [state, formAction] = useActionState(boundAddPrescription, { message: '', type: 'error' });

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(PrescriptionSchema),
    defaultValues: {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      complaint: '',
      diagnosis: '',
      medications: [{ medicationName: '', dosage: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
      if (state.type === 'error' && state.issues) {
        console.log(state.issues);
      }
    }
  }, [state, onFormSubmit]);

  const getAIRecommendations = () => {
    const values = form.getValues();
    const patientHistory = `Doğum tarixi: ${patient.dateOfBirth}, Cins: ${patient.gender}.`;
    const currentMedications = values.medications.map(m => m.medicationName).join(', ');
    const doctorNotes = `Şikayət: ${values.complaint}. Diaqnoz: ${values.diagnosis}`;
    
    const queryParams = new URLSearchParams({
        patientHistory,
        currentMedications,
        doctorNotes,
    });
    
    window.open(`/dashboard/suggestions?${queryParams.toString()}`, '_blank');
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        {state.type === 'error' && state.message && !state.issues && (
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

        <div>
          <Label>Təyin Edilən Dərmanlar</Label>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                    control={form.control}
                    name={`medications.${index}.medicationName`}
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
                    name={`medications.${index}.dosage`}
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
                </div>
                 <FormField
                  control={form.control}
                  name={`medications.${index}.instructions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İstifadə Təlimatı</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Məs., Yeməkdən sonra qəbul edilməlidir." {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {fields.length > 1 && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 h-7 w-7"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className='sr-only'>Dərmanı sil</span>
                    </Button>
                )}
              </div>
            ))}
          </div>
           <FormMessage>{form.formState.errors.medications?.root?.message}</FormMessage>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ medicationName: '', dosage: '', instructions: '' })}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Dərman Əlavə Et
          </Button>
        </div>

        <Separator />

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
