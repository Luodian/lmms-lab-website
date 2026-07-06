"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import TransitionLink from "@/components/motion/TransitionLink";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Header.module.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "Notes", href: "/notes" },
];

const galleryProjects = [
  {
    label: "LMMS-Lab Writer",
    href: "https://writer.lmms-lab.com",
    description: "AI-native LaTeX editor",
  },
  {
    label: "Engram",
    href: "https://www.engram-encrypt.com/",
    description: "Secure-first AI memory layer",
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryCloseTimerRef = useRef<number | null>(null);

  const clearGalleryCloseTimer = useCallback(() => {
    if (galleryCloseTimerRef.current !== null) {
      window.clearTimeout(galleryCloseTimerRef.current);
      galleryCloseTimerRef.current = null;
    }
  }, []);

  const openGalleryMenu = useCallback(() => {
    clearGalleryCloseTimer();
    setGalleryOpen(true);
  }, [clearGalleryCloseTimer]);

  const closeGalleryMenu = useCallback(() => {
    clearGalleryCloseTimer();
    setGalleryOpen(false);
  }, [clearGalleryCloseTimer]);

  const scheduleGalleryClose = useCallback(() => {
    clearGalleryCloseTimer();
    galleryCloseTimerRef.current = window.setTimeout(() => {
      setGalleryOpen(false);
      galleryCloseTimerRef.current = null;
    }, 180);
  }, [clearGalleryCloseTimer]);

  const handleGalleryBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const nextFocused = event.relatedTarget as Node | null;
      if (nextFocused && event.currentTarget.contains(nextFocused)) return;
      closeGalleryMenu();
    },
    [closeGalleryMenu],
  );

  const handleGalleryKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeGalleryMenu();
      const trigger = event.currentTarget.querySelector<HTMLButtonElement>(
        "button",
      );
      trigger?.focus();
    },
    [closeGalleryMenu],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => clearGalleryCloseTimer();
  }, [clearGalleryCloseTimer]);

  // Close menu on route change (browser back/forward)
  useEffect(() => {
    setMenuOpen(false);
    closeGalleryMenu();
  }, [pathname, closeGalleryMenu]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Focus trap and keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!menuOpen) return;

      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [menuOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!galleryOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        galleryRef.current &&
        !galleryRef.current.contains(event.target as Node)
      ) {
        closeGalleryMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [galleryOpen, closeGalleryMenu]);

  // Focus first menu item when opened
  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector<HTMLElement>("a[href]");
      firstLink?.focus();
    }
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (!mounted) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={styles.masthead}
      data-menu-open={menuOpen ? "true" : "false"}
    >
      <div className={styles.mastheadInner}>
        <div className={styles.mastheadBrand}>
          <TransitionLink href="/" className={styles.brandLink}>
            <AnimatedLogo />
          </TransitionLink>
        </div>

        <button
          ref={menuButtonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          className={styles.mobileMenuBtn}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {/* Desktop Nav */}
        <nav className={`${styles.navMenu} ${styles.desktopNav}`}>
          {navItems.map((item) => (
            <TransitionLink
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.active : ""}`}
            >
              {item.label}
            </TransitionLink>
          ))}
          <div
            ref={galleryRef}
            className={styles.dropdown}
            onMouseEnter={openGalleryMenu}
            onMouseLeave={scheduleGalleryClose}
            onBlur={handleGalleryBlur}
            onKeyDown={handleGalleryKeyDown}
          >
            <button
              type="button"
              className={`${styles.navLink} ${styles.dropdownTrigger} ${
                galleryOpen ? styles.active : ""
              }`}
              aria-haspopup="menu"
              aria-expanded={galleryOpen}
              onClick={() => {
                clearGalleryCloseTimer();
                setGalleryOpen((prev) => !prev);
              }}
              onMouseEnter={openGalleryMenu}
              onFocus={openGalleryMenu}
            >
              Gallery
            </button>
            <AnimatePresence>
              {galleryOpen && (
                <motion.div
                  className={styles.dropdownPanel}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <ul className={styles.dropdownList} role="menu">
                    {galleryProjects.map((project) => (
                      <li key={project.href} role="none">
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.dropdownItem}
                          role="menuitem"
                          onClick={closeGalleryMenu}
                        >
                          <span className={styles.dropdownItemLabel}>
                            {project.label}
                          </span>
                          <span className={styles.dropdownItemMeta}>
                            {project.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <TransitionLink
            href="/about"
            className={`${styles.navLink} ${isActive("/about") ? styles.active : ""}`}
          >
            About
          </TransitionLink>
        </nav>
      </div>

      {/* Mobile Menu Overlay - Apple-style smooth reveal */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.35,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className={styles.mobileNavOverlay}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <nav id="mobile-nav-menu" className={styles.mobileNavContent}>
              {navItems.map((item) => (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ""}`}
                >
                  {item.label}
                </TransitionLink>
              ))}
              <div className={styles.mobileGalleryGroup}>
                <div className={styles.mobileGalleryTitle}>Gallery</div>
                <ul className={styles.mobileGalleryList}>
                  {galleryProjects.map((project) => (
                    <li key={project.href}>
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className={styles.mobileGalleryLink}
                      >
                        {project.label}
                        <span className={styles.mobileGalleryMeta}>
                          {project.description}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <TransitionLink
                href="/about"
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileNavLink} ${isActive("/about") ? styles.active : ""}`}
              >
                About
              </TransitionLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
