import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from "lucide-react"
import Badge from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"
import type { Prediction, RiskLevel } from "@/types"
import { cn } from "@/lib/utils"

type Props = { prediction: Prediction }

const riskConfig: Record<RiskLevel, { badge: "at-risk" | "needs-improvement" | "good" | "excellent"; icon: React.ElementType; color: string }> = {
  "At Risk":           { badge: "at-risk",           icon: AlertTriangle, color: "text-red-500"    },
  "Needs Improvement": { badge: "needs-improvement", icon: AlertCircle,   color: "text-orange-500" },
  "Good Standing":     { badge: "good",              icon: TrendingUp,    color: "text-blue-500"   },
  "Excellent":         { badge: "excellent",         icon: CheckCircle,   color: "text-green-500"  },
}

export default function PredictionCard({ prediction }: Props) {
  const config = riskConfig[prediction.riskLevel]
  const Icon = config.icon

  return (
    <Card className="p-0">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{prediction.studentName}</p>
            <p className="text-xs text-gray-500">Class {prediction.studentClass}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={config.badge}>{prediction.riskLevel}</Badge>
            <span className="text-xs font-bold text-gray-700">Grade: {prediction.gradeBand}</span>
          </div>
        </div>

        {/* Attendance rate bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Attendance Rate</span>
            <span className="font-medium">{prediction.attendanceRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                prediction.attendanceRate >= 90 ? "bg-green-500" :
                prediction.attendanceRate >= 75 ? "bg-blue-500"  :
                prediction.attendanceRate >= 60 ? "bg-yellow-500": "bg-red-500"
              )}
              style={{ width: `${prediction.attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Top interventions */}
        <div className="flex flex-col gap-1">
          {prediction.interventions.slice(0, 2).map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <Icon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", config.color)} />
              {msg}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
