import HomeHero from "@/components/marketing/home/HomeHero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 transition-colors duration-500 dark:bg-slate-950 dark:text-white">
      <HomeHero />
    </div>
  );
}
