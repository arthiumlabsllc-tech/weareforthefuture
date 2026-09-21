import { img } from "@/lib/imageUrl";

export const siteConfig = {
  name: "For The Future Organization",
  shortName: "FTF",
  legalName: "For The Future Organization",
  positioning:
    "A youth-led, community-rooted child and youth development organization helping vulnerable children and young people move from disadvantage to learning, dignity, confidence, skills and future opportunity.",
  tagline: "From disadvantage to opportunity.",
  description:
    "For The Future Organization is a youth-led, community-rooted child and youth development organization working across Ghana and Nigeria. Through five programme pillars, we help vulnerable children and young people access education, stay in school, build confidence and future-ready skills, receive mentorship and move toward productive futures.",
  url: "https://weareforthefuture.org",
  founded: 2016,
  countries: ["Ghana", "Nigeria"],
  vehicleCountries: ["United States"],
  regions: {
    ghana: ["Greater Accra", "Eastern", "Central", "Volta", "Bono East", "Savannah", "Western"],
    nigeria: ["Oyo State (Ibadan)"],
  },
  mission:
    "We support vulnerable children and young people through education, girls' empowerment, future-ready skills, mentorship, child wellbeing and community-based support, while building partnerships that create lasting opportunities.",
  vision:
    "A future where every child and young person, regardless of background, can learn, grow in dignity, develop their potential and build a meaningful future.",
  legal: {
    // TODO(legal): populate with FTF's real registration details when available.
    // Until then these render as "[pending]" placeholders in the trust block.
    ngoRegistration: null as string | null,
    us501c3Ein: null as string | null,
    status: "501(c)(3) Nonprofit Organization (US vehicle)",
    taxNote: "Contributions are tax-deductible to the extent permitted by law.",
  },
  contact: {
    emails: ["info@weareforthefuture.org"],
    phones: ["+233 548 483 667", "+233 542 929 074", "+233 550 007 217"],
  },
  social: {
    tiktok: "https://www.tiktok.com/@ftfghana",
    youtube: "https://youtube.com/@ftfghana",
    linkedin: "https://www.linkedin.com/company/ftfghana/",
    facebook: "https://www.facebook.com/ftfghana",
    twitter: "https://x.com/FTFGhana",
    instagram: "https://www.instagram.com/ftfghana",
  },
  stats: {
    yearsOfFoundation: 10,
    beneficiaries: 9000,
    volunteers: 500,
    campaigns: 200,
    countries: 2,
    regions: 7,
    programmes: 5,
    lastUpdated: "2026-09-01",
  },
  donation: {
    paystackUrl: "https://paystack.shop/pay/ftf",
    goFundMeUrl: "https://www.gofundme.com/f/student-training-and-education-project",
    momoNumber: "0595855455",
    momoName: "For The Future Ghana",
    bankAccount: {
      name: "FOR THE FUTURE GHANA",
      ghs: { account: "1441002365069", branch: "WEIJA" },
      usd: { account: "3441002210168", branch: "WEIJA" },
    },
    villageGoal: 500000,
    villageCurrency: "GH₵",
    villageRaised: 125000,
    allocationNote: "100% of store proceeds fund programmes.",
  },
  founder: {
    name: "Kezia Asiedua Sanie",
    title: "Founder & President",
    quote:
      "I believe that no one came to this world without a purpose. Every single human being has a special God-given and inbuilt gift within them which must be unearthed.",
    image: img("/images/team/exec-kezia.png"),
  },
};

export const partnerLogos = [
  { name: "Jambo Spaces", image: img("/images/partners/jambo.png"), tier: "community" },
  { name: "Asustem Robotics", image: img("/images/partners/asustem.png"), tier: "programme" },
  { name: "The Wit Schools", image: img("/images/partners/wit-schools.png"), tier: "school" },
  { name: "Chess in Slums", image: img("/images/partners/chess-in-slums.png"), tier: "programme" },
  { name: "Bel Aqua", image: img("/images/partners/bel-aqua.png"), tier: "in-kind" },
  { name: "Promasidor", image: img("/images/partners/promasidor.png"), tier: "corporate" },
  { name: "Unilever", image: img("/images/partners/unilever.png"), tier: "corporate" },
  { name: "UNFPA Ghana", image: img("/images/partners/unfpa.png"), tier: "institutional" },
  { name: "School in a Bag", image: img("/images/partners/school-in-bag.png"), tier: "programme" },
  { name: "Samboad", image: img("/images/partners/samboad.png"), tier: "community" },
  { name: "PETROSOL", image: img("/images/partners/petrosol.png"), tier: "corporate" },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Impact", href: "/impact" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

/**
 * Footer link groups. Every footer column renders from one of these arrays so
 * nav changes stay in data, not JSX. `status` marks whether the target route
 * is live today or planned for a later phase. Planned links render normally in
 * production (a 404 is expected until their phase ships) and carry a subtle
 * dev-only indicator so we can spot not-yet-built routes while working locally.
 */
export type FooterLink = {
  label: string;
  href: string;
  status: "planned" | "live";
};

/** Footer "Organization" column - who we are and what we do. */
export const footerOrgLinks: FooterLink[] = [
  { label: "Our Story", href: "/about", status: "live" },
  { label: "Our Work", href: "/our-work", status: "live" },
  { label: "Impact", href: "/impact", status: "live" },
  { label: "Impact Stories", href: "/impact-stories", status: "live" },
  { label: "Executive Board", href: "/executive-board", status: "live" },
  { label: "Advisory Board", href: "/advisory-board", status: "live" },
  { label: "News", href: "/news", status: "live" },
  { label: "Nigeria", href: "/nigeria", status: "live" },
];

/** Footer "More" column - about/impact/utility pages. */
export const footerMoreLinks: FooterLink[] = [
  { label: "Our Story", href: "/about/our-story", status: "live" },
  { label: "How We Work", href: "/about/how-we-work", status: "live" },
  { label: "Where We Work", href: "/about/where-we-work", status: "live" },
  { label: "Team & Governance", href: "/about/team", status: "live" },
  { label: "Safeguarding", href: "/about/safeguarding", status: "live" },
  { label: "Reports & Transparency", href: "/impact/reports", status: "live" },
  { label: "FTF at 10", href: "/impact/ftf-at-10", status: "live" },
  { label: "Stories", href: "/news", status: "live" },
  { label: "Partners", href: "/partners", status: "live" },
  { label: "Impact Store", href: "/impact-store", status: "live" },
];

/** Footer "Get Involved" column - the conversion routes. */
export const footerInvolveLinks: FooterLink[] = [
  { label: "Give", href: "/give", status: "live" },
  { label: "Get Involved", href: "/get-involved", status: "live" },
  { label: "Volunteer", href: "/get-involved/volunteer", status: "live" },
  { label: "Fellowship", href: "/get-involved/fellowship", status: "live" },
  { label: "Mentor", href: "/get-involved/mentor", status: "live" },
  { label: "Partner With FTF", href: "/partners", status: "live" },
];

/** Legal links - rendered at the end of the "More" column. */
export const footerLegalLinks: FooterLink[] = [
  { label: "Privacy", href: "/privacy", status: "live" },
  { label: "Terms", href: "/terms", status: "live" },
  { label: "Cookies", href: "/cookies", status: "live" },
];

// Colors cycle through 3 brand tokens (accent/primary/charcoal) to preserve the
// brief's 3-color discipline. Do NOT assign 7 unique hues - that would break the
// brand system and the 70/20/10 ratio.
export const coreValues = [
  { title: "Child-centredness", description: "Every decision starts with what is best for the child - their safety, dignity, learning and voice.", icon: "Heart", color: "accent" },
  { title: "Integrity", description: "We do what we say we will do, and we are honest about what we do not yet know.", icon: "ShieldCheck", color: "primary" },
  { title: "Dignity", description: "We serve with, not to. Every child is known by name and treated with respect.", icon: "Sparkles", color: "accent" },
  { title: "Inclusion", description: "No child is left behind - regardless of background, gender, ability or circumstance.", icon: "Globe", color: "primary" },
  { title: "Accountability", description: "We measure, report and learn - to our communities, partners and supporters.", icon: "ClipboardCheck", color: "charcoal" },
  { title: "Partnership", description: "Lasting change is built with communities, schools, families and institutional allies.", icon: "Handshake", color: "primary" },
  { title: "Sustainability", description: "We build for the long term - programmes, systems and relationships that outlast us.", icon: "Leaf", color: "accent" },
];

/** Phase 7.2: Default OG image for pages that define their own openGraph block. */
export const DEFAULT_OG_IMAGE = {
  url: "https://res.cloudinary.com/vyiwmedy/image/upload/v1789126448/ftf/images/hero/ftf-hero-2-new.png",
  width: 1200,
  height: 630,
  alt: "For The Future Organization - 10 Years of Impact",
};
