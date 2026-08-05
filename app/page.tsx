import { GridMaker } from "@/components/grid-maker";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:py-12">
      <Header />
      <GridMaker />
    </div>
  );
}
