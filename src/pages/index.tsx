import { Inter } from "next/font/google";
import Hero from "../components/Hero";
import Websites from "../components/Websites";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={inter.className}>
      <Head>
        <title>Tim's Terms</title>
      </Head>
      <Hero />
      <Websites />
    </main>
  );
}
