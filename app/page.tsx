import { Footer } from '@/components/footer'
import { GridMaker } from '@/components/grid-maker'
import { Header } from '@/components/header'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <GridMaker />
      </main>
      <Footer />
    </div>
  )
}
