import { db } from '@/firebase/server-init';
import type { BlogPost } from '@/lib/types';
import MarketingHeader from '@/components/marketing-header';
import MarketingFooter from '@/components/marketing-footer';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getPost(id: string) {
    try {
        const docRef = db.collection('blogPosts').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        return doc.data() as BlogPost;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
      notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-4xl animate-fade-in-up">
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
              
              <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden shadow-xl">
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
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
              />
            </article>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
