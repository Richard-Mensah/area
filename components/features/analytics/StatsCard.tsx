import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; direction: "up" | "down" }
  variant?: "default" | "warning" | "success" | "danger"
}

const variantStyles = {
  default: { icon: "bg-blue-50 text-blue-600",   border: "border-gray-100" },
  success: { icon: "bg-green-50 text-green-600",  border: "border-green-100" },
  warning: { icon: "bg-yellow-50 text-yellow-600",border: "border-yellow-100" },
  danger:  { icon: "bg-red-50 text-red-600",      border: "border-red-100" },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: Props) {
  const styles = variantStyles[variant]
  return (
    <div className={cn("bg-white rounded-xl border shadow-sm p-5", styles.border)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            )}>
              {trend.direction === "up"
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />
              }
              {Math.abs(trend.value)}% from last month
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
