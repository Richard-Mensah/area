"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2, CheckCircle, XCircle, ScanFace } from "lucide-react"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { FACE_API_MODELS_URL } from "@/constants"

type Status = "idle" | "loading-models" | "ready" | "scanning" | "matched" | "no-match" | "no-face"

export default function FaceLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [statusMsg, setStatusMsg] = useState("")

  useEffect(() => {
    return () => {
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

      // Send descriptor to server for matching
      const descriptor = Array.from(detection.descriptor as Float32Array)
      const res = await fetch("/api/auth/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      })

      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        setStatus("no-match")
        setStatusMsg(error ?? "Face not recognised.")
        return
      }

      const { user } = await res.json() as { user: { name: string } }
      setStatus("matched")
      setStatusMsg(`Face matched! Welcome, ${user.name}`)
      toast(`Face recognised — Welcome, ${user.name}!`, "success")
      setTimeout(() => router.push("/dashboard"), 1500)
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
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
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

      {statusMsg && (
        <p className="text-sm text-center text-gray-600 leading-snug">{statusMsg}</p>
      )}

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
        Face login requires your face to be enrolled from your profile page.
        Enrol face via <code className="bg-gray-100 px-1 rounded">My Profile</code> or ask your admin.
      </p>
    </div>
  )
}
