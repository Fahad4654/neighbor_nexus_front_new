"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"

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
} from "@/components/ui/chart"

const chartData = [
  { nexus: "Oakwood", users: 275, fill: "var(--color-oakwood)" },
  { nexus: "Maple Creek", users: 200, fill: "var(--color-maplecreek)" },
  { nexus: "Willow Heights", users: 187, fill: "var(--color-willowheights)" },
  { nexus: "Pine Ridge", users: 173, fill: "var(--color-pineridge)" },
  { nexus: "Other", users: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  users: {
    label: "Users",
  },
  oakwood: {
    label: "Oakwood",
    color: "hsl(var(--chart-1))",
  },
  maplecreek: {
    label: "Maple Creek",
    color: "hsl(var(--chart-2))",
  },
  willowheights: {
    label: "Willow Heights",
    color: "hsl(var(--chart-3))",
  },
  pineridge: {
    label: "Pine Ridge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
}

export function PenetrationChart() {
  const id = "pie-interactive"
  const totalUsers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.users, 0)
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Local Penetration</CardTitle>
        <CardDescription>Users per Nexus Zone</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="users"
              nameKey="nexus"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalUsers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Users
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
