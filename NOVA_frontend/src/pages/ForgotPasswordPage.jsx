import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, MailCheck } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/Button"
import { Input, Label } from "@/components/ui/Field"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid campus email.")
      return
    }
    setError("")
    setSent(true)
  }

  return (
    <AuthLayout
      eyebrow="■ RESET PASSWORD"
      headline={sent ? "Check your inbox" : "Forgot your password?"}
      sub={
        sent
          ? "If an account exists for that email, a reset link is on its way."
          : "Enter your campus email and we'll send you a reset link."
      }
    >
      {sent ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl border border-cf-line bg-cf-cream p-4">
            <MailCheck className="h-6 w-6 text-cf-black" />
            <p className="text-sm text-cf-muted">Sent to {email}</p>
          </div>
          {/* NAV → /login — return to sign in after requesting a reset */}
          <Button as={Link} to="/login" className="w-full" badge>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <Label htmlFor="email">Campus email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
            {error && <p className="mt-1.5 text-sm text-cf-danger">{error}</p>}
          </div>
          <Button type="submit" className="w-full" badge>
            Send reset link
          </Button>
          {/* NAV → /login — cancel and go back to sign in */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-cf-muted hover:text-cf-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
