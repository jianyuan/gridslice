import { GridMaker } from '@/components/grid-maker'
import { Header } from '@/components/header'

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <Header />
      <GridMaker />
    </div>
  )
}
