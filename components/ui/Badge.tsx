import { cn } from "@/lib/utils"

type BadgeVariant =
  | "present"
  | "absent"
  | "late"
  | "unmarked"
  | "at-risk"
  | "needs-improvement"
  | "good"
  | "excellent"
  | "default"

type Props = {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  present:             "bg-green-100 text-green-800 border border-green-200",
  absent:              "bg-red-100 text-red-800 border border-red-200",
  late:                "bg-yellow-100 text-yellow-800 border border-yellow-200",
  unmarked:            "bg-gray-100 text-gray-600 border border-gray-200",
  "at-risk":           "bg-red-100 text-red-800 border border-red-200",
  "needs-improvement": "bg-orange-100 text-orange-800 border border-orange-200",
  good:                "bg-blue-100 text-blue-800 border border-blue-200",
  excellent:           "bg-green-100 text-green-800 border border-green-200",
  default:             "bg-gray-100 text-gray-700 border border-gray-200",
}

export default function Badge({ variant = "default", className, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
