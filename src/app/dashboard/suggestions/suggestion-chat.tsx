'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { Bot, Loader2, Sparkles, User, Send } from 'lucide-react';
import { submitMessage, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/ai/flows/consultation-flow';

const initialMessage: ChatMessage = {
  role: 'model',
  content: 'Salam, həkim. Xəstənin cari şikayəti nədir?',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      <span className="sr-only">Göndər</span>
    </Button>
  );
}

export function SuggestionChat() {
  const searchParams = useSearchParams();
  const patientHistory = searchParams.get('patientHistory') || 'Tarixçə tapılmadı.';

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([initialMessage]);
  const initialState: FormState = { message: '' };
  const [state, formAction] = useActionState(submitMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.response) {
      setChatHistory((prev) => [...prev, { role: 'model', content: state.response! }]);
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div:first-child');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [chatHistory]);


  const handleFormSubmit = (formData: FormData) => {
    const userMessage = formData.get('message') as string;
    if (!userMessage.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);

    const newFormData = new FormData();
    newFormData.append('patientHistory', patientHistory);
    newFormData.append('chatHistory', JSON.stringify(newHistory));
    
    formAction(newFormData);

    formRef.current?.reset();
  };

  return (
    <Card className="flex flex-col h-[70vh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Konsultant</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <CardContent className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className={cn('flex items-start gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'model' && (
                <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                  <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-md rounded-lg p-3', msg.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
               {msg.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {useFormStatus().pending && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
        </CardContent>
      </ScrollArea>
      <CardFooter className="pt-4 border-t">
        <form ref={formRef} action={handleFormSubmit} className="flex w-full items-center gap-2">
            <Textarea
                name="message"
                placeholder="AI asistana mesajınızı yazın..."
                className="flex-1 resize-none"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        formRef.current?.requestSubmit();
                    }
                }}
            />
            <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
