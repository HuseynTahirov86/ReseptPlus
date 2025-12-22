'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';

import { getSuggestions, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bot, Loader2, Pill, RefreshCcwDot, Sparkles } from 'lucide-react';

const SmartMedicationSuggestionsInputSchema = z.object({
  patientHistory: z.string().min(10, 'Xəstə tarixçəsi ən azı 10 simvol olmalıdır.'),
  currentMedications: z.string().min(3, 'Cari dərmanlar ən azı 3 simvol olmalıdır.'),
  doctorNotes: z.string(),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Yaradılır...
        </>
      ) : (
        <>
         <Sparkles className="mr-2" />
          Təklif Al
        </>
      )}
    </Button>
  );
}

export function SuggestionForm() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useActionState(getSuggestions, initialState);
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof SmartMedicationSuggestionsInputSchema>>({
    resolver: zodResolver(SmartMedicationSuggestionsInputSchema),
    defaultValues: {
      patientHistory: '',
      currentMedications: '',
      doctorNotes: '',
    },
    values: state?.fields ? {
        patientHistory: state.fields.patientHistory || '',
        currentMedications: state.fields.currentMedications || '',
        doctorNotes: state.fields.doctorNotes || '',
    } : {
        patientHistory: searchParams.get('patientHistory') || '',
        currentMedications: searchParams.get('currentMedications') || '',
        doctorNotes: searchParams.get('doctorNotes') || '',
    }
  });

  useEffect(() => {
    const patientHistory = searchParams.get('patientHistory');
    const currentMedications = searchParams.get('currentMedications');
    const doctorNotes = searchParams.get('doctorNotes');
    if(patientHistory || currentMedications || doctorNotes) {
        form.reset({
            patientHistory: patientHistory || '',
            currentMedications: currentMedications || '',
            doctorNotes: doctorNotes || '',
        });
    }
  }, [searchParams, form]);


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot /> Xəstə Məlumatı</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <FormField
                control={form.control}
                name="patientHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xəstənin Tibbi Tarixçəsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Məs., 2018-ci ildə 2-ci tip diabet diaqnozu qoyulub, hipertoniya tarixçəsi..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentMedications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cari Dərmanlar</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Məs., Metformin 500mg gündəlik, Lisinopril 10mg gündəlik..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctorNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Həkim Qeydləri (İstəyə bağlı)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Məs., Xəstə səhərlər yüngül başgicəllənmədən şikayətlənir..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {state?.issues && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Xəta</AlertTitle>
            <AlertDescription>
            {state.issues.join(', ')}
            </AlertDescription>
        </Alert>
      )}

      {state?.data && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-accent"/> AI tərəfindən Yaradılan Təkliflər</h2>
            <div className="grid gap-6 lg:grid-cols-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Pill /> Təklif Olunan Doza</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-foreground">
                        <p>{state.data.suggestedDosage}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><RefreshCcwDot /> Təkrar Dərman Təklifləri</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-foreground">
                         <p>{state.data.refillSuggestions}</p>
                    </CardContent>
                </Card>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Potensial Qarşılıqlı Təsirlər</AlertTitle>
                    <AlertDescription className="prose prose-sm max-w-none text-destructive-foreground">
                         <p>{state.data.potentialInteractions}</p>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
      )}
    </div>
  );
}
