import { Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="mx-auto max-w-5xl flex flex-col gap-3 px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 text-primary">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <span className="text-sm font-semibold tracking-widest uppercase">
          GridSlice
        </span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
        Instagram grid layout maker
      </h1>
      <p className="max-w-2xl text-pretty text-muted-foreground">
        Split one photo into a seamless multi-post grid. Crop it, and GridSlice
        pads each slice with side margins so your image survives Instagram’s 3:4
        grid crop, while every download stays a clean 4:5 for the feed.
      </p>
    </header>
  )
}
