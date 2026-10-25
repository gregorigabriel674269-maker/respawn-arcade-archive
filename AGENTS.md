<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cloud Auth owns accounts and private profiles; public summaries expose aggregates, opt-in leaderboard names and request authors but not raw account UUIDs; user-owned writes use RLS.
- Guest favorites/history remain browser-local; signed-in libraries sync to Cloud and import guest data once per account, clearing private caches on sign-out to prevent cross-account leakage.
- WebRTC signaling uses authenticated server functions and bounded database RPC rooms; no public identity-trusting relay or in-memory server room state is allowed.
- Daily competition is a first-party reflex game with database-enforced attempts, sequence and scores; never trust claimed scores from external games.
- Cloud saves are private user-scoped files; third-party games need explicit export or a validated integration, since cross-origin frames cannot be read or controlled.
- Offline uses generateSW through one preview-safe registration wrapper; never cache auth endpoints or enable app-shell workers in development or editor previews.
- The original game catalog remains static JSON in src/data; audited administrative revisions are additive Cloud overlays resolved before filtering and playback, never replacement seed data.
- Original covers are exact-name records in src/data/game-covers.json and physical optimized files in public/covers; all game surfaces use GameCover so retry, school suppression and viewport loading stay consistent.
- Cover acquisition is an offline reviewed-source import, never runtime fetching or approximate title matching; unresolved artwork and redistribution rights remain explicitly unconfirmed.
- Virtual catalog items have a fixed height derived from the capped portrait-cover width plus content, so spacer calculations match rendered rows.
- Embedded games use an opaque-origin sandbox without allow-same-origin, including after redirects; frame load events never establish remote playability.
- Signed-in library caches are namespaced per account; guest imports read only separate guest keys, and asynchronous private reads are discarded after identity transitions.
- Catalog verification distinguishes local structural checks from remote playability; exclusions are shared by runtime and artwork auditing, and incomplete cover audits remain failures.
- SQL migrations are the database source of truth; do not generate schema from the intentionally empty Drizzle model.
- Admin roles are separate from profiles; every privileged RPC requires an expiring unlock bound to the verified Auth session, with code checks exclusively server-side and durable attempt auditing.
- XP is awarded by database triggers using durable unique event keys and serialized daily budgets; deleting and recreating a rating/vote cannot re-award its XP.
- Save versions reference immutable private objects with backend base-version comparison; asynchronous reads and downloads must discard responses after identity transitions.
