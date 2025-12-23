'use client';

import type { BlogPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from "lucide-react";
import { PostForm } from "./post-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useTransition } from "react";
import { deletePost } from './actions';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BlogClientPageProps {
    initialPosts: BlogPost[];
}

export function BlogClientPage({ initialPosts }: BlogClientPageProps) {
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isPending, startTransition] = useTransition();

    const openFormForEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setIsFormOpen(true);
    }
    
    const openFormForNew = () => {
        setSelectedPost(null);
        setIsFormOpen(true);
    }

    const onFormSubmit = (state: { type: 'success' | 'error', message: string, issues?: any }) => {
        if (state.type === 'success' || (state.type === 'error' && !state.issues)) {
            toast({
                title: state.type === 'success' ? 'Uğurlu' : 'Xəta',
                description: state.message,
                variant: state.type === 'success' ? 'default' : 'destructive',
            });
        }
        if (state.type === 'success') {
            setIsFormOpen(false);
            setSelectedPost(null);
        }
    }
    
     const handleDelete = (id: string) => {
        startTransition(async () => {
            const result = await deletePost(id);
            toast({
                title: result.type === 'success' ? 'Uğurlu' : 'Xəta',
                description: result.message,
                variant: result.type === 'success' ? 'default' : 'destructive',
            });
        });
    };

    return (
        <div className="space-y-8">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle>Blog Yazıları</CardTitle>
                        <CardDescription>
                            Marketinq saytındakı blog yazılarını idarə edin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Başlıq</TableHead>
                                    <TableHead>Müəllif</TableHead>
                                    <TableHead>Nəşr Tarixi</TableHead>
                                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{new Date(post.datePublished).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isPending}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => openFormForEdit(post)}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Redaktə et
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full justify-start px-2 py-1.5 text-sm h-auto relative flex cursor-pointer select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Sil
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Bu əməliyyat geri qaytarıla bilməz. Bu, "{post.title}" başlıqlı yazını sistemdən həmişəlik siləcək.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Bəli, Sil
                                                            </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {initialPosts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Heç bir yazı tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={openFormForNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Yazı Əlavə Et
                        </Button>
                    </CardFooter>
                </Card>

                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{selectedPost ? "Yazını Redaktə Et" : "Yeni Yazı Yarat"}</DialogTitle>
                        <DialogDescription>
                        {selectedPost ? `"${selectedPost.title}" məlumatlarını yeniləyin.` : `Yeni yazı məlumatlarını daxil edin.`}
                        </DialogDescription>
                    </DialogHeader>
                    <PostForm 
                        initialData={selectedPost}
                        onFormSubmit={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
