import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

export function SpecCard({
  columns,
  rows,
  marginPx,
  marginPct,
}: {
  columns: number
  rows: number
  marginPx: number
  marginPct: number
}) {
  const specRows = [
    { label: 'Upload size (feed)', value: '1080 × 1350 px · 4:5' },
    { label: 'Grid crop (profile)', value: '1080 × 1440 px · 3:4' },
    {
      label: 'Safe zone width',
      value: `1012.5 px (${(100 - marginPct * 2).toFixed(2)}%)`,
    },
    {
      label: 'Margin per side',
      value: `${marginPx.toFixed(2)} px (${marginPct.toFixed(2)}%)`,
    },
    {
      label: `Full crop (${rows}×${columns})`,
      value: `${columns * 3}:${rows * 4} · ${rows * columns} tiles`,
    },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>The margin math</CardTitle>
        <CardDescription>
          Instagram shows portrait posts as 4:5 in the feed but center-crops
          them to 3:4 on your profile grid, shaving the left and right edges.
          GridSlice places your image in the centered 3:4 safe zone and pads the
          sides out to 4:5, ensuring the crop only ever eats the margin, never
          your photo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {specRows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-4 bg-card px-4 py-3"
            >
              <dt className="text-sm text-muted-foreground">{r.label}</dt>
              <dd className="font-mono text-sm font-medium text-foreground">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter>
        <p className="font-mono text-xs text-muted-foreground">
          margin = (height×4/5 − height×3/4) / 2 = (1080 − 1012.5) / 2 = 33.75
          px
        </p>
      </CardFooter>
    </Card>
  )
}
