'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { addTeamMember, updateTeamMember, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { TeamMember } from '@/lib/types';
import { MediaLibraryPicker } from '../media/media-library-picker';

const TeamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Ad ən azı 3 simvol olmalıdır.'),
  role: z.string().min(3, 'Vəzifə ən azı 3 simvol olmalıdır.'),
  imageUrl: z.string().url('Düzgün bir şəkil URL-i daxil edin.'),
  imageHint: z.string().optional().default(''),
});

type TeamMemberFormValues = z.infer<typeof TeamMemberSchema>;

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
        isEditing ? 'Üzvü Yenilə' : 'Üzvü Yarat'
      )}
    </Button>
  );
}

interface TeamMemberFormProps {
    initialData?: TeamMember | null;
    onFormSubmit: (state: FormState) => void;
}

export function TeamMemberForm({ initialData, onFormSubmit }: TeamMemberFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing ? updateTeamMember : addTeamMember;

  const [state, formAction] = useFormState(action, { message: '', type: 'error' });

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(TeamMemberSchema),
    defaultValues: initialData || {
      name: '',
      role: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);
    }
  }, [state, onFormSubmit]);
  
  useEffect(() => {
    form.reset(initialData || { name: '', role: '', imageUrl: '', imageHint: '' });
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
              <FormLabel>Ad və Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Aysel Quliyeva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vəzifə</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Texniki Direktor (CTO)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Şəkil URL</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                            <Input placeholder="https://example.com/image.png" {...field} />
                        </FormControl>
                         <MediaLibraryPicker onSelect={(url) => field.onChange(url)} />
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="imageHint"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>AI Şəkil İpucu (optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="man portrait" {...field} />
                    </FormControl>
                     <FormDescription>
                        Bu sahə gələcəkdə AI tərəfindən şəkillərin avtomatik tapılması üçün istifadə edilə bilər. Məs: "woman portrait"
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
