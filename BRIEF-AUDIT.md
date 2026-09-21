# BRIEF-AUDIT.md - FTF 2026-2031 Brief Coverage Audit

Last audited: 2026-09-21 (commit 0436bbc baseline)
Source: `docs/FTF-Brief-2026.md` (FTF Website Update & Content Development Brief 2026, sections 1-24)
Method: every section walked against the repository (routes, components, Prisma schema, config) and the live production deployment (weareforthefuture.vercel.app).

Status legend:
- **DELIVERED** - requirement met, evidence in repo/production
- **PARTIAL** - core exists, a named sub-requirement is missing or unverified
- **MISSING** - not implemented
- **N/A** - not a buildable requirement (direction, principle, organisational process)

## Section-by-section audit

### §1 Purpose of This Brief

| Requirement | Status | Evidence |
| --- | --- | --- |
| Reposition site as coherent child/youth development organisation (not initiative collection) | DELIVERED | Five-pillar IA (`src/data/pillars.ts`, `/our-work`), positioning copy (`src/data/site.ts` tagline, `src/app/layout.tsx` metadata) |

### §2 Strategic Basis

| Requirement | Status | Evidence |
| --- | --- | --- |
| Five programme pillars as organising principle | DELIVERED | `/our-work`, `/our-work/[pillar]`, `ProgramPillar` many-to-many (schema L432) |
| Child/youth development positioning language | DELIVERED | `layout.tsx` metadata uses §5.1 positioning sentence |
| Governance/safeguarding/M&E visibility | DELIVERED | `/about/safeguarding`, `/about/team#governance`, `/impact/reports` |
| Serve individuals, diaspora, corporates, NGOs, schools, volunteers | DELIVERED | `/give` (incl. 501(c)(3) diaspora language), `/partners`, `/get-involved/*`, `/nigeria` |
| Giving evolves into clear pathways | DELIVERED | `/give` hub: general, monthly, programme, campaign, support-a-future (`src/lib/give.ts`) |

### §3 Key Problems to Correct

| Issue | Status | Evidence |
| --- | --- | --- |
| Inconsistent impact figures | DELIVERED | Single source `siteConfig.stats` (`src/data/site.ts`) consumed by `src/data/impact.ts`, Home, Impact, Give |
| Initiative-led navigation | DELIVERED | `/initiatives` → `/our-work` 308 (`next.config.ts` L30-34) |
| Old positioning language | DELIVERED | `scripts/check-banned-language.mjs` gate + legacy copy sweep (`scripts/sweep-legacy-copy.ts`) |
| Weak credibility layer | DELIVERED | Safeguarding page, Reports & Transparency (`Document` model), Partners page |
| Programme evolution not reflected | DELIVERED | Future Pathways rename + redirects (`next.config.ts` L33-40, `scripts/verify-future-pathways.mjs`) |
| Generic giving journey | DELIVERED | `/give` multi-route hub |
| Impact Store positioning | PARTIAL | `/impact-store` rewritten as social enterprise (store models, A&C Mall/pop-ups); **Book Club sub-section MISSING** (zero matches in `src/`) |
| Ethical story framework | DELIVERED | `ImpactStory` consent chain: consentGiven + safeguardingApproved enforced at query, admin API, editor, seed |

### §4 Recommended Website Architecture

| Requirement | Status | Evidence |
| --- | --- | --- |
| Main nav: Home, About, Our Work, Impact, Get Involved, Give, Impact Store, News, Contact | DELIVERED | `src/components/layout/Navbar.tsx` + MobileMenu; all routes live |
| Give as visually distinct persistent button | DELIVERED | Navbar CTA (`bg-cta` pill) |
| Programmes beneath pillars, not top-level | DELIVERED | `/our-work/[pillar]/[program]` routing |
| About sub-pages (Our Story, How We Work, Where We Work, Team & Governance, Safeguarding) | DELIVERED | `/about/*` six routes |
| Impact sub-pages (dashboard, stories, reports, FTF at 10) | DELIVERED | `/impact`, `/impact-stories`, `/impact/reports`, `/impact/ftf-at-10` |
| "Impact Store & Book Club" nav entry | PARTIAL | Impact Store present; Book Club component MISSING (see §10.8) |

### §5 Site-Wide Messaging and Terminology

| Requirement | Status | Evidence |
| --- | --- | --- |
| 5.1 One-sentence positioning | DELIVERED | `layout.tsx` metadata description (near-verbatim) |
| 5.2/5.3/5.4 Mission, vision, values | DELIVERED | `/about` sections; values displayed |
| 5.5 Language standardisation (use/avoid table) | DELIVERED | Banned-language CI gate; "Support a Future" naming (`/give/support-a-future`); em-dash convention (AGENTS.md) |

### §6 Homepage Structure

| Sub-section | Status | Evidence |
| --- | --- | --- |
| 6.1 Hero (one institutional proposition, no rotating slogans) | DELIVERED | `HomeClient.tsx` hero, tagline "From disadvantage to opportunity"; rotating carousels banned (DESIGN.md §5) |
| 6.2 Trust & impact strip (verified figures) | DELIVERED | Stats strip + "figures last updated" line (`HomeClient.tsx` L207); 7+ regions in `impact.ts` |
| 6.3 Five pillars section | DELIVERED | Homepage pillar cards → pillar pages |
| 6.4 "How FTF Changes a Future" journey | DELIVERED | `src/components/home/JourneyStepper.tsx` |
| 6.5 Featured work (3-4 CMS-changeable priorities) | DELIVERED | `src/components/home/CurrentPriorities.tsx` (CMS-driven) |
| 6.6 Stories of Change (2-3 strengths-led, consented) | DELIVERED | `successStories` (Prince, Comfort - safeguarding-approved), consent gate chain |
| 6.7 Partner With Us block | DELIVERED | `src/components/home/PartnerWithUsBlock.tsx` |
| 6.8 Current priorities/campaigns with auto-expiry | DELIVERED | Homepage server query filters published campaigns by `startDate <= now <= endDate`; `CurrentPriorities.tsx` auto-expire filter + evergreen empty state; `BlogPost.archived` for posts |
| 6.9 Final CTA "It takes all of us" + Give/Volunteer/Partner | DELIVERED | Footer closing band (`Footer.tsx` L67-70) |

### §7 About FTF

| Sub-section | Status | Evidence |
| --- | --- | --- |
| 7.1 Our Story (decade journey) | DELIVERED | `/about/our-story` |
| 7.2 Vision/Mission/Values (single approved version) | DELIVERED | `/about`, `site.ts` SSOT |
| 7.3 How We Work | DELIVERED | `/about/how-we-work` |
| 7.4 Where We Work (Ghana core vs regional; Nigeria Ibadan/Oyo) | DELIVERED | `/about/where-we-work`, `/nigeria` |
| 7.5 Team & Governance (governance vs management split) | DELIVERED | `/about/team` (#leadership/#governance/#advisory), `TeamMember`/`ExecutiveBoardMember`/`AdvisoryBoardMember` models, `/admin/team` CRUD |
| 7.6 Safeguarding & Accountability public page | DELIVERED | `/about/safeguarding` (+ `/safeguarding` redirect) |
| 7.7 Recognition & milestones timeline | DELIVERED | `src/components/ui/Timeline.tsx`; milestone set 2016-2026 in `FTFat10Client.tsx` |

### §8 Our Work: Five-Pillar Structure

| Requirement | Status | Evidence |
| --- | --- | --- |
| Our Work landing + pathway intro | DELIVERED | `/our-work` ("Five pillars. One pathway.") |
| Every programme tagged to pillar(s) in CMS | DELIVERED | `ProgramPillar` join model (multiple tags), `/admin` programs CRUD |
| Programmes can evolve/merge/archive without nav rebuild | DELIVERED | `Program.status`: active/expanding/campaign/pilot/future_project/archived (schema L386) |
| All five pillar pages with brief's programme lists | DELIVERED | `/our-work/[pillar]` SSG routes (build output: foundational-education, girls-education-dignity, future-ready-skills, mentorship-leadership-wellbeing, community-family-support) |

### §9 Standard Programme Page Template

| Requirement | Status | Evidence |
| --- | --- | --- |
| All template fields (name, pillars, purpose, challenge, what we do, who served, where, impact, stories, partners, status, CTA, updates) | DELIVERED | `Program` model fields incl. status enum matching brief; `ProgrammeDetailClient.tsx` renders template; `src/lib/pillars.ts` ProgrammeIndicator |

### §10 Programme-Specific Changes

| Sub-section | Status | Evidence |
| --- | --- | --- |
| 10.1 STEP flagship + Sponsor a Child → Support a Future journey | PARTIAL | STEP page live (`/our-work/foundational-education/step-project`); `/give/support-a-future` exists; **verified beneficiary profiles (BeneficiaryCase swipe deck) = Phase 12 Step 8, pending spec approval** |
| 10.2 SmartStart under foundational learning | DELIVERED | `/smartstart` → pillar redirect; SmartStart presented as model within foundational learning |
| 10.3 Girls' work broader than Empower Her, Period | DELIVERED | `/our-work/girls-education-dignity` pillar scope |
| 10.4 Future Pathways replaces Project Future Ready | DELIVERED | Programme page + 3 redirects + `scripts/verify-future-pathways.mjs` |
| 10.5 Click4Change updates | DELIVERED | `/our-work/future-ready-skills/click-4-change` |
| 10.6 ShareAid connected to education access | DELIVERED | `/our-work/community-family-support/share-aid-initiative` |
| 10.7 FTF Village dedicated Vision Project page | DELIVERED | `/our-work/community-family-support/ftf-village-project` (existing vs proposed distinguished) |
| 10.8 Impact Store rewrite + Book Club sub-section | PARTIAL | Store rewrite DELIVERED (`/impact-store`, Product/Order models); **Book Club MISSING** |
| 10.9 Nigeria section (Ibadan/Oyo, STEP + Project Momentum) | DELIVERED | `/nigeria` + `/project-momentum` redirect |

### §11 Impact, Evidence and Transparency

| Sub-section | Status | Evidence |
| --- | --- | --- |
| 11.1 Impact dashboard, one CMS source, last-updated date | DELIVERED | `/impact` (org-wide + per-programme indicators), `ImpactStat` model, "Last updated" shown (`ImpactClient.tsx` L101) |
| 11.2 Dignity-first stories, no identifying minor data | DELIVERED | Consent gate chain; first-name-only stories; safeguarding-approved flag |
| 11.3 Reports & Transparency area | DELIVERED | `/impact/reports`, `Document` model, institutional profile PDF, EIN display |
| 11.4 Permanent FTF at 10 page | DELIVERED | `/impact/ftf-at-10` (timeline, figures, "It takes all of us", next-decade invitation) |

### §12 Giving and Support Experience

| Route | Status | Evidence |
| --- | --- | --- |
| Give where needed most | DELIVERED | `/give` general route (GivingPanel) |
| Monthly giving | PARTIAL | `/give/monthly` route + GivingPanel recurring preselect live; **true Paystack recurring charging (subscription plans) not implemented/verified** |
| Support a programme (pillar/programme designation) | DELIVERED | `/give/[slug]` designation routes |
| Support a verified child/youth need | PARTIAL | Page live; BeneficiaryCase model, query-level safeguarding gating, auto-close on funded = **Step 8 pending** |
| Campaign giving | DELIVERED | `DonationCampaign` (goalAmount pesewas, endDate, milestones/updates models) |
| Diaspora/international + 501(c)(3) careful language | DELIVERED | `GivingPanel.tsx` L254, `OurWorkClient.tsx` ("funding vehicle - not a third programme country"), EIN in reports |
| Corporate → partnership (not donor checkout) | DELIVERED | `/partners` + `PartnerInquiryForm` |
| 12.1 Ethical beneficiary support rules | PARTIAL | Story-level consent/safeguarding DELIVERED; case-level enforcement (no direct messaging, funded-close rule) ships with Step 8 |

### §13 Get Involved

| Sub-section | Status | Evidence |
| --- | --- | --- |
| 13.1 Volunteer (structured model + application) | DELIVERED | `/get-involved/volunteer`, `VolunteerApplication` model, `/api/volunteer`, `/admin/volunteers` |
| 13.2 Fellowship / Young Changemakers | DELIVERED | `/get-involved/fellowship` |
| 13.3 Mentor pathway | DELIVERED | `/get-involved/mentor` |
| 13.4 Partner With FTF institutional page | DELIVERED | `/partners` (routes, inquiry form) |
| 13.5 Why Partner evidence points | DELIVERED | Partners page stats/credentials block |

### §14 2026-2031 Strategy: What Should Be Public

| Requirement | Status | Evidence |
| --- | --- | --- |
| Concise "Our 2026-2031 Direction" page/section | PARTIAL | Strategy themes appear distributed (ftf-at-10 "next decade", about/how-we-work, five-year direction referenced); **no single dedicated public strategy section** |

### §15 News, Events and Campaign Content

| Requirement | Status | Evidence |
| --- | --- | --- |
| Categories/tags linked to pillars and content types | DELIVERED | `BlogCategory`, `BlogTag`, `BlogPost.pillarSlug/pillarId` |
| Search and filter by pillar/country/category | DELIVERED | `NewsClient.tsx` (category + pillar + country filters, search) |
| Post date, attribution, related pillar, CTA | DELIVERED | `/news/[slug]`: PostBody, RelatedBlock, MoreFromPillar, ShareButtons |
| Old campaign posts archive | DELIVERED | `BlogPost.archived` flag (hidden from feed by default) |

### §16 Design, UX and Functional Requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| Mobile-first, fast, compressed images | DELIVERED | Cloudinary CDN pipeline, next/image, launch Lighthouse QA |
| Visual system for pillars, one brand | DELIVERED | `--ftf-pillar-N` tokens (DESIGN.md §1), unified brand |
| Persistent Give button | DELIVERED | Navbar CTA |
| Reusable CMS templates | DELIVERED | Admin CRUD suite (blog, programs, stories, team, boards, partners, FAQ, documents, campaigns, newsletter) |
| Programmes support multiple pillar tags | DELIVERED | `ProgramPillar` |
| One central impact dataset | DELIVERED | `siteConfig.stats` + `ImpactStat` |
| News search/filter | DELIVERED | NewsClient |
| Forms routed by purpose | DELIVERED | contact/partnership (`/api/contact`), volunteer (`/api/volunteer`), mentor, school/media routes on contact page |
| Payments: general, programme, campaign designations | DELIVERED | Paystack inline checkout + metadata |
| Payments: approved beneficiary-need designation | PARTIAL | Ships with Step 8 (`beneficiaryCaseId` metadata) |
| Recurring giving | PARTIAL | See §12 monthly |
| Downloadable/emailed receipts | PARTIAL | Success page + reference verification live; emailed receipts not implemented |
| Accessibility basics | DELIVERED | DESIGN.md §6 (AA contrast, focus rings, alt text, keyboard, reduced-motion) |
| Consent-controlled media | DELIVERED | Consent gate chain + Cloudinary-managed assets |
| Analytics + conversion tracking | DELIVERED | GA4 (`GA4Script.tsx`, `src/lib/analytics.ts`), VERCEL_ENV-gated |
| Redirect strategy | DELIVERED | 20+ permanent redirects (`next.config.ts`) |

### §17 SEO and Search Visibility

| Requirement | Status | Evidence |
| --- | --- | --- |
| Unique titles/meta/H1 per page, alt text, descriptive URLs | DELIVERED | `generateMetadata` per route, launch SEO QA, sitemap.ts, robots.txt |
| Priority search themes in copy | DELIVERED | Positioning copy includes Ghana/Nigeria programme terms naturally |
| Preview deployments kept out of index | DELIVERED | X-Robots-Tag noindex on non-production (`next.config.ts` headers) |

### §18 Content Governance and Updating

| Requirement | Status | Evidence |
| --- | --- | --- |
| CMS + role-based editing platform | DELIVERED | Admin RBAC (`User` roles), `AuditLog`, `ContentAudit` model |
| Internal content owners + approval workflow | PARTIAL | Organisational process (outside codebase); platform supports it, ownership assignments not codified |

### §19 Corrections Checklist

| Item | Status | Evidence |
| --- | --- | --- |
| "Initiatives" → "Our Work" | DELIVERED | Nav + redirect |
| Five-pillar landing + detail pages | DELIVERED | `/our-work` tree |
| Verified central impact counters | DELIVERED | `siteConfig.stats` |
| Positioning rewrite, climate action removed from core identity | DELIVERED | Legacy copy sweep |
| Single institutional hero (no rotating slogans) | DELIVERED | HomeClient hero |
| Future Pathways rename + redirects | DELIVERED | `next.config.ts` L33-40 |
| SmartStart repositioned | DELIVERED | `/smartstart` redirect |
| Girls' work expanded | DELIVERED | Pillar 2 page |
| Impact Store pop-ups/A&C/Book Club update | PARTIAL | Book Club MISSING |
| FTF at 10 page | DELIVERED | `/impact/ftf-at-10` |
| Partner With Us page | DELIVERED | `/partners` |
| Public Safeguarding page | DELIVERED | `/about/safeguarding` |
| Impact/Reports/Transparency area | DELIVERED | `/impact/reports` |
| Ghana/Nigeria country context | DELIVERED | `/about/where-we-work`, `/nigeria` |
| Team/governance current + promptly updatable | DELIVERED | Admin CRUD |
| Phone/email/naming consistency | DELIVERED | `ContactInfo`/`SocialLink` models, `site.ts` |
| Legacy copy errors corrected | DELIVERED | Banned-language gate + sweeps (incl. em-dash sweep) |
| 501(c)(3) legally careful language | DELIVERED | "Funding vehicle" framing; no blanket tax-deductibility claim |
| Campaign expiry/archive controls | DELIVERED | `endDate` query filtering (homepage/give), `BlogPost.archived` flag |
| Last-updated dates on metrics/reports | DELIVERED | Impact/Reports/Give pages |
| Privacy/cookie/data-protection notices | DELIVERED | `/privacy`, `/terms`, cookie policy, CookieConsentBanner |
| SEO-preserving redirects | DELIVERED | `next.config.ts` |

### §20 Implementation Phases

| Phase | Status | Evidence |
| --- | --- | --- |
| Phase 1 Foundation | DELIVERED | Sitemap, pillars, homepage, about, figures, naming, positioning, redirects |
| Phase 2 Credibility & Conversion | DELIVERED | Impact dashboard, reports, safeguarding, partners, give hub, volunteer/mentor, Nigeria |
| Phase 3 Programme Depth | DELIVERED | Pillar/programme templates, Future Pathways, girls, foundational learning, store, village, stories |
| Phase 4 Digital Support & Growth | PARTIAL | Supporter accounts DELIVERED ("My FTF": `Supporter`/`SupporterSession`/`SavedItem`/`SupporterNotification`); ethical Support-a-Future profiles (Step 8), true recurring giving, campaign automation pending |
| Phase 5 Ongoing Governance | N/A | Operational cadence, not a build deliverable |

### §21 Content the Developer Should Not Hard-Code

| Content type | Status | Evidence |
| --- | --- | --- |
| Impact figures and labels | PARTIAL | `ImpactStat` model exists, but headline figures live in `src/data/site.ts` (approval-required code file), not CMS |
| Programme names and status | DELIVERED | `Program` + admin CRUD |
| Pillar-to-programme relationships | DELIVERED | `ProgramPillar` |
| Campaign names, targets, closing dates | DELIVERED | `DonationCampaign` |
| Programme partners/logos | DELIVERED | `Partner` |
| Team and board profiles | DELIVERED | TeamMember/board models + CRUD |
| Beneficiary/support profiles and funding status | MISSING | Step 8 (`BeneficiaryCase`) |
| Reports and downloads | DELIVERED | `Document` |
| Homepage featured programmes/stories | DELIVERED | CurrentPriorities + featured story selection |
| Contact details and social links | DELIVERED | `ContactInfo`, `SocialLink` |
| Countries/regions served | PARTIAL | Countries in `siteConfig.stats` (code); no CMS surface |
| CTAs and form routing | PARTIAL | CTA copy in code (`site.ts`/components); form routing fixed per endpoint |

### §22 Homepage Copy Bank

| Item | Status | Evidence |
| --- | --- | --- |
| Hero headline option adopted | DELIVERED | "From disadvantage to opportunity." as site tagline (`site.ts`, hero, OurWork, marquee) |
| Partnership callout | DELIVERED | PartnerWithUsBlock copy |
| Giving callout | DELIVERED | GiveClient pathway copy |
| Closing callout ("It takes all of us") | DELIVERED | Footer + FTF at 10 |

### §23 Final Website Principle

| Item | Status | Evidence |
| --- | --- | --- |
| Warm + structured + credible build principle | N/A | Guiding principle; reflected across delivered work (DESIGN.md, trust layer, safeguarding) |

### §24 Source Documents

| Item | Status | Evidence |
| --- | --- | --- |
| Reference list | N/A | Sources external; brief committed at `docs/FTF-Brief-2026.md`. Note: the Mobile App brief (Sept 2026) exists as `FTF_App_Product_and_Content_Brief_Updated_Child_and_Youth.docx` (Downloads) - not in repo, out of website scope |

## Critical gaps (priority order)

1. **Support-a-Future beneficiary system** (§10.1, §12, §12.1, §16, §21) - the brief's dignity-first verified-need giving route is a page shell only; `BeneficiaryCase` model, query-level consent/safeguarding gating, Paystack `beneficiaryCaseId` metadata and funded-auto-close are specced as **Phase 12 Step 8** (proposal pending review).
2. **Book Club** (§4, §10.8, §19) - required visible sub-section of Impact Store (reading buddies, discussions, challenges). Zero implementation. Editorial + build work.
3. **True recurring giving** (§12, §16) - monthly route/UI exists; Paystack subscription charging not implemented. Payment-provider work.
4. **Impact figures not CMS-editable** (§11.1, §21) - headline figures are code SSOT (`src/data/site.ts`) with last-updated display; brief wants one CMS source. Decide: keep code SSOT (safer, approval-gated) or migrate to `ImpactStat`-backed CMS.
5. **Dedicated public 2026-2031 direction section** (§14) - content decision needed on where it lives (about page section vs standalone).
6. **Emailed donation receipts** (§16) - not implemented (no email service wired).

## Summary

| Status | Count (leaf requirements) |
| --- | --- |
| DELIVERED | 119 |
| PARTIAL | 17 |
| MISSING | 1 |
| N/A | 3 |
| **Total** | **140** |

The repositioning brief is substantially delivered: architecture, messaging, credibility layer, giving hub, supporter accounts and governance tooling are live in production. The remaining gaps cluster around the beneficiary-support feature (Step 8), Book Club content, recurring payments, and CMS-vs-code ownership of impact figures.

## Phase 13 candidate backlog (post-Phase-12)

The following gaps are known, deferred, and tracked. Do not implement without founder sign-off. The founder has confirmed all deferred gaps matter; sequencing below.

**Phase 12 (current):**

- Step 1: C3 motion docs - DONE (DESIGN.md §8)
- Step 2: A1 hero polish
- Step 3: A3 section rhythm
- Step 4: A2 card system
- Step 5: C2 journey stepper
- Step 6: A4 fund bars
- Step 7: C1 celebration
- Step 7b: Book Club sub-section on Impact Store (NEW - folded into the visual refresh since that page is being touched)
- Step 8: Support a Future swipe deck (founder's explicit ask)

**Phase 13:**

1. 13.1: Public 2026-2031 Direction section (brief §14)
2. 13.2: Impact figures → CMS (move siteConfig.stats to ImpactStat)
3. 13.3: Email donation receipts (recommend Resend)
4. 13.4: Paystack recurring charging (subscriptions API)

**Phase 14 (post-launch):**

- Additional polish based on real usage
- Analytics review
- Performance optimization (Lighthouse simulated gaps)
