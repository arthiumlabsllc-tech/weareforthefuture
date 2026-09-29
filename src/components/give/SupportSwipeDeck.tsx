"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Case routes require document navigation to keep the analytics boundary intact. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import BeneficiaryCard, { caseOutline } from "./BeneficiaryCard";
import SupportDrawer from "./SupportDrawer";
import { pageSchema, useCaseHydrated, type CasePage } from "./case-client";

const storageKey = "ftf:case-browser:v1";
const viewButton = `${caseOutline} aria-pressed:border-primary aria-pressed:bg-info-bg aria-pressed:text-info-text aria-pressed:hover:bg-info-bg`;
type Position = { cursor: string | null; index: number; view: "list" | "deck" };

export default function SupportSwipeDeck({ initial, initialCursor = null, archive = false }: {
  initial: CasePage | null; initialCursor?: string | null; archive?: boolean;
}) {
  const hydrated = useCaseHydrated();
  const [page, setPage] = useState(initial);
  const [view, setView] = useState<"list" | "deck">("list");
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initial ? "" : "Cases could not be loaded. Please try again.");
  const [announcement, setAnnouncement] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const position = useRef<Position>({ cursor: initialCursor, index: 0, view: "list" });
  const [trail, setTrail] = useState<(string | null)[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [nextCursor, setNextCursor] = useState(initial?.nextCursor ?? null);
  const history = useRef<(string | null)[]>([]);
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const deck = useRef<HTMLDivElement>(null);
  const movingCard = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; dx: number; width: number; horizontal: boolean } | null>(null);
  const reduced = useRef(false);
  const frame = useRef<number | null>(null);
  const animation = useRef<Animation | null>(null);

  const remember = useCallback((next: Partial<Position>) => {
    position.current = { ...position.current, ...next };
    if (!archive) try { sessionStorage.setItem(storageKey, JSON.stringify(position.current)); } catch { /* Storage is optional. */ }
  }, [archive]);

  const load = useCallback(async (cursor: string | null, targetIndex = 0, nextTrail = history.current, nextView?: Position["view"]) => {
    request.current?.abort();
    // Keep the intended position for retry, but persist it only after a fresh response.
    position.current = { ...position.current, cursor, index: targetIndex };
    history.current = nextTrail;
    setCursor(cursor); setTrail(nextTrail);
    const controller = new AbortController(); request.current = controller; busy.current = true;
    setPending(true); setError(""); setPage(null); setExhausted(false);
    try {
      const query = new URLSearchParams({ archive: String(archive), ...(cursor ? { cursor } : {}) });
      const response = await fetch(`/api/support-a-future/cases?${query}`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
      if (!response.ok) throw new Error("unavailable");
      const result = pageSchema.parse(await response.json());
      if (controller.signal.aborted) return;
      const nextIndex = Math.max(0, Math.min(targetIndex, result.cases.length - 1));
      setPage(result); setIndex(nextIndex); setNextCursor(result.nextCursor);
      if (nextView) setView(nextView);
      remember({ cursor, index: nextIndex, ...(nextView ? { view: nextView } : {}) });
      setAnnouncement(result.cases.length ? `Case ${nextIndex + 1} of ${result.cases.length} on this page. Current consent and funding checked.` : result.nextCursor ? "No eligible cases on this page. More pages are available." : "No further eligible cases on this page.");
    } catch { if (!controller.signal.aborted) setError("Cases could not be checked. Reconnect and retry; previously viewed profiles are hidden."); }
    finally { if (!controller.signal.aborted) { setPending(false); busy.current = false; request.current = null; } }
  }, [archive, remember]);

  useEffect(() => {
    // Restore browser-only preferences after hydration; cancel discarded mounts.
    const restoreTimer = window.setTimeout(() => {
      if (archive) return;
      try {
        const stored = JSON.parse(sessionStorage.getItem(storageKey) || "null");
        if (stored && ["list", "deck"].includes(stored.view)) {
          const fromStart = new URLSearchParams(window.location.search).get("start") === "1";
          const restore = !fromStart && !initialCursor && (stored.cursor === null || typeof stored.cursor === "string" && stored.cursor.length <= 400) && Number.isInteger(stored.index) && stored.index >= 0 && stored.index < 20;
          void load(restore ? stored.cursor : initialCursor, restore ? stored.index : 0, [], stored.view);
        }
      } catch { /* A missing or invalid saved position does not block browsing. */ }
    }, 0);
    const refresh = () => {
      if (document.hidden) { request.current?.abort(); busy.current = true; setPage(null); setPending(true); }
      else void load(position.current.cursor, position.current.index);
    };
    window.addEventListener("focus", refresh); window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearTimeout(restoreTimer); request.current?.abort(); window.removeEventListener("focus", refresh); window.removeEventListener("pageshow", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [archive, initialCursor, load]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = media.matches;
      if (media.matches) {
        if (frame.current !== null) { cancelAnimationFrame(frame.current); frame.current = null; }
        animation.current?.cancel();
        if (movingCard.current) movingCard.current.style.transform = "";
      }
    };
    update(); media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); if (frame.current !== null) cancelAnimationFrame(frame.current); animation.current?.cancel(); };
  }, []);

  function changeView(next: "list" | "deck") {
    setView(next); remember({ view: next }); setExhausted(false);
    void load(position.current.cursor, position.current.index);
  }
  function next() {
    if (busy.current || !page) return;
    if (index + 1 < page.cases.length) void load(position.current.cursor, index + 1);
    else if (page.nextCursor) void load(page.nextCursor, 0, [...history.current, position.current.cursor]);
    else { setExhausted(true); setAnnouncement("You’re all caught up. No further pages remain. You can revisit cases or refresh."); }
  }
  function previous() {
    if (busy.current) return;
    if (exhausted) { void load(position.current.cursor, position.current.index); return; }
    if (page && index > 0) void load(position.current.cursor, index - 1);
    else if (history.current.length) void load(history.current.at(-1)!, 19, history.current.slice(0, -1));
  }
  function support(publicId: string) {
    if (!busy.current) setSelected(publicId);
  }
  function cancelDrag() {
    const point = drag.current;
    const dx = point?.dx ?? 0;
    drag.current = null;
    if (point && deck.current?.hasPointerCapture(point.id)) deck.current.releasePointerCapture(point.id);
    if (frame.current !== null) { cancelAnimationFrame(frame.current); frame.current = null; }
    if (movingCard.current) {
      movingCard.current.style.transform = "";
      if (!reduced.current && dx) animation.current = movingCard.current.animate([{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }], { duration: 250, easing: "ease-out" });
    }
  }
  const current = page?.cases[index];
  const root = `/give/support-a-future${archive ? "/archive" : ""}`;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 id="case-browser-heading" tabIndex={-1} className="font-[family-name:var(--font-display)] text-3xl text-text-primary">{archive ? "Funded needs" : "Needs open for support"}</h2>
        <p className="mt-2 max-w-[620px] text-text-secondary">{archive ? "Funding targets met, with publication still subject to consent. Funding is not a claim that every outcome is complete." : "Oldest published needs first. Each gift supports a verified need managed by FTF."}</p></div>
      {hydrated && !archive && <div role="group" aria-label="Case view" className="flex flex-wrap gap-2">
        <button type="button" className={viewButton} aria-pressed={view === "list"} onClick={() => changeView("list")}><Check aria-hidden="true" className={`h-4 w-4 shrink-0 ${view === "list" ? "" : "invisible"}`} />List view</button>
        <button type="button" className={viewButton} aria-pressed={view === "deck"} onClick={() => changeView("deck")}><Check aria-hidden="true" className={`h-4 w-4 shrink-0 ${view === "deck" ? "" : "invisible"}`} />Deck view</button>
      </div>}
    </div>
    {page && !archive && !page.checkoutEnabled && <p className="rounded-xl bg-info-bg p-4 text-info-text">Case giving is not open yet. Browse approved needs or explore <a href="/give" className="underline">other giving routes</a>.</p>}
    <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-text-secondary">{pending ? "Checking current consent and funding…" : announcement}</p>
    {error && <p role="alert" className="rounded-xl border border-error/20 bg-error-bg p-4 text-error-text">{error}</p>}
    <div aria-busy={pending}>
      {view === "deck" && !archive && <div className="mx-auto max-w-[620px] space-y-4">
        <p id="deck-help" className="text-sm text-text-secondary">Swipe right to open support; left for the next need. Neither gesture charges money or judges a person. On the navigation surface, arrow keys browse and Enter opens support.</p>
        <div ref={deck} tabIndex={0} role="group" aria-label="Case deck navigation" aria-describedby="deck-help" className="overflow-x-clip rounded-2xl" style={{ touchAction: "pan-y pinch-zoom" }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.key === "ArrowRight") { event.preventDefault(); next(); }
            if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
            if (event.key === "Enter" && current && !exhausted) { event.preventDefault(); support(current.publicId); }
          }}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0 || busy.current || !current || exhausted || (event.target as HTMLElement).closest("a,button,input,select,textarea")) return;
            animation.current?.cancel();
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, width: event.currentTarget.clientWidth, horizontal: false };
          }}
          onPointerMove={(event) => {
            const point = drag.current;
            if (!point || point.id !== event.pointerId) return;
            const dx = event.clientX - point.x; const dy = event.clientY - point.y;
            if (!point.horizontal) {
              if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { cancelDrag(); return; }
              if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
              point.horizontal = true; event.currentTarget.setPointerCapture(event.pointerId);
            }
            point.dx = Math.max(-point.width, Math.min(point.width, dx));
            if (!reduced.current && frame.current === null) frame.current = requestAnimationFrame(() => { if (!reduced.current && movingCard.current && drag.current) movingCard.current.style.transform = `translateX(${drag.current.dx}px)`; frame.current = null; });
          }}
          onPointerUp={(event) => {
            const point = drag.current;
            if (!point || point.id !== event.pointerId) return;
            const commit = point.horizontal && Math.abs(point.dx) > point.width * 0.25;
            const right = point.dx > 0;
            cancelDrag();
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            if (commit) { deck.current?.focus({ preventScroll: true }); if (right && current) support(current.publicId); else next(); }
          }} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}>
          {current && !exhausted && <div ref={movingCard}><BeneficiaryCard record={current} interactive onSupport={() => support(current.publicId)} /></div>}
          {exhausted && <div className="rounded-2xl border border-dashed border-border bg-surface p-8"><h3 className="text-2xl text-text-primary">You’re all caught up</h3><p className="mt-3 text-text-secondary">No further pages remain. Use Previous to revisit the last need, List view to review this page, or refresh.</p></div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className={caseOutline} aria-disabled={pending || !exhausted && (!page || index === 0) && !trail.length} onClick={previous}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Previous</button>
          <p className="text-sm tabular-nums text-text-secondary">{current && page ? `Case ${index + 1} of ${page.cases.length} on this page` : pending ? "Checking this page…" : page ? "No eligible cases on this page" : "Page unavailable"}</p>
          <button type="button" className={caseOutline} aria-disabled={pending || !page || exhausted} onClick={() => { if (!exhausted) next(); }}>Next<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        </div>
      </div>}
      {(view === "list" || archive) && page && <ul className="grid gap-6 lg:grid-cols-2">{page.cases.map((record) => <li key={record.publicId}><BeneficiaryCard record={record} archive={archive} interactive={hydrated} onSupport={() => support(record.publicId)} /></li>)}</ul>}
      {page && !page.cases.length && <div className="rounded-2xl border border-dashed border-border bg-surface p-6">
        <h3 className="text-2xl text-text-primary">{page.nextCursor ? "No eligible cases on this page" : cursor ? "No further eligible cases" : archive ? "No funded needs are currently published" : "No needs are currently open"}</h3>
        <p className="mt-3 text-text-secondary">{page.nextCursor ? "Continue to the next page before finishing your search." : "Publication depends on current consent and safeguarding review. You can explore other giving routes or check again later."}</p>
      </div>}
    </div>
    <nav aria-label="Case pages" className="flex flex-wrap gap-3">
      {hydrated ? <button type="button" className={caseOutline} aria-disabled={pending || !page || !nextCursor} onClick={() => { if (!busy.current && page && nextCursor) void load(nextCursor, 0, [...history.current, position.current.cursor]); }}>Next page</button> : page?.nextCursor && <a className={caseOutline} href={`${root}?cursor=${encodeURIComponent(page.nextCursor)}`}>Next page</a>}
      <a className={caseOutline} href={`${root}?start=1`} onClick={(event) => {
        if (!hydrated || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (!archive) try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
        void load(null, 0, []);
      }}>Review cases from the start</a>
      {hydrated && <button type="button" className={caseOutline} aria-disabled={pending} onClick={() => { if (!busy.current) void load(position.current.cursor, position.current.index); }}>Refresh cases</button>}
    </nav>
    <noscript><p className="text-text-secondary">The case list and detail links work without JavaScript. Enable JavaScript to use the deck and payment drawer. Opening a case never starts a payment.</p></noscript>
    {selected && <SupportDrawer key={selected} publicId={selected} onClose={() => setSelected(null)} />}
  </div>;
}
