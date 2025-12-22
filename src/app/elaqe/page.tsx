import MarketingHeader from "@/components/marketing-header";
import MarketingFooter from "@/components/marketing-footer";
import { Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container text-center animate-fade-in-up" style={{ animationDuration: '0.9s' }}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Əlaqə</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Suallarınız var? Komandamız sizə kömək etməyə hazırdır.
            </p>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container grid gap-16 md:grid-cols-2 items-start">
             <Card 
                className="animate-fade-in-up bg-glass-bg border-glass-border backdrop-blur-lg"
                style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}
              >
                <CardHeader>
                    <CardTitle>Mesaj Göndərin</CardTitle>
                    <CardDescription>Aşağıdakı formu doldurun, ən qısa zamanda sizinlə əlaqə saxlayacağıq.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">Ad</Label>
                            <Input id="first-name" placeholder="Adınız" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="last-name">Soyad</Label>
                            <Input id="last-name" placeholder="Soyadınız" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@nümunə.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Mesajınız</Label>
                        <Textarea id="message" placeholder="Mesajınızı buraya yazın..." className="min-h-[120px]" />
                    </div>
                    <Button className="w-full">Göndər</Button>
                </CardContent>
             </Card>
             <div className="space-y-8">
                <Card 
                  className="animate-fade-in-up bg-glass-bg border-glass-border backdrop-blur-lg"
                  style={{ animationDelay: '0.4s', animationDuration: '0.9s' }}
                >
                    <CardHeader className="flex-row items-center gap-4">
                        <Mail className="h-8 w-8 text-primary"/>
                        <div>
                            <CardTitle>Email</CardTitle>
                            <CardDescription>Ümumi suallar üçün</CardDescription>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <a href="mailto:info@sagliknet.az" className="font-semibold text-primary hover:underline">info@sagliknet.az</a>
                    </CardContent>
                </Card>
                 <Card 
                  className="animate-fade-in-up bg-glass-bg border-glass-border backdrop-blur-lg"
                  style={{ animationDelay: '0.6s', animationDuration: '0.9s' }}
                 >
                    <CardHeader className="flex-row items-center gap-4">
                        <MessageSquare className="h-8 w-8 text-primary"/>
                        <div>
                            <CardTitle>Texniki Dəstək</CardTitle>
                            <CardDescription>Texniki yardım üçün</CardDescription>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <a href="mailto:destek@sagliknet.az" className="font-semibold text-primary hover:underline">destek@sagliknet.az</a>
                    </CardContent>
                </Card>
             </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
