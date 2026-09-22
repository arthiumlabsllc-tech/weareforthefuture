"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import * as Icons from "lucide-react";
import { cardPadding } from "@/lib/ui/cardClasses";

interface ValueCardProps {
  title: string;
  description: string;
  iconName: string;
  color?: string;
  index?: number;
}

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  gold: {
    bg: "bg-accent-subtle",
    icon: "text-accent-text",
    border: "border-accent/20",
  },
  coral: {
    bg: "bg-error-bg",
    icon: "text-error",
    border: "border-error/20",
  },
  emerald: {
    bg: "bg-success-bg",
    icon: "text-success-text",
    border: "border-success/20",
  },
  navy: {
    bg: "bg-primary-subtle",
    icon: "text-primary",
    border: "border-primary/20",
  },
  /* Brand-semantic keys used by siteConfig.coreValues (brief colour discipline:
     green accent = hope/growth, blue primary = trust, charcoal = structure). */
  accent: {
    bg: "bg-accent-subtle",
    icon: "text-accent-text",
    border: "border-accent/20",
  },
  primary: {
    bg: "bg-primary-subtle",
    icon: "text-primary",
    border: "border-primary/20",
  },
  charcoal: {
    bg: "bg-bg-tertiary",
    icon: "text-text-secondary",
    border: "border-border-strong/40",
  },
};

export default function ValueCard({
  title,
  description,
  iconName,
  color = "gold",
  index = 0,
}: ValueCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[iconName] || Icons.Heart;
  const colors = colorMap[color] || colorMap.gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative rounded-2xl border ${colors.border} ${colors.bg} ${cardPadding.default} transition-shadow hover:shadow-md`}
    >
      <div
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.bg} ${colors.icon} transition-transform group-hover:scale-110`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </motion.div>
  );
}
