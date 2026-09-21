import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";
import BottomShell from "@/components/layout/BottomShell";
import GA4Script from "@/components/layout/GA4Script";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://weareforthefuture.org"),
  title: {
    default: "For The Future Organization | Empowering Children Worldwide",
    template: "%s | For The Future Organization",
  },
  description:
    "For The Future Organization (FTF) is a youth-led, community-rooted child and youth development organization working across Ghana and Nigeria. Through five programme pillars, we help vulnerable children and young people access education, build future-ready skills, receive mentorship and move toward productive futures.",
  keywords: [
    "FTF",
    "For The Future Organization",
    "child education NGO Ghana",
    "youth development Ghana",
    "girls' education Ghana",
    "digital skills for children Ghana",
    "youth employability Ghana",
    "sponsor education Ghana",
    "NGO partnership Ghana",
    "CSR education Ghana",
    "child and youth development organisation Ghana",
    "volunteering with children Ghana",
    "Nigeria youth programme",
    "Ibadan NGO",
  ],
  authors: [{ name: "For The Future Organization" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://weareforthefuture.org",
    title: "For The Future Organization | Empowering Children Worldwide",
    description:
      "A youth-led, community-rooted child and youth development organization helping vulnerable children and young people across Ghana and Nigeria move from disadvantage to opportunity.",
    siteName: "For The Future Organization",
    images: [
      {
        url: "https://res.cloudinary.com/vyiwmedy/image/upload/v1789126448/ftf/images/hero/ftf-hero-2-new.png",
        width: 1200,
        height: 630,
        alt: "For The Future Organization - 10 Years of Impact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "For The Future Organization",
    description:
      "From disadvantage to opportunity. Join FTF in supporting vulnerable children and young people across Ghana and Nigeria.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/misc/ftf-logo-ico.png",
    apple: "/images/misc/ftf-logo-ico.png",
  },
  other: {
    "theme-color": "#F6F7F8", // design-tokens-exempt
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        {/* FOUC prevention - KEEP next/script beforeInteractive exactly as-is.
            It runs the theme bootstrap in the initial HTML <head> BEFORE first
            paint, so a stored/system dark preference never flashes light.
            React 19 logs a DEV-ONLY console warning ("Encountered a script tag
            while rendering React component") for ANY non-async <script> that a
            component renders. Verified: that string exists only in react-dom's
            *.development.js bundles and is absent from production builds, so the
            deployed site is clean and the dev warning is harmless. Do NOT
            migrate away from beforeInteractive:
              - SSR cookie + data-theme : forces dynamic rendering (breaks
                ISR/static caching) and still cannot read the OS preference on a
                first visit (no cookie yet).
              - <script async>          : loses the pre-paint guarantee (FOUC).
              - useEffect / JS on mount : runs post-hydration (guaranteed FOUC).
            Each alternative breaks ISR, pre-paint, or both. theme-color is
            emitted via the metadata API above. */}
        <Script id="theme-init" src="/theme-init.js" strategy="beforeInteractive" />
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <PublicShell />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <BottomShell />
        <Analytics />
        {/* GA4 mounts only on the production deployment (VERCEL_ENV=production).
            On Vercel preview/branch builds and locally this is never rendered, so
            no gtag.js request fires and preview traffic cannot pollute prod
            analytics. The consent + NEXT_PUBLIC_GA4_ID gates inside GA4Script are
            the second and third layers. */}
        {process.env.VERCEL_ENV === "production" && <GA4Script />}
      </body>
    </html>
  );
}
