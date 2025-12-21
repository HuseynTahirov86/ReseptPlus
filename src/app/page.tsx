import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-image");
  const patientAvatar = PlaceHolderImages.find((img) => img.id === "testimonial-patient");
  const doctorAvatar = PlaceHolderImages.find((img) => img.id === "testimonial-doctor");
  const pharmacistAvatar = PlaceHolderImages.find((img) => img.id === "testimonial-pharmacist");

  const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "For Patients",
      description:
        "Easily access your prescriptions, find nearby pharmacies, and manage your medication history all in one secure place.",
      link: "/dashboard",
    },
    {
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
      title: "For Doctors",
      description:
        "Create, sign, and send digital prescriptions in seconds. Leverage AI for smart dosage and interaction suggestions.",
      link: "/dashboard",
    },
    {
      icon: <Pill className="h-10 w-10 text-primary" />,
      title: "For Pharmacies",
      description:
        "Verify prescriptions in real-time, manage your inventory efficiently, and serve your customers faster than ever.",
      link: "/dashboard",
    },
  ];

  const testimonials = [
    {
      avatar: patientAvatar,
      name: "Ayşe Yılmaz",
      role: "Patient",
      text: "SaglikNet has made managing my family's prescriptions incredibly simple. I can see everything on my phone and find the closest pharmacy with my medication in stock.",
    },
    {
      avatar: doctorAvatar,
      name: "Dr. Mehmet Öztürk",
      role: "Doctor",
      text: "This is the future of prescribing. It's faster, more secure, and the AI suggestions are a fantastic safety net. I've reduced prescription errors and saved so much time.",
    },
    {
      avatar: pharmacistAvatar,
      name: "Fatma Kaya",
      role: "Pharmacist",
      text: "Verifying prescriptions used to be a bottleneck. With SaglikNet, it's instant. Our workflow is smoother, and we can focus more on patient care.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center">
            <Logo />
          </div>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="#features" className="transition-colors hover:text-accent">Features</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-accent">How It Works</Link>
            <Link href="#testimonials" className="transition-colors hover:text-accent">Testimonials</Link>
          </nav>
          <div className="flex items-center justify-end md:ml-6">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Log In</Link>
            </Button>
            <Button asChild className="ml-2">
              <Link href="/dashboard">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Connecting Healthcare. Seamlessly.
              </h1>
              <p className="max-w-[600px] text-lg text-muted-foreground">
                SaglikNet is a comprehensive electronic prescription system designed to bring doctors, pharmacies, and patients together for a safer and more efficient healthcare experience.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Get Started Now <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl shadow-2xl md:h-[400px] lg:h-[500px]">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-card py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                A Unified Platform for Everyone
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                SaglikNet is tailored to meet the unique needs of patients, doctors, and pharmacists.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={i} className="flex transform flex-col justify-between transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="mt-4 text-2xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, Secure, and Swift
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our process is designed for maximum efficiency and security.
              </p>
            </div>
            <div className="relative grid gap-12 md:grid-cols-3">
              <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-border md:block"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">1</div>
                <h3 className="text-xl font-semibold">Doctor Prescribes</h3>
                <p className="mt-2 text-muted-foreground">
                  Doctors create and digitally sign prescriptions using our intuitive interface.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">2</div>
                <h3 className="text-xl font-semibold">Patient Receives</h3>
                <p className="mt-2 text-muted-foreground">
                  Patients instantly receive the e-prescription on their SaglikNet profile.
                </p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background text-2xl font-bold text-primary">3</div>
                <h3 className="text-xl font-semibold">Pharmacy Dispenses</h3>
                <p className="mt-2 text-muted-foreground">
                  Pharmacists scan and verify the prescription in real-time before dispensing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full bg-card py-16 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by Healthcare Professionals and Patients
              </h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <Card key={i} className="p-6">
                  <CardContent className="p-0">
                    <p className="italic text-muted-foreground">"{testimonial.text}"</p>
                    <div className="mt-6 flex items-center">
                      {testimonial.avatar && (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.avatar.description} data-ai-hint={testimonial.avatar.imageHint} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="ml-4">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} SaglikNet. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
             <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link>
             <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
