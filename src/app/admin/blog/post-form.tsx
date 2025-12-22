'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { addPost, updatePost, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { MediaLibraryPicker } from '../media/media-library-picker';

const PostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Başlıq ən azı 3 simvol olmalıdır.'),
  description: z.string().min(10, 'Qısa təsvir ən azı 10 simvol olmalıdır.'),
  content: z.string().min(20, 'Məzmun ən azı 20 simvol olmalıdır.'),
  author: z.string().min(3, 'Müəllif adı ən azı 3 simvol olmalıdır.'),
  imageUrl: z.string().url('Düzgün bir şəkil URL-i daxil edin.'),
  imageHint: z.string().optional().default(''),
});

type PostFormValues = z.infer<typeof PostSchema>;

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
        isEditing ? 'Yazını Yenilə' : 'Yazını Yarat'
      )}
    </Button>
  );
}

interface PostFormProps {
    initialData?: BlogPost | null;
    onFormSubmit: (state: FormState) => void;
}

export function PostForm({ initialData, onFormSubmit }: PostFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing ? updatePost : addPost;

  const [state, formAction] = useActionState(action, { message: '', type: 'error' });

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      content: '',
      author: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state);

      if (state.type === 'error' && state.issues) {
        const fieldErrors = state.issues;
        Object.keys(fieldErrors).forEach((key) => {
            const fieldName = key as keyof PostFormValues;
            const message = (fieldErrors as any)[fieldName]?.[0];
            if(message && form.getFieldState(fieldName).error?.type !== 'server') {
              form.setError(fieldName, { type: 'server', message });
            }
        });
      }
    }
  }, [state, onFormSubmit, form]);
  
  useEffect(() => {
    form.reset(initialData || { title: '', description: '', content: '', author: '', imageUrl: '', imageHint: '' });
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
                <Input placeholder="Yazının başlığı" {...field} />
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
              <FormLabel>Qısa Təsvir</FormLabel>
              <FormControl>
                <Textarea placeholder="Yazı üçün qısa xülasə" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Məzmun</FormLabel>
              <FormControl>
                <Textarea placeholder="Yazının tam məzmunu. Sadə HTML və ya Markdown istifadə edə bilərsiniz." className="min-h-[200px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Müəllif</FormLabel>
              <FormControl>
                <Input placeholder="Dr. Aysel Məmmədova" {...field} />
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
                        <Input placeholder="digital health" {...field} />
                    </FormControl>
                     <FormDescription>
                        Bu sahə gələcəkdə AI tərəfindən şəkillərin avtomatik tapılması üçün istifadə ediləcək. Məs: "doctor with patient"
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
