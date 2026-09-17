import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

const googleAuthSearchSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
})

export const Route = createFileRoute("/linkedinAuth")({
  component: AuthCallback,
  validateSearch: (search) => googleAuthSearchSchema.parse(search),
})

export function AuthCallback() {
  const navigate = useNavigate()
  const { code, error } = Route.useSearch()

  useEffect(() => {
    if (error) {
      navigate({
        to: "/login",
        search: { error },
      })

      return
    }

    if (!code) {
      navigate({
        to: "/login",
        search: { error: "Missing Google authorization code" },
      })

      return
    }

    const authenticate = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/login/linkedin/callback?code=${encodeURIComponent(code)}`,
        )

        if (!res.ok) {
          const errorData = await res.json()
          alert(JSON.stringify(res))
          throw new Error(errorData.detail || "Authentication failed")
        }

        const data = await res.json()

        localStorage.setItem("access_token", data.access_token)

        navigate({
          to: "/dashboard",
        })
      } catch (err) {
        navigate({
          to: "/login",
          search: {
            error: err instanceof Error ? err.message : "Authentication failed",
          },
        })
      }
    }

    void authenticate()
  }, [code, error, navigate])

  return null
}
