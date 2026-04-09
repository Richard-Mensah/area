"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  })

  async function onSubmit(data: LoginFormValues) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const { error } = await res.json() as { error: string }
      toast(error ?? "Login failed. Please try again.", "error")
      return
    }

    const { user } = await res.json() as { user: { name: string } }
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
      <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-1">
        Sign In
      </Button>
      <p className="text-center text-xs text-gray-500">
        Demo accounts (password: <span className="font-medium">password123</span>)<br />
        teacher@school.com · admin@school.com · student@school.com
      </p>
    </form>
  )
}
