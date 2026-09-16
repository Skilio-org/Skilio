import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from "react";

export const Route = createFileRoute("/googleAuth")({
  component: AuthCallback,
})

export function AuthCallback() {
  const searchParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      fetch(`http://localhost:8000/api/v1/login/google/callback?code=${code}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || "Authentication failed");
          }
          return res.json();
        })
        .then((data) => {
          localStorage.setItem("access_token", data.access_token);
          navigate({ to: "/dashboard" });
        })
        .catch((err) => {
          console.error("Login failed:", err.message);
          navigate({
            to: "/login",
            search: { error: err.message },
          });
        });
    }
  }, [searchParams, navigate]);

  return <div>Completing Google Login...</div>;
}