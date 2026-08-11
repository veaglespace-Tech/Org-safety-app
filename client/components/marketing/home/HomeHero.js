import Link from "next/link";
import { ArrowRight, Sparkles, ShieldAlert, UserCheck, MapPin, BellRing, PhoneCall } from "lucide-react";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

export default function HomeHero() {
  return (
    <section className="theme-hero-mesh relative overflow-hidden px-3 pb-8 pt-20 sm:px-4 sm:pb-10 sm:pt-24 md:px-0 md:pb-12 md:pt-36 lg:pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-1/4 h-72 w-72 animate-pulse rounded-full bg-cyan-300/20 blur-[110px] dark:bg-cyan-300/14 md:h-[520px] md:w-[520px] md:blur-[160px]" />
        <div className="absolute -right-10 bottom-1/4 h-72 w-72 animate-pulse rounded-full bg-blue-500/20 blur-[110px] delay-700 dark:bg-blue-400/18 md:h-[500px] md:w-[500px] md:blur-[160px]" />
      </div>

      <div className="site-container relative z-10">
        <div className="mx-auto max-w-4xl text-center">

          <h1 className="mb-5 text-4xl font-black leading-[1.02] tracking-tight sm:mb-6 sm:text-5xl md:mb-8 md:text-7xl md:leading-[0.95] lg:text-8xl">
            ढोल - ताशा  <br className="hidden md:block" />
            <span className="gradient-text">महासंघ</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl px-1 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:px-3 sm:text-lg md:mb-12 md:px-0 md:text-2xl">
            <strong className="font-extrabold text-rose-600 dark:text-rose-400">'तिची सुरक्षा'</strong> द्वारे महिलांच्या सुरक्षिततेसाठी अटूट बांधिलकीसह आपल्या महासंघाला सक्षम करणे.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 px-2 sm:flex-row sm:gap-4 md:gap-6 md:px-0">
            <Link
              href="/register/organisation"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base font-black text-white shadow-[0_26px_68px_rgba(30,112,209,0.28)] transition-all duration-500 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_30px_78px_rgba(4,18,48,0.20)] active:scale-95 dark:bg-blue-500 dark:text-slate-950 dark:shadow-blue-950/40 dark:hover:bg-blue-300 sm:w-auto md:rounded-[2rem] md:px-10 md:py-5 md:text-lg"
            >
              Get Started Now
              <ArrowRight size={22} className="transition-transform duration-500 group-hover:translate-x-2" />
            </Link>
            <Link
              href="/login"
              className="w-full rounded-2xl border-2 border-slate-100 bg-white/85 px-8 py-4 text-base font-black text-slate-900 shadow-[0_20px_52px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-600 hover:text-blue-600 hover:shadow-[0_24px_62px_rgba(59,130,246,0.16)] active:scale-95 dark:border-slate-700 dark:bg-slate-900/75 dark:text-white dark:shadow-black/20 dark:hover:border-blue-400 dark:hover:bg-slate-800 dark:hover:text-blue-100 sm:w-auto md:rounded-[2rem] md:px-10 md:py-5 md:text-lg"
            >
              Sign In
            </Link>
          </div>

        </div>

        <div className="w-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 mt-14 text-left sm:mt-16 md:mt-20">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white/90 via-slate-50/90 to-slate-100/90 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-950/95 p-6 shadow-xl dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8 md:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

              <div className="relative z-10 mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6 sm:flex-row sm:items-center md:mb-10 md:pb-8">
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_30px_rgba(59,130,246,0.25)]">
                    <Sparkles size={26} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl md:text-3xl">
                      सिस्टम कसे कार्य करते?
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm md:text-base font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                      How this feature works — Quick Overview
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 shadow-sm">
                  <ShieldAlert size={14} className="text-blue-600 dark:text-blue-400" />
                  Safety & Security
                </span>
              </div>

              <div className="relative z-10 grid gap-5 sm:gap-6 md:grid-cols-2 md:gap-7">
                <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-blue-300 hover:bg-white dark:hover:border-blue-500/50 dark:hover:bg-slate-800/60 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-transform duration-300 group-hover:scale-110">
                      <UserCheck size={24} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        ऑटो-फील प्रोफाइल
                      </h4>
                      <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                        तुमचे नाव, ईमेल, फोन नंबर आणि संस्था (Org Name/ID) आपोआप प्रदर्शित होतात.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white dark:hover:border-emerald-500/50 dark:hover:bg-slate-800/60 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-transform duration-300 group-hover:scale-110">
                      <MapPin size={24} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        Live GPS Location
                      </h4>
                      <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                        Browser Geolocation API द्वारे तुमचे अचूक अक्षांश व रेखांश मिळवून Google Maps लिंक तयार केली जाते.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:bg-white dark:hover:border-amber-500/50 dark:hover:bg-slate-800/60 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm dark:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-transform duration-300 group-hover:scale-110">
                      <BellRing size={24} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                        तात्काळ ईमेल अलर्ट
                      </h4>
                      <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                        SOS बटण दाबल्यावर Nodemailer द्वारे तुमचा लोकेशन Admin ला आणि Support टीमला त्वरित ईमेल पाठवला जातो.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-rose-300 hover:bg-white dark:hover:border-rose-500/50 dark:hover:bg-slate-800/60 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm dark:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-transform duration-300 group-hover:scale-110">
                      <PhoneCall size={24} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                        थेट कॉल व मेसेज
                      </h4>
                      <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                        Direct Call व WhatsApp शेअर लिंकद्वारे तुम्ही एका क्लिकवर तुमच्या जवळच्या व्यक्तींना माहिती पाठवू शकता.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
