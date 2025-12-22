'use client';

import { Logo } from '@/components/logo';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

const ValueProposition = ({
  icon: Icon,
  text,
  delay,
}: {
  icon: React.ElementType;
  text: string;
  delay: string;
}) => (
  <div
    className="flex items-center gap-4 animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100/70 text-blue-600">
      <Icon className="h-6 w-6" />
    </div>
    <span className="text-lg font-medium text-gray-700">{text}</span>
  </div>
);

export default function PitchDeckPage() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left side - Visual Mockup */}
      <div className="relative hidden w-3/5 flex-col items-center justify-center overflow-hidden bg-gray-50/50 p-12 lg:flex">
        {/* Abstract background shapes */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-teal-100/30 blur-3xl" />
        
        <div
          className="relative h-[450px] w-full max-w-2xl rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-2xl shadow-blue-100/50 backdrop-blur-xl animate-fade-in-up"
          style={{ animationDuration: '1.2s' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
            <div className="h-6 w-48 rounded-md bg-gray-100"></div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            {/* Left panel */}
            <div className="col-span-1 space-y-4">
              <div className="h-8 w-full rounded-md bg-blue-100/80"></div>
              <div className="h-8 w-full rounded-md bg-gray-100"></div>
              <div className="h-8 w-full rounded-md bg-gray-100"></div>
              <div className="h-8 w-full rounded-md bg-gray-100"></div>
            </div>

            {/* Main panel - visualization */}
            <div className="relative col-span-2 rounded-lg border border-dashed border-gray-300 p-4">
              <div
                className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 animate-pulse items-center justify-center rounded-full bg-blue-500/10 p-4"
                style={{ animationDelay: '1s' }}
              >
                <BrainCircuit className="h-8 w-8 text-blue-500" />
              </div>

              {/* Connecting lines and icons */}
              <FileText className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <ShieldCheck className="absolute right-4 top-4 h-6 w-6 text-green-500" />
              <BarChart3 className="absolute bottom-4 left-4 h-6 w-6 text-gray-400" />
              <div className="absolute bottom-4 right-4 h-12 w-12 rounded-lg bg-gray-100"></div>

              {/* Animated lines */}
              <svg className="absolute inset-0 h-full w-full opacity-30">
                <line
                  x1="25%"
                  y1="15%"
                  x2="48%"
                  y2="48%"
                  stroke="#a0b4d1"
                  strokeWidth="2"
                  strokeDasharray="4"
                  className="animate-flow"
                />
                <line
                  x1="75%"
                  y1="15%"
                  x2="52%"
                  y2="48%"
                  stroke="#a0b4d1"
                  strokeWidth="2"
                  strokeDasharray="4"
                  className="animate-flow"
                  style={{ animationDelay: '0.5s' }}
                />
                 <line
                  x1="25%"
                  y1="85%"
                  x2="48%"
                  y2="52%"
                  stroke="#a0b4d1"
                  strokeWidth="2"
                  strokeDasharray="4"
                  className="animate-flow"
                   style={{ animationDelay: '1s' }}
                />
              </svg>
            </div>
          </div>
           <div className="mt-6 space-y-3">
              <div className="h-5 w-full rounded-md bg-gray-100"></div>
               <div className="h-5 w-3/4 rounded-md bg-gray-100"></div>
          </div>
        </div>
        <style jsx>{`
          @keyframes flow {
            from {
              stroke-dashoffset: 8;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          .animate-flow {
            animation: flow 1s linear infinite;
          }
        `}</style>
      </div>

      {/* Right side - Content */}
      <div className="flex w-full flex-col justify-center p-8 lg:w-2/5 lg:p-16">
        <Link href="/" className="mb-16">
          <Logo />
        </Link>
        <div className="w-full max-w-md">
          <h1
            className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            ReseptPlus
          </h1>
          <p
            className="mt-4 text-xl text-gray-600 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Səhiyyəni rəqəmsal, təhlükəsiz və ağıllı bir sistemdə birləşdirən
            vahid platforma.
          </p>

          <div className="mt-12 space-y-8 border-t border-gray-200 pt-12">
            <ValueProposition
              icon={FileText}
              text="Rəqəmsal və Kağızsız Səhiyyə Axını"
              delay="0.6s"
            />
            <ValueProposition
              icon={BrainCircuit}
              text="Süni İntellekt Dəstəkli Tibbi Qərarlar"
              delay="0.8s"
            />
            <ValueProposition
              icon={ShieldCheck}
              text="Məlumatlar üçün Kompromissiz Təhlükəsizlik"
              delay="1.0s"
            />
          </div>

          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: '1.2s' }}
          >
            <Link
              href="#problem"
              className="inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-800"
            >
              Təqdimata Başla <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
