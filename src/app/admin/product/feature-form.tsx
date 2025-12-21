'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { addFeature, updateFeature, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ProductFeature } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

const FeatureSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Başlıq ən azı 3 simvol olmalıdır.'),
  description: z.string().min(10, 'Təsvir ən azı 10 simvol olmalıdır.'),
  icon: z.string().min(2, 'İkon adı ən azı 2 simvol olmalıdır (məs., "Bot").'),
});

type FeatureFormValues = z.infer<typeof FeatureSchema>;

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
        isEditing ? 'Xüsusiyyəti Yenilə' : 'Xüsusiyyəti Yarat'
      )}
    </Button>
  );
}

interface FeatureFormProps {
    initialData?: ProductFeature | null;
    onFormSubmit: (state: FormState) => void;
}

export function FeatureForm({ initialData, onFormSubmit }: FeatureFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing ? updateFeature : addFeature;

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<FeatureFormValues>({
    resolver: zodResolver(FeatureSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      icon: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
    }
  }, [state, onFormSubmit]);
  
  useEffect(() => {
    form.reset(initialData || { title: '', description: '', icon: '' });
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Başlıq</FormLabel>
              <FormControl>
                <Input placeholder="Xüsusiyyətin başlığı" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lucide İkon Adı</FormLabel>
              <FormControl>
                <Input placeholder="Məs., ShieldCheck" {...field} />
              </FormControl>
               <p className="text-xs text-muted-foreground">
                <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">Lucide Icons</a> saytından ikon adını kopyalayın.
              </p>
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
                <Textarea placeholder="Xüsusiyyət üçün qısa təsvir" {...field} />
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
