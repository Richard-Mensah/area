"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

type Props = {
  present: number
  absent: number
  late: number
  title?: string
}

export default function ClassOverviewChart({ present, absent, late, title = "Today's Attendance" }: Props) {
  const data = [
    { name: "Present", value: present, color: "#22c55e" },
    { name: "Absent",  value: absent,  color: "#ef4444" },
    { name: "Late",    value: late,    color: "#f59e0b" },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            No attendance recorded today
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [v, name]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
