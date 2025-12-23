'use client';

import { Suspense } from 'react';
import { SuggestionChat } from './suggestion-chat';
import { Loader2 } from 'lucide-react';

function SuggestionsPageContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Konsultasiyası</h1>
        <p className="text-muted-foreground">
          Xəstə məlumatlarına əsaslanaraq doza, təkrar dərman və potensial qarşılıqlı təsirlər barədə AI ilə məsləhətləşin.
        </p>
      </div>
      <SuggestionChat />
    </div>
  );
}

export default function SuggestionsPage() {
    return (
        <Suspense fallback={<div className='flex h-full w-full items-center justify-center'><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <SuggestionsPageContent />
        </Suspense>
    )
}
