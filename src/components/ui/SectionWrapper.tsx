"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "warm" | "navy" | "gradient";
}

const bgStyles = {
  white: "bg-surface",
  warm: "bg-bg-primary",
  navy: "bg-primary text-text-on-primary",
  gradient: "bg-gradient-to-b from-bg-primary to-surface",
};

export default function SectionWrapper({
  children,
  className = "",
  id,
  background = "warm",
}: SectionWrapperProps) {
  return (
    <section id={id} className={`py-20 md:py-24 lg:py-28 ${bgStyles[background]} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({
  overline,
  title,
  description,
  align = "center",
  light = false,
}: {
  overline?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : "text-left"} mb-12 md:mb-16`}
    >
      {overline && (
        <span
          className={`inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-3 ${
            light ? "text-accent-bright" : "text-accent-hover"
          }`}
        >
          {overline}
        </span>
      )}
      <h2
        className={`font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
          light ? "text-text-on-primary" : "text-text-primary"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            light ? "text-text-on-primary/70" : "text-text-secondary"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
