// Manual runtime verification for the Future Pathways release.
// Usage: npm run verify:future-pathways   (requires a running server, e.g. npm run dev)
// Override target with BASE_URL=https://... when checking a deployed environment.

const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const failures = [];

function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
}

async function get(path, options) {
  const response = await fetch(base + path, options);
  // React splits interpolated SSR text with comment nodes; strip them so
  // rendered copy can be matched as plain strings.
  return { response, text: (await response.text()).replaceAll("<!-- -->", "") };
}

async function main() {
  // 1. Programme detail page content and privacy constraints.
  const detail = await get("/initiatives/future-pathways");
  check("detail page responds 200", detail.response.status === 200, `status ${detail.response.status}`);
  for (const stage of ["Identify", "Prepare", "Train", "Place", "Launch", "Employ"]) {
    check(`stage present: ${stage}`, detail.text.includes(`>${stage}<`) || detail.text.includes(stage));
  }
  const running = (detail.text.match(/Running today/g) || []).length;
  const seeking = (detail.text.match(/Seeking partners/g) || []).length;
  check("four running stages plus legend", running >= 5, `found ${running}`);
  check("two partner-seeking stages plus legend", seeking >= 3, `found ${seeking}`);
  check("launch date shown", detail.text.includes("February 2025"));
  check("rename history shown", detail.text.includes("Previously known as Project Future Ready"));
  check("partnership anchor present", detail.text.includes('id="partner"'));
  check("pathway anchor present", detail.text.includes('id="pathway"'));
  check("partnership mailto present", detail.text.includes("mailto:"));
  for (const term of ["Prince", "Kojo", "Delight", "Montessori", "Cape Coast", "West African Vehicle", "WhatsApp"]) {
    check(`identifiable source term absent: ${term}`, !detail.text.includes(term));
  }

  // 2. Stylesheet carries the theme tokens and stage colours used by the page.
  const cssPaths = [...new Set(detail.text.match(/\/_next\/[^"'\s]+?\.css/g) || [])];
  let cssOk = false;
  for (const path of cssPaths) {
    const css = await (await fetch(base + path)).text();
    if (css.includes("--ftf-primary:") && css.includes(".bg-blue-600") && css.includes(".bg-royal")) cssOk = true;
  }
  check("stylesheet includes theme tokens and stage colours", cssOk, `${cssPaths.length} stylesheet(s)`);

  // 3. Listing page links to the detail page.
  const listing = await get("/initiatives");
  check("listing responds 200", listing.response.status === 200);
  check("listing links to detail page", listing.text.includes("/initiatives/future-pathways"));
  check("listing shows explore CTA", listing.text.includes("Explore Future Pathways"));

  // 4. Public API ordering and privacy-safe metrics.
  const api = await get("/api/programs");
  const programs = JSON.parse(api.text).programs || [];
  check("API responds 200", api.response.status === 200);
  check("Future Pathways featured first", programs[0]?.slug === "future-pathways" && programs[0]?.featured === true);
  check("API exposes detail href", programs[0]?.href === "/initiatives/future-pathways");
  check("API keeps beneficiary count unknown", programs[0]?.beneficiaries === null);

  // 5. Legacy URL redirects.
  for (const path of ["/project-future-ready", "/initiatives/project-future-ready", "/future-pathways"]) {
    const redirect = await get(path, { redirect: "manual" });
    check(`legacy redirect ${path}`, redirect.response.status === 308 && (redirect.response.headers.get("location") || "").endsWith("/initiatives/future-pathways"), `status ${redirect.response.status}`);
  }

  // 6. Unknown programme slugs 404 instead of rendering empty shells.
  const missing = await get("/initiatives/does-not-exist");
  check("unknown slug returns 404", missing.response.status === 404, `status ${missing.response.status}`);

  // 7. Sitemap includes the published detail URL.
  const sitemap = await get("/sitemap.xml");
  check("sitemap lists detail page", sitemap.text.includes("https://weareforthefuture.org/initiatives/future-pathways"));

  // 8. Homepage still renders and keeps the featured programmes section.
  const home = await get("/");
  check("homepage responds 200", home.response.status === 200);
  check("homepage keeps featured section", home.text.includes("Featured Initiatives"));

  // 9. Rebrand tokens, five-pillar structure and supporter login chrome.
  const css = cssPaths.length ? await (await fetch(base + cssPaths[0])).text() : "";
  check("brand blue #3973B8 in stylesheet", css.toLowerCase().includes("#3973b8"));
  check("brand green #4CB64D in stylesheet", css.toLowerCase().includes("#4cb64d"));
  check("brand charcoal #494949 in stylesheet", css.toLowerCase().includes("#494949"));
  check("legacy cream brand removed", !css.toLowerCase().includes("#fdf8f0"));
  check("nav label is Our Work", home.text.includes("Our Work"));
  check("homepage links to pillar anchors", home.text.includes("/initiatives#pillar-"));
  check("homepage shows five-pillar strip", home.text.includes("Our Five Pillars"));
  check("listing groups initiatives by pillar", listing.text.includes('id="pillar-foundational-education"') && listing.text.includes('id="pillar-community-family-support"'));
  check("listing includes static initiatives", listing.text.includes("Sponsor A Child") && listing.text.includes("Empower Her, Period"));
  check("future pathways tagged to pillar 3", listing.text.includes("Future-Ready Skills"));
  const login = await get("/supporter-login");
  check("supporter login responds 200", login.response.status === 200);
  check("supporter login renders no header", !login.text.includes("<header"));
  check("supporter login shows brand panel", login.text.includes("One account for every act of kindness."));
  check("supporter login has back-to-site link", login.text.includes("Back to site"));
  const register = await get("/register");
  check("register renders no header", register.response.status === 200 && !register.text.includes("<header"));

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed against ${base}`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll checks passed against ${base}`);
  }
}

main().catch((error) => {
  console.error(`Verification could not reach ${base}. Start the site first (npm run dev).`, error.message);
  process.exitCode = 1;
});
