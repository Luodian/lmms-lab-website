"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import TransitionLink from "@/components/motion/TransitionLink";
import type { UserRole } from "@/lib/blog-db";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import styles from "./UserMenu.module.css";

interface MenuUser {
	id: string;
	email: string | null;
}

interface MenuProfile {
	display_name: string | null;
	avatar_url: string | null;
	role: UserRole;
}

type MenuStatus = "loading" | "signed-out" | "signed-in";

export default function UserMenu() {
	const configured = isSupabaseConfigured();
	const [status, setStatus] = useState<MenuStatus>("loading");
	const [user, setUser] = useState<MenuUser | null>(null);
	const [profile, setProfile] = useState<MenuProfile | null>(null);
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!configured) return;
		const supabase = createClient();
		let cancelled = false;

		async function loadProfile(userId: string) {
			const { data, error } = await supabase
				.from("profiles")
				.select("display_name, avatar_url, role")
				.eq("id", userId)
				.maybeSingle();
			if (error) {
				console.error(`[user-menu] loading profile failed: ${error.message}`);
				return;
			}
			if (!cancelled) setProfile((data as MenuProfile | null) ?? null);
		}

		function applyUser(nextUser: { id: string; email?: string } | null) {
			if (cancelled) return;
			if (nextUser) {
				setUser({ id: nextUser.id, email: nextUser.email ?? null });
				setStatus("signed-in");
				// Deferred: supabase-js can deadlock on queries issued
				// synchronously inside onAuthStateChange callbacks.
				const userId = nextUser.id;
				window.setTimeout(() => void loadProfile(userId), 0);
			} else {
				setUser(null);
				setProfile(null);
				setStatus("signed-out");
			}
		}

		void supabase.auth.getUser().then(({ data }) => applyUser(data.user));

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			applyUser(session?.user ?? null);
		});

		return () => {
			cancelled = true;
			subscription.unsubscribe();
		};
	}, [configured]);

	useEffect(() => {
		if (!open) return;

		function handleMouseDown(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return;
			setOpen(false);
			triggerRef.current?.focus();
		}

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	const handleSignOut = useCallback(async () => {
		setOpen(false);
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(`[user-menu] sign out failed: ${error.message}`);
		}
		window.location.assign("/");
	}, []);

	if (!configured || status === "loading") return null;

	if (status === "signed-out") {
		return (
			<TransitionLink href="/login/" className={styles.signInLink}>
				Sign in
			</TransitionLink>
		);
	}

	const displayName = profile?.display_name || user?.email || "Account";
	const initial = displayName.charAt(0).toUpperCase() || "A";
	const role: UserRole = profile?.role ?? "reader";

	return (
		<div ref={containerRef} className={styles.menu}>
			<button
				ref={triggerRef}
				type="button"
				className={styles.trigger}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label="Account menu"
				onClick={() => setOpen((prev) => !prev)}
			>
				{profile?.avatar_url ? (
					<img
						src={profile.avatar_url}
						alt=""
						width={28}
						height={28}
						referrerPolicy="no-referrer"
						className={styles.avatar}
					/>
				) : (
					<span className={styles.initial} aria-hidden="true">
						{initial}
					</span>
				)}
			</button>
			<AnimatePresence>
				{open && (
					<motion.div
						className={styles.panel}
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
					>
						<div className={styles.identity}>
							<span className={styles.identityName}>{displayName}</span>
							{user?.email && profile?.display_name && (
								<span className={styles.identityMeta}>{user.email}</span>
							)}
						</div>
						<ul className={styles.list} role="menu">
							<li role="none">
								<TransitionLink
									href="/account/"
									className={styles.item}
									role="menuitem"
									onClick={() => setOpen(false)}
								>
									Account
								</TransitionLink>
							</li>
							{(role === "editor" || role === "admin") && (
								<li role="none">
									<TransitionLink
										href="/studio/"
										className={styles.item}
										role="menuitem"
										onClick={() => setOpen(false)}
									>
										Studio
									</TransitionLink>
								</li>
							)}
							{role === "admin" && (
								<li role="none">
									<TransitionLink
										href="/admin/"
										className={styles.item}
										role="menuitem"
										onClick={() => setOpen(false)}
									>
										Admin
									</TransitionLink>
								</li>
							)}
							<li role="none">
								<button
									type="button"
									className={styles.item}
									role="menuitem"
									onClick={() => void handleSignOut()}
								>
									Sign out
								</button>
							</li>
						</ul>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
