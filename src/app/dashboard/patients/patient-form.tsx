'use client';

import React, { useActionState, useEffect, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addPatient, type FormState } from './actions';

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

const PatientSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır.'),
  finCode: z.string().length(7, 'FİN kod 7 simvol olmalıdır.'),
  dateOfBirth: z.string().nonempty('Doğum tarixi tələb olunur.'),
  gender: z.enum(['Kişi', 'Qadın'], {
    errorMap: () => ({ message: 'Cins seçilməlidir.' }),
  }),
  contactNumber: z.string().min(9, 'Nömrə düzgün formatda olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.').optional().or(z.literal('')),
  address: z.string().min(3, 'Ünvan ən azı 3 simvol olmalıdır.').optional().or(z.literal('')),
});

type PatientFormValues = z.infer<typeof PatientSchema>;

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gözləyin...
        </>
      ) : (
        'Xəstəni Yarat'
      )}
    </Button>
  );
}

interface PatientFormProps {
  initialFinCode?: string;
  initialBirthDate?: string;
  onFormSubmit: (state: FormState) => void;
}

export function PatientForm({ initialFinCode, initialBirthDate, onFormSubmit }: PatientFormProps) {
  // ✅ React 19/Next 15: üçüncü dəyər isPending olur
  const [state, formAction, isPending] = useActionState(addPatient, {
    message: '',
    type: 'error',
  } as FormState);

  // ✅ "called outside of a transition" fix
  const [_, startTransition] = useTransition();

  // ✅ parent-dən gələn callback renderdə dəyişsə belə loop olmasın
  const onFormSubmitRef = useRef(onFormSubmit);
  useEffect(() => {
    onFormSubmitRef.current = onFormSubmit;
  }, [onFormSubmit]);

  // ✅ eyni state ilə təkrar işləməsin deyə (xüsusən Dialog loop-larında kömək edir)
  const lastHandledMessageRef = useRef<string>('');

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      finCode: initialFinCode || '',
      dateOfBirth: initialBirthDate || '',
      gender: undefined as unknown as PatientFormValues['gender'],
      contactNumber: '',
      email: '',
      address: '',
    },
  });

  // Server action nəticəsini handle et (loop-safe)
  useEffect(() => {
    if (!state?.message) return;

    // eyni mesajla təkrar-təkrar işləməsin
    if (lastHandledMessageRef.current === state.message) return;
    lastHandledMessageRef.current = state.message;

    onFormSubmitRef.current(state);

    if (state.type === 'error' && state.issues) {
      Object.entries(state.issues).forEach(([key, messages]) => {
        const fieldName = key as keyof PatientFormValues;
        if (messages && messages.length > 0) {
          form.setError(fieldName, { type: 'server', message: messages[0] });
        }
      });
    }
  }, [state, form]);

  // initial dəyərlər dəyişəndə reset
  useEffect(() => {
    form.reset({
      firstName: '',
      lastName: '',
      finCode: initialFinCode || '',
      dateOfBirth: initialBirthDate || '',
      gender: undefined as unknown as PatientFormValues['gender'],
      contactNumber: '',
      email: '',
      address: '',
    });
  }, [initialFinCode, initialBirthDate, form]);

  // ✅ RHF values -> FormData (event-dən asılı deyil)
  const handleSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    (Object.entries(values) as Array<[keyof PatientFormValues, any]>).forEach(([key, value]) => {
      formData.append(String(key), value ?? '');
    });

    // ✅ transition içində çağır
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {state.type === 'error' && state.message && !state.issues && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xəta</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

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
                  <Input {...field} />
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
              <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Email (optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="xeste@example.com" {...field} />
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
              <FormLabel>Ünvan (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Bakı ş., Nizami küç. 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton pending={isPending} />
      </form>
    </Form>
  );
}
