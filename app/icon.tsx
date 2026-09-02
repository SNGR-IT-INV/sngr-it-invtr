import { ImageResponse } from "next/og"

// No brand logo asset exists yet — a simple monogram on the app's own
// indigo primary token (see --primary in app/globals.css) is a reliable,
// dependency-free placeholder. Swap this file for a real logo later
// without touching anything else (favicon.ico still serves as the
// classic fallback for browsers that ignore this route).
export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#4f39f6",
        color: "#ffffff",
        fontFamily: "sans-serif",
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: -1,
      }}
    >
      IT
    </div>,
    { ...size }
  )
}
