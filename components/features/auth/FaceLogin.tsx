"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2, CheckCircle, XCircle, ScanFace } from "lucide-react"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { FACE_API_MODELS_URL, MOCK_USERS } from "@/constants"
import type { AuthSession } from "@/types"

type Status = "idle" | "loading-models" | "ready" | "scanning" | "matched" | "no-match" | "no-face"

export default function FaceLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [statusMsg, setStatusMsg] = useState("")

  useEffect(() => {
    return () => {
      // Cleanup webcam on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function startCamera() {
    setStatus("loading-models")
    setStatusMsg("Loading face recognition models…")
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus("ready")
      setStatusMsg("Position your face in the camera and click Scan Face")
    } catch (err) {
      console.error(err)
      setStatus("idle")
      setStatusMsg("Failed to start camera. Check permissions or model files in /public/models/")
      toast("Camera or model load failed", "error")
    }
  }

  async function scanFace() {
    if (!videoRef.current) return
    setStatus("scanning")
    setStatusMsg("Scanning…")

    try {
      const mod = await import("face-api.js")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const faceapi = (mod as any).default ?? mod
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setStatus("no-face")
        setStatusMsg("No face detected. Please look directly at the camera.")
        return
      }

      const liveDescriptor = detection.descriptor // already Float32Array

      // Load stored face descriptors from localStorage
      const raw = localStorage.getItem("attendance_app_face_descriptors")
      const stored = (raw ? JSON.parse(raw) : {}) as Record<string, number[]>

      let matchedStudentId: string | null = null
      let bestDistance = Infinity

      for (const [studentId, storedDesc] of Object.entries(stored)) {
        const dist = faceapi.euclideanDistance(
          liveDescriptor,
          new Float32Array(storedDesc as number[])
        )
        if (dist < bestDistance) {
          bestDistance = dist
          matchedStudentId = studentId
        }
      }

      const THRESHOLD = 0.5
      if (matchedStudentId && bestDistance < THRESHOLD) {
        // Match found — log in as teacher by default (demo: first mock user)
        const mockUser = MOCK_USERS[0]
        const session: AuthSession = {
          user: { id: mockUser.id, name: mockUser.name, email: mockUser.email, role: mockUser.role },
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        }
        localStorage.setItem("attendance_app_auth", JSON.stringify(session))
        setStatus("matched")
        setStatusMsg(`Face matched! Welcome, ${mockUser.name}`)
        toast(`Face recognised — Welcome, ${mockUser.name}!`, "success")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        setStatus("no-match")
        setStatusMsg("Face not recognised. Please enrol your face in the Students section first, or use email login.")
      }
    } catch (err) {
      console.error(err)
      setStatus("ready")
      setStatusMsg("Scan failed. Try again.")
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Video preview */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center max-h-56">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <Camera className="w-10 h-10 opacity-50" />
            <p className="text-sm opacity-70">Camera off</p>
          </div>
        )}
        {status === "loading-models" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-gray-900">
            <Loader2 className="w-8 h-8 animate-spin opacity-80" />
            <p className="text-sm opacity-70">Loading models…</p>
          </div>
        )}
        {status === "matched" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-900/80 text-white">
            <CheckCircle className="w-10 h-10 text-green-400" />
            <p className="text-sm font-medium">Matched!</p>
          </div>
        )}
        {status === "no-match" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-900/80 text-white">
            <XCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm font-medium">Not recognised</p>
          </div>
        )}
      </div>

      {/* Status message */}
      {statusMsg && (
        <p className="text-sm text-center text-gray-600 leading-snug">{statusMsg}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        {status === "idle" && (
          <Button variant="primary" className="flex-1" onClick={startCamera}>
            <Camera className="w-4 h-4" />
            Enable Camera
          </Button>
        )}
        {(status === "ready" || status === "no-face") && (
          <Button variant="primary" className="flex-1" onClick={scanFace}>
            <ScanFace className="w-4 h-4" />
            Scan Face
          </Button>
        )}
        {status === "scanning" && (
          <Button variant="primary" className="flex-1" loading>
            Scanning…
          </Button>
        )}
        {(status === "no-match" || status === "no-face") && (
          <Button variant="outline" className="flex-1" onClick={() => { setStatus("ready"); setStatusMsg("") }}>
            Try Again
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Face login requires face model files in <code className="bg-gray-100 px-1 rounded">/public/models/</code>.
        Admin can enrol faces from the Students page.
      </p>
    </div>
  )
}
