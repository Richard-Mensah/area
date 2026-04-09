import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/ui/Toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduTrack — Student Attendance & Analytics",
  description: "Track student attendance and predict academic performance",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
