'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Prescription } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitDoctorFeedback } from '../../patients/actions';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Göndərilir...</> : <><Send className="mr-2 h-4 w-4" /> Rəyi Göndər</>}
        </Button>
    );
}

export default function FeedbackForm() {
    const searchParams = useSearchParams();
    const prescriptionId = searchParams.get('prescriptionId');
    const { user } = useUser();
    const { firestore } = useFirebase();

    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rating, setRating] = useState(0);

    const [state, formAction] = useActionState(submitDoctorFeedback, { message: '', type: 'error' });

    useEffect(() => {
        if (!prescriptionId || !firestore) {
            setError('Resept ID tapılmadı.');
            setIsLoading(false);
            return;
        }

        const fetchPrescription = async () => {
            try {
                const docRef = doc(firestore, 'prescriptions', prescriptionId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPrescription(docSnap.data() as Prescription);
                } else {
                    setError('Bu resept tapılmadı.');
                }
            } catch (e) {
                console.error(e);
                setError('Resept məlumatlarını yükləyərkən xəta baş verdi.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrescription();
    }, [prescriptionId, firestore]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Xəta</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!prescription) {
        return null;
    }

    if (state.type === 'success') {
        return (
            <Card className="max-w-2xl mx-auto">
                 <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Təşəkkür edirik!</h2>
                    <p className="text-muted-foreground mb-6">{state.message}</p>
                    <Button asChild>
                        <Link href="/dashboard/prescriptions">Reseptlərimə Qayıt</Link>
                    </Button>
                 </CardContent>
            </Card>
        )
    }

    return (
        <form action={formAction} className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Həkimə Rəy Bildirmək</CardTitle>
                    <CardDescription>
                        {new Date(prescription.datePrescribed).toLocaleDateString()} tarixli resepti yazan Dr. {prescription.doctorName} haqqında rəyinizi bildirin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {state.type === 'error' && state.message && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Xəta</AlertTitle>
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    
                    <input type="hidden" name="prescriptionId" value={prescription.id} />
                    <input type="hidden" name="doctorId" value={prescription.doctorId} />
                    <input type="hidden" name="patientId" value={prescription.patientId} />
                    <input type="hidden" name="rating" value={rating} />

                    <div className="space-y-2">
                        <Label>Reytinqiniz</Label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "h-8 w-8 cursor-pointer transition-colors",
                                        rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                    )}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment">Rəyiniz (istəyə bağlı)</Label>
                        <Textarea id="comment" name="comment" placeholder="Həkimin xidmətindən razı qaldınızmı? Nəyi bəyəndiniz və ya nəyi yaxşılaşdırmaq olar?" />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    );
}