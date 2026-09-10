"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import * as Icons from "lucide-react";

interface ValueCardProps {
  title: string;
  description: string;
  iconName: string;
  color?: string;
  index?: number;
}

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  gold: {
    bg: "bg-gold-50",
    icon: "text-gold-600",
    border: "border-gold-200",
  },
  coral: {
    bg: "bg-coral-50",
    icon: "text-coral-500",
    border: "border-coral-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    border: "border-emerald-200",
  },
  navy: {
    bg: "bg-navy-50",
    icon: "text-navy-600",
    border: "border-navy-200",
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
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl border ${colors.border} ${colors.bg} p-8 transition-shadow hover:shadow-xl hover:shadow-navy-900/5`}
    >
      <div
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.bg} ${colors.icon} transition-transform group-hover:scale-110`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-navy-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
