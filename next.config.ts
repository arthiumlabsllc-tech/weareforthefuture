import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bake the deployment context into the client bundle at BUILD time so client
  // components can show a clear "preview" notice. VERCEL_ENV itself must never be
  // read in a client component (it is undefined there); Vercel sets VERCEL_ENV
  // automatically for every build, and this maps it to a NEXT_PUBLIC_ literal.
  env: {
    NEXT_PUBLIC_DEPLOY_ENV: process.env.VERCEL_ENV || "development",
  },
  // Preview safety: keep Vercel preview / branch deployments out of search
  // indexes. On the production deployment (VERCEL_ENV === "production") we emit
  // NO rule at all - Next rejects a route whose headers array is empty
  // ("`headers` field cannot be empty for route"), which broke the prod build.
  async headers() {
    if (process.env.VERCEL_ENV === "production") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // PHASE 3a - the /our-work tree is live, so the temporary bridge that sent
      // /our-work -> /initiatives is removed and the direction is reversed:
      // /initiatives now permanently redirects to /our-work. No loop, because
      // nothing redirects /our-work back to /initiatives.
      { source: "/initiatives", destination: "/our-work", permanent: true },
      // Specific programme redirects BEFORE the catch-all (the catch-all maps
      // /initiatives/:slug* → /our-work/:slug* which only works for pillar slugs).
      { source: "/initiatives/future-pathways", destination: "/our-work/future-ready-skills/future-pathways", permanent: true },
      { source: "/initiatives/:slug*", destination: "/our-work/:slug*", permanent: true },

      { source: "/project-future-ready", destination: "/our-work/future-ready-skills/future-pathways", permanent: true },
      { source: "/future-pathways", destination: "/our-work/future-ready-skills/future-pathways", permanent: true },
      { source: "/smartstart", destination: "/our-work/foundational-education", permanent: true },
      { source: "/empower-her-period", destination: "/our-work/girls-education-dignity", permanent: true },
      { source: "/click4change", destination: "/our-work/future-ready-skills/click-4-change", permanent: true },
      { source: "/step", destination: "/our-work/foundational-education/step-project", permanent: true },
      { source: "/sponsor-a-child", destination: "/give/support-a-future", permanent: true },
      { source: "/shareaid", destination: "/our-work/community-family-support/share-aid-initiative", permanent: true },
      { source: "/partner", destination: "/partners", permanent: true },
      { source: "/reports", destination: "/impact/reports", permanent: true },
      { source: "/transparency", destination: "/impact/reports", permanent: true },
      { source: "/safeguarding", destination: "/about/safeguarding", permanent: true },
      { source: "/stories", destination: "/news", permanent: true },
      { source: "/blog", destination: "/news", permanent: true },

      // PHASE 3b.1 - /about/team is live with #leadership / #governance /
      // #advisory anchors, so the standalone board pages now permanently
      // redirect into it. No loop: /about/team does not redirect back to either
      // source, and the old page files are kept (unreachable) for rollback.
      { source: "/executive-board", destination: "/about/team#governance", permanent: true },
      { source: "/advisory-board", destination: "/about/team#advisory", permanent: true },

      // PHASE 3b.2 - /about/team is the single canonical team/governance page.
      // The standalone /team route is a duplicate-content risk, so it now
      // permanently (308) redirects there. No loop: /about/team does not
      // redirect back to /team, and the old /team page file is kept (unreachable)
      // for rollback, matching the /executive-board + /advisory-board precedent.
      { source: "/team", destination: "/about/team", permanent: true },

      // PHASE 5 - the /give hub replaces the single-page /donate. This is an
      // EXACT-match redirect: `source: "/donate"` matches only /donate, so the
      // shared Paystack success route at /donate/success (used by both donations
      // and the Impact Store) keeps working. No loop: /give never redirects to
      // /donate, and the old /donate page file is kept (unreachable) for rollback.
      { source: "/donate", destination: "/give", permanent: true },

      // PHASE 6 - /nigeria is the dedicated Nigeria context page. Project
      // Momentum is FTF Nigeria's launch initiative, so its legacy standalone
      // path permanently (308) redirects there. No loop: /nigeria never
      // redirects back to /project-momentum.
      { source: "/project-momentum", destination: "/nigeria", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/vyiwmedy/**",
      },
    ],
  },
};

export default nextConfig;
