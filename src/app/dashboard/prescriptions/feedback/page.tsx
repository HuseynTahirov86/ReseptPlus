'use client';

import { Suspense } from 'react';
import FeedbackForm from './feedback-form';
import { Loader2 } from 'lucide-react';

function FeedbackPageContent() {
  return (
    <div className="space-y-8">
      <FeedbackForm />
    </div>
  );
}

export default function FeedbackPage() {
    return (
        <Suspense fallback={<div className='flex items-center justify-center h-full'><Loader2 className='h-8 w-8 animate-spin'/></div>}>
            <FeedbackPageContent />
        </Suspense>
    )
}
