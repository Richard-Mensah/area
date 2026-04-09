import type { Student, Subject } from "@/types"

export const CLASSES = ["10A", "10B", "11A", "11B"] as const

export const RISK_THRESHOLDS = {
  AT_RISK: 60,
  NEEDS_IMPROVEMENT: 75,
  GOOD_STANDING: 90,
} as const

export const FACE_API_MODELS_URL = "/models"

// Seed credentials (used only by /api/seed route)
export const SEED_PASSWORD = "password123"

export const SEED_USERS = [
  { email: "teacher@school.com", name: "Ms. Sarah Thompson", role: "teacher" as const },
  { email: "admin@school.com",   name: "Principal James Adams", role: "admin" as const },
  { email: "student@school.com", name: "Alice Johnson", role: "student" as const },
]

export const SEED_STUDENTS: Omit<Student, "id">[] = [
  { name: "Alice Johnson",   roll: "001", class: "10A", email: "alice@school.com" },
  { name: "Bob Smith",       roll: "002", class: "10A", email: "bob@school.com" },
  { name: "Carol Williams",  roll: "003", class: "10A", email: "carol@school.com" },
  { name: "David Brown",     roll: "004", class: "10A", email: "david@school.com" },
  { name: "Emma Davis",      roll: "005", class: "10A", email: "emma@school.com" },
  { name: "Frank Miller",    roll: "006", class: "10A", email: "frank@school.com" },
  { name: "Grace Wilson",    roll: "007", class: "10B", email: "grace@school.com" },
  { name: "Henry Moore",     roll: "008", class: "10B", email: "henry@school.com" },
  { name: "Isla Taylor",     roll: "009", class: "10B", email: "isla@school.com" },
  { name: "James Anderson",  roll: "010", class: "10B", email: "james@school.com" },
  { name: "Karen Thomas",    roll: "011", class: "11A", email: "karen@school.com" },
  { name: "Liam Jackson",    roll: "012", class: "11A", email: "liam@school.com" },
]

// Teacher names are resolved at seed time from the DB
export const SEED_SUBJECTS: Omit<Subject, "id" | "teacherId">[] = [
  { name: "Mathematics", code: "MATH101", class: "10A", teacher: "Ms. Sarah Thompson" },
  { name: "English",     code: "ENG101",  class: "10A", teacher: "Mr. Robert Clark" },
  { name: "Science",     code: "SCI101",  class: "10A", teacher: "Dr. Lisa White" },
  { name: "History",     code: "HIST101", class: "10A", teacher: "Ms. Sarah Thompson" },
  { name: "Mathematics", code: "MATH101", class: "10B", teacher: "Ms. Sarah Thompson" },
  { name: "English",     code: "ENG101",  class: "10B", teacher: "Mr. Robert Clark" },
  { name: "Mathematics", code: "MATH201", class: "11A", teacher: "Dr. Lisa White" },
  { name: "English",     code: "ENG201",  class: "11A", teacher: "Mr. Robert Clark" },
]
