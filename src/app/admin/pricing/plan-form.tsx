'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { addPlan, updatePlan, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { PricingPlan } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const PlanSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Başlıq ən azı 3 simvol olmalıdır.'),
  description: z.string().min(10, 'Təsvir ən azı 10 simvol olmalıdır.'),
  price: z.string().min(1, 'Qiymət daxil edilməlidir.'),
  period: z.string().optional(),
  features: z.string().min(5, "Ən azı bir xüsusiyyət daxil edin (hər birini yeni sətirdə)."),
  isPopular: z.boolean().default(false),
});

type PlanFormValues = z.infer<typeof PlanSchema>;

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
        isEditing ? 'Planı Yenilə' : 'Planı Yarat'
      )}
    </Button>
  );
}

interface PlanFormProps {
    initialData?: PricingPlan | null;
    onFormSubmit: (state: FormState) => void;
}

export function PlanForm({ initialData, onFormSubmit }: PlanFormProps) {
  const isEditing = !!initialData;
  
  const action = isEditing ? updatePlan : addPlan;

  const [state, formAction] = useActionState(action, { message: '', type: 'error', fields: {} });

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(PlanSchema),
    defaultValues: initialData ? {
        ...initialData,
        features: initialData.features.join('\n'),
    } : {
      title: '',
      description: '',
      price: '',
      period: '/ay',
      features: '',
      isPopular: false,
    },
  });

  useEffect(() => {
    if (state.message) {
      onFormSubmit(state as any);
      if (state.type === 'error' && state.issues) {
        const fieldErrors = state.issues;
        Object.keys(fieldErrors).forEach((key) => {
            const fieldName = key as keyof PlanFormValues;
            const message = (fieldErrors as any)[fieldName]?.[0];
            if(message && form.getFieldState(fieldName).error?.type !== 'server') {
              form.setError(fieldName, { type: 'server', message });
            }
        });
      }
    }
  }, [state, onFormSubmit, form]);
  
  useEffect(() => {
    const defaultVals = initialData ? { ...initialData, features: initialData.features.join('\n') } : { title: '', description: '', price: '', period: '/ay', features: '', isPopular: false };
    form.reset(defaultVals);
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
              <FormLabel>Plan Başlığı</FormLabel>
              <FormControl>
                <Input placeholder="Məs., Fərdi Həkim" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Qiymət</FormLabel>
                <FormControl>
                    <Input placeholder="49₼ və ya Xüsusi" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Dövr (optional)</FormLabel>
                <FormControl>
                    <Input placeholder="/ay" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qısa Təsvir</FormLabel>
              <FormControl>
                <Textarea placeholder="Plan üçün qısa xülasə" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xüsusiyyətlər (hər biri yeni sətirdə)</FormLabel>
              <FormControl>
                <Textarea placeholder={"Limitsiz resept yazma\n500 xəstəyə qədər idarəetmə"} className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-2">
            <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        name={field.name}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                            Bu planı populyar kimi işarələ
                        </FormLabel>
                    </div>
                </FormItem>
             )}
            />
        </div>
        
        <SubmitButton isEditing={isEditing} />
      </form>
    </Form>
  );
}
