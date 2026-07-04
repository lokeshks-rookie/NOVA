import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, Check, X } from "lucide-react"
import { Logo } from "@/components/Logo"
import { Eyebrow } from "@/components/Eyebrow"
import { StepIndicator } from "@/components/StepIndicator"
import { Button } from "@/components/ui/Button"
import { Input, Label, Textarea } from "@/components/ui/Field"
import { useApp } from "@/context/AppContext"
import api from "@/lib/api"

const STEPS = ["Verify your identity", "Prove ownership", "Claim submitted"]

export default function ClaimPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { user, addToast } = useApp()
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState("")
  const [proofPhoto, setProofPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch item from API
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const refNum = `CL-${Date.now().toString(36).toUpperCase().slice(-6)}`

  useEffect(() => {
    api.get(`/items/${itemId}`)
      .then((res) => {
        const d = res?.data
        setItem({
          id: d._id || d.id,
          title: d.title,
          challengeQuestion: d.challengeQuestions?.[0] || null,
          imageUrl: d.imageUrls?.[0] || null,
        })
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [itemId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-cf-muted">Loading item...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="cf-h1">Item not found</h1>
        {/* NAV → /search — item not found, go back to search */}
        <Button as={Link} to="/search" className="mt-4" badge>Search items</Button>
      </div>
    )
  }

  const handleProof = (e) => {
    const file = e.target.files?.[0]
    if (file) setProofPhoto({ name: file.name, url: URL.createObjectURL(file) })
  }

  const handleSubmitClaim = async () => {
    setSubmitting(true)
    try {
      await api.post("/claims", {
        itemId: item.id,
        answers: item.challengeQuestion
          ? [{ question: item.challengeQuestion, answer: answer }]
          : [],
      })
      setStep(2)
      addToast({ variant: "success", title: "Claim submitted", message: `Reference: ${refNum}` })
    } catch (err) {
      addToast({ variant: "error", title: "Claim failed", message: err.message || "Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cf-white">
      {/* Top bar — no sidebar */}
      <header className="flex items-center justify-between border-b border-cf-line px-6 py-4">
        <Logo />
        {/* NAV → /items/:id — back to the item detail */}
        <Link
          to={`/items/${itemId}`}
          className="flex items-center gap-1.5 text-sm font-medium text-cf-muted hover:text-cf-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to item
        </Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <StepIndicator steps={STEPS} current={step} />

        <div className="mt-10">
          {/* ── Step 01: Identity Confirmation ─────────────────────── */}
          {step === 0 && (
            <div className="cf-fade-in space-y-6">
              <Eyebrow className="text-cf-muted">Step 01 of 03 — verify your identity</Eyebrow>
              <h2 className="cf-h1 mt-3">Confirm your details</h2>
              <p className="text-[15px] leading-relaxed text-cf-muted">
                Before you proceed, confirm this information matches your campus ID.
              </p>

              <div className="space-y-4 rounded-2xl border border-cf-line bg-cf-cream p-6">
                <ReadOnlyField label="Full name" value={user?.name} />
                <ReadOnlyField label="Email" value={user?.email} />
                <ReadOnlyField label="Role" value={user?.role} />
                <ReadOnlyField label="Mobile" value={user?.mobile} />
              </div>

              <Button onClick={() => setStep(1)} className="w-full" badge>
                Confirm & continue
              </Button>
            </div>
          )}

          {/* ── Step 02: Ownership Verification ───────────────────── */}
          {step === 1 && (
            <div className="cf-fade-in space-y-6">
              <Eyebrow className="text-cf-muted">Step 02 of 03 — prove ownership</Eyebrow>
              <h2 className="cf-h1 mt-3">Answer the verification question</h2>

              <div className="rounded-2xl border border-cf-yellow bg-cf-yellow/20 p-6">
                <p className="text-sm font-medium text-cf-black">
                  Answer the question below. This was set by the person who found your item.
                  Only the true owner would know the answer.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Challenge question</Label>
                  <p className="mt-1 rounded-xl border border-cf-line bg-cf-cream px-4 py-3 text-[15px] font-medium text-cf-black">
                    {item.challengeQuestion || "No challenge question set for this item."}
                  </p>
                </div>

                <div>
                  <Label htmlFor="cl-answer">Your answer</Label>
                  <Input
                    id="cl-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                  />
                </div>

                <div>
                  <Label>Upload proof (optional but recommended)</Label>
                  <p className="mb-2 text-xs text-cf-muted">Upload a photo with the item from before it was lost.</p>
                  {proofPhoto ? (
                    <div className="flex items-center gap-3 rounded-xl border border-cf-line bg-cf-cream p-3">
                      <img src={proofPhoto.url} alt="Proof" className="h-14 w-14 rounded-lg object-cover" />
                      <span className="flex-1 truncate text-sm">{proofPhoto.name}</span>
                      <button onClick={() => setProofPhoto(null)} className="text-cf-muted hover:text-cf-danger" aria-label="Remove">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cf-focus-ring flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-cf-line bg-cf-cream/50 px-6 py-8 text-center hover:border-cf-muted">
                      <Upload className="h-6 w-6 text-cf-muted" strokeWidth={1.5} />
                      <span className="text-sm text-cf-muted">Click to upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleProof} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmitClaim} disabled={!answer.trim() || submitting} className="flex-1" badge>
                  {submitting ? "Submitting..." : "Submit claim"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 03: Confirmation ─────────────────────────────── */}
          {step === 2 && (
            <div className="cf-fade-in flex flex-col items-center px-6 py-8 text-center">
              <Eyebrow className="text-cf-muted">Step 03 of 03 — claim submitted</Eyebrow>

              {/* CSS-only yellow circle with checkmark */}
              <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-cf-yellow">
                <Check className="h-12 w-12 text-cf-black" strokeWidth={2.5} />
              </div>

              <h2 className="cf-h1 mt-6">Your claim has been submitted</h2>
              <p className="mt-2 text-sm text-cf-muted">Reference number</p>
              <p className="mt-1 text-2xl font-semibold tracking-wider">{refNum}</p>

              <div className="mt-8 w-full max-w-md text-left">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cf-muted">What happens next?</h3>
                <div className="mt-4 space-y-4">
                  {[
                    { n: "01", text: "Admin reviews your claim (within 24h)" },
                    { n: "02", text: "You receive WhatsApp/SMS with decision" },
                    { n: "03", text: "Visit the lost & found desk to collect your item" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cf-black text-xs font-semibold text-cf-white">
                        {s.n}
                      </span>
                      <p className="pt-0.5 text-sm leading-relaxed text-cf-muted">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* NAV → /my-claims — track the claim */}
              <Button as={Link} to="/my-claims" className="mt-8 w-full max-w-md" badge>
                Track this claim
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-cf-muted">{label}</p>
      <p className="mt-1 text-[15px] font-medium capitalize text-cf-black">{value || "—"}</p>
    </div>
  )
}
