'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { addDoctor, updateDoctor, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Doctor, Hospital } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Validation schemas
const CreateDoctorSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 simvol olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.'),
  specialization: z.string().min(2, 'İxtisas ən azı 2 simvol olmalıdır.'),
  hospitalId: z.string({ required_error: 'Xəstəxana seçilməlidir.' }).min(1, 'Xəstəxana seçilməlidir.'),
  role: z.enum(['doctor', 'head_doctor'], {
    errorMap: () => ({ message: 'Rol seçilməlidir.' }),
  }),
});

const UpdateDoctorSchema = CreateDoctorSchema.omit({ password: true }).extend({
  id: z.string().min(1, 'Həkim ID-si təyin edilməyib.'),
  password: z.union([
    z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.'),
    z.literal('')
  ]).optional(),
});

type CreateDoctorFormValues = z.infer<typeof CreateDoctorSchema>;
type UpdateDoctorFormValues = z.infer<typeof UpdateDoctorSchema>;
type DoctorFormValues = CreateDoctorFormValues | UpdateDoctorFormValues;

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gözləyin...
        </>
      ) : (
        isEditing ? 'Həkimi Yenilə' : 'Həkim Əlavə Et'
      )}
    </Button>
  );
}

interface DoctorFormProps {
  initialData?: Doctor | null;
  hospitals: Hospital[];
  onFormSubmit: (state: FormState) => void;
}

export function DoctorForm({ initialData, hospitals, onFormSubmit }: DoctorFormProps) {
  const isEditing = !!initialData;
  const action = isEditing ? updateDoctor : addDoctor;

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(isEditing ? UpdateDoctorSchema : CreateDoctorSchema),
    defaultValues: initialData ? {
        ...initialData,
        password: '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      specialization: '',
      hospitalId: '',
      role: 'doctor',
    },
  });
  
  // Handle server response and errors
  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
      
      if (state.type === 'error' && state.issues) {
        Object.entries(state.issues).forEach(([key, messages]) => {
          const fieldName = key as keyof DoctorFormValues;
          if (messages && messages.length > 0) {
            form.setError(fieldName, { 
              type: 'server', 
              message: messages[0] 
            });
          }
        });
      }
    }
  }, [state, onFormSubmit, form]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({ ...initialData, password: '' });
    } else {
       form.reset({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          specialization: '',
          hospitalId: '',
          role: 'doctor',
       });
    }
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

        {isEditing && initialData?.id && (
          <input type="hidden" name="id" value={initialData.id} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input placeholder="Məs., Elvin" {...field} />
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
                  <Input placeholder="Məs., Əliyev" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="hekim@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditing ? 'Yeni Şifrə (dəyişdirmək üçün doldurun)' : 'Şifrə'}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İxtisas</FormLabel>
              <FormControl>
                <Input placeholder="Kardioloq" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hospitalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xəstəxana</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Xəstəxana seçin..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hospitals.map(hospital => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçin..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="doctor">Həkim</SelectItem>
                    <SelectItem value="head_doctor">Baş Həkim</SelectItem>
                  </SelectContent>
                </Select>
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
