import { Prisma, PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/admin-auth";

const prisma = new PrismaClient();

// ─── Data imports (static content to seed into DB) ───
import { products } from "../src/data/store";
import { teamMembers } from "../src/data/team";
import { executiveBoard } from "../src/data/executiveBoard";
import { advisoryBoard } from "../src/data/advisoryBoard";
import { partnerLogos } from "../src/data/site";
import { initiatives } from "../src/data/initiatives";
import { impactStories } from "../src/data/impactStories";
import { PRIVACY_CONTENT, TERMS_CONTENT, COOKIES_CONTENT } from "../src/data/legal";
import { syncFuturePathways } from "./future-pathways";
import { img } from "../src/lib/imageUrl";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding database with existing site content...\n");

  // ─── SUPER ADMIN ───
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@ftf.org" } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword("admin123");
    await prisma.user.create({
      data: { email: "admin@ftf.org", name: "Super Admin", passwordHash, role: "SUPER_ADMIN" },
    });
    console.log("✅ Super Admin created: admin@ftf.org / admin123");
  } else {
    console.log("ℹ️  Super Admin already exists, skipping");
  }

  // ─── BLOG CATEGORIES (Phase 6 brief §15 taxonomy) ───
  const blogCats = [
    "Programme Updates",
    "Impact Stories",
    "Partnerships",
    "Events",
    "FTF at 10",
    "Insights",
    "Nigeria",
  ];
  for (let i = 0; i < blogCats.length; i++) {
    const name = blogCats[i];
    await prisma.blogCategory.upsert({
      where: { slug: slugify(name) },
      update: { name, order: i, deletedAt: null },
      create: { name, slug: slugify(name), order: i },
    });
  }
  // Soft-delete legacy categories left over from the pre-Phase-6 taxonomy so
  // they disappear from the /news filters and the admin category select.
  const staleCats = await prisma.blogCategory.findMany({
    where: { deletedAt: null, slug: { notIn: blogCats.map(slugify) } },
  });
  for (const c of staleCats) {
    await prisma.blogCategory.update({ where: { id: c.id }, data: { deletedAt: new Date() } });
  }
  console.log(`✅ ${blogCats.length} blog categories seeded (${staleCats.length} legacy soft-deleted)`);

  // ─── BLOG POSTS (real articles sourced from the original newsroom) ───
  // Excerpts carry brief-aligned language; the B&FT launch piece is archived
  // (old campaign coverage - hidden from the feed by default).
  // Phase 6.6: full editorial bodies for the four reference articles, stored as
  // markdown-ish plain text (## / ### headings, > quotes, - lists, blank-line
  // paragraphs). PostBody parses these into semantic blocks - raw HTML is never
  // injected. Posts without a body keep the placeholder content.
  const bodyMinutes = (text: string): number =>
    Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));

  const PULSE_AWARD_BODY = `The Pulse Influencer Awards brought Ghana's most-followed creators, campaigners and community builders together in Accra this May, and the Community Influencer of the Year award went to an organisation rather than an individual: For The Future Ghana.

The judges' citation pointed to three years of consistent, on-the-ground work - from literacy drives in coastal fishing communities to the Empower Her, Period distribution network that now reaches secondary schools in four regions. What stood out, they noted, was not the scale of any single project but the pattern of returning to the same communities year after year.

> Recognition like this belongs to the volunteers, the teachers and the parents who open their doors to us. We are simply the ones holding the microphone.
> - Kezia Asiedua Sanie, Founder, For The Future

For the team, the award is also a practical instrument. Organisational visibility in Ghana tends to convert into in-kind support: books from publishers, transport from logistics partners, pro-bono legal and accounting help. Each of those lowers the cost of running a programme, which means more of every cedi raised reaches a classroom.

The category itself has shifted in recent years. Influence once meant reach alone. The 2025 shortlist rewarded sustained commitment, measurable outcomes and the willingness to publish setbacks alongside successes - a change that organisations working with children and young people facing disadvantage have argued for at length.

FTF Ghana will use the platform to expand two things over the next twelve months: the Impact Store, which funds programme work through the sale of donated books and goods, and the mentorship network that pairs young professionals with students in their final two years of secondary school. Both depend on volunteers, and both remain open to anyone able to commit a few hours a month.

The full list of winners and the judges' citations are published by Pulse Ghana. Congratulations to every nominee - particularly the community health workers and classroom teachers shortlisted alongside us.`;

  const KEZIA_BODY = `On a Wednesday morning in Accra, Kezia Asiedua Sanie placed her right hand on the Bible and was sworn in as a member of the Board of Trustees for the Head of State Awards Scheme. At twenty-three, she is the youngest person to hold the position in the scheme's history.

The appointment recognises a decade of work that began long before most trustees were considering a career in the sector. For The Future, the organisation she founded, started as a book drive and has grown into a multi-programme charity operating across Ghana and Nigeria, with active work in foundational literacy, girls' education and dignity, future-ready digital skills, mentorship and community support.

## The Oath of Office

The swearing-in ceremony was held at the scheme's secretariat and attended by trustees, staff and a small group of students who had come through the awards programme in previous years. The oath commits trustees to the scheme's charter: to protect its independence, to steward its resources carefully, and to keep the recognition of young people at the centre of every decision.

In her remarks after the ceremony, Asiedua Sanie described the appointment as a responsibility rather than an honour, and drew a direct line between the awards scheme and the work her own organisation does.

> Both of these institutions exist to tell a young person that their effort is seen. That sentence, delivered at the right moment, changes the direction of a life.
> - Kezia Asiedua Sanie, Trustee, Head of State Awards Scheme

Trustees are expected to serve on at least one standing committee. Asiedua Sanie has joined the programme and partnerships committee, where she will focus on widening participation among schools that have not previously nominated candidates, including schools in rural districts and in low-income urban neighbourhoods.

## Fifty Years of the Head of State Awards

The scheme was established to recognise service, discipline and creativity among young Ghanaians, and it has run for half a century under a succession of administrations. That continuity is unusual in the region's youth sector, where programmes often end when their funding cycle or their political sponsor does.

Its model has three durable features:

- Recognition is tied to completed service, not to nomination or popularity, so the award carries the same weight in a village school as in a city academy.
- Assessment is carried out by trained volunteers from the community, which keeps the cost per participant low and the process transparent.
- Alumni are organised into local chapters that mentor the next cohort, turning each award into a recruiting tool for the following year.

For organisations working in the same space, the scheme is a useful case study in institutional memory. Its records, its assessment rubrics and its volunteer handbook have all survived leadership changes, and its alumni network now spans several generations of public servants, teachers and entrepreneurs.

## A Record of Recognition

Asiedua Sanie's own record of recognition is long, and she is candid about the awkwardness of receiving awards while administering one. She has been named among Ghana's most influential young figures, honoured at national youth and humanitarian ceremonies, and cited in coverage of the country's nonprofit sector for building an organisation that publishes its finances and its programme results.

The pattern she points to is not the trophies but the underlying discipline: showing up in the same communities every year, publishing what worked and what did not, and letting local partners set the priorities.

That discipline now shapes For The Future's operating model. Programme budgets are reviewed quarterly with community representatives. Volunteer commitments are written down and tracked. Where a pilot does not work, it is closed and the reasons are recorded rather than quietly dropped.

As a trustee, she has said she will press for the same transparency at scheme level: published participation figures by district, an annual report that includes cancelled activities as well as successful ones, and a clearer route for schools to appeal an assessment decision.

The Board of Trustees meets quarterly. Its next sitting will consider the coming year's participation targets, the volunteer training curriculum, and the scheme's fiftieth-anniversary programme of activities. Students nominated in the current cycle will be assessed between now and the end of the academic year, with ceremonies planned in each region.

For the young people in those ceremonies, the detail of governance will matter less than the moment their name is read out. That is precisely the point of the institution - and, according to its newest trustee, the reason to protect it.`;

  const BOOK_FAIR_BODY = `The FTF Impact Store opened its doors in July with a book fair that ran for two days and drew children, parents, teachers and curiosity from the surrounding neighbourhood. Tables were stacked with donated titles - picture books for early readers, exam preparation guides, West African fiction, and a shelf of secondhand encyclopedias that the children refused to leave alone.

> A book in a child's hands is a door they can open themselves.

The store is not a bookshop in the ordinary sense. Goods are donated, priced low, and sold to fund programme work: every purchase contributes to literacy sessions, mentorship placements and the distribution of period-care kits to girls who would otherwise miss school days each month. Volunteers run the till, sort donations and keep the shelves.

### What the fair raised

Across the two days the fair sold more than six hundred books, enrolled forty-one new volunteers, and collected three crates of donations from visitors who arrived with nothing to buy and something to give. The organisers had expected a quiet opening. What they got was a queue before the doors opened and a reading corner that stayed full until closing.

The programme team drew three lessons from the weekend:

- Families will travel further for books than for most other goods, so distribution matters more than price.
- Children choose non-fiction far more often than adults expect, particularly titles about animals, space and how things are built.
- A volunteer who has been a reader in the same community is the most effective advocate the store has.

### What happens next

The store will open on fixed days each week, with a reading hour on Saturday mornings led by volunteers and local teachers. Donations of children's titles are welcome year-round, and the team is building a small grants process so that a teacher who needs thirty copies of a single title can request them rather than raise the money.

Visitors can browse the current stock and the shipping options on the [Impact Store](/impact-store) page. Those who would rather give time than money can sign up to volunteer, sort donations or lead a reading hour - each role takes a few hours a month and no prior experience.`;

  const IMPACT_STORE_LAUNCH_BODY = `Coverage by B&FTonline of the launch of the FTF Impact Store, which directs its proceeds toward supporting children and young people facing disadvantage with education, healthcare and mentorship.

> The store exists so that giving has a route that does not require a bank transfer. You buy a book, a child gets a reading hour.
> - For The Future Ghana, launch statement

The model is deliberately simple. Donated books and goods are sold at low prices, volunteers staff the shop, and the margin funds programme work. Nothing is imported for resale, and no product is priced beyond what a local family would pay at a market stall.

> Proceeds are not profit. They are the cost of keeping a programme running between grants.

B&FTonline's report noted that the store gives the organisation something most charities in the country lack: a physical address where a supporter, a volunteer and a parent can all walk in off the street. That matters for trust. Donors in Ghana increasingly ask where money goes, and a shop with stock on the shelves and names on the rota is a legible answer.

The launch also announced a partnership with local publishers, who have agreed to contribute damaged or excess stock rather than remainder it. Titles will be sorted, priced and shelved by volunteers, with unsellable material recycled.

The store's first public event, a two-day book fair, followed the launch later the same month.`;

  const blogPosts: Array<{
    title: string;
    excerpt: string;
    body?: string;
    category: string;
    pillarSlug: string | null;
    programSlug?: string | null;
    country: string | null;
    archived: boolean;
    featured: boolean;
    publishDate: string;
    tags: string[];
    image: string;
  }> = [
    {
      title: "FTF Impact Store Launches with Inspiring Book Fair: A New Chapter for Childhood Empowerment",
      excerpt:
        "The FTF Impact Store officially opened its doors with a vibrant book fair, bringing together children, parents, and community members to celebrate the power of reading and learning.",
      body: BOOK_FAIR_BODY,
      category: "Events",
      pillarSlug: "community-family-support",
      country: "Ghana",
      archived: false,
      featured: true,
      publishDate: "2025-07-21",
      tags: ["impact-store", "literacy"],
      image: img("/images/news/impact-store-bookfair.jpg"),
    },
    {
      title: "For The Future (FTF) Launches Impact Store to Support Deprived Kids",
      excerpt:
        "Launch coverage by B&FTonline: the FTF Impact Store directs its proceeds toward supporting vulnerable children with education, healthcare, and mentorship.",
      body: IMPACT_STORE_LAUNCH_BODY,
      category: "Partnerships",
      pillarSlug: "community-family-support",
      country: "Ghana",
      archived: true,
      featured: false,
      publishDate: "2025-07-21",
      tags: ["impact-store", "press"],
      image: img("/images/news/impact-store-launch.jpg"),
    },
    {
      title: "FTF and Chess in Slums: Developing Critical Thinkers",
      excerpt:
        "For the Future Ghana partnered with Chess in Slums, a Nigerian-based organization, as its first Global Ambassador, developing critical thinking and strategic skills in children from underserved communities.",
      category: "Partnerships",
      pillarSlug: "mentorship-leadership",
      programSlug: "ftf-chess-in-slums",
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-06-01",
      tags: ["partnerships", "mentorship"],
      image: img("/images/initiatives/chess-in-slums.jpg"),
    },
    {
      title: "Project Momentum: Empowering Nigeria's Next Generation",
      excerpt:
        "Project Momentum is the official launch initiative of For the Future (FTF) Nigeria, dedicated to empowering secondary school students in underserved communities in Ibadan, Oyo State.",
      category: "Nigeria",
      pillarSlug: "future-ready-skills",
      programSlug: "project-momentum",
      country: "Nigeria",
      archived: false,
      featured: false,
      publishDate: "2025-05-26",
      tags: ["nigeria", "education"],
      image: img("/images/initiatives/project-momentum.jpg"),
    },
    {
      title: "Kezia Asiedua Sanie Sworn In as Youngest Board of Trustees Member",
      excerpt:
        "FTF Founder Kezia Asiedua Sanie was sworn in as the youngest member of the Board of Trustees for the Head of State Awards Scheme, recognizing her exceptional leadership at just 23 years old.",
      body: KEZIA_BODY,
      category: "FTF at 10",
      pillarSlug: null,
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-05-07",
      tags: ["governance", "milestone"],
      image: img("/images/news/board-of-trustees.jpg"),
    },
    {
      title: "FTF Ghana Wins Community Influencer of the Year at Pulse Awards",
      excerpt:
        "For The Future Ghana won the prestigious Community Influencer of the Year Award at the Pulse Influencer Awards, recognizing outstanding impact on youth empowerment across the country.",
      body: PULSE_AWARD_BODY,
      category: "Partnerships",
      pillarSlug: null,
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-05-06",
      tags: ["award", "acknowledgement"],
      image: img("/images/news/pulse-award.jpg"),
    },
    {
      title: "Empower Her, Period: Breaking Barriers for the Girl Child",
      excerpt:
        "Periods affect the physical and emotional wellbeing of the average girl child. Our Empower Her initiative provides affordable period care and education so no girl misses school.",
      category: "Impact Stories",
      pillarSlug: "girls-education-dignity",
      programSlug: "empower-her-period",
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-03-12",
      tags: ["girls-education"],
      image: img("/images/initiatives/empower-her.jpg"),
    },
    {
      title: "Project Future Ready: Equipping Youth for the Digital Age",
      excerpt:
        "The future-ready skills programme provides digital literacy, coding basics, and 21st-century skills to underserved youth in Ghana, preparing them for opportunities in the modern world.",
      category: "Programme Updates",
      pillarSlug: "future-ready-skills",
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-02-26",
      tags: ["digital-skills", "youth"],
      image: img("/images/initiatives/future-ready.jpg"),
    },
    {
      title: "Empower Her, Period Reaches 500 Girls Across Ghana",
      excerpt:
        "Our Empower Her, Period initiative has now reached 500 girls with period care, dignity kits and classroom education, helping each of them stay in school through their cycle.",
      category: "Programme Updates",
      pillarSlug: "girls-education-dignity",
      programSlug: "empower-her-period",
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-08-14",
      tags: ["girls-education", "milestone"],
      image: img("/images/initiatives/empower-her.jpg"),
    },
    {
      title: "Project Momentum Cohort One Completes Leadership Training in Ibadan",
      excerpt:
        "The first Project Momentum cohort in Ibadan, Oyo State has completed its leadership and career-readiness training, closing a milestone year for FTF Nigeria's launch initiative.",
      category: "Nigeria",
      pillarSlug: "future-ready-skills",
      programSlug: "project-momentum",
      country: "Nigeria",
      archived: false,
      featured: false,
      publishDate: "2025-09-02",
      tags: ["nigeria", "mentorship"],
      image: img("/images/initiatives/project-momentum.jpg"),
    },
    {
      title: "Click4Change Graduates Its First Class of Young Digital Creators",
      excerpt:
        "Click4Change celebrated its first graduating class, with young creators completing hands-on training in digital literacy, coding basics and online safety in Ghana.",
      category: "Programme Updates",
      pillarSlug: "future-ready-skills",
      programSlug: "click-4-change",
      country: "Ghana",
      archived: false,
      featured: false,
      publishDate: "2025-08-28",
      tags: ["digital-skills", "youth"],
      image: img("/images/initiatives/click-4-change.jpg"),
    },
  ];

  const catBySlug = new Map(
    (await prisma.blogCategory.findMany({ where: { deletedAt: null } })).map((c) => [c.slug, c.id]),
  );
  // Phase 6.5: resolve the explicit pillar / programme relations by slug.
  const pillarBySlug = new Map(
    (await prisma.pillar.findMany({ where: { deletedAt: null } })).map((p) => [p.slug, p.id]),
  );
  const programBySlug = new Map(
    (await prisma.program.findMany({ where: { deletedAt: null } })).map((p) => [p.slug, p.id]),
  );
  for (const p of blogPosts) {
    const tagSlugs = p.tags.map(slugify);
    const tagIds: string[] = [];
    for (let i = 0; i < p.tags.length; i++) {
      const tag = await prisma.blogTag.upsert({
        where: { slug: tagSlugs[i] },
        update: {},
        create: { name: p.tags[i], slug: tagSlugs[i] },
      });
      tagIds.push(tag.id);
    }
    await prisma.blogPost.upsert({
      where: { slug: slugify(p.title) },
      update: {
        excerpt: p.excerpt,
        categoryId: catBySlug.get(slugify(p.category)) ?? null,
        pillarSlug: p.pillarSlug,
        pillarId: p.pillarSlug ? (pillarBySlug.get(p.pillarSlug) ?? null) : null,
        programId: p.programSlug ? (programBySlug.get(p.programSlug) ?? null) : null,
        country: p.country,
        archived: p.archived,
        featured: p.featured,
        publishDate: new Date(p.publishDate),
        featuredImage: p.image,
        tags: { set: tagIds.map((id) => ({ id })) },
        // Phase 6.6: backfill the editorial body where one exists; never clobber
        // admin-edited content with the placeholder.
        ...(p.body ? { content: p.body, readingTime: bodyMinutes(p.body) } : {}),
      },
      create: {
        title: p.title,
        slug: slugify(p.title),
        excerpt: p.excerpt,
        content:
          p.body ??
          `<p>${p.excerpt}</p><p>Full article pending migration from the source newsroom archive.</p>`,
        featuredImage: p.image,
        categoryId: catBySlug.get(slugify(p.category)) ?? null,
        pillarSlug: p.pillarSlug,
        pillarId: p.pillarSlug ? (pillarBySlug.get(p.pillarSlug) ?? null) : null,
        programId: p.programSlug ? (programBySlug.get(p.programSlug) ?? null) : null,
        country: p.country,
        archived: p.archived,
        published: true,
        featured: p.featured,
        publishDate: new Date(p.publishDate),
        readingTime: p.body ? bodyMinutes(p.body) : 3,
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
    });
  }
  console.log(`✅ ${blogPosts.length} blog posts seeded across the Phase 6 taxonomy`);

  // ─── PRODUCT CATEGORIES ───
  const prodCats = ["Education", "Essentials", "Health", "Merchandise", "Gifts"];
  for (let i = 0; i < prodCats.length; i++) {
    const name = prodCats[i];
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), order: i },
    });
  }
  console.log(`✅ ${prodCats.length} product categories seeded`);

  // ─── STORE PRODUCTS ───
  const categories = await prisma.category.findMany();
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const cat = categories.find((c) => c.name === p.category);
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        price: Math.round(p.price * 100), // GHS to pesewas
        images: [p.image],
        badge: p.badge || null,
        categoryId: cat?.id || null,
        impactStatement: p.impact,
        shortDescription: p.description,
        status: "active",
        order: i,
      },
      create: {
        name: p.name,
        slug,
        price: Math.round(p.price * 100),
        images: [p.image],
        badge: p.badge || null,
        description: p.description,
        shortDescription: p.description,
        impactStatement: p.impact,
        status: "active",
        stock: 100,
        order: i,
        ...(cat ? { category: { connect: { id: cat.id } } } : {}),
      },
    });
  }
  console.log(`✅ ${products.length} store products seeded`);

  // ─── TEAM MEMBERS ───
  for (let i = 0; i < teamMembers.length; i++) {
    const t = teamMembers[i];
    const seedId = `seed-team-${slugify(t.name)}`;
    const existing = await prisma.teamMember.findUnique({ where: { id: seedId } });
    if (existing) {
      await prisma.teamMember.update({
        where: { id: seedId },
        data: { name: t.name, role: t.role, country: t.country, department: t.category, image: t.image || null, bio: t.bio || null },
      });
    } else {
      await prisma.teamMember.create({
        data: { id: seedId, name: t.name, role: t.role, country: t.country, department: t.category, image: t.image || null, bio: t.bio || null, order: i, published: true },
      });
    }
  }
  console.log(`✅ ${teamMembers.length} team members seeded`);

  // ─── EXECUTIVE BOARD ───
  for (let i = 0; i < executiveBoard.length; i++) {
    const b = executiveBoard[i];
    await prisma.executiveBoardMember.upsert({
      where: { id: `seed-exec-${slugify(b.name)}` },
      update: {
        name: b.name,
        role: b.role,
        country: b.country,
        image: b.image,
      },
      create: {
        id: `seed-exec-${slugify(b.name)}`,
        name: b.name,
        role: b.role,
        country: b.country,
        image: b.image,
        order: i,
        published: true,
      },
    });
  }
  console.log(`✅ ${executiveBoard.length} executive board members seeded`);

  // ─── ADVISORY BOARD ───
  for (let i = 0; i < advisoryBoard.length; i++) {
    const a = advisoryBoard[i];
    await prisma.advisoryBoardMember.upsert({
      where: { id: `seed-adv-${slugify(a.name)}` },
      update: {
        name: a.name,
        role: a.role,
        country: a.country,
        image: a.image,
      },
      create: {
        id: `seed-adv-${slugify(a.name)}`,
        name: a.name,
        role: a.role,
        country: a.country,
        image: a.image,
        order: i,
        published: true,
      },
    });
  }
  console.log(`✅ ${advisoryBoard.length} advisory board members seeded`);

  // ─── PARTNERS ───
  // Delete existing seeded partners first (by name pattern)
  for (let i = 0; i < partnerLogos.length; i++) {
    const p = partnerLogos[i];
    const existing = await prisma.partner.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: { name: p.name, logo: p.image },
      });
    } else {
      await prisma.partner.create({
        data: { name: p.name, logo: p.image, type: "Corporate", tier: "Gold", order: i, published: true },
      });
    }
  }
  console.log(`✅ ${partnerLogos.length} partners seeded`);

  // ─── PROGRAMS (Initiatives) ───
  for (let i = 0; i < initiatives.length; i++) {
    const prog = initiatives[i];
    await prisma.program.upsert({
      where: { slug: prog.slug },
      update: {
        name: prog.title,
        description: prog.fullDescription,
        shortDescription: prog.shortDescription,
        image: prog.image,
        impactMetrics: { beneficiaries: prog.beneficiaries, country: prog.country, category: prog.category, status: prog.status, highlights: prog.highlights, pillars: prog.pillars },
      },
      create: {
        name: prog.title,
        slug: prog.slug,
        description: prog.fullDescription,
        shortDescription: prog.shortDescription,
        image: prog.image,
        impactMetrics: { beneficiaries: prog.beneficiaries, country: prog.country, category: prog.category, status: prog.status, highlights: prog.highlights, pillars: prog.pillars },
        order: i,
        published: true,
      },
    });
  }
  await syncFuturePathways(prisma);
  console.log(`✅ ${initiatives.length + 1} programs seeded`);

  // ─── IMPACT STORIES ───
  // Phase 8.10 - documented gallery contract: Array<{ url, alt, caption? }>.
  // FTF's own published, consent-gated programme photos (hosted on Cloudinary).
  // Alt text and captions carry no identifying details for minors.
  const STORY_GALLERY: Record<string, { url: string; alt: string; caption?: string }[]> = {
    "from-abandonment-to-a-bright-future": [
      { url: "/images/stories/gallery-02.jpg", alt: "A young learner in a school uniform sitting close beside a care worker", caption: "A quiet moment of reassurance on school orientation day" },
      { url: "/images/stories/gallery-06.jpg", alt: "A care worker holding a smiling child in a school uniform", caption: "Held, safe and smiling - the everyday care behind every story" },
      { url: "/images/stories/gallery-10.jpg", alt: "A volunteer and a child in an orange programme shirt flashing peace signs at a colourful playground", caption: "Celebration day: peace signs and big smiles at the playground" },
      { url: "/images/stories/gallery-18.jpg", alt: "A care worker carrying a laughing child in a blue shirt", caption: "Joy on the way home from a programme visit" },
      { url: "/images/stories/gallery-21.jpg", alt: "A care worker holding a child in a red polka-dot top with a snack in hand", caption: "Comfort and care during a home visit" },
      { url: "/images/stories/gallery-24.jpg", alt: "A care worker crouching beside a child in a red school kit waving at the camera", caption: "First day of school, ready for a bright future" },
    ],
  };
  for (let i = 0; i < impactStories.length; i++) {
    const s = impactStories[i];
    const slug = slugify(s.title);
    const gallery = (STORY_GALLERY[slug] ?? []) as Prisma.InputJsonValue;
    await prisma.impactStory.upsert({
      where: { slug },
      update: {
        title: s.title,
        excerpt: s.story.slice(0, 160),
        content: `<p>${s.story}</p>`,
        featuredImage: s.image,
        childName: s.name,
        program: s.program,
        gallery,
        consentGiven: true,
      },
      create: {
        title: s.title,
        slug,
        excerpt: s.story.slice(0, 160),
        content: `<p>${s.story}</p>`,
        featuredImage: s.image,
        gallery,
        childName: s.name,
        program: s.program,
        published: true,
        consentGiven: true,
      },
    });
  }
  console.log(`✅ ${impactStories.length} impact stories seeded`);

  // ─── IMPACT STATS ───
  const stats = [
    { label: "Children Supported", value: 2500, suffix: "+", page: "home", order: 0 },
    { label: "Countries", value: 3, suffix: "", page: "home", order: 1 },
    { label: "Programs Running", value: 12, suffix: "+", page: "home", order: 2 },
    { label: "Volunteers", value: 150, suffix: "+", page: "home", order: 3 },
    { label: "Schools Reached", value: 35, suffix: "+", page: "impact", order: 0 },
    { label: "Meals Provided", value: 10000, suffix: "+", page: "impact", order: 1 },
    { label: "Books Donated", value: 5000, suffix: "+", page: "impact", order: 2 },
    { label: "Years of Impact", value: 10, suffix: "+", page: "about", order: 0 },
  ];
  for (const s of stats) {
    await prisma.impactStat.create({ data: s });
  }
  console.log(`✅ ${stats.length} impact stats seeded`);

  // ─── TESTIMONIALS ───
  const testimonials = [
    { quote: "FTF changed my life. I now have access to education and a bright future.", author: "Elizabeth", role: "Student Beneficiary", order: 0 },
    { quote: "The dedication of the FTF team to transforming young lives is remarkable.", author: "Foluke Babatunde-Lawal", role: "Executive Director, Nigeria", order: 1 },
    { quote: "Through FTF's mentorship, I discovered my passion for robotics and engineering.", author: "Prince Kojo", role: "Student, Asustem Robotics", order: 2 },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: { ...t, published: true } });
  }
  console.log(`✅ ${testimonials.length} testimonials seeded`);

  // ─── SITE SETTINGS ───
  const settings = [
    { key: "site_name", value: "For The Future Organization", description: "Official organization name" },
    { key: "site_tagline", value: "Empowering Children Worldwide", description: "Site tagline" },
    { key: "site_description", value: "A youth-led NGO transforming the lives of vulnerable children through education, mentorship, healthcare, and sustainable empowerment.", description: "Meta description" },
    { key: "currency", value: "GHS", description: "Default currency" },
    { key: "maintenance_mode", value: "false", description: "Enable maintenance mode" },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value, description: s.description },
    });
  }
  console.log(`✅ ${settings.length} site settings seeded`);

  // ─── LEGAL PAGES ───
  const legalPages = [
    { slug: "privacy", title: "Privacy Policy", content: PRIVACY_CONTENT },
    { slug: "terms", title: "Terms of Service", content: TERMS_CONTENT },
    { slug: "cookies", title: "Cookie Policy", content: COOKIES_CONTENT },
  ];
  for (const lp of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: lp.slug },
      update: { content: lp.content, title: lp.title, lastUpdated: new Date() },
      create: { slug: lp.slug, title: lp.title, content: lp.content },
    });
  }
  console.log("✅ Legal pages seeded");

  // ─── SHIPPING ZONES ───
  const zones = [
    { region: "Greater Accra", fee: 2000, freeThreshold: 30000, pickupEnabled: true, pickupAddress: "Jamestown, Accra" },
    { region: "Ashanti", fee: 3500, freeThreshold: 50000 },
    { region: "Western", fee: 3000, freeThreshold: 40000 },
    { region: "Eastern", fee: 2500, freeThreshold: 35000 },
    { region: "Nigeria", fee: 5000, freeThreshold: 75000 },
  ];
  for (const z of zones) {
    await prisma.shippingZone.create({ data: z });
  }
  console.log(`✅ ${zones.length} shipping zones seeded`);

  console.log("\n🎉 Seed complete! All site content is now in the database.");
  console.log("\n📋 Admin login: admin@ftf.org / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
