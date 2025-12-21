import { SuggestionForm } from "./suggestion-form";

export default function SuggestionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ağıllı Dərman Təklifləri</h1>
        <p className="text-muted-foreground">
          Xəstə məlumatlarına əsaslanaraq dozalar, təkrarlar və potensial qarşılıqlı təsirlər üçün təkliflər almaq üçün AI-dan istifadə edin.
        </p>
      </div>
      <SuggestionForm />
    </div>
  );
}
