"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info"

type ToastItem = {
  id: string
  message: string
  type: ToastType
}

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = String(Date.now())
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error:   <AlertCircle className="w-5 h-5 text-red-500" />,
    info:    <Info className="w-5 h-5 text-blue-500" />,
  }
  const bg: Record<ToastType, string> = {
    success: "bg-white border-green-200",
    error:   "bg-white border-red-200",
    info:    "bg-white border-blue-200",
  }
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-72 max-w-sm",
        "animate-in slide-in-from-right-5 fade-in duration-300",
        bg[item.type]
      )}
    >
      {icons[item.type]}
      <p className="flex-1 text-sm text-gray-800">{item.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
