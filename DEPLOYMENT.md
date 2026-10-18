# First deployment and connected features

## Publish the app

1. Review the local changes, then commit and push them to `main` yourself (GLOBAL.md leaves Git operations to the owner).
2. Repository Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Actions → **Build, test and deploy** → Run workflow if the push did not start it. Wait for both build and deploy to succeed.
4. Open the URL shown by the deploy job. The configured base path is `/No-More-Scrolling/`.
5. On iPhone, open it in Safari and add it to the Home Screen. Check language, reading progress after reopening, formulas and the chat panel with the keyboard visible. Check offline reading after one full online load.

No database or running personal computer is required for this stage. No changes have been committed, pushed, or deployed by the agent.

## World brief

- `node scripts/fetch-world.mjs` fetches up to eight BBC World RSS headlines, links and publication dates into `public/world-feed.json`. No article text or images are copied.
- The build workflow runs this before production build, on pushes/manual runs and hourly at minute 23. GitHub scheduling can be delayed or suspended for inactive repositories. A failed fetch fails the build and leaves the previous live deployment intact.
- Browser refresh checks the deployed JSON; it does not trigger a publisher fetch. While visible, the world page checks every five minutes. Data older than three hours is labeled stale. Failed requests retain the last validated browser snapshot.
- Feed JSON is excluded from service-worker precaching and the asset version hash. A feed-only deployment does not require installing a new app shell. An already-open app that predates this feature needs the normal one-time app update.
- Regional grouping uses headline keywords and can be inaccurate. Circles encode report counts only,  The offline world map uses Natural Earth land outlines; it shows no national borders. This is single-source reporting, not a ranking of global importance or independently verified claims.
- UI is bilingual; publisher headlines retain their original English. A future server-side multilingual editorial pipeline can provide reviewed Chinese summaries and multiple sources.

## AI companion

In **Profile → Settings → AI**, enter a full HTTPS Chat Completions endpoint, the provider's exact model ID, and your own key. This uses the compatible `POST` protocol with `messages` and `stream: false`; it does not support arbitrary API protocols.

Keys stay in memory by default. Optional `sessionStorage` survives this tab's reloads (browser restore behavior may vary), and Clear key removes it. Keys and chat history are excluded from reading backups. No project-owned key is embedded in code or deployment.

The browser sends the key to the configured endpoint in the Authorization header. Use a restricted personal key with appropriate spending limits; browser storage is not a secret vault. CORS must be supported by the provider. Providers that prohibit browser requests need a server proxy; never solve this by publishing a shared key in the static bundle.

The chat shows and previews the current page excerpt. Reading sections and public lab text update with the page; selected world reports include their source URLs. Notes, collection data and settings fields are not automatically included. Turning off context removes the current page from subsequent requests; previously sent content is still part of the active conversation until New chat. Chats are memory-only, bounded to the most recent 12 messages per request, with a 60-second timeout and Stop button. Answers support `\(...\)` and `\[...\]` math. The assistant has no search tool and must not claim live verification.

## Google / email accounts — next stage

`src/auth.ts` defines the provider contract for Google sign-in, email codes, sessions, sign-out and session-change events. It is a boundary, **not an implemented authentication backend**. There are intentionally no pretend working login buttons.

After deployment:

1. Create a Supabase project, configure the exact production site URL and localhost redirect allowlist.
2. Enable Google provider and configure its OAuth client/secret in Supabase (never in this repository). Enable email OTP and production email delivery.
3. Implement the `AuthGateway` with the official Supabase client, including callback processing, session refresh, logout and error states.
4. Add per-user data tables and Row Level Security policies; only the owning user may read/write their records. No service-role key in the browser.
5. Implement explicit first-login migration from this device, synchronization/conflict rules and offline replay. Signing in alone does not synchronize the existing local state.
6. Test email expiry/resend, Google return URL, two devices, offline edits, revoked sessions and account separation before promising durable cross-device retention.

References: [Google provider setup](https://supabase.com/docs/guides/auth/social-login/auth-google), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Validation in this change

Automated feed validation, request payload/error tests, all previous tests, TypeScript and production build run locally. Live BBC feed collection and browser region filtering/context preview verified. No real provider key supplied, so paid model responses are not end-to-end verified. Actual iPhone Safari and published Pages verification remain owner checks.

## Profile and summary update

The profile now supports a local display name, bio and four avatar choices, included in reading backups. Existing backups get default profile fields. Achievements count days with at least 60 seconds of existing reading/graph activity (1, 10, 30, 100 days), not login events. Settings has its own route.

World summaries, diplomacy/policy filtering and 30-date local history are implemented; configure your own service using [SUMMARY-API.md](SUMMARY-API.md). No summary backend or cloud login has been provisioned.
