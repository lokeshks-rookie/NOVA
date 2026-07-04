import { LegalPage } from "../components/LegalPage"

const sections = [
  {
    h: "1. Information we collect",
    p: "We collect your name, campus email, mobile number, department, and role during signup. When you report or claim an item, we store the details and any photos you provide.",
  },
  {
    h: "2. How we use your data",
    p: "Your information is used to match lost items with owners, verify claims, and send notifications about matches and claim decisions through your chosen channels.",
  },
  {
    h: "3. What we show publicly",
    p: "Item reports are shown to the campus community with your identity anonymised as 'a student' or 'a staff member'. Ownership verification answers are never displayed publicly.",
  },
  {
    h: "4. Notifications",
    p: "You control how you are contacted. WhatsApp, SMS, and email notifications can each be toggled from your profile settings at any time.",
  },
  {
    h: "5. Data retention",
    p: "Account data is retained while your campus membership is active. You may delete your account from the profile settings, which removes your personal information from the platform.",
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      {sections.map((s) => (
        <section key={s.h}>
          <h2 className="mb-2 text-lg font-semibold text-black">{s.h}</h2>
          <p>{s.p}</p>
        </section>
      ))}
    </LegalPage>
  )
}
