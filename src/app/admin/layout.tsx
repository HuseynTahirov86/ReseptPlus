'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user loading is finished and there's no user or the user is not an admin, redirect.
    if (!isUserLoading && (!user || user.profile?.role !== 'admin')) {
      router.push('/dashboard'); // Redirect to the main dashboard or a login page
    }
  }, [user, isUserLoading, router]);

  // While checking user auth, show a loader
  if (isUserLoading || !user || user.profile?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is an admin, render the requested page
  return <>{children}</>;
}

    