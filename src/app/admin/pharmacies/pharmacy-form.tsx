'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { addPharmacy, updatePharmacy, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const PharmacySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.'),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  latitude: z.coerce.number().min(-90, "Enlik -90 və 90 arasında olmalıdır.").max(90, "Enlik -90 və 90 arasında olmalıdır."),
  longitude: z.coerce.number().min(-180, "Uzunluq -180 və 180 arasında olmalıdır.").max(180, "Uzunluq -180 və 180 arasında olmalıdır."),
});

type PharmacyFormValues = z.infer<typeof PharmacySchema>;

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

interface PharmacyFormProps {
    initialData?: Pharmacy | null;
    onFormSubmit: (state: FormState) => void;
}

export function PharmacyForm({ initialData, onFormSubmit }: PharmacyFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing ? updatePharmacy : addPharmacy;

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(PharmacySchema),
    defaultValues: initialData || {
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      latitude: 40.4093,
      longitude: 49.8671,
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
      if (state.type === 'error' && state.issues) {
        Object.entries(state.issues).forEach(([key, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(key as keyof PharmacyFormValues, { type: 'server', message: messages[0] });
          }
        });
      }
    }
  }, [state, onFormSubmit, form]);
  
  useEffect(() => {
    form.reset(initialData || { name: '', address: '', contactNumber: '', email: '', latitude: 40.4093, longitude: 49.8671 });
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
              <FormLabel>Aptek Adı</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Zeytun Aptek" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ünvan</FormLabel>
              <FormControl>
                <Textarea placeholder="Aptekin tam ünvanı" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Əlaqə Nömrəsi</FormLabel>
                <FormControl>
                    <Input placeholder="(012) 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="info@apteka.az" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Enlik (Latitude)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="40.4093" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Uzunluq (Longitude)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="49.8671" {...field} />
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
