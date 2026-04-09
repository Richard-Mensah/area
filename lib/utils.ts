import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, subDays } from "date-fns"
import { v4 as uuidv4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, fmt = "MMM dd, yyyy"): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date
    return format(d, fmt)
  } catch {
    return String(date)
  }
}

export function generateId(): string {
  return uuidv4()
}

export function generateDateRange(days: number): string[] {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), "yyyy-MM-dd"))
  }
  return dates
}

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
  )
  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function isWeekday(dateStr: string): boolean {
  const day = parseISO(dateStr).getDay()
  return day !== 0 && day !== 6
}
