'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { addPharmacist, updatePharmacist, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Pharmacist, Pharmacy } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CreatePharmacistSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  lastName: z.string().min(2, 'Soyad ən azı 2 simvol olmalıdır.'),
  email: z.string().email('Düzgün email daxil edin.'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.'),
  pharmacyId: z.string().min(1, 'Aptek seçilməlidir.'),
  role: z.enum(['employee', 'head_pharmacist']),
});

const UpdatePharmacistSchema = CreatePharmacistSchema.omit({ password: true }).extend({
  id: z.string().optional(),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır.').optional().or(z.literal('')),
});


type PharmacistFormValues = z.infer<typeof CreatePharmacistSchema> | z.infer<typeof UpdatePharmacistSchema>;

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
        isEditing ? 'Əczaçını Yenilə' : 'Əczaçı Əlavə Et'
      )}
    </Button>
  );
}

interface PharmacistFormProps {
    initialData?: Pharmacist | null;
    pharmacies: Pharmacy[];
    onFormSubmit: (state: FormState) => void;
}

export function PharmacistForm({ initialData, pharmacies, onFormSubmit }: PharmacistFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing ? updatePharmacist : addPharmacist;

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<PharmacistFormValues>({
    resolver: zodResolver(isEditing ? UpdatePharmacistSchema : CreatePharmacistSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      pharmacyId: '',
      role: 'employee',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
    }
  }, [state, onFormSubmit]);
  
  useEffect(() => {
    form.reset(initialData || { firstName: '', lastName: '', email: '', password: '', pharmacyId: '', role: 'employee'});
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                    <Input placeholder="Məs., Aygün" {...field} />
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
                    <Input placeholder="Məs., Səmədova" {...field} />
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
                    <Input type="email" placeholder="eczaci@example.com" {...field} />
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
                
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="pharmacyId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Aptek</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Aptek seçin..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pharmacies.map(pharmacy => (
                            <SelectItem key={pharmacy.id} value={pharmacy.id}>
                                {pharmacy.name}
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Rol seçin..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="employee">Əczaçı</SelectItem>
                            <SelectItem value="head_pharmacist">Baş Əczaçı</SelectItem>
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
