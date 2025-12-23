'use client';
import { useUser, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import type { Doctor, DoctorFeedback } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, User, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface DoctorWithFeedback extends Doctor {
    feedback: DoctorFeedback[];
    avgRating: number;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
            <span className="ml-2 text-sm font-bold text-muted-foreground">({rating.toFixed(1)})</span>
        </div>
    );
}

export default function HospitalFeedbackPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const router = useRouter();

    const [doctorsWithFeedback, setDoctorsWithFeedback] = useState<DoctorWithFeedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const hospitalId = user?.profile?.hospitalId;

    useEffect(() => {
        if (!isUserLoading && user?.profile?.role !== 'head_doctor') {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const fetchFeedback = async () => {
            if (!firestore || !hospitalId) return;

            setIsLoading(true);

            try {
                // 1. Get all doctors in the hospital
                const doctorsQuery = query(collection(firestore, 'doctors'), where('hospitalId', '==', hospitalId));
                const doctorsSnapshot = await getDocs(doctorsQuery);
                const hospitalDoctors = doctorsSnapshot.docs.map(doc => doc.data() as Doctor);

                if (hospitalDoctors.length === 0) {
                    setIsLoading(false);
                    return;
                }
                
                const doctorIds = hospitalDoctors.map(d => d.id);
                
                // 2. Get all feedback for those doctors using a collectionGroup query
                const feedbackQuery = query(collectionGroup(firestore, 'feedback'), where('doctorId', 'in', doctorIds));
                const feedbackSnapshot = await getDocs(feedbackQuery);
                
                const feedbackByDoctor: Record<string, DoctorFeedback[]> = {};
                feedbackSnapshot.forEach(doc => {
                    const feedback = doc.data() as DoctorFeedback;
                    if (!feedbackByDoctor[feedback.doctorId]) {
                        feedbackByDoctor[feedback.doctorId] = [];
                    }
                    feedbackByDoctor[feedback.doctorId].push(feedback);
                });

                // 3. Combine data
                const combinedData: DoctorWithFeedback[] = hospitalDoctors.map(doctor => {
                    const feedbacks = feedbackByDoctor[doctor.id] || [];
                    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
                    const avgRating = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;
                    return {
                        ...doctor,
                        feedback: feedbacks.sort((a,b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()),
                        avgRating
                    };
                });
                
                // Sort doctors by average rating
                combinedData.sort((a,b) => b.avgRating - a.avgRating);
                
                setDoctorsWithFeedback(combinedData);

            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (firestore && hospitalId) {
            fetchFeedback();
        }

    }, [firestore, hospitalId]);


    if (isUserLoading || isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <div className="space-y-3 pt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }
    
    if (user?.profile?.role !== 'head_doctor') {
        return null; // Or a more explicit "Unauthorized" component
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Həkim Rəyləri</h1>
                <p className="text-muted-foreground">
                    Xəstəxananızdakı həkimlərə verilən xəstə rəylərinə baxın və xidmət keyfiyyətini izləyin.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Rəy Xülasəsi</CardTitle>
                    <CardDescription>Həkimlər orta reytinqə görə sıralanıb.</CardDescription>
                </CardHeader>
                <CardContent>
                    {doctorsWithFeedback.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {doctorsWithFeedback.map(doctor => (
                                <AccordionItem value={doctor.id} key={doctor.id}>
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className='flex items-center gap-3'>
                                                <Avatar>
                                                    <AvatarFallback>{doctor.firstName[0]}{doctor.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</p>
                                                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-4'>
                                                 <Badge variant="outline" className="h-8">
                                                    <MessageSquare className="h-4 w-4 mr-2"/>
                                                    {doctor.feedback.length} rəy
                                                </Badge>
                                                <StarRating rating={doctor.avgRating} />
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 pt-4 pl-4 border-l-2 ml-4">
                                            {doctor.feedback.length > 0 ? doctor.feedback.map(fb => (
                                                <div key={fb.id} className="p-4 rounded-lg bg-muted/50">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <StarRating rating={fb.rating}/>
                                                        <p className="text-xs text-muted-foreground">{new Date(fb.dateSubmitted).toLocaleDateString()}</p>
                                                    </div>
                                                    <p className="text-sm italic">"{fb.comment || 'Şərh yazılmayıb.'}"</p>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-muted-foreground italic text-center py-4">Bu həkim üçün heç bir rəy tapılmadı.</p>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                         <div className="text-center py-12 text-muted-foreground">
                            <p>Xəstəxananızdakı həkimlər üçün heç bir rəy tapılmadı.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
