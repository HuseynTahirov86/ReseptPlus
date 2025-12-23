'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, DatabaseZap } from "lucide-react";
import { seedDatabase } from "./actions";

export default function SeedPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

    useEffect(() => {
        if (!isUserLoading && user?.profile?.role !== 'system_admin') {
            router.push('/admin/dashboard');
        }
    }, [user, isUserLoading, router]);

    const handleSeed = () => {
        startTransition(async () => {
            const res = await seedDatabase();
            setResult(res);
        });
    }
    
    if (isUserLoading || user?.profile?.role !== 'system_admin') {
        return (
             <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <DatabaseZap className="w-7 h-7 text-primary"/>
                        Nümunə Məlumatları Yarat
                    </CardTitle>
                    <CardDescription>
                        Bu əməliyyat, platformanın funksionallığını nümayiş etdirmək üçün lazım olan bütün nümunə hesabları (xəstəxana, həkimlər, aptek, əczaçılar, xəstə) və məlumatları (inventar) yaradacaq. Bu əməliyyatı yalnız bir dəfə icra etmək kifayətdir.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {result && (
                        <Alert variant={result.type === 'success' ? 'default' : 'destructive'} className="mb-6">
                            {result.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{result.type === 'success' ? 'Uğurlu!' : 'Xəta!'}</AlertTitle>
                            <AlertDescription>
                                {result.message}
                            </AlertDescription>
                        </Alert>
                    )}
                    <Button onClick={handleSeed} disabled={isPending} className="w-full">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isPending ? 'Məlumatlar Yaradılır...' : 'Nümunə Məlumatları Yarat'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
