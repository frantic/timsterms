import { Inter } from "next/font/google";
import Hero from "../components/Hero";
import Websites from "../components/Websites";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={inter.className}>
      <Hero />
      <Websites />
    </main>
  );
}
