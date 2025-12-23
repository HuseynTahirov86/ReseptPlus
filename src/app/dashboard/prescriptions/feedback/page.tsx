'use client';

import { Suspense } from 'react';
import FeedbackForm from './feedback-form';

function FeedbackPageContent() {
  return (
    <div className="space-y-8">
      <FeedbackForm />
    </div>
  );
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={<div>Yüklənir...</div>}>
            <FeedbackPageContent />
        </Suspense>
    )
}
