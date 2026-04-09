"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { MOCK_USERS } from "@/constants"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import type { AuthSession } from "@/types"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["teacher", "admin", "student"]),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "teacher" },
  })

  function onSubmit(data: LoginFormValues) {
    const user = MOCK_USERS.find(
      (u) => u.email === data.email && u.password === data.password && u.role === data.role
    )
    if (!user) {
      toast("Invalid credentials. Please try again.", "error")
      return
    }
    const session: AuthSession = {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    }
    localStorage.setItem("attendance_app_auth", JSON.stringify(session))
    toast(`Welcome back, ${user.name}!`, "success")
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="teacher@school.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <Select
        label="Login As"
        options={[
          { value: "teacher", label: "Teacher" },
          { value: "admin",   label: "Admin / Principal" },
          { value: "student", label: "Student" },
        ]}
        error={errors.role?.message}
        {...register("role")}
      />
      <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-1">
        Sign In
      </Button>
      <p className="text-center text-xs text-gray-500">
        Demo: <span className="font-medium">teacher@school.com</span> / password123
      </p>
    </form>
  )
}
