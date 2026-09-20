// Phase 6.6: editorial post body.
//
// Parses CMS content into a typed block model and renders React elements only —
// raw CMS HTML is never injected (project convention). Two source shapes are
// supported:
//   1. HTML from the rich-text editor (<p>, <h2>-<h4>, <blockquote>, <ul>/<ol>,
//      <img>, inline <a>/<strong>/<em>/<br>); unknown tags are dropped.
//   2. Markdown-ish plain text (## / ### headings, > quotes, - / 1. lists,
//      [label](url), **bold**, *italic*, blank-line paragraphs, single newlines
//      as <br />).
// Short standalone quotes render as centred pull-quotes; longer ones as
// left-bordered blockquotes.
import type { ReactNode } from "react";

export type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; text: string; cite?: string; pull: boolean }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "image"; src: string; alt: string; caption?: string };

/* ------------------------------------------------------------------ utils */

const decodeEntities = (s: string): string =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013");

/** Convert safe inline HTML to markdown-ish text; unknown tags are stripped. */
const inlineHtmlToText = (s: string): string =>
  decodeEntities(
    s
      .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  ).trim();

const attr = (attrs: string, name: string): string => {
  const m = attrs.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? decodeEntities(m[1]) : "";
};

/** A quote with no citation and under ~140 chars reads as a pull-quote. */
const isPullQuote = (text: string, cite?: string): boolean => !cite && text.length <= 140;

/** Split "Some words. — Author, role" into text + citation. */
const splitCitation = (raw: string): { text: string; cite?: string } => {
  const m = raw.match(/^(.*?)[\n]*\s*(?:\u2014|--|\u2013)\s*([^.\n][^\n]{1,80})$/);
  if (m && m[1].trim()) return { text: m[1].trim(), cite: m[2].trim() };
  return { text: raw.trim() };
};

/* --------------------------------------------------------------- parsers */

const looksLikeHtml = (s: string): boolean => /<\/?(p|h[1-6]|blockquote|ul|ol|li|img|figure|div|br)\b/i.test(s);

function parseHtml(content: string): Block[] {
  const blocks: Block[] = [];
  const re =
    /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>|<blockquote\b([^>]*)>([\s\S]*?)<\/blockquote>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\6>|<img\b([^>]*?)\/?>|<(p|div)\b[^>]*>([\s\S]*?)<\/\9>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) {
      const level = Number(m[1]);
      const text = inlineHtmlToText(m[3]);
      if (text) blocks.push({ kind: "heading", level: level <= 2 ? 2 : 3, text });
    } else if (m[4] !== undefined) {
      const text = inlineHtmlToText(m[5]);
      if (text) {
        const { text: q, cite } = splitCitation(text);
        blocks.push({ kind: "quote", text: q, ...(cite ? { cite } : {}), pull: isPullQuote(q, cite) });
      }
    } else if (m[6]) {
      const items = [...m[7].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => inlineHtmlToText(li[1]))
        .filter(Boolean);
      if (items.length) blocks.push({ kind: "list", ordered: m[6].toLowerCase() === "ol", items });
    } else if (m[8] !== undefined) {
      const src = attr(m[8], "src");
      const alt = attr(m[8], "alt");
      if (src) blocks.push({ kind: "image", src, alt: alt || "Article image" });
    } else if (m[9]) {
      const text = inlineHtmlToText(m[10]);
      if (text) blocks.push({ kind: "paragraph", text });
    }
  }
  return blocks;
}

function parsePlain(content: string): Block[] {
  const blocks: Block[] = [];
  const chunks = content
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);

    const heading = chunk.match(/^(#{1,6})\s+(.*)$/);
    if (heading && lines.length === 1) {
      blocks.push({ kind: "heading", level: heading[1].length <= 2 ? 2 : 3, text: heading[2].trim() });
      continue;
    }

    const image = chunk.match(/^!\[([^\]]*)\]\(([^)\s]+)\)(?:\s*\n+([\s\S]+))?$/);
    if (image) {
      blocks.push({
        kind: "image",
        src: image[2],
        alt: image[1] || "Article image",
        ...(image[3] ? { caption: image[3].trim() } : {}),
      });
      continue;
    }

    if (lines.every((l) => /^\s*>\s?/.test(l))) {
      const text = lines.map((l) => l.replace(/^\s*>\s?/, "")).join(" ");
      const { text: q, cite } = splitCitation(text);
      blocks.push({ kind: "quote", text: q, ...(cite ? { cite } : {}), pull: isPullQuote(q, cite) });
      continue;
    }

    if (lines.length > 1 || /^\s*[-*+]\s+/.test(lines[0] ?? "")) {
      if (lines.every((l) => /^\s*[-*+]\s+/.test(l))) {
        blocks.push({ kind: "list", ordered: false, items: lines.map((l) => l.replace(/^\s*[-*+]\s+/, "")) });
        continue;
      }
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        blocks.push({ kind: "list", ordered: true, items: lines.map((l) => l.replace(/^\s*\d+[.)]\s+/, "")) });
        continue;
      }
    }

    blocks.push({ kind: "paragraph", text: chunk });
  }
  return blocks;
}

export function parsePostContent(content: string): Block[] {
  if (!content || !content.trim()) return [];
  const blocks = looksLikeHtml(content) ? parseHtml(content) : [];
  if (blocks.length) return blocks;
  // Plain text, or HTML so malformed nothing matched: strip tags, parse as text.
  const asText = looksLikeHtml(content) ? inlineHtmlToText(content) : content;
  return parsePlain(asText);
}

/* ------------------------------------------------------------- rendering */

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g;

const safeHref = (href: string): string | null => {
  const h = href.trim();
  if (/^(https?:|mailto:)/i.test(h)) return h;
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  return null;
};

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  text.split(INLINE).forEach((part, i) => {
    if (!part) return;
    const key = `${keyBase}-${i}`;

    if (/^(\*\*[^*]+\*\*|__[^_]+__)$/.test(part)) {
      nodes.push(
        <strong key={key} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>,
      );
      return;
    }
    if (/^\*[^*\n]+\*$/.test(part)) {
      nodes.push(<em key={key}>{part.slice(1, -1)}</em>);
      return;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) {
        nodes.push(<span key={key}>{link[1]}</span>);
        return;
      }
      const external = /^https?:/i.test(href);
      nodes.push(
        <a
          key={key}
          href={href}
          className="text-text-link underline decoration-accent/50 underline-offset-2 transition-colors hover:text-text-link-hover hover:decoration-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>,
      );
      return;
    }
    // Plain text: keep single newlines as line breaks.
    part.split("\n").forEach((line, j) => {
      if (j > 0) nodes.push(<br key={`${key}-br-${j}`} />);
      if (line) nodes.push(<span key={`${key}-t-${j}`}>{line}</span>);
    });
  });
  return nodes;
}

export default function PostBody({ content }: { content: string }) {
  const blocks = parsePostContent(content);
  if (!blocks.length) return null;

  let paragraphIndex = 0;

  return (
    <div className="[&>*:first-child]:mt-0">
      {blocks.map((block, i) => {
        const key = `b-${i}`;

        if (block.kind === "heading") {
          return block.level === 2 ? (
            <h2
              key={key}
              className="mt-16 mb-4 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.2] tracking-[-0.01em] text-text-primary"
            >
              {renderInline(block.text, `${key}-h`)}
            </h2>
          ) : (
            <h3
              key={key}
              className="mt-10 mb-3 text-[1.25rem] font-bold leading-snug text-text-primary"
            >
              {renderInline(block.text, `${key}-h`)}
            </h3>
          );
        }

        if (block.kind === "quote") {
          if (block.pull) {
            return (
              <figure key={key} className="my-10 text-center">
                <blockquote data-pull-quote="true" className="font-[family-name:var(--font-display)] text-[clamp(1.375rem,3vw,2rem)] italic leading-[1.35] text-accent-text">
                  <span aria-hidden="true" className="mr-1">
                    &ldquo;
                  </span>
                  {renderInline(block.text, `${key}-q`)}
                  <span aria-hidden="true" className="ml-1">
                    &rdquo;
                  </span>
                </blockquote>
                {block.cite && (
                  <figcaption className="mt-3 text-sm font-medium text-text-tertiary">
                    {block.cite}
                  </figcaption>
                )}
              </figure>
            );
          }
          return (
            <blockquote
              key={key}
              className="my-8 border-l-4 border-accent pl-6 font-[family-name:var(--font-display)] text-[1.5rem] italic leading-[1.45] text-text-secondary"
            >
              <p>{renderInline(block.text, `${key}-q`)}</p>
              {block.cite && (
                <footer className="mt-3 font-sans text-sm not-italic font-medium text-text-tertiary">
                  {block.cite}
                </footer>
              )}
            </blockquote>
          );
        }

        if (block.kind === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag
              key={key}
              className={`mt-[1.5em] space-y-3 pl-6 text-[1.0625rem] leading-[1.75] text-text-primary md:text-[1.125rem] ${
                block.ordered
                  ? "list-decimal marker:font-semibold marker:text-accent-text"
                  : "list-disc marker:text-accent-text"
              }`}
            >
              {block.items.map((item, j) => (
                <li key={`${key}-li-${j}`} className="pl-1">
                  {renderInline(item, `${key}-li-${j}`)}
                </li>
              ))}
            </Tag>
          );
        }

        if (block.kind === "image") {
          return (
            <figure key={key} className="my-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.src}
                alt={block.alt}
                loading="lazy"
                className="mx-auto w-full max-w-full rounded-lg border border-border object-cover"
              />
              {block.caption && (
                <figcaption className="mt-2 text-center text-sm text-text-tertiary">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        // paragraph — the first one is the lead
        const isLead = paragraphIndex === 0;
        paragraphIndex += 1;
        return (
          <p
            key={key}
            className={
              isLead
                ? "mt-[1.5em] text-[1.1875rem] font-normal leading-[1.7] text-text-primary md:text-[1.25rem]"
                : "mt-[1.5em] text-[1.0625rem] leading-[1.75] text-text-primary md:text-[1.125rem]"
            }
          >
            {renderInline(block.text, `${key}-p`)}
          </p>
        );
      })}
    </div>
  );
}
