'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { addPartner, updatePartner, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { SupportingOrganization, ClientCompany } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { MediaLibraryPicker } from '../media/media-library-picker';

const PartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır.'),
  description: z.string().min(3, 'Təsvir ən azı 3 simvol olmalıdır.'),
  logoUrl: z.string().url('Düzgün bir URL daxil edin.'),
});

type PartnerFormValues = z.infer<typeof PartnerSchema>;
type Partner = SupportingOrganization | ClientCompany;

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

interface PartnerFormProps {
    partnerType: 'supportingOrganizations' | 'clientCompanies';
    initialData?: Partner | null;
    onFormSubmit: (state: FormState) => void;
}

export function PartnerForm({ partnerType, initialData, onFormSubmit }: PartnerFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing 
    ? updatePartner.bind(null, partnerType)
    : addPartner.bind(null, partnerType);

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (state?.message) {
      onFormSubmit(state);
      if (state.type === 'error' && state.issues) {
        Object.entries(state.issues).forEach(([key, messages]) => {
          const fieldName = key as keyof PartnerFormValues;
          if (messages && messages.length > 0) {
            form.setError(fieldName, { type: 'server', message: messages[0] });
          }
        });
      }
    }
  }, [state, form, onFormSubmit]);
  
  useEffect(() => {
    form.reset(initialData || { name: '', description: '', logoUrl: '' });
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {state?.type === 'error' && state.message && !state.issues && (
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
              <FormLabel>Partnyor Adı</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Medistyle Hospital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Təsvir</FormLabel>
              <FormControl>
                <Textarea placeholder="Partnyor haqqında qısa məlumat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loqo URL</FormLabel>
               <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} />
                </FormControl>
                <MediaLibraryPicker onSelect={(url) => field.onChange(url)} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
