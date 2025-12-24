'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Prescription } from "@/lib/types";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartProps {
    prescriptions: Prescription[] | null;
    isLoading: boolean;
}

export function MonthlyPrescriptionsChart({ prescriptions, isLoading }: ChartProps) {
    const chartData = useMemo(() => {
        if (!prescriptions) return [];
        
        const monthlyCounts = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('az-AZ', { month: 'long' }),
            count: 0,
        }));
        
        prescriptions.forEach(p => {
            const monthIndex = new Date(p.datePrescribed).getMonth();
            monthlyCounts[monthIndex].count += 1;
        });

        return monthlyCounts;
    }, [prescriptions]);

     if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-56 w-full" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylıq Resept Statistikası</CardTitle>
        <CardDescription>Bu il ərzində yazılmış reseptlərin aylıq sayı</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ count: { label: "Resept", color: "hsl(var(--primary))" } }}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis 
                dataKey="count" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
