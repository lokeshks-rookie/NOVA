import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Phone, Calendar, Shield, Trash2, X, Search, Sun, Moon } from "lucide-react"
import { Eyebrow } from "@/components/Eyebrow"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/Button"
import { Input, Label, Select, Switch } from "@/components/ui/Field"
import { Accordion } from "@/components/ui/Accordion"
import { Modal } from "@/components/ui/Modal"
import { useApp } from "@/context/AppContext"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser, logout, savedSearches, deleteSavedSearch, addToast, theme, setTheme } = useApp()

  // Editable fields
  const [name, setName] = useState(user?.name || "")
  const [mobile, setMobile] = useState(user?.mobile?.replace("+91 ", "") || "")
  const [department, setDepartment] = useState(user?.department || "")
  const [year, setYear] = useState(user?.year || "")

  // Notification prefs
  const [whatsapp, setWhatsapp] = useState(true)
  const [sms, setSms] = useState(true)
  const [emailNotif, setEmailNotif] = useState(true)
  const [savedSearchNotif, setSavedSearchNotif] = useState(true)

  // Password
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")

  // Delete modal
  const [showDelete, setShowDelete] = useState(false)

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const handleSavePersonal = async () => {
    try {
      const res = await api.patch("/auth/profile", { name, mobile: `+91 ${mobile}`, department, year: year || null })
      if (res?.data) updateUser(res.data)
      addToast({ variant: "success", title: "Profile updated", message: "Your personal information has been saved." })
    } catch (err) {
      addToast({ variant: "error", title: "Update failed", message: err.message || "Please try again." })
    }
  }

  const handleChangePw = () => {
    if (newPw.length < 6) {
      addToast({ variant: "error", title: "Error", message: "New password must be at least 6 characters." })
      return
    }
    if (newPw !== confirmPw) {
      addToast({ variant: "error", title: "Error", message: "Passwords do not match." })
      return
    }
    setCurrentPw("")
    setNewPw("")
    setConfirmPw("")
    addToast({ variant: "success", title: "Password updated", message: "Your password has been changed." })
  }

  const handleDeleteAccount = () => {
    setShowDelete(false)
    logout()
    // NAV → / — after account deletion go to landing
    navigate("/")
    addToast({ variant: "info", title: "Account deleted", message: "Your account has been removed." })
  }

  const settingsSections = [
    {
      id: "personal",
      question: "Personal information",
      answer: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-name">Full name</Label>
              <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pf-mobile">Mobile number</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-cf-line bg-cf-cream px-3 text-sm text-cf-muted">
                  +91
                </span>
                <Input
                  id="pf-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="rounded-l-none"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-dept">Department</Label>
              <Select id="pf-dept" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {["Computer Science", "Mathematics", "Mechanical", "Electrical", "Civil", "Administration", "Facilities", "Other"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
            {user?.role === "student" && (
              <div>
                <Label htmlFor="pf-year">Year of study</Label>
                <Select id="pf-year" value={year} onChange={(e) => setYear(e.target.value)}>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <Button onClick={handleSavePersonal} size="sm">Save changes</Button>
        </div>
      ),
    },
    {
      id: "notifications",
      question: "Notification preferences",
      answer: (
        <div className="space-y-4">
          <ToggleRow label="WhatsApp notifications" checked={whatsapp} onChange={setWhatsapp} />
          <ToggleRow label="SMS notifications" checked={sms} onChange={setSms} />
          <ToggleRow label="Email notifications" checked={emailNotif} onChange={setEmailNotif} />
          <ToggleRow label="Notify on saved search match" checked={savedSearchNotif} onChange={setSavedSearchNotif} />
        </div>
      ),
    },
    {
      id: "password",
      question: "Password & Security",
      answer: (
        <div className="space-y-4 max-w-sm">
          <div>
            <Label htmlFor="pf-curpw">Current password</Label>
            <Input id="pf-curpw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pf-newpw">New password</Label>
            <Input id="pf-newpw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pf-confirmpw">Confirm new password</Label>
            <Input id="pf-confirmpw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          <Button onClick={handleChangePw} size="sm">Update password</Button>
        </div>
      ),
    },
    {
      id: "preferences",
      question: "Appearance Preferences",
      answer: (
        <div className="space-y-4">
          <p className="text-sm text-cf-muted">Choose your preferred appearance for the entire site.</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Light theme option */}
            <button
              type="button"
              onClick={() => {
                setTheme("light")
                addToast({ variant: "success", title: "Theme updated", message: "Switched to light mode." })
              }}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                theme === "light"
                  ? "border-cf-yellow bg-cf-yellow/10 shadow-sm"
                  : "border-cf-line hover:border-cf-muted"
              )}
            >
              <img
                src="/icons/theme-light.png"
                alt="Light theme preview"
                className="w-full rounded-xl border border-cf-line"
              />
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium">Light</span>
              </div>
              {theme === "light" && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cf-yellow text-[11px] font-bold text-black">✓</span>
              )}
            </button>

            {/* Dark theme option */}
            <button
              type="button"
              onClick={() => {
                setTheme("dark")
                addToast({ variant: "success", title: "Theme updated", message: "Switched to dark mode." })
              }}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all",
                theme === "dark"
                  ? "border-cf-yellow bg-cf-yellow/10 shadow-sm"
                  : "border-cf-line hover:border-cf-muted"
              )}
            >
              <img
                src="/icons/theme-dark.png"
                alt="Dark theme preview"
                className="w-full rounded-xl border border-cf-line"
              />
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium">Dark</span>
              </div>
              {theme === "dark" && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cf-yellow text-[11px] font-bold text-black">✓</span>
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "saved",
      question: "Saved searches",
      answer: (
        <div className="space-y-3">
          {savedSearches.length === 0 ? (
            <p className="text-sm text-cf-muted">No saved searches.</p>
          ) : (
            savedSearches.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-cf-line bg-cf-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium">&ldquo;{s.query}&rdquo;</p>
                  <p className="text-xs text-cf-muted">{s.category}</p>
                </div>
                <button
                  onClick={() => deleteSavedSearch(s.id)}
                  className="text-cf-muted hover:text-cf-danger"
                  aria-label={`Delete search: ${s.query}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      id: "delete",
      question: "Delete account",
      answer: (
        <div className="rounded-2xl border-2 border-cf-danger/30 p-5">
          <p className="text-sm leading-relaxed text-cf-muted">
            Deleting your account will permanently remove all your data, reports, and claims. This action cannot be undone.
          </p>
          <Button variant="danger" size="sm" className="mt-4" onClick={() => setShowDelete(true)}>
            Delete my account
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <Eyebrow className="text-cf-muted">Your profile</Eyebrow>
      <h1 className="cf-h1 mt-3 mb-8">Profile & Settings</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* ── Profile summary card ─────────────────────────────────── */}
        <div className="lg:w-72 lg:shrink-0">
          <div className="rounded-2xl border border-cf-line bg-cf-white p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cf-black text-2xl font-bold text-cf-white">
              {initials}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{user?.name}</h2>
            <span className="mt-1 inline-flex rounded-full bg-cf-yellow px-3 py-1 text-xs font-medium capitalize text-cf-black">
              {user?.role}
            </span>

            <div className="mt-6 space-y-3 text-left text-sm text-cf-muted">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user?.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {user?.mobile}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Member since {formatDate(user?.memberSince)}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> {user?.idNumber}
              </div>
            </div>
          </div>
        </div>

        {/* ── Settings accordion ───────────────────────────────────── */}
        <div className="flex-1">
          <Accordion items={settingsSections} defaultOpen="personal" />
        </div>
      </div>

      {/* Delete account confirmation modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete your account?">
        <p className="text-sm leading-relaxed text-cf-muted">
          This will permanently remove your profile, reports, claims, and saved searches. This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDeleteAccount}>
            Delete account
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-cf-black">{label}</span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  )
}
