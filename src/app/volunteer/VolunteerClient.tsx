"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowRight,
  Users,
  Globe,
  BookOpen,
  Laptop,
  Megaphone,
  DollarSign,
  Stethoscope,
  Palette,
  Check,
  Send,
  Quote,
  Star,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";

const roles = [
  {
    icon: BookOpen,
    title: "Teaching & Tutoring",
    description: "Help children with academics, life skills, and creative subjects.",
    location: "Ghana, Nigeria, Remote",
  },
  {
    icon: Laptop,
    title: "Tech & Digital",
    description: "Support our digital literacy programs, web development, and IT needs.",
    location: "Remote",
  },
  {
    icon: Megaphone,
    title: "Marketing & Communications",
    description: "Help tell our story through social media, content creation, and PR.",
    location: "Remote",
  },
  {
    icon: DollarSign,
    title: "Fundraising",
    description: "Organize campaigns, events, and donor outreach to fund our programs.",
    location: "All Locations",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    description: "Provide medical support, health education, and wellness programs.",
    location: "Ghana, Nigeria",
  },
  {
    icon: Palette,
    title: "Creative Arts",
    description: "Lead workshops in art, music, photography, and creative expression.",
    location: "Ghana, Nigeria",
  },
];

const benefits = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Join a network of 3,000+ changemakers across 3 countries.",
  },
  {
    icon: Star,
    title: "Skill Development",
    description: "Gain real-world experience in project management, leadership, and nonprofit work.",
  },
  {
    icon: Heart,
    title: "Real Impact",
    description: "See the direct impact of your work on children's lives and communities.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Be part of a supportive community that shares your passion for change.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Volunteer since 2022",
    location: "Accra, Ghana",
    quote: "Volunteering with FTF has been the most rewarding experience of my life. Seeing the children grow and thrive makes every hour worth it.",
  },
  {
    name: "David O.",
    role: "Tech Volunteer",
    location: "Lagos, Nigeria",
    quote: "The team is incredible. I've been able to use my tech skills to make a real difference in children's education. FTF truly lives its mission.",
  },
  {
    name: "Emily K.",
    role: "Remote Volunteer",
    location: "New York, USA",
    quote: "Even from across the ocean, I feel connected to the mission. The FTF team makes remote volunteering seamless and impactful.",
  },
];

export default function VolunteerClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    interest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.1),transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-gold-400 mb-4">
              Get Involved
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-white sm:text-5xl md:text-6xl">
              Be the Light in a Child&apos;s Journey
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
              A smile, a lesson, a helping hand - small acts that change lives.
              Join us as a volunteer and help shape futures, one child at a
              time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== WHY VOLUNTEER ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Why Join Us"
          title="More Than Volunteering - It's a Movement"
          description="When you volunteer with FTF, you become part of a global family dedicated to creating lasting change."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center p-6"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== ROLES ===== */}
      <SectionWrapper background="warm">
        <SectionHeader
          overline="Opportunities"
          title="Volunteer Roles Available"
          description="Find the role that matches your skills and passion. Every contribution matters."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group rounded-2xl border border-navy-100 bg-white p-8 transition-all hover:shadow-xl hover:shadow-navy-900/5 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition-colors group-hover:bg-gold-50 group-hover:text-gold-600">
                <role.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed mb-4">
                {role.description}
              </p>
              <span className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-500">
                {role.location}
              </span>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== TESTIMONIALS ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Volunteer Stories"
          title="Hear From Our Volunteers"
        />
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl border border-navy-100 bg-white p-8"
            >
              <Quote className="h-8 w-8 text-gold-300 mb-4" />
              <p className="text-navy-600 leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-navy-100 pt-4">
                <div className="font-semibold text-navy-900">{t.name}</div>
                <div className="text-sm text-navy-500">
                  {t.role} - {t.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== APPLICATION FORM ===== */}
      <SectionWrapper background="warm">
        <div className="mx-auto max-w-2xl">
          <SectionHeader
            overline="Apply Now"
            title="Volunteer Application"
            description="Fill out the form below and our team will get back to you within 48 hours."
          />

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-white border border-emerald-200 p-12 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-navy-600">
                Thank you for your interest in volunteering with FTF. Our team
                will review your application and get back to you within 48
                hours.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white border border-navy-100 p-8 md:p-10 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                    placeholder="+233 XXX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Country *
                  </label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                  >
                    <option value="">Select country</option>
                    <option value="ghana">Ghana</option>
                    <option value="nigeria">Nigeria</option>
                    <option value="us">United States</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Area of Interest *
                </label>
                <select
                  required
                  value={formData.interest}
                  onChange={(e) =>
                    setFormData({ ...formData, interest: e.target.value })
                  }
                  className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                >
                  <option value="">Select area</option>
                  <option value="teaching">Teaching & Tutoring</option>
                  <option value="tech">Tech & Digital</option>
                  <option value="marketing">Marketing & Communications</option>
                  <option value="fundraising">Fundraising</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="creative">Creative Arts</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Tell Us About Yourself
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-navy-200 px-4 py-3 text-navy-900 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 resize-none"
                  placeholder="Share your skills, experience, and why you'd like to volunteer with FTF..."
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-4 text-base font-semibold text-navy-900 shadow-lg shadow-gold-400/20 transition-all hover:scale-[1.01]"
              >
                <Send className="h-5 w-5" />
                Submit Application
              </button>
            </motion.form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
