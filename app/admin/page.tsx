import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { CollabRequestRow, UserRole } from "@/lib/blog-db";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { approveCollabRequest, declineCollabRequest } from "./actions";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin - LMMs-Lab",
	robots: { index: false, follow: false },
};

interface CollaboratorRow {
	id: string;
	display_name: string | null;
	role: UserRole;
}

function formatDate(value: string | null): string {
	if (!value) return "";
	return new Date(value).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default async function AdminPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const actionError = typeof params.error === "string" ? params.error : undefined;

	if (!isSupabaseConfigured()) {
		return (
			<div className={styles.container}>
				<div className={styles.inner}>
					<h1 className={styles.pageTitle}>Admin</h1>
					<div className={styles.panel}>
						<p className={styles.panelBody}>
							Supabase is not configured on this deployment. Set
							NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
							enable it.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		redirect("/login");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.maybeSingle();
	const role = (profile?.role ?? "reader") as UserRole;

	if (role !== "admin") {
		return (
			<div className={styles.container}>
				<div className={styles.inner}>
					<h1 className={styles.pageTitle}>Admin</h1>
					<div className={styles.panel}>
						<p className={styles.panelBody}>Admins only.</p>
					</div>
				</div>
			</div>
		);
	}

	// collab_requests has two FKs into profiles (user_id, decided_by), so the
	// requester embed must name its FK explicitly.
	const requestColumns =
		"id, user_id, message, status, created_at, decided_by, decided_at, profiles!collab_requests_user_id_fkey(display_name)";

	const [pendingRes, collaboratorsRes, decidedRes] = await Promise.all([
		supabase
			.from("collab_requests")
			.select(requestColumns)
			.eq("status", "pending")
			.order("created_at", { ascending: true }),
		supabase
			.from("profiles")
			.select("id, display_name, role")
			.in("role", ["editor", "admin"])
			.order("display_name", { ascending: true }),
		supabase
			.from("collab_requests")
			.select(requestColumns)
			.neq("status", "pending")
			.order("decided_at", { ascending: false, nullsFirst: false })
			.limit(10),
	]);

	const pending = (pendingRes.data ?? []) as unknown as CollabRequestRow[];
	const collaborators = (collaboratorsRes.data ?? []) as CollaboratorRow[];
	const decided = (decidedRes.data ?? []) as unknown as CollabRequestRow[];

	return (
		<div className={styles.container}>
			<div className={styles.inner}>
				<header className={styles.pageHeader}>
					<h1 className={styles.pageTitle}>Admin</h1>
					<p className={styles.pageHint}>
						Approving a request promotes the requester to editor.
					</p>
				</header>

				{actionError && <p className={styles.errorLine}>{actionError}</p>}

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Collaboration requests</h2>
					{pendingRes.error ? (
						<p className={styles.errorLine}>{pendingRes.error.message}</p>
					) : pending.length === 0 ? (
						<div className={styles.list}>
							<p className={styles.empty}>No pending requests.</p>
						</div>
					) : (
						<div className={styles.list}>
							{pending.map((request) => (
								<div className={styles.row} key={request.id}>
									<div className={styles.rowBody}>
										<p className={styles.rowName}>
											{request.profiles?.display_name ?? "Unnamed user"}
											<span className={styles.rowDate}>
												{" "}
												requested {formatDate(request.created_at)}
											</span>
										</p>
										{request.message && (
											<p className={styles.rowMessage}>{request.message}</p>
										)}
									</div>
									<div className={styles.rowActions}>
										<form action={approveCollabRequest.bind(null, request.id)}>
											<button
												className={`${styles.button} ${styles.buttonPrimary}`}
												type="submit"
											>
												Approve
											</button>
										</form>
										<form action={declineCollabRequest.bind(null, request.id)}>
											<button className={styles.button} type="submit">
												Decline
											</button>
										</form>
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Collaborators</h2>
					{collaboratorsRes.error ? (
						<p className={styles.errorLine}>{collaboratorsRes.error.message}</p>
					) : collaborators.length === 0 ? (
						<div className={styles.list}>
							<p className={styles.empty}>No collaborators yet.</p>
						</div>
					) : (
						<div className={styles.list}>
							{collaborators.map((person) => (
								<div className={styles.row} key={person.id}>
									<p className={styles.rowName}>
										{person.display_name ?? "Unnamed user"}
									</p>
									<span
										className={
											person.role === "admin"
												? `${styles.roleBadge} ${styles.roleAdmin}`
												: styles.roleBadge
										}
									>
										{person.role}
									</span>
								</div>
							))}
						</div>
					)}
				</section>

				<section className={styles.section}>
					<h2 className={styles.sectionTitle}>Recent decisions</h2>
					{decidedRes.error ? (
						<p className={styles.errorLine}>{decidedRes.error.message}</p>
					) : decided.length === 0 ? (
						<div className={styles.list}>
							<p className={styles.empty}>No decisions yet.</p>
						</div>
					) : (
						<div className={styles.list}>
							{decided.map((request) => (
								<div className={styles.row} key={request.id}>
									<p className={styles.rowName}>
										{request.profiles?.display_name ?? "Unnamed user"}
									</p>
									<div className={styles.rowMeta}>
										<span
											className={
												request.status === "approved"
													? `${styles.roleBadge} ${styles.roleAdmin}`
													: styles.roleBadge
											}
										>
											{request.status}
										</span>
										<span className={styles.rowDate}>
											{formatDate(request.decided_at)}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
