import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import TeamGovernanceClient, {
  type BoardPerson,
  type TeamPerson,
} from "./TeamGovernanceClient";

export const metadata: Metadata = {
  title: "Team & Governance",
  description:
    "Meet the leadership, independent executive board, advisory board and volunteer-powered delivery team behind For The Future Organization.",
  // Self-referential canonical + og:url (Interpretation 2): /team now 308s here,
  // so this page must declare itself canonical to avoid a duplicate-content split.
  alternates: { canonical: "https://weareforthefuture.org/about/team" },
  openGraph: {
    title: "Team & Governance | For The Future Organization",
    description:
      "Meet the leadership, independent executive board, advisory board and volunteer-powered delivery team behind For The Future Organization.",
    url: "https://weareforthefuture.org/about/team",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

// ISR (revalidate = 600) instead of force-dynamic: governance/team content is
// CMS-managed but does not need per-request freshness. Static generation with a
// 10-minute revalidation window keeps the route ○/● in the build output, not λ.
export const revalidate = 600;

export default async function AboutTeamPage() {
  // Guarded (Phase 3a.5 pattern) so this ISR page renders its empty states when
  // the DB is unreachable at revalidation time instead of throwing a 500.
  const [executiveBoard, advisory, team] = await Promise.all([
    prisma.executiveBoardMember
      .findMany({ where: { published: true, deletedAt: null }, orderBy: { order: "asc" } })
      .catch((err) => {
        console.error("[/about/team] executive board query failed:", err);
        return [];
      }),
    prisma.advisoryBoardMember
      .findMany({ where: { published: true, deletedAt: null }, orderBy: { order: "asc" } })
      .catch((err) => {
        console.error("[/about/team] advisory board query failed:", err);
        return [];
      }),
    prisma.teamMember
      .findMany({ where: { published: true, deletedAt: null }, orderBy: { order: "asc" } })
      .catch((err) => {
        console.error("[/about/team] team query failed:", err);
        return [];
      }),
  ]);

  return (
    <TeamGovernanceClient
      executiveBoard={executiveBoard as BoardPerson[]}
      advisory={advisory as BoardPerson[]}
      team={team as TeamPerson[]}
    />
  );
}
