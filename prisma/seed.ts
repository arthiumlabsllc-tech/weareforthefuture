import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ftf.org" },
    update: {},
    create: {
      email: "admin@ftf.org",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });
  console.log(`✅ Super Admin created: ${admin.email} (password: admin123)`);

  // Create default blog categories
  const categories = ["News", "Impact", "Programs", "Events", "Stories"];
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.blogCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`✅ ${categories.length} blog categories created`);

  // Create default product categories
  const productCategories = ["Education", "Health", "Merchandise", "Gifts", "Essentials"];
  for (const name of productCategories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`✅ ${productCategories.length} product categories created`);

  // Create default site settings
  const settings = [
    { key: "site_name", value: "For The Future Organization", description: "Organization name" },
    { key: "site_tagline", value: "Empowering Children, Transforming Futures", description: "Site tagline" },
    { key: "site_description", value: "FTF is dedicated to providing education, healthcare, and hope to children across Africa.", description: "Site description for SEO" },
    { key: "currency", value: "GHS", description: "Default currency" },
    { key: "maintenance_mode", value: false, description: "Enable maintenance mode" },
  ];
  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ ${settings.length} site settings created`);

  // Create legal pages
  await prisma.legalPage.upsert({
    where: { slug: "privacy" },
    update: {},
    create: {
      slug: "privacy",
      title: "Privacy Policy",
      content: "<p>Privacy policy content will be added via the admin dashboard.</p>",
    },
  });
  await prisma.legalPage.upsert({
    where: { slug: "terms" },
    update: {},
    create: {
      slug: "terms",
      title: "Terms & Conditions",
      content: "<p>Terms and conditions content will be added via the admin dashboard.</p>",
    },
  });
  console.log("✅ Legal pages created (privacy, terms)");

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: admin@ftf.org");
  console.log("   Password: admin123");
  console.log("\n⚠️  Change the password immediately after first login!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
