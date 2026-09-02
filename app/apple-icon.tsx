import { ImageResponse } from "next/og"

// iOS applies its own rounded-corner mask, so this stays a plain filled
// square — no radius/padding tricks needed here. See app/icon.tsx for why
// this is a monogram rather than a real logo.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
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
        fontSize: 84,
        letterSpacing: -2,
      }}
    >
      IT
    </div>,
    { ...size }
  )
}
