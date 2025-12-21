import { SuggestionForm } from "./suggestion-form";

export default function SuggestionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Medication Suggestions</h1>
        <p className="text-muted-foreground">
          Leverage AI to get suggestions for dosages, refills, and potential interactions based on patient data.
        </p>
      </div>
      <SuggestionForm />
    </div>
  );
}
