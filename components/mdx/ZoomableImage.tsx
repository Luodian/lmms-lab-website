"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

// Fullscreen image overlay. Rendered through a portal so ancestor
// transforms (page transitions) cannot re-anchor the fixed positioning.
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-sm)",
        padding: "var(--space-lg)",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        cursor: "zoom-out",
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: "var(--space-md)",
          right: "var(--space-md)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-caption)",
          color: "#ffffff",
          background: "transparent",
          border: "1px solid #ffffff",
          padding: "var(--space-xs) var(--space-sm)",
          cursor: "pointer",
        }}
      >
        CLOSE [ESC]
      </button>
      <img
        src={src}
        alt={alt ?? ""}
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: "95vw",
          maxHeight: "88vh",
          objectFit: "contain",
          boxShadow: "0 0 0 1px #ffffff",
          cursor: "default",
        }}
      />
      {alt && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-caption)",
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          {alt}
        </p>
      )}
    </div>,
    document.body,
  );
}

type ZoomableImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

// Drop-in replacement for the MDX `img` element: same framing as the old
// static override, plus click / Enter to open the lightbox.
export function ZoomableImage({ src, alt, style, ...rest }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!src || typeof src !== "string") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Enlarge image: ${alt}` : "Enlarge image"}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          display: "inline-block",
          maxWidth: "100%",
          cursor: "zoom-in",
          margin: "var(--space-md) 0",
        }}
      >
        <img
          {...rest}
          src={src}
          alt={alt ?? ""}
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
            boxShadow: "0 0 0 1px currentColor",
            ...style,
          }}
        />
      </button>
      {open && <ImageLightbox src={src} alt={alt} onClose={close} />}
    </>
  );
}
