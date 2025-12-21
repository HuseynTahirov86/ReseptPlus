'use client';
import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { BlogPost } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function PostSkeleton() {
    return (
        <Card className="overflow-hidden h-full flex flex-col">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-5 w-24" />
            </CardFooter>
        </Card>
    );
}


export default function BlogPage() {
    const { firestore } = useFirebase();
    const blogPostsQuery = useMemoFirebase(() => firestore && collection(firestore, 'blogPosts'), [firestore]);
    const { data: blogPosts, isLoading } = useCollection<BlogPost>(blogPostsQuery);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Səhiyyə texnologiyaları və SaglikNet yenilikləri haqqında ən son məqalələr.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container">
             <div className="grid gap-8 lg:grid-cols-3">
              {isLoading && Array.from({length: 3}).map((_, i) => <PostSkeleton key={i} />)}
              {!isLoading && blogPosts?.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 w-full">
                        <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.imageHint} />
                    </div>
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                      <CardDescription>{new Date(post.datePublished).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })} • {post.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{post.description}</p>
                    </CardContent>
                     <CardFooter>
                       <span className="text-sm font-semibold text-primary group-hover:underline">Daha çox oxu →</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
               {!isLoading && blogPosts?.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">Heç bir blog yazısı tapılmadı.</p>
               )}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

    