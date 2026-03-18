"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="sr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom, #f5f4dc, #faf9f6)",
            padding: "1.5rem",
          }}
        >
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>😔</p>
            <h1 style={{ fontSize: 24, color: "#232323", marginBottom: 12 }}>
              Nešto nije u redu
            </h1>
            <p style={{ fontSize: 14, color: "#78716c", marginBottom: 32, lineHeight: 1.6 }}>
              Došlo je do neočekivane greške.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                background: "#AE343F",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
