import { LegalPage } from "../components/LegalPage"

const sections = [
  {
    h: "1. Acceptance of terms",
    p: "By accessing CampusFind you agree to use the platform solely for reporting, searching, and claiming lost and found items within your campus community. Accounts are limited to verified campus members.",
  },
  {
    h: "2. Reporting items",
    p: "You agree to provide accurate descriptions of items you report. Fraudulent listings, spam, or attempts to claim items that do not belong to you may result in suspension of your account.",
  },
  {
    h: "3. Ownership verification",
    p: "Claims are verified using challenge questions set by the finder and reviewed by campus administrators. Providing false verification details is a violation of these terms and campus policy.",
  },
  {
    h: "4. Item storage",
    p: "Found items handed to the lost and found desk are stored for up to 90 days. Unclaimed items may be donated or disposed of according to campus policy after this period.",
  },
  {
    h: "5. Limitation of liability",
    p: "CampusFind facilitates connections between finders and owners but is not responsible for the condition of items, the accuracy of listings, or the conduct of members during handovers.",
  },
]

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      {sections.map((s) => (
        <section key={s.h}>
          <h2 className="mb-2 text-lg font-semibold text-black">{s.h}</h2>
          <p>{s.p}</p>
        </section>
      ))}
    </LegalPage>
  )
}
