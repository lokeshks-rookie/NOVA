import { useState, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Upload, Lock, MapPin, Check, ChevronLeft, X, Image as ImageIcon } from "lucide-react"
import { StepIndicator } from "@/components/StepIndicator"
import { Eyebrow } from "@/components/Eyebrow"
import { CategoryIcon } from "@/components/CategoryIcon"
import { Button } from "@/components/ui/Button"
import { Input, Textarea, Label, Select } from "@/components/ui/Field"
import { useApp } from "@/context/AppContext"
import { CATEGORIES, LOCATIONS } from "@/data/mock"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

const STEPS = ["Type & Category", "Details & Photos", "Location", "Review & Submit"]

export default function ReportPage() {
  const navigate = useNavigate()
  const { addToast } = useApp()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [type, setType] = useState(null) // "lost" | "found"
  const [category, setCategory] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [photos, setPhotos] = useState([])
  const [challengeQ, setChallengeQ] = useState("")
  const [challengeA, setChallengeA] = useState("")
  const [location, setLocation] = useState("")
  const [landmark, setLandmark] = useState("")

  const refNum = `CF-${Date.now().toString(36).toUpperCase().slice(-6)}`

  const canNext = () => {
    if (step === 0) return type && category
    if (step === 1) return title.trim().length > 0 && description.length >= 50 && date
    if (step === 2) return location
    return true
  }

  const handlePhotoDrop = useCallback((e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files || e.target.files || []).slice(0, 4 - photos.length)
    const newPhotos = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 4))
  }, [photos.length])

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const dateTime = date && time ? `${date}T${time}:00` : date ? `${date}T00:00:00` : new Date().toISOString()
      await api.post("/items", {
        type,
        category,
        title,
        description,
        location,
        landmark: landmark || undefined,
        date: dateTime,
        imageUrls: photos.map((p) => p.url),
        challengeQuestions: challengeQ && challengeA
          ? [{ question: challengeQ, answer: challengeA }]
          : [],
      })
      setSubmitted(true)
      addToast({ variant: "success", title: "Report submitted", message: `Reference: ${refNum}` })
    } catch (err) {
      addToast({ variant: "error", title: "Submission failed", message: err.message || "Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
        {/* CSS-only yellow checkmark */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-cf-yellow">
          <Check className="h-12 w-12 text-cf-black" strokeWidth={2.5} />
        </div>
        <Eyebrow className="text-cf-muted">Report submitted</Eyebrow>
        <h1 className="cf-h1 mt-4">Your item has been reported</h1>
        <p className="mt-2 text-sm text-cf-muted">Reference number</p>
        <p className="mt-1 text-2xl font-semibold tracking-wider">{refNum}</p>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cf-muted">
          Your report is now live on the campus feed. You will be notified if someone matches or claims it.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {/* NAV → /report — fresh report wizard */}
          <Button onClick={() => window.location.reload()} variant="secondary" badge>
            Report another item
          </Button>
          {/* NAV → /dashboard — return to dashboard */}
          <Button as={Link} to="/dashboard" badge>
            Go to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Eyebrow className="text-cf-muted">Report an item</Eyebrow>
      <h1 className="cf-h1 mt-3 mb-8 text-balance">What did you lose or find?</h1>

      <StepIndicator steps={STEPS} current={step} />

      <div className="mt-10">
        {/* ── STEP 01: Type & Category ──────────────────────────────── */}
        {step === 0 && (
          <div className="cf-fade-in space-y-8">
            <div>
              <Label>What happened?</Label>
              <div className="mt-2 flex gap-3">
                {[
                  { v: "lost", label: "I LOST something" },
                  { v: "found", label: "I FOUND something" },
                ].map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => setType(t.v)}
                    className={cn(
                      "cf-focus-ring flex-1 rounded-full py-3 text-sm font-semibold transition-colors",
                      type === t.v
                        ? "bg-cf-yellow text-cf-black"
                        : "border border-cf-line text-cf-muted hover:text-cf-black",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "cf-focus-ring flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-medium transition-colors",
                      category === cat.id
                        ? "border-cf-yellow bg-cf-yellow text-cf-black"
                        : "border-cf-line text-cf-muted hover:border-cf-black hover:text-cf-black",
                    )}
                  >
                    <CategoryIcon name={cat.icon} className="h-6 w-6" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 02: Details & Photos ────────────────────────────── */}
        {step === 1 && (
          <div className="cf-fade-in space-y-6">
            <div>
              <Label htmlFor="rp-title">Item title</Label>
              <Input id="rp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Black Apple AirPods Pro" />
            </div>

            <div>
              <Label htmlFor="rp-desc">Description</Label>
              <Textarea
                id="rp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible — colour, brand, distinguishing marks..."
                rows={4}
              />
              <p className={cn("mt-1.5 text-xs", description.length >= 50 ? "text-cf-success" : "text-cf-muted")}>
                {description.length}/50 characters minimum
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="rp-date">Date</Label>
                <Input id="rp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rp-time">Time (optional)</Label>
                <Input id="rp-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            {/* Photo upload zone */}
            <div>
              <Label>Photos (up to 4)</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handlePhotoDrop}
                className="mt-2 flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cf-line bg-cf-cream/50 p-6 text-center transition-colors hover:border-cf-muted"
              >
                <Upload className="h-8 w-8 text-cf-muted" strokeWidth={1.5} />
                <p className="text-sm text-cf-muted">Drag and drop photos here</p>
                <label className="cf-focus-ring cursor-pointer rounded-full border border-cf-line bg-cf-white px-4 py-2 text-sm font-medium text-cf-black hover:bg-cf-cream">
                  Browse files
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoDrop} />
                </label>
              </div>
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-cf-line">
                      <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute inset-0 flex items-center justify-center bg-cf-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="h-5 w-5 text-cf-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Challenge questions — only for Found items */}
            {type === "found" && (
              <div className="rounded-2xl border border-cf-line bg-cf-cream p-6">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-cf-black" />
                  <Eyebrow className="text-cf-black">Ownership verification</Eyebrow>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-cf-muted">
                  Set a question only the true owner can answer. This prevents fraudulent claims.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="rp-cq">Identifying detail</Label>
                    <Input id="rp-cq" value={challengeQ} onChange={(e) => setChallengeQ(e.target.value)} placeholder="e.g. What sticker is on the back of the case?" />
                  </div>
                  <div>
                    <Label htmlFor="rp-ca">Answer</Label>
                    <div className="relative">
                      <Input
                        id="rp-ca"
                        type="password"
                        value={challengeA}
                        onChange={(e) => setChallengeA(e.target.value)}
                        placeholder="••••••••"
                        className="pr-8"
                      />
                      <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cf-muted" />
                    </div>
                    <p className="mt-1.5 text-xs text-cf-muted">This answer will not be shown publicly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 03: Location ────────────────────────────────────── */}
        {step === 2 && (
          <div className="cf-fade-in space-y-6">
            <div>
              <Label htmlFor="rp-loc">Where was it {type === "lost" ? "lost" : "found"}?</Label>
              <Select id="rp-loc" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Select location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="rp-landmark">Additional landmark / floor / room (optional)</Label>
              <Input id="rp-landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Second floor, near the printer" />
            </div>

            {/* Static campus map placeholder */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cf-line bg-cf-cream p-10 text-center">
              <MapPin className="h-10 w-10 text-cf-muted" strokeWidth={1.5} />
              <p className="text-sm font-medium text-cf-muted">Interactive map — coming soon</p>
              <span className="rounded-full border border-cf-line bg-cf-white px-3 py-1 text-xs text-cf-muted">Phase 2</span>
            </div>
          </div>
        )}

        {/* ── STEP 04: Review & Submit ─────────────────────────────── */}
        {step === 3 && (
          <div className="cf-fade-in space-y-6">
            <Eyebrow className="text-cf-muted">Review your report</Eyebrow>

            <div className="divide-y divide-cf-line rounded-2xl border border-cf-line bg-cf-white">
              <ReviewRow label="Type" value={type === "lost" ? "Lost" : "Found"} onEdit={() => setStep(0)} />
              <ReviewRow label="Category" value={CATEGORIES.find((c) => c.id === category)?.label || category} onEdit={() => setStep(0)} />
              <ReviewRow label="Title" value={title} onEdit={() => setStep(1)} />
              <ReviewRow label="Description" value={description} onEdit={() => setStep(1)} />
              <ReviewRow label="Date" value={`${date}${time ? ` at ${time}` : ""}`} onEdit={() => setStep(1)} />
              <ReviewRow label="Location" value={`${location}${landmark ? ` — ${landmark}` : ""}`} onEdit={() => setStep(2)} />
              {photos.length > 0 && (
                <div className="flex items-start gap-4 px-5 py-4">
                  <span className="w-28 shrink-0 text-sm font-medium text-cf-muted">Photos</span>
                  <div className="flex flex-wrap gap-2">
                    {photos.map((p, i) => (
                      <img key={i} src={p.url} alt={p.name} className="h-14 w-14 rounded-lg border border-cf-line object-cover" />
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="ml-auto text-sm font-medium text-cf-black hover:underline">Edit</button>
                </div>
              )}
              {type === "found" && challengeQ && (
                <ReviewRow label="Challenge" value={challengeQ} onEdit={() => setStep(1)} />
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full" badge>
              Submit report
            </Button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {!submitted && (
        <div className="mt-10 flex items-center justify-between border-t border-cf-line pt-6">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <span />
          )}
          {step < 3 && (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} badge>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <span className="w-28 shrink-0 text-sm font-medium text-cf-muted">{label}</span>
      <p className="flex-1 text-sm text-cf-black">{value}</p>
      <button onClick={onEdit} className="shrink-0 text-sm font-medium text-cf-black hover:underline">Edit</button>
    </div>
  )
}
