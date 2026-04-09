# Next.js LLM Instructions — Prototyping Guide
> App Router · Next.js 15 · Tailwind CSS · Component-Based Architecture
> For: Beginners building full-stack prototypes

---

## 🧠 LLM Behaviour Rules (Read First)

These rules apply to **every response** in this project. Never break them unless explicitly told to.

1. **Always use the App Router** (`app/` directory). Never suggest Pages Router (`pages/`).
2. **Never write a component or file longer than 200 lines.** Split it if it gets close.
3. **Always use Tailwind CSS** for styling. Never write plain CSS unless Tailwind physically cannot do it (e.g. a very custom animation keyframe).
4. **Always use TypeScript.** Every file should be `.tsx` or `.ts`. Never `.js` or `.jsx`.
5. **Always explain what you're doing** in 1–2 sentences before writing code, especially when introducing a pattern for the first time.
6. **When unsure which approach to take**, ask one clarifying question before writing code.
7. **Never install unnecessary packages.** Prefer built-in Next.js and React features first.
8. **Always write readable code** — prefer clarity over cleverness.

---

## 📁 Folder Structure

This is the canonical folder layout. Always follow it. Never create files outside this structure without explaining why.

```
my-app/
├── app/                          # All routes live here (App Router)
│   ├── layout.tsx                # Root layout — wraps all pages
│   ├── page.tsx                  # Home page  (route: /)
│   ├── globals.css               # Only Tailwind directives + CSS variables
│   │
│   ├── (marketing)/              # Route group — no URL segment added
│   │   └── about/
│   │       └── page.tsx          # route: /about
│   │
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard-specific layout
│   │   ├── page.tsx              # route: /dashboard
│   │   └── settings/
│   │       └── page.tsx          # route: /dashboard/settings
│   │
│   └── api/                      # Backend API routes (optional)
│       └── users/
│           └── route.ts          # route: /api/users
│
├── components/                   # All reusable UI components
│   ├── ui/                       # Generic, dumb, reusable atoms
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   │
│   ├── layout/                   # Structural layout pieces
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   │
│   └── features/                 # Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   └── SignupForm.tsx
│       └── dashboard/
│           ├── StatsCard.tsx
│           └── RecentActivity.tsx
│
├── lib/                          # Utilities and helper functions
│   ├── utils.ts                  # General helpers (cn(), formatDate(), etc.)
│   ├── validations.ts            # Zod schemas / form validation
│   └── db.ts                     # DB client (only if using a database)
│
├── hooks/                        # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── types/                        # Shared TypeScript types/interfaces
│   ├── index.ts                  # Re-export all types from here
│   └── api.ts                    # API response/request types
│
├── constants/                    # App-wide constants
│   └── index.ts
│
├── public/                       # Static assets (images, fonts, icons)
│   └── images/
│
├── .env.local                    # Secret keys — NEVER commit this
├── .env.example                  # Template of env vars — commit this
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

### Folder Rules
- `components/ui/` — No logic. No API calls. Just props in, UI out.
- `components/features/` — Can have local state and call hooks. Grouped by feature.
- `components/layout/` — Structural chrome. Navbar, Footer, Sidebar only.
- `lib/` — Pure functions only. No React. No JSX.
- `hooks/` — Custom React hooks only. Each hook in its own file.
- `types/` — Never define types inline inside components. Always put them here.
- `app/api/` — Only API route handlers go here.

---

## ⚛️ Component Rules

### 1. One Component Per File
Each file exports exactly one component. The file name matches the component name exactly.

```tsx
// ✅ Good — components/ui/Button.tsx
export default function Button() { ... }

// ❌ Bad — multiple components in one file
export function Button() { ... }
export function IconButton() { ... }
```

### 2. Always Type Your Props
Define a `Props` type at the top of every component file. Never use `any`.

```tsx
// ✅ Good
type Props = {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
  disabled?: boolean
}

export default function Button({ label, onClick, variant = "primary", disabled = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  )
}
```

### 3. Keep Components Focused
A component should do **one thing**. If a component is handling layout AND data AND logic, split it.

```
UserProfilePage        ← orchestrates
  └── UserProfileCard  ← layout/display
        └── Avatar     ← pure display atom
        └── UserStats  ← display with minor logic
```

### 4. Server vs Client Components

**Default: Server Component** — never add `"use client"` unless you need it.

Add `"use client"` only when the component uses:
- `useState` or `useEffect`
- Browser APIs (`window`, `localStorage`)
- Event listeners (`onClick` when it involves state)
- Third-party client-only libraries

```tsx
// ✅ Server Component (default) — no directive needed
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData() // runs on server
  return <StatsCard data={data} />
}

// ✅ Client Component — explicit directive required
// components/ui/Counter.tsx
"use client"
import { useState } from "react"

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### 5. Component Size Limit
- Hard limit: **200 lines per component file.**
- If approaching 150 lines, start extracting sub-components.
- Extract sections into descriptively named components: `UserFormFields.tsx`, `DashboardHeader.tsx`, etc.

---

## 🗺️ Routing Rules (App Router)

| What you want | How to do it |
|---|---|
| A new page | Create `app/your-route/page.tsx` |
| Shared layout for a section | Create `app/your-section/layout.tsx` |
| Group routes without affecting URL | Wrap folder in `(parentheses)` |
| Dynamic route (e.g. `/users/123`) | Name folder `[id]` → `app/users/[id]/page.tsx` |
| Not found page | Create `app/not-found.tsx` |
| Error boundary | Create `app/error.tsx` (must be `"use client"`) |
| Loading skeleton | Create `app/loading.tsx` |

### Page File Template
```tsx
// app/example/page.tsx
import ExampleFeature from "@/components/features/example/ExampleFeature"

export const metadata = {
  title: "Example Page",
  description: "Page description for SEO",
}

export default function ExamplePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <ExampleFeature />
    </main>
  )
}
```

**Rule:** Pages are thin. They import components and provide layout. No business logic inside `page.tsx`.

---

## 🎨 Tailwind CSS Rules

### 1. Use `cn()` for Conditional Classes
Always install and use `clsx` + `tailwind-merge` via a `cn()` helper. Never string-concatenate class names manually.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```tsx
// Usage in a component
import { cn } from "@/lib/utils"

<div className={cn("px-4 py-2 rounded", isActive && "bg-blue-500", className)} />
```

### 2. Design Token Conventions
Define your brand colors and spacing in `tailwind.config.ts`. Never hardcode arbitrary hex values inline.

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        50: "#eff6ff",
        500: "#3b82f6",
        900: "#1e3a8a",
      }
    }
  }
}
```

### 3. Responsive Design — Mobile First
Always write mobile styles first, then add responsive prefixes for larger screens.

```tsx
// ✅ Good — mobile first
<div className="flex flex-col gap-4 md:flex-row md:gap-8">

// ❌ Bad — desktop assumed, mobile afterthought
<div className="flex flex-row gap-8 sm:flex-col">
```

### 4. No Inline `style` Prop
Use Tailwind or CSS variables. Only use `style` for values that are truly dynamic (e.g., calculated pixel values at runtime).

```tsx
// ✅ Good
<div className="bg-blue-500 text-white p-4 rounded-xl shadow-md" />

// ❌ Bad
<div style={{ backgroundColor: "blue", padding: "16px" }} />
```

---

## 🔌 API Routes (Backend — Optional)

Use `app/api/` for backend logic. Only add this when you need server-side data processing, database calls, or secrets that can't be exposed to the browser.

### API Route Template
```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server"

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const users = [{ id: 1, name: "Alice" }] // replace with DB call
    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // validate body, save to DB, etc.
    return NextResponse.json({ message: "Created" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
```

### API Rules
- Always wrap handlers in `try/catch`. Never let errors crash silently.
- Always return a meaningful HTTP status code.
- Never put business logic directly in the route handler — call a function from `lib/`.
- Never expose secrets or internal errors in the response body.
- Validate all incoming request bodies before using them.

---

## 🪝 Custom Hooks Rules

Extract any reusable stateful logic into a custom hook in `hooks/`.

```ts
// hooks/useLocalStorage.ts
import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

**Hook Rules:**
- Hook filenames start with `use` — e.g. `useAuth.ts`, `useDebounce.ts`.
- One hook per file.
- Hooks must only be called at the top level of a component or another hook. Never inside loops or conditionals.

---

## 🔒 Environment Variables

```bash
# .env.local  ← secret, never commit
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
SOME_API_KEY="sk-..."

# Rule: Variables exposed to the browser MUST start with NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ANALYTICS_ID="UA-XXXXX"
```

```ts
// Accessing in server code (API routes, Server Components)
const dbUrl = process.env.DATABASE_URL

// Accessing in client code — only NEXT_PUBLIC_ variables work here
const appUrl = process.env.NEXT_PUBLIC_APP_URL
```

**Rules:**
- Never commit `.env.local`. It's in `.gitignore` by default.
- Always maintain a `.env.example` file with dummy values as a reference.
- Never put real secrets in `NEXT_PUBLIC_` variables — they are exposed to everyone.

---

## 📦 Recommended Starter Packages

Install these as needed — not all at once.

| Purpose | Package |
|---|---|
| Class merging | `clsx` + `tailwind-merge` |
| Icons | `lucide-react` |
| Form handling | `react-hook-form` |
| Form validation | `zod` |
| Animations | `framer-motion` |
| Auth | `next-auth` (Auth.js v5) |
| Database ORM | `prisma` |
| Date formatting | `date-fns` |
| Fetching (client) | `swr` or `@tanstack/react-query` |

---

## ✅ General Best Practices Checklist

### Code Quality
- [ ] No `any` types in TypeScript. Use `unknown` if the type is truly unknown.
- [ ] No unused imports or variables.
- [ ] No hardcoded strings that could be constants — move to `constants/index.ts`.
- [ ] All async functions handle errors with `try/catch`.
- [ ] No commented-out code committed to the repo.

### Components
- [ ] Every component has typed props.
- [ ] No component is longer than 200 lines.
- [ ] Client components are minimised — push `"use client"` as far down the tree as possible.
- [ ] No direct DOM manipulation (no `document.getElementById()`).

### Data Fetching
- [ ] Server Components fetch data directly with `async/await` — no `useEffect` for initial data loads.
- [ ] Client-side fetching uses SWR or React Query — not raw `fetch` inside `useEffect`.
- [ ] Loading and error states are always handled in UI.

### Styling
- [ ] All styles use Tailwind utility classes.
- [ ] Conditional classes use the `cn()` helper.
- [ ] No magic numbers in styles — use Tailwind's scale.
- [ ] All interactive elements have hover and focus states.
- [ ] All images have `alt` text.

### Security
- [ ] Never trust client input — validate on the server too.
- [ ] Never expose API keys to the client.
- [ ] Never store sensitive data in `localStorage`.

---

## 🚫 Anti-Patterns — Never Do These

```tsx
// ❌ Never use useEffect to fetch initial data in a Server Component context
useEffect(() => {
  fetch("/api/users").then(...)
}, [])
// ✅ Instead: fetch in a Server Component directly

// ❌ Never write CSS inline when Tailwind can do it
<div style={{ display: "flex", justifyContent: "center" }}>
// ✅ Instead:
<div className="flex justify-center">

// ❌ Never put logic in page.tsx
export default function Page() {
  const [data, setData] = useState([])
  // 80 lines of logic...
}
// ✅ Instead: extract to a feature component

// ❌ Never use any
const processUser = (user: any) => { ... }
// ✅ Instead:
type User = { id: string; name: string }
const processUser = (user: User) => { ... }

// ❌ Never import from deep paths
import Button from "../../../components/ui/Button"
// ✅ Instead — configure path aliases in tsconfig.json
import Button from "@/components/ui/Button"
```

---

## 🔧 tsconfig Path Alias (Required Setup)

Always configure `@/` as a path alias. This makes imports clean across the whole project.

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 🗂️ Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `UserCard.tsx` |
| Hook files | camelCase with `use` prefix | `useAuth.ts` |
| Utility files | camelCase | `formatDate.ts` |
| Route folders | kebab-case | `app/user-profile/` |
| Type names | PascalCase | `type UserProfile = {...}` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| CSS variables | kebab-case | `--color-brand-primary` |

---

## 📋 Quick Reference — When to Use What

| Situation | What to use |
|---|---|
| Display-only UI with no interactivity | Server Component (default) |
| Needs `useState` / `useEffect` | Client Component (`"use client"`) |
| Shared logic used in multiple components | Custom hook in `hooks/` |
| Fetch data on the server | `async` Server Component |
| Fetch data on the client after interaction | SWR or React Query |
| Backend endpoint needed | `app/api/route.ts` |
| Repeated UI pattern | Component in `components/ui/` |
| Feature-specific UI | Component in `components/features/` |
| Shared TypeScript type | `types/index.ts` |
| Pure helper function | `lib/utils.ts` |

---

*Last updated: April 2026 · Next.js 15 · App Router · Tailwind CSS v4*
