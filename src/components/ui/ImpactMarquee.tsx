"use client";

import { useRef, useEffect, useState } from "react";

const messages = [
  "10 Years of Impact",
  "9,000+ Lives Reached",
  "Education for Every Child",
  "Healthcare & Nutrition",
  "Digital Literacy Through Click4Change",
  "Building FTF Village",
  "Ghana - Nigeria - United States",
  "100% of Store Proceeds Fund Programs",
  "Mentorship That Transforms",
  "Climate Action for Communities",
  "Empowering Girls Through Empower Her Period",
  "From Jamestown to a Global Movement",
];

export default function ImpactMarquee() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      // Always show at top, hide when scrolled past navbar
      if (current < 80) {
        setIsVisible(true);
      } else if (current > lastScroll && current > 200) {
        setIsVisible(false);
      } else if (current < lastScroll) {
        setIsVisible(true);
      }
      lastScroll = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Duplicate messages for seamless loop
  const doubled = [...messages, ...messages];

  return (
    <div
      ref={containerRef}
      className={`fixed top-[80px] left-0 right-0 z-40 transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-primary/95 backdrop-blur-md border-b border-accent/10 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap py-2">
          {doubled.map((msg, i) => (
            <span
              key={i}
              className="inline-flex items-center mx-6 text-xs font-medium tracking-wide"
            >
              {/* Gold diamond separator */}
              <span className="inline-block w-1.5 h-1.5 bg-accent rotate-45 mr-3 shrink-0 opacity-60" />
              <span className={i % 3 === 0 ? "text-text-on-primary font-semibold" : "text-text-on-primary/70"}>
                {msg}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
