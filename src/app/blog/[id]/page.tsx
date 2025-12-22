'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { useParams } from 'next/navigation';
import type { BlogPost } from '@/lib/types';
import MarketingHeader from '@/components/marketing-header';
import MarketingFooter from '@/components/marketing-footer';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function BlogPostPage() {
  const params = useParams();
  const { id } = params;
  const { firestore } = useFirebase();

  const postRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'blogPosts', id as string) : null),
    [firestore, id]
  );
  const { data: post, isLoading } = useDoc<BlogPost>(postRef);

  if (!isLoading && !post) {
      notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-4xl">
          {isLoading ? (
            <article>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="w-full h-96 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <br/>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            </article>
          ) : post && (
            <article>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground mb-8">
                 <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.datePublished}>
                      {new Date(post.datePublished).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                </div>
              </div>
              
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  data-ai-hint={post.imageHint}
                />
              </div>

              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} // Simple newline to <br> conversion for now
              />
            </article>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
