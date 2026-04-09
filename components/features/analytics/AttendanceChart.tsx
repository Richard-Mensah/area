"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import type { ChartDataPoint } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

type Props = { data: ChartDataPoint[]; title?: string }

export default function AttendanceChart({ data, title = "30-Day Attendance Trend" }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} dot={false} name="Present" />
            <Line type="monotone" dataKey="absent"  stroke="#ef4444" strokeWidth={2} dot={false} name="Absent" />
            <Line type="monotone" dataKey="late"    stroke="#f59e0b" strokeWidth={2} dot={false} name="Late" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
