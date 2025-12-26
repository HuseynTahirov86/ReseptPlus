'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updatePrescription, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Prescription } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PrescriptionUpdateSchema = z.object({
  id: z.string(),
  diagnosis: z.string().min(3, 'Diaqnoz ən azı 3 simvol olmalıdır.'),
  status: z.enum(['Təhvil verildi', 'Gözləmədə', 'Ləğv edildi']),
});

type PrescriptionFormValues = z.infer<typeof PrescriptionUpdateSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Yenilənir...
        </>
      ) : (
        'Dəyişiklikləri Yadda Saxla'
      )}
    </Button>
  );
}

interface PrescriptionFormProps {
    initialData: Prescription | null;
    onFormSubmit: (state: FormState) => void;
}

export function PrescriptionForm({ initialData, onFormSubmit }: PrescriptionFormProps) {
  const [state, formAction] = useActionState(updatePrescription, { message: '', type: 'error' });

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(PrescriptionUpdateSchema),
    defaultValues: {
      id: initialData?.id || '',
      diagnosis: initialData?.diagnosis || '',
      status: initialData?.status || 'Gözləmədə',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
    }
  }, [state, onFormSubmit]);

  useEffect(() => {
    form.reset({
        id: initialData?.id || '',
        diagnosis: initialData?.diagnosis || '',
        status: initialData?.status || 'Gözləmədə',
    });
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {state.type === 'error' && state.message && !state.issues && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xəta</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        
        <input type="hidden" {...form.register('id')} />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diaqnoz</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Kəskin bronxit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Statusu seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Gözləmədə">Gözləmədə</SelectItem>
                  <SelectItem value="Təhvil verildi">Təhvil verildi</SelectItem>
                  <SelectItem value="Ləğv edildi">Ləğv edildi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton />
      </form>
    </Form>
  );
}
