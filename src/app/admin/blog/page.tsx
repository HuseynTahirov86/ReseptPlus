import type { BlogPost } from "@/lib/types";
import { db } from "@/firebase/server-init";
import { BlogClientPage } from "./client-page";

async function getPosts() {
  try {
    const snapshot = await db.collection("blogPosts").orderBy("datePublished", "desc").get();
    const posts = snapshot.docs.map(doc => doc.data() as BlogPost);
    return posts;
  } catch (error) {
    console.error("Error fetching blog posts in Server Component: ", error);
    return [];
  }
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return <BlogClientPage initialPosts={posts} />;
}
