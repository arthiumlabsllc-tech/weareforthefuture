"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { img } from "@/lib/imageUrl";

/* ===== Confetti piece config ===== */
const CONFETTI_COLORS = [
  "#D4A843", // gold
  "#10B981", // emerald
  "#F97316", // coral
  "#3B82F6", // blue
  "#EC4899", // pink
  "#8B5CF6", // purple
  "#FFFFFF", // white
  "#FBBF24", // amber
  "#34D399", // mint
  "#F472B6", // rose
];

const CONFETTI_SHAPES = ["rect", "circle", "strip", "square"] as const;
type Shape = (typeof CONFETTI_SHAPES)[number];

interface ConfettiPiece {
  id: number;
  color: string;
  shape: Shape;
  x: number;       // horizontal spread %
  y: number;       // vertical fall %
  rotate: number;  // final rotation deg
  scale: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
}

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.random() * 360 * Math.PI) / 180;
    const velocity = Math.random() * 260 + 80;
    return {
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity - Math.random() * 60,
      rotate: Math.random() * 1440 - 720,
      scale: Math.random() * 0.8 + 0.4,
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 4,
      width: Math.random() * 12 + 6,
      height: Math.random() * 16 + 6,
    };
  });
}

/* ===== Second wave - delayed confetti ===== */
function generateWave2(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.random() * 360 * Math.PI) / 180;
    const velocity = Math.random() * 240 + 80;
    return {
      id: i + 1000,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity,
      rotate: Math.random() * 1080 - 540,
      scale: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 0.6 + 0.3,
      duration: Math.random() * 2 + 4,
      width: Math.random() * 10 + 5,
      height: Math.random() * 14 + 5,
    };
  });
}

/* ===== Third wave - edge bursts from corners & sides ===== */
function generateEdgeBurst(count: number): ConfettiPiece[] {
  const origins = [
    { ox: 10, oy: 10 }, { ox: 90, oy: 10 },
    { ox: 10, oy: 90 }, { ox: 90, oy: 90 },
    { ox: 50, oy: 5 },  { ox: 50, oy: 95 },
    { ox: 5, oy: 50 },  { ox: 95, oy: 50 },
  ];
  return Array.from({ length: count }, (_, i) => {
    const origin = origins[i % origins.length];
    const spread = Math.random() * 300 + 100;
    const dirX = origin.ox < 50 ? 1 : -1;
    const dirY = origin.oy < 50 ? 1 : -1;
    return {
      id: i + 2000,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      x: dirX * (Math.random() * spread + 40),
      y: dirY * (Math.random() * spread + 40) + 80,
      rotate: Math.random() * 1200 - 600,
      scale: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 2.5 + 3.5,
      width: Math.random() * 10 + 5,
      height: Math.random() * 14 + 5,
    };
  });
}

function ConfettiRenderer({ piece, originX, originY }: { piece: ConfettiPiece; originX: string; originY: string }) {
  const shapeStyle: React.CSSProperties = {
    position: "absolute",
    left: originX,
    top: originY,
    width: piece.width,
    height: piece.height,
    backgroundColor: piece.color,
    borderRadius:
      piece.shape === "circle" ? "50%" :
      piece.shape === "strip" ? "2px" : "1px",
    transform: "translate(-50%, -50%)",
  };

  return (
    <motion.div
      style={shapeStyle}
      initial={{
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0,
        opacity: 1,
      }}
      animate={{
        x: piece.x,
        y: piece.y + 80, // gentle gravity
        rotate: piece.rotate,
        scale: piece.scale,
        opacity: [1, 1, 1, 0], // stay visible longer, fade at end
      }}
      transition={{
        duration: piece.duration,
        delay: piece.delay,
        ease: [0.15, 0.45, 0.35, 0.95],
      }}
    />
  );
}

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Only show on fresh visit - not when navigating back to home
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("ftf-splash-shown");
    if (!alreadyShown) {
      setVisible(true);
      sessionStorage.setItem("ftf-splash-shown", "1");
    }
  }, []);

  const wave1 = useMemo(() => generateConfetti(200), []);
  const wave2 = useMemo(() => generateWave2(140), []);
  const wave3 = useMemo(() => generateEdgeBurst(100), []);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => setVisible(false), 900);
  }, [exiting]);

  // Auto-dismiss after 5 minutes
  useEffect(() => {
    const timer = setTimeout(dismiss, 300000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-surface"
        onClick={dismiss}
      >
        {/* White background */}
        <div className="absolute inset-0 bg-surface" />

        {/* Subtle gradient overlays for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-bg-tertiary)_90%,transparent)_0%,var(--color-bg-primary)_70%)]" />

        {/* Decorative foreground elements - faded */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.10]">
          {/* Large decorative circles */}
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full border-[40px] border-accent" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full border-[50px] border-accent-hover" />
          <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full border-[30px] border-success" />
          <div className="absolute bottom-1/4 left-10 w-48 h-48 rounded-full border-[25px] border-primary" />
          
          {/* Decorative dots pattern */}
          <div className="absolute top-10 right-1/4 w-3 h-3 rounded-full bg-accent" />
          <div className="absolute top-20 right-1/3 w-2 h-2 rounded-full bg-accent-hover" />
          <div className="absolute bottom-20 left-1/4 w-4 h-4 rounded-full bg-success" />
          <div className="absolute top-1/3 left-20 w-2 h-2 rounded-full bg-primary" />
          <div className="absolute bottom-1/3 right-20 w-3 h-3 rounded-full bg-accent" />
          
          {/* Subtle radial lines from center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(212,168,67,0.5)_10deg,transparent_20deg,transparent_40deg,rgba(16,185,129,0.3)_50deg,transparent_60deg,transparent_80deg,rgba(212,168,67,0.4)_90deg,transparent_100deg,transparent_120deg,rgba(249,115,22,0.3)_130deg,transparent_140deg,transparent_160deg,rgba(212,168,67,0.5)_170deg,transparent_180deg,transparent_200deg,rgba(16,185,129,0.3)_210deg,transparent_220deg,transparent_240deg,rgba(212,168,67,0.4)_250deg,transparent_260deg,transparent_280deg,rgba(249,115,22,0.3)_290deg,transparent_300deg,transparent_320deg,rgba(212,168,67,0.5)_330deg,transparent_340deg,transparent_360deg)]" />
          </div>
        </div>

        {/* Colorful ambient glow - multi-color */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ delay: 0.3, duration: 1.5 }}
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-accent blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-success blur-[100px]"
        />

        {/* ===== CONFETTI BURST - Wave 1 (center explosion) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {wave1.map((piece) => (
            <ConfettiRenderer key={piece.id} piece={piece} originX="50%" originY="40%" />
          ))}
        </div>

        {/* ===== CONFETTI BURST - Wave 2 (top spread) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {wave2.map((piece) => (
            <ConfettiRenderer key={piece.id} piece={piece} originX="50%" originY="30%" />
          ))}
        </div>

        {/* ===== CONFETTI BURST - Wave 3 (edge/corner bursts) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {wave3.map((piece) => {
            const idx = piece.id - 2000;
            const origins = [
              { x: "5%", y: "5%" },   { x: "95%", y: "5%" },
              { x: "5%", y: "95%" },  { x: "95%", y: "95%" },
              { x: "50%", y: "2%" },  { x: "50%", y: "98%" },
              { x: "2%", y: "50%" },  { x: "98%", y: "50%" },
              { x: "25%", y: "5%" },  { x: "75%", y: "5%" },
              { x: "25%", y: "95%" }, { x: "75%", y: "95%" },
            ];
            const o = origins[idx % origins.length];
            return <ConfettiRenderer key={piece.id} piece={piece} originX={o.x} originY={o.y} />;
          })}
        </div>

        {/* ===== Clear zone behind content - radial fade for readability ===== */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_500px_450px_at_50%_48%,color-mix(in_srgb,var(--ftf-surface)_90%,transparent)_0%,color-mix(in_srgb,var(--ftf-surface)_50%,transparent)_50%,transparent_70%)]" />

        {/* ===== MAIN CONTENT ===== */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-xl">

          {/* Top accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-12 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent mb-8"
          />

          {/* FTF Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-2"
          >
            <Image
              src={img("/images/misc/ftf-logo-white.png")}
              alt="For The Future Organization"
              width={280}
              height={112}
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
              unoptimized
            />
          </motion.div>

          {/* Large "10" with gold gradient */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative -mb-2"
          >
            <span className="font-[family-name:var(--font-display)] text-[80px] sm:text-[100px] md:text-[130px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-accent via-accent-hover to-accent">
              10
            </span>
          </motion.div>

          {/* "Years of Impact" */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="mb-3 font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-3xl font-bold text-text-primary tracking-tight"
          >
            Years of Impact
          </motion.h1>

          {/* "Countless Lives Changed." */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="text-base sm:text-lg font-semibold text-accent-hover mb-5"
          >
            Countless Lives Changed.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-5"
          />

          {/* Body text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="text-sm sm:text-[15px] font-light text-text-secondary leading-relaxed max-w-md"
          >
            For a decade, we&rsquo;ve been empowering underprivileged children and communities through education, mentorship, healthcare, digital literacy, climate action and opportunities for growth.
          </motion.p>

          {/* Stat highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.7 }}
            className="mt-8 flex flex-col items-center gap-1"
          >
            <span className="text-3xl sm:text-4xl font-bold text-text-primary tabular-nums">9,000+</span>
            <span className="text-sm text-text-secondary font-medium">Lives reached</span>
            <span className="text-xs text-text-muted mt-1 italic">Thousands more to go.</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7 }}
            className="mt-8"
          >
            <Link
              href="/volunteer"
              onClick={(e) => e.stopPropagation()}
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-accent-hover px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-2xl shadow-accent/20 transition-all hover:shadow-accent/30 hover:scale-[1.02]"
            >
              Join us as we build the next chapter of impact
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Bottom accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.9, duration: 0.8 }}
            className="w-8 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent mt-8"
          />
        </div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="absolute top-6 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-tertiary text-text-muted transition-all hover:bg-bg-secondary hover:text-text-secondary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </motion.button>

        {/* Progress bar - 5 min auto-dismiss */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 300, ease: "linear" }}
          style={{ transformOrigin: "left" }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/50 via-success/30 to-coral-400/40"
        />

        {/* Click hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
          transition={{ opacity: { delay: 2.5, duration: 4, repeat: Infinity } }}
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-text-muted uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium whitespace-nowrap"
        >
          Click anywhere to enter
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
