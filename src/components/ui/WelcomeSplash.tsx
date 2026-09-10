"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

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
    const velocity = Math.random() * 180 + 60;
    return {
      id: i,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity - Math.random() * 40,
      rotate: Math.random() * 1080 - 540,
      scale: Math.random() * 0.8 + 0.4,
      delay: Math.random() * 0.4,
      duration: Math.random() * 1.5 + 2.5,
      width: Math.random() * 10 + 5,
      height: Math.random() * 14 + 5,
    };
  });
}

/* ===== Second wave - delayed confetti ===== */
function generateWave2(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.random() * 200 + 80) * (Math.PI / 180);
    const velocity = Math.random() * 150 + 40;
    return {
      id: i + 1000,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      x: Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1),
      y: -Math.random() * 100 - 20,
      rotate: Math.random() * 720 - 360,
      scale: Math.random() * 0.6 + 0.3,
      delay: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 1.5 + 2.5,
      width: Math.random() * 8 + 4,
      height: Math.random() * 12 + 4,
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
    const spread = Math.random() * 200 + 80;
    const dirX = origin.ox < 50 ? 1 : -1;
    const dirY = origin.oy < 50 ? 1 : -1;
    return {
      id: i + 2000,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      x: dirX * (Math.random() * spread + 30),
      y: dirY * (Math.random() * spread + 30) + 60,
      rotate: Math.random() * 900 - 450,
      scale: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 0.6 + 0.2,
      duration: Math.random() * 2 + 2,
      width: Math.random() * 8 + 4,
      height: Math.random() * 12 + 4,
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
        y: piece.y + 120, // gravity pull down
        rotate: piece.rotate,
        scale: piece.scale,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: piece.duration,
        delay: piece.delay,
        ease: [0.25, 0.46, 0.45, 0.94],
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

  const wave1 = useMemo(() => generateConfetti(120), []);
  const wave2 = useMemo(() => generateWave2(80), []);
  const wave3 = useMemo(() => generateEdgeBurst(60), []);

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
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#060d1a]"
        onClick={dismiss}
      >
        {/* Solid dark background - no image */}
        <div className="absolute inset-0 bg-[#060d1a]" />

        {/* Subtle gradient overlays for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0c1a30_0%,#060d1a_70%)]" />

        {/* Colorful ambient glow - multi-color */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.3, duration: 1.5 }}
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-gold-400 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-emerald-500 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ delay: 0.7, duration: 1.5 }}
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-coral-500 blur-[80px]"
        />

        {/* ===== CONFETTI BURST - Wave 1 (center explosion) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {wave1.map((piece) => (
            <ConfettiRenderer key={piece.id} piece={piece} originX="50%" originY="45%" />
          ))}
        </div>

        {/* ===== CONFETTI BURST - Wave 2 (delayed upward) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {wave2.map((piece) => (
            <ConfettiRenderer key={piece.id} piece={piece} originX="50%" originY="50%" />
          ))}
        </div>

        {/* ===== CONFETTI BURST - Wave 3 (edge/corner bursts) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {wave3.map((piece) => {
            const idx = piece.id - 2000;
            const origins = [
              { x: "10%", y: "10%" }, { x: "90%", y: "10%" },
              { x: "10%", y: "90%" }, { x: "90%", y: "90%" },
              { x: "50%", y: "5%" },  { x: "50%", y: "95%" },
              { x: "5%", y: "50%" },  { x: "95%", y: "50%" },
            ];
            const o = origins[idx % origins.length];
            return <ConfettiRenderer key={piece.id} piece={piece} originX={o.x} originY={o.y} />;
          })}
        </div>

        {/* ===== Clear zone behind content - radial fade for readability ===== */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_500px_450px_at_50%_48%,rgba(6,13,26,0.9)_0%,rgba(6,13,26,0.5)_50%,transparent_70%)]" />

        {/* ===== MAIN CONTENT ===== */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-xl">

          {/* Top accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-12 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent mb-8"
          />

          {/* Large "10" */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-1"
          >
            <span className="font-[family-name:var(--font-display)] text-[90px] sm:text-[120px] md:text-[140px] font-bold leading-none text-white/[0.06]">
              10
            </span>
            <span className="absolute inset-0 font-[family-name:var(--font-display)] text-[90px] sm:text-[120px] md:text-[140px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/90 via-gold-300/60 to-gold-400/30">
              10
            </span>
          </motion.div>

          {/* "Years of Impact" */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="-mt-2 sm:-mt-3 mb-3 font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            Years of Impact
          </motion.h1>

          {/* "Countless Lives Changed." */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="text-base sm:text-lg font-semibold text-gold-400 mb-5"
          >
            Countless Lives Changed.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent mb-5"
          />

          {/* Body text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="text-sm sm:text-[15px] font-light text-white/60 leading-relaxed max-w-md"
          >
            For a decade, we&rsquo;ve been empowering underprivileged children and communities through education, mentorship, healthcare, digital literacy, climate action and opportunities for growth.
          </motion.p>

          {/* Stat highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="mt-8 flex flex-col items-center gap-1"
          >
            <span className="text-3xl sm:text-4xl font-bold text-white tabular-nums">9,000+</span>
            <span className="text-sm text-white/60 font-medium">Lives reached</span>
            <span className="text-xs text-white/40 mt-1 italic">Thousands more to go.</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7 }}
            className="mt-8"
          >
            <Link
              href="/volunteer"
              onClick={(e) => e.stopPropagation()}
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-2xl shadow-gold-400/20 transition-all hover:shadow-gold-400/30 hover:scale-[1.02]"
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
            className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8"
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
          className="absolute top-6 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-white/30 transition-all hover:bg-white/[0.06] hover:text-white/60"
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
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-400/50 via-emerald-400/30 to-coral-400/40"
        />

        {/* Click hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
          transition={{ opacity: { delay: 2.5, duration: 4, repeat: Infinity } }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/40 uppercase tracking-[0.3em] font-medium"
        >
          Click anywhere to enter
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
