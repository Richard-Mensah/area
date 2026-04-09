"use client"

import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import { computeSubjectBreakdown, computeTrend } from "@/lib/attendance"
import AttendanceChart from "@/components/features/analytics/AttendanceChart"
import SubjectChart from "@/components/features/analytics/SubjectChart"
import PredictionCard from "@/components/features/predictions/PredictionCard"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import { FACE_API_MODELS_URL } from "@/constants"
import type { RiskLevel } from "@/types"
import { formatDate } from "@/lib/utils"

const riskBadge: Record<RiskLevel, "at-risk" | "needs-improvement" | "good" | "excellent"> = {
  "At Risk":           "at-risk",
  "Needs Improvement": "needs-improvement",
  "Good Standing":     "good",
  "Excellent":         "excellent",
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { students, subjects, records, initialized } = useAttendance()
  const { getPrediction } = usePrediction(students, records, subjects)

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const student = students.find((s) => s.id === id)
  const prediction = getPrediction(id)

  const studentRecords = useMemo(
    () => records.filter((r) => r.studentId === id),
    [records, id]
  )

  const trendData = useMemo(
    () => {
      if (!student) return []
      const fakeStudents = [student]
      // Use computeTrend filtered for this student
      return computeTrend(studentRecords, 30)
    },
    [studentRecords, student]
  )

  const subjectData = useMemo(() => {
    if (!student) return []
    const classSubjects = subjects.filter((s) => s.class === student.class)
    return computeSubjectBreakdown(records, id, classSubjects)
  }, [records, id, subjects, student])

  const recentHistory = useMemo(
    () =>
      [...studentRecords]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20),
    [studentRecords]
  )

  async function handleEnrollFace() {
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
      const stored = JSON.parse(localStorage.getItem("attendance_app_face_descriptors") ?? "{}")
      stored[id] = Array.from(det.descriptor)
      localStorage.setItem("attendance_app_face_descriptors", JSON.stringify(stored))
      toast(`Face enrolled for ${student?.name}!`, "success")
      setEnrollOpen(false)
    } catch (err) {
      console.error(err)
      toast("Enrollment failed. Check model files and camera permissions.", "error")
    } finally {
      setEnrolling(false)
    }
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center text-gray-400 py-16">
        Student not found.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-sm text-gray-500">
              Roll {student.roll} · Class {student.class} · {student.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {prediction && <Badge variant={riskBadge[prediction.riskLevel]}>{prediction.riskLevel}</Badge>}
          <Button variant="outline" size="sm" onClick={() => setEnrollOpen(true)}>
            <Camera className="w-4 h-4" />
            Enrol Face
          </Button>
        </div>
      </div>

      {/* Prediction card */}
      {prediction && (
        <PredictionCard prediction={prediction} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={trendData} title={`${student.name}'s 30-Day Trend`} />
        <SubjectChart data={subjectData} />
      </div>

      {/* Recent history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Subject</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((r) => {
                const sub = subjects.find((s) => s.id === r.subjectId)
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-gray-700">{sub?.name ?? r.subjectId}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "present" ? "present" :
                          r.status === "absent"  ? "absent"  :
                          r.status === "late"    ? "late"    : "unmarked"
                        }
                      >
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face enrollment modal */}
      <Modal open={enrollOpen} onClose={() => setEnrollOpen(false)} title="Enrol Face for Login">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            This will capture a photo of {student.name} and save their face descriptor for
            future facial recognition login. Make sure the student is facing the camera clearly.
          </p>
          <p className="text-xs text-gray-400">
            Requires model files in <code className="bg-gray-100 px-1 rounded">/public/models/</code>
            and camera permission.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEnrollOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={enrolling} onClick={handleEnrollFace}>
              <Camera className="w-4 h-4" />
              Capture & Enrol
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
