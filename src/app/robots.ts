import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/supporter-login", "/register", "/my-account"],
    },
    sitemap: "https://weareforthefuture.org/sitemap.xml",
  };
}
