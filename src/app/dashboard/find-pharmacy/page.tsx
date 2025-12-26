'use client';

import { useState } from 'react';
import { useUser, useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MapPin, Search, AlertCircle, Navigation } from 'lucide-react';
import type { Prescription } from '@/lib/types';
import { findAndSortPharmacies, type FoundPharmacy } from './actions';

export default function FindPharmacyPage() {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foundPharmacies, setFoundPharmacies] = useState<FoundPharmacy[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const prescriptionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'prescriptions'),
            where('patientId', '==', user.uid),
            where('status', '==', 'Gözləmədə'),
            orderBy('datePrescribed', 'desc')
        );
    }, [firestore, user]);

    const { data: prescriptions, isLoading: isLoadingPrescriptions } = useCollection<Prescription>(prescriptionsQuery);

    const handleSearch = async () => {
        if (!selectedPrescriptionId) {
            setError("Zəhmət olmasa, bir resept seçin.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setFoundPharmacies([]);

        // 1. Get user's location
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const selectedPrescription = prescriptions?.find(p => p.id === selectedPrescriptionId);

                if (selectedPrescription) {
                    // 2. Call server action to find and sort pharmacies
                    const results = await findAndSortPharmacies(selectedPrescription.medications, latitude, longitude);
                    setFoundPharmacies(results);
                } else {
                    setError("Seçilmiş resept tapılmadı.");
                }
                setIsLoading(false);
            },
            (geoError) => {
                // 3. Handle location error
                setError(`Coğrafi mövqeyi əldə etmək mümkün olmadı: ${geoError.message}. Zəhmət olmasa, brauzerinizdə bu sayt üçün icazə verdiyinizdən əmin olun.`);
                setIsLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin/> Ən Yaxın Apteki Tap</CardTitle>
                    <CardDescription>
                        Axtarış etmək üçün aktiv reseptlərinizdən birini seçin. Sistem, reseptdəki bütün dərmanların olduğu ən yaxın aptekləri tapacaq.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
                    <Select onValueChange={setSelectedPrescriptionId} disabled={isLoadingPrescriptions}>
                        <SelectTrigger className="w-full sm:w-[400px]">
                            <SelectValue placeholder={isLoadingPrescriptions ? "Reseptlər yüklənir..." : "Aktiv resept seçin..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {prescriptions?.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {new Date(p.datePrescribed).toLocaleDateString()} - {p.diagnosis}
                                </SelectItem>
                            ))}
                             {prescriptions?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Aktiv reseptiniz yoxdur.</div>}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} disabled={isLoading || !selectedPrescriptionId}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Axtar
                    </Button>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Xəta</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading && (
                <div className="text-center p-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Apteklər axtarılır və məsafə hesablanır...</p>
                </div>
            )}

            {hasSearched && !isLoading && !error && (
                <Card>
                    <CardHeader>
                        <CardTitle>Axtarış Nəticələri</CardTitle>
                        <CardDescription>
                            Seçilmiş reseptdəki bütün dərmanların olduğu apteklər, sizə ən yaxın olandan başlayaraq sıralanmışdır.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {foundPharmacies.length > 0 ? (
                            <div className="space-y-4">
                                {foundPharmacies.map(({ pharmacy, distance }) => (
                                    <Card key={pharmacy.id} className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{pharmacy.name}</h3>
                                            <p className="text-muted-foreground">{pharmacy.address}</p>
                                            <p className="text-sm">{pharmacy.contactNumber} • {pharmacy.email}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-primary text-lg">
                                                ~{distance.toFixed(1)} km
                                            </div>
                                            <Button asChild variant="outline" size="sm" className="mt-2">
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Navigation className="mr-2 h-4 w-4"/>
                                                    Xəritədə Bax
                                                </a>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Aptek Tapılmadı</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Təəssüf ki, reseptinizdəki bütün dərmanların birlikdə olduğu heç bir aptek tapılmadı.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
