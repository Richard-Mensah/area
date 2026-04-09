"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from "recharts"
import type { SubjectChartPoint } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

type Props = { data: SubjectChartPoint[]; title?: string }

function barColor(rate: number): string {
  if (rate >= 90) return "#22c55e"
  if (rate >= 75) return "#f59e0b"
  return "#ef4444"
}

export default function SubjectChart({ data, title = "Attendance by Subject" }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} unit="%" />
            <Tooltip
              formatter={(v) => [`${v}%`, "Attendance"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <ReferenceLine y={75} stroke="#e5e7eb" strokeDasharray="4 4" label={{ value: "75%", fontSize: 10, fill: "#9ca3af" }} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={barColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
