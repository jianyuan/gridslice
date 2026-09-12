import { ArrowUpLeft } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span>Gridslice</span>
        <Link
          href="https://jian.fyi"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <ArrowUpLeft className="size-3.5" />
          jian.fyi
        </Link>
      </div>
    </footer>
  )
}
