'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { addMedication, updateMedication, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Inventory } from '@/lib/types';

const MedicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  dosage: z.string().min(1, 'Doza daxil edilməlidir.'),
  unit: z.string().min(1, 'Vahid daxil edilməlidir.'),
  form: z.string().min(3, 'Forma daxil edilməlidir (məs: tablet).'),
  quantity: z.coerce.number().min(0, 'Miqdar mənfi ola bilməz.'),
  expirationDate: z.string().nonempty('İstifadə müddəti seçilməlidir.'),
});

type MedicationFormValues = z.infer<typeof MedicationSchema>;

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gözləyin...
        </>
      ) : (
        isEditing ? 'Yenilə' : 'Əlavə Et'
      )}
    </Button>
  );
}

interface MedicationFormProps {
    pharmacyId: string;
    initialData?: Inventory | null;
    onFormSubmit: (state: FormState) => void;
}

export function MedicationForm({ pharmacyId, initialData, onFormSubmit }: MedicationFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing 
    ? updateMedication.bind(null, pharmacyId, 'update')
    : addMedication.bind(null, pharmacyId, 'add');

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: initialData ? {
        ...initialData,
        expirationDate: initialData.expirationDate.split('T')[0] // Format for date input
    } : {
      name: '',
      dosage: '',
      unit: 'mg',
      form: 'tablet',
      quantity: 0,
      expirationDate: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
       if (state.type === 'error' && state.issues) {
        Object.entries(state.issues).forEach(([key, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(key as keyof MedicationFormValues, { type: 'server', message: messages[0] });
          }
        });
      }
    }
  }, [state, onFormSubmit, form]);
  
  useEffect(() => {
    form.reset(initialData ? {...initialData, expirationDate: initialData.expirationDate.split('T')[0]} : { name: '', dosage: '', unit: 'mg', form: 'tablet', quantity: 0, expirationDate: '' });
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
        
        {isEditing && initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dərman Adı</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Paracetamol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-2 gap-4'>
             <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Doza</FormLabel>
                    <FormControl>
                        <Input placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Vahid</FormLabel>
                    <FormControl>
                        <Input placeholder="mg, ml, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

         <FormField
          control={form.control}
          name="form"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma</FormLabel>
              <FormControl>
                <Input placeholder="tablet, kapsul, məhlul" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className='grid grid-cols-2 gap-4'>
             <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Miqdar</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Son İstifadə Tarixi</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
