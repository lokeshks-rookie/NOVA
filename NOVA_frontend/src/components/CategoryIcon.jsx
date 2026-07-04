import {
  Smartphone,
  CreditCard,
  Backpack,
  Shirt,
  KeyRound,
  BookOpen,
  Watch,
  Package,
} from "lucide-react"

// Maps a category icon name (from mock CATEGORIES) to a lucide line icon.
const ICONS = { Smartphone, CreditCard, Backpack, Shirt, KeyRound, BookOpen, Watch, Package }

export function CategoryIcon({ name, className, strokeWidth = 1.75 }) {
  const Icon = ICONS[name] || Package
  return <Icon className={className} strokeWidth={strokeWidth} />
}
