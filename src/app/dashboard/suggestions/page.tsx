'use client';

import { SuggestionChat } from './suggestion-chat';

export default function SuggestionsPage() {
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
