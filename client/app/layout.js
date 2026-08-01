import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { Inter, Outfit, Fira_Code, Space_Grotesk } from "next/font/google";
import SessionSync from "@/components/providers/SessionSync";
import RegistrationDraftLifecycle from "@/components/register/RegistrationDraftLifecycle";
import GlobalErrorToast from "@/components/ui/GlobalErrorToast";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "ढोल - ताशा महासंघ - Attendance Management Simplified",
  description: "Modern multi-tenant attendance management system for organizations.",
};

const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const root = document.documentElement;
    const keys = ["veagle-theme", "theme"];
    let theme = root.getAttribute("data-theme");

    if (theme !== "dark" && theme !== "light") {
      for (const key of keys) {
        const storedTheme = window.localStorage.getItem(key);
        if (storedTheme === "dark" || storedTheme === "light") {
          theme = storedTheme;
          break;
        }
      }
    }

    if (theme !== "dark" && theme !== "light") {
      theme =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }

    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  } catch (error) {
    console.warn("Theme bootstrap failed", error);
  }
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
        <ThemeProvider>
          <StoreProvider>
            <SessionSync />
            <Suspense fallback={null}>
              <RegistrationDraftLifecycle />
            </Suspense>
            <Navbar />
            <main className="w-full overflow-x-clip min-h-[calc(100vh-4rem)] flex flex-col">
              {children}
              <Footer />
            </main>
            <GlobalErrorToast />
            <Toaster position="bottom-right" />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
