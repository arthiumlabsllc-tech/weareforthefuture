import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Handshake, ShieldCheck } from "lucide-react";
import { getPublicProgramme } from "@/lib/programmes";
import { siteConfig } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getPublicProgramme(slug);
  if (!program) return { title: "Programme not found" };
  return {
    title: `${program.name} | Our Work`,
    description: program.shortDescription || program.description,
    alternates: { canonical: `/initiatives/${encodeURIComponent(program.slug)}` },
    openGraph: { title: program.name, description: program.shortDescription || program.description, type: "website" },
  };
}

export default async function ProgrammePage({ params }: Props) {
  const { slug } = await params;
  const program = await getPublicProgramme(slug);
  if (!program) notFound();
  const { detail, metrics } = program;
  const email = siteConfig.contact.emails[0];
  const partnerHref = `mailto:${email}?subject=${encodeURIComponent(`${program.name} partnership enquiry`)}`;
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

  return (
    <>
      <section className="relative overflow-hidden bg-royal pt-36 pb-20 text-text-on-primary">
        <div aria-hidden="true" className="absolute -right-24 top-20 h-96 w-96 rounded-full border-[48px] border-accent/10" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-text-on-primary/75">
            <Link href="/" className={`hover:underline ${focus}`}>Home</Link><span aria-hidden="true">/</span>
            <Link href="/initiatives" className={`hover:underline ${focus}`}>Our Work</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{program.name}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                {(metrics.pillars || []).map((pillar) => <span key={pillar} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white">{pillar}</span>)}
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold sm:text-6xl">{program.name}</h1>
              <p className="mt-4 text-2xl font-medium text-accent-bright sm:text-3xl">{detail.headline}</p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-on-primary/80">{program.shortDescription}</p>
              {detail.formerName && <p className="mt-3 text-sm text-text-on-primary/70">Previously known as {detail.formerName}.</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#partner" className={`rounded-full bg-cta px-6 py-3 font-semibold text-on-cta ${focus}`}>Partner with this programme</a>
                <a href="#pathway" className={`rounded-full border border-white/40 px-6 py-3 font-semibold hover:bg-white/10 ${focus}`}>Explore the pathway</a>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-white/20 bg-white/5 p-6">
              <div><dt className="text-sm text-text-on-primary/70">Launched</dt><dd className="mt-2 font-semibold">{detail.launched}</dd></div>
              <div><dt className="text-sm text-text-on-primary/70">Current delivery</dt><dd className="mt-2 font-semibold">{metrics.country}</dd></div>
              <div className="col-span-2"><dt className="text-sm text-text-on-primary/70">Programme status</dt><dd className="mt-2 font-semibold capitalize">{metrics.status || "active"}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20" aria-labelledby="challenge-heading">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div><p className="mb-3 text-sm font-semibold uppercase tracking-widest text-warning-text">The opportunity</p><h2 id="challenge-heading" className="text-3xl font-bold text-text-primary">Talent is not the barrier. Access is.</h2><p className="mt-5 leading-relaxed text-text-secondary">{program.description}</p></div>
          <p className="text-lg leading-relaxed text-text-secondary">{detail.challenge}</p>
        </div>
      </section>

      <section id="pathway" className="scroll-mt-28 bg-bg-secondary py-16 sm:py-20" aria-labelledby="pathway-heading">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-warning-text">The programme model</p>
          <h2 id="pathway-heading" className="text-3xl font-bold text-text-primary">One connected pathway</h2>
          <p className="mt-5 max-w-3xl leading-relaxed text-text-secondary">{detail.evidenceSummary}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
            <span className="rounded-lg bg-blue-600 px-3 py-2 text-text-on-primary">Running today</span>
            <span className="rounded-lg bg-amber-100 px-3 py-2 text-amber-950">Seeking partners to build</span>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {detail.stages.map((stage, index) => (
              <li key={index} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className={`flex items-center justify-between px-5 py-4 font-bold ${stage.status === "running" ? "bg-blue-600 text-text-on-primary" : "bg-amber-100 text-amber-950"}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span><ArrowRight aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="p-5"><h3 className="text-xl font-bold text-text-primary">{stage.name}</h3><p className="mt-3 text-sm leading-relaxed text-text-secondary">{stage.description}</p><p className={`mt-5 text-xs font-semibold ${stage.status === "running" ? "text-text-primary" : "text-warning-text"}`}>{stage.status === "running" ? "Running today" : "Seeking partners"}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20" aria-labelledby="progress-heading">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-warning-text">Progress, not promises</p>
          <h2 id="progress-heading" className="text-3xl font-bold text-text-primary">Individual journeys show what is possible</h2>
          <p className="mt-4 text-text-secondary">Anonymized programme examples. Identifiable stories remain subject to consent and safeguarding approval.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {detail.evidence.map((story, index) => <article key={index} className="rounded-2xl border border-border p-7"><h3 className="text-xl font-bold text-text-primary">{story.title}</h3><p className="mt-4 leading-relaxed text-text-secondary">{story.description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="partner" className="scroll-mt-28 bg-royal py-16 text-text-on-primary sm:py-20" aria-labelledby="partner-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
          <div><Handshake aria-hidden="true" className="mb-5 h-10 w-10 text-accent-bright" /><h2 id="partner-heading" className="text-3xl font-bold">Help build the next stage</h2><p className="mt-5 leading-relaxed text-text-on-primary/80">{detail.partnershipIntro}</p><a href={partnerHref} className={`mt-7 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 font-semibold text-on-cta ${focus}`}>Discuss a partnership <ArrowRight aria-hidden="true" className="h-4 w-4" /></a><p className="mt-4 text-sm text-text-on-primary/75">Email FTF at <a href={partnerHref} className="break-all underline">{email}</a>. Support is coordinated through FTF.</p></div>
          <ul className="space-y-4 self-center">{detail.partnershipOptions.map((option, index) => <li key={index} className="flex items-start gap-3 rounded-xl border border-white/20 p-4"><Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright" /><span>{option}</span></li>)}</ul>
        </div>
      </section>

      <section className="bg-bg-secondary py-16 sm:py-20" aria-labelledby="scaling-heading">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 id="scaling-heading" className="text-3xl font-bold text-text-primary">Scaling the model</h2>
          <p className="mt-4 text-text-secondary">A phased ambition, subject to partnerships and funding.</p>
          <ol className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{detail.roadmap.map((phase, index) => <li key={index} className="rounded-2xl border border-border bg-surface p-6"><h3 className="font-bold text-text-primary">{phase.title}</h3><p className="mt-4 text-sm leading-relaxed text-text-secondary">{phase.description}</p></li>)}</ol>
          <aside className="mt-10 flex items-start gap-4 rounded-2xl border border-border p-6"><ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-warning-text" /><div><h3 className="font-bold text-text-primary">Dignity and safeguarding come first</h3><p className="mt-2 text-sm leading-relaxed text-text-secondary">{detail.safeguarding}</p></div></aside>
          <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold text-text-primary"><Link href="/initiatives" className="underline">Explore our other programmes</Link><Link href="/donate" className="underline">Give to FTF’s general work</Link><Link href="/volunteer" className="underline">Learn about volunteering</Link></div>
        </div>
      </section>
    </>
  );
}
