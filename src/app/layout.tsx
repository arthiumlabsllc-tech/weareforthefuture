import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";
import ImpactMarquee from "@/components/ui/ImpactMarquee";

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
  title: {
    default: "For The Future Organization | Empowering Children Worldwide",
    template: "%s | For The Future Organization",
  },
  description:
    "For The Future Organization (FTF) is a youth-led NGO transforming the lives of underprivileged children through education, mentorship, healthcare, and sustainable empowerment across Ghana, Nigeria, and the US.",
  keywords: [
    "FTF",
    "For The Future",
    "NGO",
    "nonprofit",
    "children",
    "education",
    "Ghana",
    "Nigeria",
    "youth-led",
    "charity",
    "donate",
    "volunteer",
  ],
  authors: [{ name: "For The Future Organization" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://weareforthefuture.org",
    title: "For The Future Organization | Empowering Children Worldwide",
    description:
      "A youth-led organization transforming the lives of underprivileged children through education, mentorship, and sustainable empowerment.",
    siteName: "For The Future Organization",
  },
  twitter: {
    card: "summary_large_image",
    title: "For The Future Organization",
    description:
      "Be the reason a child smiles today. Join FTF in empowering underprivileged children worldwide.",
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
    "theme-color": "#FDF8F0",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        {/* FOUC prevention: set theme before any CSS renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ftf-theme');var th=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',th);document.documentElement.style.colorScheme=th;}catch(e){}})();`,
          }}
        />
        <meta name="theme-color" content="#FDF8F0" />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Navbar />
        <ImpactMarquee />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
