import { PrismaClient } from "@prisma/client";
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
import { syncFuturePathways } from "./future-pathways";

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

  // ─── BLOG CATEGORIES ───
  const blogCats = ["News", "Impact", "Programs", "Events", "Stories"];
  for (let i = 0; i < blogCats.length; i++) {
    const name = blogCats[i];
    await prisma.blogCategory.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), order: i },
    });
  }
  console.log(`✅ ${blogCats.length} blog categories seeded`);

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
  for (let i = 0; i < impactStories.length; i++) {
    const s = impactStories[i];
    const slug = slugify(s.title);
    await prisma.impactStory.upsert({
      where: { slug },
      update: {
        title: s.title,
        excerpt: s.story.slice(0, 160),
        content: `<p>${s.story}</p>`,
        featuredImage: s.image,
        childName: s.name,
        program: s.program,
        consentGiven: true,
      },
      create: {
        title: s.title,
        slug,
        excerpt: s.story.slice(0, 160),
        content: `<p>${s.story}</p>`,
        featuredImage: s.image,
        gallery: [],
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
    { key: "site_description", value: "A youth-led NGO transforming the lives of underprivileged children through education, mentorship, healthcare, and sustainable empowerment.", description: "Meta description" },
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
  for (const slug of ["privacy", "terms"]) {
    await prisma.legalPage.upsert({
      where: { slug },
      update: {},
      create: { slug, title: slug === "privacy" ? "Privacy Policy" : "Terms of Service", content: "<p>Content to be updated.</p>" },
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
