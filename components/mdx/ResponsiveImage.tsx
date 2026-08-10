"use client";

import { useState } from "react";
import { ImageLightbox } from "./ZoomableImage";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  caption?: string;
  maxWidth?: string;
  variant?: "aligned" | "max";
}

export function ResponsiveImage({
  src,
  alt,
  caption,
  maxWidth = "100%",
  variant = "aligned",
}: ResponsiveImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerStyle: React.CSSProperties = {
    margin: "var(--space-lg) auto",
    maxWidth: variant === "max" ? maxWidth : "48rem",
  };

  return (
    <>
      <figure style={containerStyle}>
        <img
          src={src}
          alt={alt}
          onClick={() => setIsExpanded(true)}
          style={{
            width: "100%",
            height: "auto",
            boxShadow: "0 0 0 1px currentColor",
            cursor: "pointer",
            transition: "filter 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(110%)")}
          onMouseOut={(e) => (e.currentTarget.style.filter = "brightness(100%)")}
        />
        {caption && (
          <figcaption
            style={{
              marginTop: "var(--space-sm)",
              fontSize: "0.875rem",
              opacity: 0.7,
              textAlign: "center",
            }}
          >
            {caption}
          </figcaption>
        )}
      </figure>

      {isExpanded && (
        <ImageLightbox
          src={src}
          alt={caption || alt}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
