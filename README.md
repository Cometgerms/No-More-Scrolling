# No More Scrolling

An iPhone-first, offline-capable knowledge discovery PWA. Chinese narrative, English terminology, properly typeset mathematics, and small experiments that reward understanding rather than endless consumption.

**Planned Pages URL:** https://cometgerms.github.io/No-More-Scrolling/

## What works in v0.1

- Eight curated, four-section articles across mathematics, computer science, history and politics. Four daily picks are frozen for the device's local calendar date. This finite seed library rotates; it does not pretend to generate new articles every day.
- KaTeX formulas and local bundled fonts; proof sketches, prerequisites, deeper explanations, dated source/verification notes.
- Eight functioning labs: continuous probability interval, animated Cantor construction, halting contradiction trace, direct-mapped cache, historical timeline, evidence classification, weighted pairwise voting and agenda-order experiment.
- Each article has an explained multiple-choice question, reading-position persistence, optional completion, notes, bookmarks and feedback. Completion is not a mastery claim.
- Fourteen concept nodes with labeled curated relations, searchable/filterable graph, drag/pan and zoom, accessible node-list alternatives, personal labeled links, deletion of personal links and concept notes/bookmarks.
- Subject ordering preferences, Core/Deep preference and interest-keyword matching. Future selection de-prioritizes Not Interested; the other feedback is recorded for later editorial refinement. Personalization is intentionally modest with only two articles per subject.
- Approximate active reading/graph time, optional 5/10/15-minute target and seven-day view. Background/hidden pages and 60-second inactivity pause counting; no streaks, login or leaderboards.
- Dark, light and system themes; reduced-motion styling; mobile safe areas; locally generated app icons.
- IndexedDB persistence with an immediate localStorage mirror, validated JSON export/import and confirmation before restore. No user data is sent to a server.
- Versioned precache of app shell, articles, interactions and math fonts. User-controlled update prompt avoids replacing an active reading session unexpectedly.

## Run locally

Requires Node 22+ and npm.

```sh
npm ci
npm test
npm run build
npm run dev
```

Vite serves the app under `/No-More-Scrolling/`, matching the GitHub Pages project path. `npm run preview` serves the production build. Hash routing means refreshing an article does not require server rewrites.

## GitHub Pages setup (one time)

1. Open repository **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open **Actions → Build, test and deploy**. If an earlier deployment failed because Pages was not enabled, rerun its failed jobs, or choose **Run workflow**.
4. Wait for both build and deploy to turn green, then open the URL above.

Every push to `main` runs tests, builds the PWA and deploys. Pull requests run validation/build without deploying. No personal token or LLM credential is required. Repository Contents access does not necessarily include the ability to enable Pages; a repository owner may need to perform step 2.

## Actual iPhone test

1. In Safari, open the deployed HTTPS URL and wait for the first load to finish. A first service-worker activation may reload once.
2. Share → **Add to Home Screen** → keep **Open as Web App** enabled if offered. Launch the new icon.
3. Open an article. Check inline UI, display formulas, line wrapping, section navigation, one lab and final answer explanations. Save it and write a note.
4. Open Explore. Tap a node or use the concept chips, pan the canvas, zoom, bookmark a concept and add a labeled personal relation.
5. Close and reopen the app: confirm reading position, note, bookmark and relation remain.
6. After the first complete online load, enable Airplane Mode. Close and reopen; verify articles, math fonts, labs, notes and graph work. Source links require internet.
7. In You, export a JSON backup to Files; test restore. Safari and the installed app can use different storage contexts, so use backup/restore to transfer if necessary.
8. Check the daily timer while reading, after locking the phone, and after 60 seconds idle. A five-second sampling interval makes it approximate, not exact activity telemetry.
9. After a new deployment, reopen online and use **Check application updates**. Apply the banner update and verify saved data survives. If assets change, the build produces a new cache name.
10. On the next local date, open Today and confirm a new four-card selection. The seed corpus repeats after its finite rotation; unfinished articles remain accessible in the full library.

Real-device Safari/standalone/offline QA must be completed on an iPhone. Automated math, domain-logic, backup and render tests are not a substitute for physical-device testing.

## Content model and editing

- `src/model.ts`: typed Article, Concept, Edge, progress and versioned user state.
- `src/content.ts`: curated content and citations. Add a unique article ID, one subject, prerequisites, concept IDs, narrative sections, an existing lab type, deeper explanation, quiz/explanations, sources and publication/verification metadata.
- `src/Labs.tsx`: subject-specific interactive modules. New lab types need a model update, component and domain tests.
- `src/logic.ts`: local-date daily selection, backup validation and mathematical interaction models.
- `src/storage.ts`: local persistence and IndexedDB mirror.
- `scripts/build-sw.mjs`: content-hashed precache; no CDN is needed at runtime.

New articles are compiled with the application. Commit content changes to publish; the installed PWA receives them through its update prompt. Today’s selection stays stable once chosen; new material joins future selections and the full library.

## Accuracy and limits

Mathematical claims include their assumptions. Finite Cantor drawings are explicitly approximations. A cycle is not mislabeled as a full proof of Arrow's theorem. Historical events, causal explanations and counterfactuals are separated. The voting exercises are formal models, not public-opinion data. No contemporary political news is generated in this release.

Sources were checked during preparation on 2026-10-17. Numerical models and KaTeX syntax have automated tests; there has been no independent expert review. Suggested reading times include thinking and interaction and are estimates.

The first seed corpus is intentionally eight substantial articles, not the originally proposed 28. Full English translations, authentication, cross-device sync, adaptive mastery tracking and server-side daily generation are not implemented. Interest input never silently reads ChatGPT history. A future publishing pipeline should stage drafts, verify sources and math, and use approved fallback content if validation fails. All privileged credentials must remain in backend/Actions secrets, never in `VITE_*` variables or client bundles.

Local storage can be cleared by the user/browser, so export backups. Restoring currently replaces local data after confirmation; it does not merge two devices' histories. Repository/site content is public; personal notes stay on-device.

## Validation

`npm test` checks local dates (including New York UTC boundaries), stable daily selection, feedback de-prioritization, cache traces, Cantor lengths, exhaustive small voting profiles, content references, formula rendering, backup roundtrips/sanitization, and server rendering of all labs and the graph.

`npm run build` runs TypeScript checking, Vite production bundling and generates the service worker. CI repeats tests/build. Visual/physical iPhone QA is documented above and is not claimed as automated coverage.

## License

The existing repository Apache-2.0 LICENSE is preserved. External source material remains owned by its respective authors; this app links to sources and uses original summaries and diagrams.
