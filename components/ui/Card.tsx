import { cn } from "@/lib/utils"

type Props = { className?: string; children: React.ReactNode }

export function Card({ className, children }: Props) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: Props) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-100", className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }: Props) {
  return (
    <h3 className={cn("text-base font-semibold text-gray-900", className)}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children }: Props) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children }: Props) {
  return (
    <div className={cn("px-6 py-4 border-t border-gray-100", className)}>
      {children}
    </div>
  )
}
