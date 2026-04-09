"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import type { SessionUser } from "@/lib/auth"

const fetcher = (url: string) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r)))

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<{ user: SessionUser }>(
    "/api/auth/me",
    fetcher,
    { revalidateOnFocus: false }
  )

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    mutate(undefined, false)
    router.push("/login")
  }

  return {
    user: data?.user ?? null,
    isLoading,
    isError: !!error,
    logout,
    mutate,
  }
}
