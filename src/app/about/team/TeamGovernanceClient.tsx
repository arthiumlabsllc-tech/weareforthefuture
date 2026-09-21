"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Landmark, Sparkles, Users } from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";

/* Minimal structural shapes so the DB payloads (which carry extra fields) stay
   assignable; all optional/nullable fields are declared permissively. */
export interface BoardPerson {
  name: string;
  role: string;
  image?: string | null;
  country?: string | null;
}
export interface TeamPerson {
  name: string;
  role: string;
  country?: string | null;
  department?: string | null;
  bio?: string | null;
  image?: string | null;
}

interface Props {
  executiveBoard: BoardPerson[];
  advisory: BoardPerson[];
  team: TeamPerson[];
}

const anchors = [
  { id: "leadership", label: "Leadership" },
  { id: "governance", label: "Executive Board" },
  { id: "advisory", label: "Advisory Board" },
  { id: "team", label: "Team" },
  { id: "fellows", label: "Associates & Fellows" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function Avatar({ person }: { person: { name: string; image?: string | null } }) {
  return (
    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-border bg-bg-tertiary">
      {person.image ? (
        <Image
          src={person.image}
          alt={person.name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-2xl font-bold text-text-muted">
          {initialsOf(person.name)}
        </span>
      )}
    </div>
  );
}

function PersonGrid({
  people,
  empty,
  showDepartment,
}: {
  people: (BoardPerson | TeamPerson)[];
  empty: string;
  showDepartment?: boolean;
}) {
  if (people.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-strong bg-bg-secondary px-6 py-10 text-center text-text-secondary">
        {empty}
      </p>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person, i) => {
        const dept = showDepartment ? (person as TeamPerson).department : null;
        const bio = showDepartment ? (person as TeamPerson).bio : null;
        return (
          <motion.div
            key={`${person.name}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="rounded-2xl border border-border bg-surface p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
          >
            <Avatar person={person} />
            <h3 className="mt-4 font-semibold text-text-primary">{person.name}</h3>
            <p className="text-sm font-medium text-accent-text">{person.role}</p>
            {person.country && (
              <p className="mt-1 text-xs text-text-muted">{person.country}</p>
            )}
            {dept && (
              <span className="mt-3 inline-block rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary">
                {dept}
              </span>
            )}
            {bio && (
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{bio}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function TeamGovernanceClient({ executiveBoard, advisory, team }: Props) {
  const vp = executiveBoard.find((m) => /vice/i.test(m.role));

  return (
    <>
      {/* ===== HERO ===== */}
      <SectionWrapper background="navy" className="!py-20 md:!py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-bright">
            <Users className="h-4 w-4" aria-hidden="true" /> Team &amp; Governance
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl">
            The people behind the mission
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-on-primary/70">
            For The Future is governed by an independent board and delivered by a
            youth-led team and hundreds of volunteers. Here is how the
            responsibility is shared.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* ===== STICKY ANCHOR NAV ===== */}
      <div className="sticky top-16 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 lg:px-8">
          {anchors.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent-text"
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>

      {/* ===== LEADERSHIP ===== */}
      <SectionWrapper background="white" id="leadership" className="scroll-mt-28">
        <SectionHeader
          align="left"
          overline="Leadership"
          title="Founder & President"
          description="FTF was founded and is led by young people who started this work as students."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-border bg-surface p-6 text-center"
          >
            <Avatar person={{ name: siteConfig.founder.name, image: siteConfig.founder.image }} />
            <h3 className="mt-4 font-semibold text-text-primary">{siteConfig.founder.name}</h3>
            <p className="text-sm font-medium text-accent-text">{siteConfig.founder.title}</p>
          </motion.div>

          {vp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-2xl border border-border bg-surface p-6 text-center"
            >
              <Avatar person={vp} />
              <h3 className="mt-4 font-semibold text-text-primary">{vp.name}</h3>
              <p className="text-sm font-medium text-accent-text">{vp.role}</p>
              {vp.country && <p className="mt-1 text-xs text-text-muted">{vp.country}</p>}
            </motion.div>
          )}
        </div>
      </SectionWrapper>

      {/* ===== EXECUTIVE BOARD (governance) ===== */}
      <SectionWrapper background="gradient" id="governance" className="scroll-mt-28">
        <SectionHeader
          align="left"
          overline="Governance"
          title="Executive Board"
          description="An independent board providing strategic oversight, governance and accountability."
        />
        <PersonGrid
          people={executiveBoard}
          empty="Executive board profiles are being updated and will appear here shortly."
        />
      </SectionWrapper>

      {/* ===== ADVISORY BOARD ===== */}
      <SectionWrapper background="white" id="advisory" className="scroll-mt-28">
        <SectionHeader
          align="left"
          overline="Guidance"
          title="Advisory Board"
          description="Experienced advisers who counsel the organization across sectors and geographies."
        />
        <PersonGrid
          people={advisory}
          empty="Advisory board profiles are being updated and will appear here shortly."
        />
      </SectionWrapper>

      {/* ===== PROGRAMME / FUNCTIONAL TEAM ===== */}
      <SectionWrapper background="gradient" id="team" className="scroll-mt-28">
        <SectionHeader
          align="left"
          overline="Delivery"
          title="Programme & functional team"
          description="The staff and programme leads who run our work day to day."
        />
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border-strong/50 bg-bg-secondary p-5">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-text-secondary">
            This is our core delivery team - not every volunteer. FTF is
            volunteer-powered: more than 500 volunteers contribute to programmes
            across Ghana and Nigeria, and they are recognized through the
            fellowship below rather than listed as permanent staff.
          </p>
        </div>
        <PersonGrid
          people={team}
          showDepartment
          empty="Team profiles are being updated and will appear here shortly."
        />
      </SectionWrapper>

      {/* ===== ASSOCIATES & FELLOWS ===== */}
      <SectionWrapper background="white" id="fellows" className="scroll-mt-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Associates &amp; Fellows
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
              A growing network of youth changemakers
            </h2>
            <p className="mt-5 leading-relaxed text-text-secondary">
              Alongside our team, a network of associates and fellows contributes
              expertise, mentorship and hands-on service. The FTF Fellowship
              trains university students in leadership, project management and
              community service, and many fellows go on to lead programmes.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Fellows trained in leadership and project delivery",
                "Associates offering specialist and sector expertise",
                "Volunteers embedded in the communities we serve",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/get-involved"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              Join the team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-bg-secondary p-8">
            <Landmark className="h-10 w-10 text-accent-text" aria-hidden="true" />
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-text-primary">
              Governance you can trust
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              An independent executive board, an advisory board of sector
              experts, and clear safeguarding and accountability policies keep our
              youth-led model rigorous and transparent.
            </p>
            <Link
              href="/about/safeguarding"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
            >
              Read our safeguarding commitments <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="warm">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
            Want to build futures with us?
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Whether you volunteer, advise or partner, there is a place for you in
            this work.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-on-cta shadow-lg shadow-accent/20 transition-all hover:bg-cta-hover hover:scale-[1.02]"
            >
              Join the team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-7 py-3.5 text-sm font-semibold text-text-primary transition-all hover:border-accent hover:text-accent-text"
            >
              Contact us
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
