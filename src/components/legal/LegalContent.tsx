import type { ReactNode } from "react";
import { parsePostContent, type Block } from "@/components/news/PostBody";

/**
 * Renders parsed Block[] with legal-appropriate styling:
 * - No lead paragraph differentiation (uniform body size)
 * - Tighter heading spacing than editorial articles
 * - No pull-quotes (legal text doesn't use them)
 * - 16px body for density (legal pages are reference, not reading pleasure)
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Simple bold/italic/link renderer reusing PostBody's inline markup conventions
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={`${keyPrefix}-b${i}`}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={`${keyPrefix}-i${i}`}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      const href = match[5];
      const isExternal = href.startsWith("http");
      parts.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={href}
          className="text-text-link underline decoration-text-link/30 underline-offset-2 transition hover:text-text-link-hover hover:decoration-text-link-hover/50"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {match[4]}
        </a>
      );
    }
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function LegalContent({ content }: { content: string }) {
  const blocks: Block[] = parsePostContent(content);

  return (
    <div className="legal-content">
      {blocks.map((block, idx) => {
        const key = `lb-${idx}`;

        if (block.kind === "heading") {
          if (block.level === 2) {
            return (
              <h2
                key={key}
                className="mt-10 mb-3 font-[family-name:var(--font-display)] text-[1.375rem] font-bold leading-tight text-text-primary first:mt-0"
              >
                {block.text}
              </h2>
            );
          }
          return (
            <h3 key={key} className="mt-7 mb-2 text-[1.0625rem] font-bold text-text-primary">
              {block.text}
            </h3>
          );
        }

        if (block.kind === "paragraph") {
          return (
            <p
              key={key}
              className="mt-4 text-[0.9375rem] leading-[1.7] text-text-secondary first:mt-0"
            >
              {renderInline(block.text, key)}
            </p>
          );
        }

        if (block.kind === "quote") {
          return (
            <blockquote
              key={key}
              className="my-5 border-l-4 border-accent pl-5 text-[0.9375rem] italic leading-[1.6] text-text-secondary"
            >
              <p>{renderInline(block.text, key)}</p>
              {block.cite && (
                <footer className="mt-2 text-sm not-italic font-medium text-text-tertiary">
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
              className="mt-4 space-y-1.5 pl-6 text-[0.9375rem] leading-[1.7] text-text-secondary marker:text-accent-text"
              style={{ listStyleType: block.ordered ? "decimal" : "disc" }}
            >
              {block.items.map((item, j) => (
                <li key={`${key}-li${j}`}>{renderInline(item, `${key}-${j}`)}</li>
              ))}
            </Tag>
          );
        }

        // Images are unlikely in legal pages but handle gracefully
        if (block.kind === "image") {
          return (
            <figure key={key} className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.src}
                alt={block.alt}
                loading="lazy"
                className="w-full rounded-lg border border-border"
              />
              {block.caption && (
                <figcaption className="mt-2 text-center text-xs text-text-tertiary">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
