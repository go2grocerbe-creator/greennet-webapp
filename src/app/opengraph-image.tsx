import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        padding: "76px 84px",
        color: "#F5F2EA",
        background: "#0D1B24",
        fontFamily: "sans-serif",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-80px",
          top: "-180px",
          width: "590px",
          height: "590px",
          border: "2px solid rgba(243,178,63,.34)",
          borderRadius: "999px",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "120px",
          top: "60px",
          width: "132px",
          height: "132px",
          borderRadius: "999px",
          background: "#F3B23F",
          boxShadow: "0 0 80px rgba(243,178,63,.42)",
          display: "flex",
        }}
      />
      <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: "-1px" }}>
        {siteConfig.shortName}
      </div>
      <div style={{ display: "flex", maxWidth: "850px", flexDirection: "column" }}>
        <div style={{ display: "flex", color: "#F3B23F", fontSize: 25, letterSpacing: "5px" }}>
          SOLAR / INSTALLATION / SUPPORT
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "22px",
            fontSize: 82,
            fontWeight: 750,
            lineHeight: 0.96,
            letterSpacing: "-5px",
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
      <div style={{ display: "flex", color: "#AEB9B7", fontSize: 23 }}>
        GreenNet Energy Ltd · Benin City, Nigeria
      </div>
    </div>,
    size,
  );
}
