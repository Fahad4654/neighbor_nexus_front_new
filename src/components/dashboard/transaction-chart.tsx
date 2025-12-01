"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", tools: 186, services: 80 },
  { month: "February", tools: 305, services: 200 },
  { month: "March", tools: 237, services: 120 },
  { month: "April", tools: 73, services: 190 },
  { month: "May", tools: 209, services: 130 },
  { month: "June", tools: 214, services: 140 },
]

const chartConfig = {
  tools: {
    label: "Tools",
    color: "hsl(var(--chart-1))",
  },
  services: {
    label: "Services",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function TransactionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="tools" fill="var(--color-tools)" radius={4} />
            <Bar dataKey="services" fill="var(--color-services)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
