import type { MockUser, Student, Subject } from "@/types"

export const MOCK_USERS: MockUser[] = [
  { id: "u1", email: "teacher@school.com", password: "password123", role: "teacher", name: "Ms. Sarah Thompson" },
  { id: "u2", email: "admin@school.com", password: "password123", role: "admin", name: "Principal James Adams" },
  { id: "u3", email: "student@school.com", password: "password123", role: "student", name: "Alice Johnson" },
]

export const CLASSES = ["10A", "10B", "11A", "11B"] as const

export const RISK_THRESHOLDS = {
  AT_RISK: 60,
  NEEDS_IMPROVEMENT: 75,
  GOOD_STANDING: 90,
} as const

export const FACE_API_MODELS_URL = "/models"

export const SEED_STUDENTS: Student[] = [
  { id: "s1",  name: "Alice Johnson",    roll: "001", class: "10A", email: "alice@school.com" },
  { id: "s2",  name: "Bob Smith",        roll: "002", class: "10A", email: "bob@school.com" },
  { id: "s3",  name: "Carol Williams",   roll: "003", class: "10A", email: "carol@school.com" },
  { id: "s4",  name: "David Brown",      roll: "004", class: "10A", email: "david@school.com" },
  { id: "s5",  name: "Emma Davis",       roll: "005", class: "10A", email: "emma@school.com" },
  { id: "s6",  name: "Frank Miller",     roll: "006", class: "10A", email: "frank@school.com" },
  { id: "s7",  name: "Grace Wilson",     roll: "007", class: "10B", email: "grace@school.com" },
  { id: "s8",  name: "Henry Moore",      roll: "008", class: "10B", email: "henry@school.com" },
  { id: "s9",  name: "Isla Taylor",      roll: "009", class: "10B", email: "isla@school.com" },
  { id: "s10", name: "James Anderson",   roll: "010", class: "10B", email: "james@school.com" },
  { id: "s11", name: "Karen Thomas",     roll: "011", class: "11A", email: "karen@school.com" },
  { id: "s12", name: "Liam Jackson",     roll: "012", class: "11A", email: "liam@school.com" },
]

export const SEED_SUBJECTS: Subject[] = [
  { id: "sub1", name: "Mathematics",    code: "MATH101", class: "10A", teacher: "Ms. Sarah Thompson" },
  { id: "sub2", name: "English",        code: "ENG101",  class: "10A", teacher: "Mr. Robert Clark" },
  { id: "sub3", name: "Science",        code: "SCI101",  class: "10A", teacher: "Dr. Lisa White" },
  { id: "sub4", name: "History",        code: "HIST101", class: "10A", teacher: "Ms. Sarah Thompson" },
  { id: "sub5", name: "Mathematics",    code: "MATH101", class: "10B", teacher: "Ms. Sarah Thompson" },
  { id: "sub6", name: "English",        code: "ENG101",  class: "10B", teacher: "Mr. Robert Clark" },
  { id: "sub7", name: "Mathematics",    code: "MATH201", class: "11A", teacher: "Dr. Lisa White" },
  { id: "sub8", name: "English",        code: "ENG201",  class: "11A", teacher: "Mr. Robert Clark" },
]
