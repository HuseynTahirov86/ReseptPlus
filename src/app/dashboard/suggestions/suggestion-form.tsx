'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getSuggestions, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bot, Loader2, Pill, RefreshCcwDot, Sparkles } from 'lucide-react';

const SmartMedicationSuggestionsInputSchema = z.object({
  patientHistory: z.string().min(10, 'Patient history must be at least 10 characters.'),
  currentMedications: z.string().min(3, 'Current medications must be at least 3 characters.'),
  doctorNotes: z.string(),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
         <Sparkles className="mr-2" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export function SuggestionForm() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(getSuggestions, initialState);

  const form = useForm<z.infer<typeof SmartMedicationSuggestionsInputSchema>>({
    resolver: zodResolver(SmartMedicationSuggestionsInputSchema),
    defaultValues: {
      patientHistory: '',
      currentMedications: '',
      doctorNotes: '',
    },
    // This makes the form update when the server action returns new state
    values: state?.fields && {
        patientHistory: state.fields.patientHistory || '',
        currentMedications: state.fields.currentMedications || '',
        doctorNotes: state.fields.doctorNotes || '',
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot /> Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <FormField
                control={form.control}
                name="patientHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Medical History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Diagnosed with Type 2 Diabetes in 2018, history of hypertension..."
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
                    <FormLabel>Current Medications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Metformin 500mg daily, Lisinopril 10mg daily..."
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
                    <FormLabel>Doctor's Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Patient reports mild dizziness in the mornings..."
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
            {state.issues.join(', ')}
            </AlertDescription>
        </Alert>
      )}

      {state?.data && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-accent"/> AI Generated Suggestions</h2>
            <div className="grid gap-6 lg:grid-cols-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Pill /> Suggested Dosage</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-foreground">
                        <p>{state.data.suggestedDosage}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><RefreshCcwDot /> Refill Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-foreground">
                         <p>{state.data.refillSuggestions}</p>
                    </CardContent>
                </Card>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Potential Interactions</AlertTitle>
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
