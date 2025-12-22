'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function SecurityPage() {
    const [rules, setRules] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since we can't directly read the file, this is a placeholder.
        // In a real scenario, this might fetch from an API endpoint
        // that serves the content of the rules file.
        const mockRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }

    // Rules for patients, doctors, pharmacies etc.
    // ...
    
    match /admins/{adminId} {
      allow get, list, write: if isSystemAdmin();
    }

    match /systemAdmins/{adminId} {
        allow get, list, write: if isSystemAdmin();
    }

    // ... other rules
  }
}
        `.trim();
        setRules(mockRules);
        setLoading(false);
    }, []);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Firestore Təhlükəsizlik Qaydaları
                    </CardTitle>
                    <CardDescription>
                        Bu, verilənlər bazasına girişi idarə edən Firestore təhlükəsizlik qaydalarının bir xülasəsidir. 
                        Bu fayl birbaşa redaktə edilə bilməz, lakin sistemin təhlükəsizlik məntiqini anlamaq üçün burada göstərilir.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Qaydalar yüklənir...</p>
                    ) : (
                        <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                            <code>{rules}</code>
                        </pre>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
