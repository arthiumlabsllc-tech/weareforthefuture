"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
  Loader2,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";

const faqs = [
  {
    question: "How can I donate to For The Future?",
    answer:
      "You can donate through our website via bank transfer, MTN Mobile Money, Visa/Mastercard through Paystack, or GoFundMe. All donations are tax-deductible as FTF is a registered 501(c)(3) organization.",
  },
  {
    question: "How do I become a volunteer?",
    answer:
      "Visit our Volunteer page and fill out the application form. Our team will review your application and get back to you within 48 hours. We welcome both in-person and remote volunteers across all our locations.",
  },
  {
    question: "Can I start an FTF chapter in my country?",
    answer:
      "Yes! We're actively expanding. If you're passionate about our mission and want to start a chapter in your country, reach out through our contact form. We'll provide guidance, resources, and support to help you launch.",
  },
  {
    question: "How is my donation used?",
    answer:
      "90% of donations go directly to our programs - education, healthcare, and community development. The remaining 10% covers essential operational costs. Visit our Impact page for detailed financial transparency.",
  },
  {
    question: "Is For The Future a registered nonprofit?",
    answer:
      "Yes. FTF is registered as a 501(c)(3) nonprofit organization in the United States, and is also registered in Ghana and Nigeria. All contributions are tax-deductible to the extent permitted by law.",
  },
  {
    question: "How can my organization partner with FTF?",
    answer:
      "We offer several partnership models including corporate sponsorship, program partnerships, and in-kind contributions. Visit our Partners page for details, or contact us directly to discuss how we can collaborate.",
  },
];

const subjectLabels: Record<string, string> = {
  general: "General Inquiry",
  volunteer: "Volunteering",
  donate: "Donations",
  partner: "Partnerships",
  media: "Media & Press",
  chapter: "Start a Chapter",
};

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Build-time deployment flag (baked via next.config `env`): true on Vercel
  // preview/branch builds and locally, false only on production builds. Lets the
  // form show a clear notice and skip a doomed request; the API route's 403 is
  // the bypass-proof backstop.
  const IS_PREVIEW = process.env.NEXT_PUBLIC_DEPLOY_ENV !== "production";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (IS_PREVIEW) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subject: subjectLabels[formData.subject] || formData.subject || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to send your message. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to send your message. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/contact-hero.jpg")}
            alt="Contact Us"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent-text mb-4">
              Get in Touch
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              We&apos;d Love to Hear From You
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Whether you have a question, want to volunteer, or explore
              partnership opportunities - your voice matters to us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT FORM + INFO ===== */}
      <SectionWrapper background="white">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-success-bg border border-success/20 p-12 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
                  <Check className="h-8 w-8 text-success-text" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  Message Sent!
                </h3>
                <p className="text-text-secondary">
                  Thank you for reaching out. Our team will get back to you
                  within 24-48 hours.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary mb-2">
                  Send Us a Message
                </h2>
                <p className="text-text-secondary mb-6">
                  Reach out - your voice, support, and ideas matter to us.
                </p>
                {IS_PREVIEW && (
                  <p
                    role="status"
                    className="rounded-xl border border-border bg-bg-tertiary px-4 py-3 text-sm text-text-secondary"
                  >
                    This is a preview build — form submissions are disabled.
                  </p>
                )}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-border-strong px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-border-strong px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full rounded-xl border border-border-strong px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="volunteer">Volunteering</option>
                    <option value="donate">Donations</option>
                    <option value="partner">Partnerships</option>
                    <option value="media">Media & Press</option>
                    <option value="chapter">Start a Chapter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full rounded-xl border border-border-strong px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || IS_PREVIEW}
                  className="inline-flex items-center gap-2 rounded-full bg-cta px-8 py-4 text-base font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {loading
                    ? "Sending..."
                    : IS_PREVIEW
                      ? "Submissions disabled on preview"
                      : "Send Message"}
                </button>
              </motion.form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-primary p-8 text-text-on-primary">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface/10">
                    <Mail className="h-5 w-5 text-accent-bright" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-on-primary/50 mb-1">Email</p>
                    <a
                      href={`mailto:${siteConfig.contact.emails[0]}`}
                      className="text-text-on-primary hover:underline transition-colors"
                    >
                      {siteConfig.contact.emails[0]}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface/10">
                    <Phone className="h-5 w-5 text-accent-bright" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-on-primary/50 mb-1">Phone</p>
                    {siteConfig.contact.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="block text-text-on-primary hover:underline transition-colors"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface/10">
                    <Globe className="h-5 w-5 text-accent-bright" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-on-primary/50 mb-1">Locations</p>
                    <p className="text-text-on-primary">Ghana</p>
                    <p className="text-text-on-primary">Nigeria</p>
                    <p className="text-text-on-primary">United States</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface/10">
                    <Clock className="h-5 w-5 text-accent-bright" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-on-primary/50 mb-1">Response Time</p>
                    <p className="text-text-on-primary">24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="mt-6 rounded-2xl border border-border bg-accent-subtle p-6">
              <h4 className="font-bold text-text-primary mb-2">
                A Call to Changemakers
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                If you believe in equal opportunity for all children and have the
                passion to create change, join us. Start an FTF chapter in your
                country.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== FAQ ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="FAQ"
          title="Frequently Asked Questions"
          description="Find quick answers to common questions about FTF."
        />
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-text-primary pr-4">
                  {faq.question}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="h-5 w-5 text-text-muted shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-muted shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-5"
                >
                  <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
