"use client"

import { useState } from "react"
import { Camera, Loader2, CheckCircle, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useAttendance } from "@/hooks/useAttendance"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { FACE_API_MODELS_URL } from "@/constants"

export default function MyProfilePage() {
  const { user } = useAuth()
  const { students } = useAttendance()
  const { toast } = useToast()
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)

  const myStudent = students[0] ?? null

  async function enrollFace() {
    setEnrolling(true)
    try {
      const mod = await import("face-api.js")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const faceapi = (mod as any).default ?? mod
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_MODELS_URL),
      ])
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement("video")
      video.srcObject = stream
      await video.play()
      await new Promise((r) => setTimeout(r, 500))
      const det = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
      stream.getTracks().forEach((t) => t.stop())

      if (!det) {
        toast("No face detected. Try again with better lighting.", "error")
        return
      }

      const res = await fetch("/api/profile/face", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor: Array.from(det.descriptor as Float32Array) }),
      })

      if (!res.ok) { toast("Enrollment failed", "error"); return }
      setEnrolled(true)
      toast("Face enrolled! You can now use face login.", "success")
    } catch (err) {
      console.error(err)
      toast("Enrollment failed. Check camera permissions and model files.", "error")
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Your account and security settings</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-blue-600 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>

        {myStudent && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Roll Number</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{myStudent.roll}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{myStudent.class}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Student Email</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{myStudent.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Face login enrollment */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            {enrolled ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Camera className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Face Recognition Login</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Enrol your face to enable one-tap login without typing your password.
              Your face data is stored securely and never shared.
            </p>
            {enrolled && (
              <p className="text-xs text-green-600 mt-2 font-medium">✓ Face enrolled successfully</p>
            )}
          </div>
          <Button
            variant={enrolled ? "outline" : "primary"}
            size="sm"
            loading={enrolling}
            onClick={enrollFace}
          >
            {enrolling ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Capturing…</>
            ) : enrolled ? (
              <><Camera className="w-4 h-4" /> Re-enrol</>
            ) : (
              <><Camera className="w-4 h-4" /> Enrol Face</>
            )}
          </Button>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Account Information</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Account Type</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Login Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          To change your password or email, contact your school administrator.
        </p>
      </div>
    </div>
  )
}
