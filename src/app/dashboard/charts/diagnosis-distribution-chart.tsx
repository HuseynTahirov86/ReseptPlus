'use client';

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

interface ChartProps {
    prescriptions: Prescription[] | null;
    isLoading: boolean;
}

export function DiagnosisDistributionChart({ prescriptions, isLoading }: ChartProps) {
    const chartData = useMemo(() => {
        if (!prescriptions) return [];

        const diagnosisCounts = prescriptions.reduce((acc, p) => {
            if (p.diagnosis) {
                acc[p.diagnosis] = (acc[p.diagnosis] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(diagnosisCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); 
    }, [prescriptions]);

    const totalDiagnoses = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0);
    }, [chartData]);
    
    if (isLoading) {
        return (
            <Card className="flex flex-col h-full">
                <CardHeader className="items-center pb-0">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="flex items-center justify-center h-full">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Diaqnozların Paylanması</CardTitle>
        <CardDescription>Ən çox rastlanan 5 diaqnoz</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Ən populyar diaqnozlar arasında trendlər <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Cəmi {totalDiagnoses} diaqnoz göstərilir.
        </div>
      </CardFooter>
    </Card>
  );
}
