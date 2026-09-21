"use client";

/**
 * Phase 7.2: Root-level error boundary. This replaces the entire <html> when
 * an error occurs in the root layout itself (error.tsx cannot catch those).
 * Must include its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ /* design-tokens-exempt */ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F6F7F8", color: "#16181A", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ /* design-tokens-exempt */ color: "#555", marginBottom: "1.5rem" }}>
            An unexpected error occurred. Please try again or return home.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ /* design-tokens-exempt */ padding: "0.625rem 1.5rem", borderRadius: "9999px", background: "#2E7D32", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ /* design-tokens-exempt */ padding: "0.625rem 1.5rem", borderRadius: "9999px", background: "#fff", color: "#333", border: "1px solid #ddd", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem" }}
            >
              Go home
            </a>
          </div>
          {process.env.NODE_ENV === "development" && error?.digest && (
            <p style={{ /* design-tokens-exempt */ marginTop: "1.5rem", fontSize: "0.75rem", color: "#888", fontFamily: "monospace" }}>
              Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
