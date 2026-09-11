"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  Heart,
  ArrowRight,
  Quote,
  ChevronLeft,
  ChevronRight,
  Target,
  Eye,
  Compass,
  Users,
  Globe,
  Brain,
  Lightbulb,
  Leaf,
  HandHeart,
  MapPin,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ValueCard from "@/components/ui/ValueCard";
import WelcomeSplash from "@/components/ui/WelcomeSplash";
import { siteConfig, coreValues, focusAreas, partnerLogos } from "@/data/site";
import { initiatives } from "@/data/initiatives";

/* ===== Hero Slides ===== */
const heroSlides = [
  {
    title: "Be the Reason a Child Smiles Today",
    subtitle: "YOUR SUPPORT CAN CHANGE LIVES",
    cta: "Learn More",
    image: img("/images/hero/hero-1.png"),
    gradient: "from-primary/80 via-primary/50 to-primary/30",
  },
  {
    title: "Creating Lasting Change for Underprivileged Children",
    subtitle: "GIVING CHILDREN HOPE, CARE AND OPPORTUNITY",
    cta: "Our Initiatives",
    image: img("/images/hero/hero-2.png"),
    gradient: "from-primary/70 via-primary/40 to-transparent",
  },
  {
    title: "A Better Tomorrow for Every Child",
    subtitle: "BE A PART OF THEIR STORY",
    cta: "Get Involved",
    image: img("/images/hero/hero-3.png"),
    gradient: "from-primary/80 via-primary/50 to-primary/20",
  },
];

const partners = partnerLogos;

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ===== WELCOME SPLASH ===== */}
      <WelcomeSplash />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-primary/85 via-primary/60 to-primary/30" />
          <div className="absolute top-1/4 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl z-20" />
          <div className="absolute bottom-1/4 -left-32 h-96 w-96 rounded-full bg-success/10 blur-3xl z-20" />
        </div>

        {/* Content */}
        <div className="relative z-30 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-6">
                  {heroSlides[currentSlide].subtitle}
                </span>
                <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl lg:text-7xl">
                  {heroSlides[currentSlide].title}
                </h1>
              </motion.div>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed"
            >
              {siteConfig.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/donate"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-4 text-base font-semibold text-primary-contrast shadow-2xl shadow-accent/20 transition-all hover:shadow-accent/30 hover:scale-[1.02]"
              >
                <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
                Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-text-on-primary/20 px-8 py-4 text-base font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10 hover:border-text-on-primary/30"
              >
                Become a Volunteer
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-10 left-6 lg:left-8 flex gap-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSlide
                    ? "w-12 bg-accent"
                    : "w-6 bg-text-on-primary/30 hover:bg-text-on-primary/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 right-6 lg:right-8 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-on-primary/40">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-8 w-5 rounded-full border-2 border-text-on-primary/20 flex items-start justify-center p-1"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <SectionWrapper background="white">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <AnimatedCounter
            end={siteConfig.stats.beneficiaries}
            suffix="+"
            label="Lives Impacted"
          />
          <AnimatedCounter
            end={siteConfig.stats.volunteers}
            suffix="+"
            label="Amazing Volunteers"
          />
          <AnimatedCounter
            end={siteConfig.stats.initiatives}
            suffix="+"
            label="Active Initiatives"
          />
          <AnimatedCounter
            end={siteConfig.stats.countries}
            label="Countries"
          />
        </div>
      </SectionWrapper>

      {/* ===== WHO WE ARE ===== */}
      <SectionWrapper background="gradient">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src={img("/images/about/ftf-home-about.png")}
                alt="For The Future Organization - Creating brighter futures"
                width={600}
                height={700}
                className="w-full h-auto object-contain"
                unoptimized
              />
            </div>
            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-6 -right-6 rounded-2xl bg-surface p-6 shadow-2xl shadow-primary/10 border border-border"
            >
              <div className="text-3xl font-bold text-accent-hover">10+</div>
              <div className="text-sm text-text-secondary">Years of Impact</div>
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-hover">
              Who We Are
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl leading-tight">
              Creating Brighter Futures for Every Child in Ghana, Nigeria and Beyond
            </h2>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              For The Future Organization (FTF) is a youth-led organization transforming the lives of underprivileged children through education, mentorship, menstrual health, climate action, and sustainable empowerment. What started as a small act of kindness in Ghana has grown into a global movement.
            </p>
            <p className="mt-4 text-text-tertiary leading-relaxed">
              Through community-driven initiatives and impactful solutions, we provide the support needed to help children thrive and build a better future. Your donations and support help us empower communities and foster sustainable development.
            </p>

            {/* Vision / Mission mini cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-bg-tertiary/50 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-subtle">
                    <Eye className="h-5 w-5 text-accent-hover" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Our Vision</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  A world where every child has the opportunity to grow in dignity and build a meaningful future.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-tertiary/50 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-subtle">
                    <Target className="h-5 w-5 text-success-text" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Our Mission</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  To empower underprivileged children through education, healthcare, mentorship, and sustainable opportunities.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-6 py-3 text-sm font-semibold text-primary-contrast shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]"
              >
                <Heart className="h-4 w-4" />
                Donate Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border-2 border-border px-6 py-3 text-sm font-semibold text-text-secondary transition-all hover:border-primary hover:bg-bg-tertiary"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== CORE VALUES ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="What Drives Us"
          title="Driven by Young People. Powered by Purpose."
          description="Our core values guide everything we do, from community outreach to global advocacy."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, i) => (
            <ValueCard
              key={value.title}
              title={value.title}
              description={value.description}
              iconName={value.icon}
              color={value.color}
              index={i}
            />
          ))}
        </div>
      </SectionWrapper>

      {/* ===== FOCUS AREAS ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="How We Develop"
          title="Building Well-Rounded Future Leaders"
          description="We nurture essential skills and awareness to help children become confident, capable leaders."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {focusAreas.map((area, i) => {
            const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
              Brain, Lightbulb, Users, Leaf,
            };
            const Icon = iconMap[area.icon] || Brain;
            return (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl bg-surface p-8 border border-border transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-secondary transition-colors group-hover:bg-accent-subtle group-hover:text-accent-hover">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{area.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{area.description}</p>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ===== FEATURED INITIATIVES ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Our Work"
          title="Featured Initiatives"
          description="Discover the impactful initiatives driving change at For The Future. Each campaign creates lasting impact in the lives of underprivileged children."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.slice(0, 6).map((initiative, i) => (
            <motion.div
              key={initiative.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/initiatives#${initiative.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-bg-tertiary to-bg-tertiary">
                  <Image
                    src={initiative.image}
                    alt={initiative.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
                      {initiative.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-hover transition-colors">
                    {initiative.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {initiative.shortDescription}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-text-muted">{initiative.country}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-hover group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/initiatives"
            className="inline-flex items-center gap-2 rounded-full border-2 border-border px-8 py-3.5 text-sm font-semibold text-text-secondary transition-all hover:border-primary hover:bg-bg-tertiary"
          >
            View All Initiatives
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SectionWrapper>

      {/* ===== FTF VILLAGE CTA ===== */}
      <SectionWrapper background="navy">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Our Biggest Project
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl lg:text-5xl leading-tight">
              For The Future Village
            </h2>
            <p className="mt-6 text-lg text-text-on-primary/70 leading-relaxed">
              Our 2025/26 objective is to raise GH₵ 500,000 for phase one of
              construction of For The Future Village - a home for orphans,
              homeless kids, and vulnerable children in Ghana.
            </p>
            <p className="mt-4 text-text-on-primary/50 leading-relaxed">
              The village will provide safe housing, education, healthcare, and
              mentorship - creating a nurturing environment where every child can
              thrive.
            </p>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-on-primary/70">
                  {siteConfig.donation.villageCurrency}
                  {siteConfig.donation.villageRaised.toLocaleString()} raised
                </span>
                <span className="text-sm font-medium text-white/70">
                  Goal: {siteConfig.donation.villageCurrency}
                  {siteConfig.donation.villageGoal.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${
                      (siteConfig.donation.villageRaised /
                        siteConfig.donation.villageGoal) *
                      100
                    }%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
                />
              </div>
              <p className="mt-2 text-xs text-text-on-primary/40">
                {Math.round(
                  (siteConfig.donation.villageRaised /
                    siteConfig.donation.villageGoal) *
                    100
                )}
                % of goal reached
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-4 text-base font-semibold text-primary-contrast shadow-2xl shadow-accent/20 transition-all hover:scale-[1.02]"
              >
                <Heart className="h-5 w-5" />
                Support This Project
              </Link>
            </div>
          </motion.div>

          {/* Right side - visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <Image
                src={img("/images/about/ftf-village-1.jpg")}
                alt="FTF Village Project - Future home for vulnerable children"
                fill
                className="object-cover opacity-60"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                <h3 className="text-2xl font-bold text-text-on-primary mb-1">FTF Village</h3>
                <p className="text-text-on-primary/60 text-sm mb-4">Ghana, West Africa</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10">
                    <div className="text-xl font-bold text-accent">200+</div>
                    <div className="text-[10px] text-text-on-primary/50">Children Housed</div>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10">
                    <div className="text-xl font-bold text-success-text">Safe</div>
                    <div className="text-[10px] text-text-on-primary/50">Living Space</div>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10">
                    <div className="text-xl font-bold text-error-text">School</div>
                    <div className="text-[10px] text-text-on-primary/50">On-site</div>
                  </div>
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10">
                    <div className="text-xl font-bold text-primary">Health</div>
                    <div className="text-[10px] text-text-on-primary/50">Care Center</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ===== FOUNDER QUOTE ===== */}
      <SectionWrapper background="gradient">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Quote className="mx-auto h-12 w-12 text-accent mb-6" />
          <blockquote className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-primary md:text-3xl lg:text-4xl leading-snug">
            &ldquo;{siteConfig.founder.quote}&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-accent">
              <Image
                src={siteConfig.founder.image}
                alt={siteConfig.founder.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-left">
              <div className="font-semibold text-text-primary">
                {siteConfig.founder.name}
              </div>
              <div className="text-sm text-text-muted">
                {siteConfig.founder.title}
              </div>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ===== GET INVOLVED ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Get Involved"
          title="Join the Movement. We Are For The Future."
          description="Every child deserves a chance to learn, grow and thrive. With your support, we can reach more children and provide them with education, healthcare, and opportunities."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Empower a Child's Future",
              description:
                "Your donation directly funds education, healthcare, and mentorship for underprivileged children.",
              cta: "Donate Now",
              href: "/donate",
              color: "gold",
            },
            {
              icon: Users,
              title: "Create Lasting Change",
              description:
                "Join our team of 3,000+ volunteers making a tangible difference in communities across three countries.",
              cta: "Volunteer",
              href: "/volunteer",
              color: "emerald",
            },
            {
              icon: Globe,
              title: "Be Part of Something Bigger",
              description:
                "Partner with us as a corporate sponsor, institutional partner, or community ally.",
              cta: "Become a Partner",
              href: "/partners",
              color: "coral",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                  item.color === "gold"
                    ? "bg-accent-subtle text-accent-hover"
                    : item.color === "emerald"
                    ? "bg-success-bg text-success-text"
                    : "bg-error-bg text-error-text"
                }`}
              >
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {item.title}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                {item.description}
              </p>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-hover transition-all hover:gap-2.5"
              >
                {item.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== PARTNERS MARQUEE ===== */}
      <SectionWrapper background="warm" className="!py-16">
        <SectionHeader
          overline="Our Partners"
          title="Trusted by Leading Organizations"
        />
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-primary to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-primary to-transparent z-10" />
          <div className="flex partners-track">
            {[...partners, ...partners].map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="mx-4 flex h-20 min-w-[180px] items-center justify-center rounded-xl border border-border bg-surface px-6"
              >
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width={120}
                  height={50}
                  className="max-h-12 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ===== NEWSLETTER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,color-mix(in_srgb,var(--ftf-accent)_10%,transparent),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary md:text-4xl">
              Stay Updated on Our Impact
            </h2>
            <p className="mt-4 text-lg text-text-on-primary/60">
              Get the latest news, stories, and updates from For The Future
              delivered to your inbox.
            </p>
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 rounded-full bg-text-on-primary/10 border border-text-on-primary/10 px-6 py-4 text-text-on-primary placeholder:text-text-on-primary/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-4 text-sm font-semibold text-primary-contrast shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] sm:rounded-l-none sm:rounded-r-full"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-text-on-primary/30">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
