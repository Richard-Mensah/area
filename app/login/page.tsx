"use client"

import { useState } from "react"
import { GraduationCap, Mail, ScanFace } from "lucide-react"
import LoginForm from "@/components/features/auth/LoginForm"
import FaceLogin from "@/components/features/auth/FaceLogin"
import { cn } from "@/lib/utils"

type Tab = "email" | "face"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>("email")

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "email", label: "Email & Password", icon: Mail     },
    { id: "face",  label: "Face Recognition", icon: ScanFace },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">EduTrack</h1>
          <p className="text-blue-200 text-sm mt-1">Student Attendance & Analytics Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
                  activeTab === id
                    ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-7">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              {activeTab === "email" ? "Sign in to your account" : "Sign in with your face"}
            </h2>
            {activeTab === "email" ? <LoginForm /> : <FaceLogin />}
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          EduTrack v2.0 · Attendance & Academic Analytics Platform
        </p>
      </div>
    </div>
  )
}
