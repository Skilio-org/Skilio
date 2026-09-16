import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from "react";

export const Route = createFileRoute('/googleAuth')({
  component: AuthCallback,
})

export function AuthCallback() {
  const [searchParams] = useSearchParams();
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
          // Store JWT access token
          localStorage.setItem("access_token", data.access_token);
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Login failed:", err.message);
          navigate("/login?error=" + encodeURIComponent(err.message));
        });
    }
  }, [searchParams, navigate]);

  return <div>Completing Google Login...</div>;
}