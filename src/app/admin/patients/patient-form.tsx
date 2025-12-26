'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addPatient, updatePatient, type FormState } from './actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Patient } from '@/lib/types';

const PatientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır.'),
  finCode: z.string().length(7, 'FİN kod 7 simvol olmalıdır.').transform(val => val.toUpperCase()),
  dateOfBirth: z.string().nonempty('Doğum tarixi tələb olunur.'),
  gender: z.enum(['Kişi', 'Qadın'], {
    errorMap: () => ({ message: 'Cins seçilməlidir.' }),
  }),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.'),
});

type PatientFormValues = z.infer<typeof PatientSchema>;

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gözləyin...
        </>
      ) : (
        isEditing ? "Dəyişiklikləri Yadda Saxla" : "Xəstəni Yarat"
      )}
    </Button>
  );
}

interface PatientFormProps {
  initialData?: Patient | null;
  onFormSubmit: (state: FormState) => void;
}

export function PatientForm({ initialData, onFormSubmit }: PatientFormProps) {
  const isEditing = !!initialData;
  const action = isEditing ? updatePatient : addPatient;

  const [state, formAction] = useActionState(action, {
    message: '',
    type: 'error',
  });

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      finCode: '',
      dateOfBirth: '',
      gender: undefined,
      contactNumber: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    if (state?.message) {
      onFormSubmit(state);

      if (state.type === 'error' && state.issues) {
        Object.entries(state.issues).forEach(([key, messages]) => {
          const fieldName = key as keyof PatientFormValues;
          if (messages && messages.length > 0) {
            form.setError(fieldName, { type: 'server', message: messages[0] });
          }
        });
      }
    }
  }, [state, onFormSubmit, form]);

  useEffect(() => {
    form.reset(initialData || {
      firstName: '',
      lastName: '',
      finCode: '',
      dateOfBirth: '',
      gender: undefined,
      contactNumber: '',
      email: '',
      address: '',
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
        
        {isEditing && initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input placeholder="Məs., Ayan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Məs., Məmmədova" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="finCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FİN Kod</FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doğum Tarixi</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cins</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Cins seçin..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Kişi">Kişi</SelectItem>
                  <SelectItem value="Qadın">Qadın</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Əlaqə Nömrəsi</FormLabel>
                <FormControl>
                    <Input placeholder="(050) 123 45 67" {...field} />
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
                    <Input type="email" placeholder="xeste@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ünvan</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Bakı ş., Nizami küç. 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
