# First deployment and connected features

## Publish the app

1. Review the local changes, then commit and push them to `main` yourself (GLOBAL.md leaves Git operations to the owner).
2. Repository Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Actions → **Build, test and deploy** → Run workflow if the push did not start it. Wait for both build and deploy to succeed.
4. Open the URL shown by the deploy job. The configured base path is `/No-More-Scrolling/`.
5. On iPhone, open it in Safari and add it to the Home Screen. Check language, reading progress after reopening, formulas and the chat panel with the keyboard visible. Check offline reading after one full online load.

No database or running personal computer is required for this stage. No changes have been committed, pushed, or deployed by the agent.

## World brief

- `node --import tsx scripts/fetch-world.mjs` fetches up to sixteen headlines, links and publication dates from BBC, The Guardian, DW and Al Jazeera into `public/world-feed.json`. No article text or images are copied.
- The build workflow runs this before production build, on pushes/manual runs and daily at 10:23 UTC. GitHub scheduling can be delayed or suspended for inactive repositories. Unavailable sources are skipped; if all fail, the bundled snapshot remains visible with its original timestamp.
- Browser refresh checks the deployed JSON; it does not trigger a publisher fetch. While visible, the world page checks every five minutes. Data older than three hours is labeled stale. Failed requests retain the last validated browser snapshot.
- Feed JSON is excluded from service-worker precaching and the asset version hash. A feed-only deployment does not require installing a new app shell. An already-open app that predates this feature needs the normal one-time app update.
- Regional grouping uses headline keywords and can be inaccurate. Circles encode report counts only,  The offline world map uses Natural Earth land outlines; it shows no national borders. This is single-source reporting, not a ranking of global importance or independently verified claims.
- UI is bilingual; publisher headlines retain their original English. A future server-side multilingual editorial pipeline can provide reviewed Chinese summaries and multiple sources.

## AI companion

In **Profile → Settings → AI**, enter a full HTTPS Chat Completions endpoint, the provider's exact model ID, and your own key. This uses the compatible `POST` protocol with `messages` and `stream: false`; it does not support arbitrary API protocols.

Keys stay in memory by default. Optional `sessionStorage` survives this tab's reloads (browser restore behavior may vary), and Clear key removes it. Keys and chat history are excluded from reading backups. No project-owned key is embedded in code or deployment.

The browser sends the key to the configured endpoint in the Authorization header. Use a restricted personal key with appropriate spending limits; browser storage is not a secret vault. CORS must be supported by the provider. Providers that prohibit browser requests need a server proxy; never solve this by publishing a shared key in the static bundle.

The chat shows and previews the current page excerpt. Reading sections and public lab text update with the page; selected world reports include their source URLs. Notes, collection data and settings fields are not automatically included. Turning off context removes the current page from subsequent requests; previously sent content is still part of the active conversation until New chat. Chats are memory-only, bounded to the most recent 12 messages per request, with a 60-second timeout and Stop button. Answers support `\(...\)` and `\[...\]` math. The assistant has no search tool and must not claim live verification.

## Email and password accounts

Supabase Auth and cloud synchronization are implemented with the pinned official client. The live project is `no-more-scrolling` (`lanrrewsskfqylinmsag`, US East). Only its publishable key is included in the frontend. The deployed database has `reading_states`, ownership RLS and a revision-checked, security-invoker save function; `supabase/schema.sql` records the schema for a fresh project (do not reapply it to the provisioned project).

### Owner configuration

1. In Supabase Authentication → URL Configuration, set Site URL and an allowed redirect URL to `https://cometgerms.github.io/No-More-Scrolling/`. For local testing, also allow `http://localhost:5174/No-More-Scrolling/` and `http://localhost:4173/No-More-Scrolling/`.
2. Keep Email authentication enabled in Supabase. No Google Cloud project, OAuth client or Google provider is required. The application exposes only email/password sign-in.
3. Keep signup confirmation enabled. In Email Templates, Confirm Signup and Reset Password should retain links using `{{ .ConfirmationURL }}`. The old Magic Link OTP customization is no longer used.
4. Registration sends a confirmation email; the UI also supports resending it. After confirmation, sign in with email/password. Forgot password sends a recovery link; open it in the same browser where requested (PKCE), then set a new password in My → Account and sync. Safari and installed PWA can have separate storage: initiate recovery in Safari if email links open there, then use the new password in the PWA.
5. Default Supabase email delivery is restricted to project organization members and has strict rate limits. Configure custom SMTP before inviting other users. See [email SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
6. Passwords are passed to Supabase Auth, never stored in reading records/backups. New passwords must have at least 8 characters in the UI; server policy may require more. Logged-in users can also set/change their password. Failed operations display errors and clear password fields.

### Persistence and conflicts

- Guest state keeps the original localStorage/IndexedDB location. Each signed-in account has its own local record and cloud row. Sign-out returns to the guest copy; it does not upload account A's records into account B.
- First sign-in offers an explicit merge of guest data, retaining the guest copy. Each account records whether this merge was already done.
- Edits persist locally immediately. Sync runs after changes, every 15 seconds while visible/online, on focus/reconnection, and via Sync now. Failed requests retain pending data. An account-switch generation guard discards stale responses; the database also checks the expected owner.
- Writes use a server-side revision comparison. A collision re-reads and merges up to three times. Bookmarks and links use a three-way merge including removals. Independent notes merge; conflicting edits/deletion require a user choice and block uploading until resolved. Conflict alternatives are retained locally and included as `syncConflicts` in exports; restore currently imports the selected state, not the alternatives.
- Profile fields, preferences and the current chapter use local changes over the last acknowledged baseline, otherwise the cloud value. Returning to an earlier chapter is preserved; completed articles remain completed. Daily time takes the maximum per date to avoid duplicate activity, so simultaneous reading on two devices is not summed. Language, AI keys/chats and report history stay device-local.
- For this first release, avoid editing the same account in multiple offline tabs of one browser: those tabs share a local cache. Different devices have independent caches and are covered by revision/merge tests.
- Sign-out keeps unsynced account records on that browser for later sign-in. Export backups before clearing storage. A successful login alone is not proof that every pending change has synced; check the sync status.

### Validation and release

Stage the complete account change (including new files) before committing; `.idea` files are not needed:

```powershell
git add src package.json package-lock.json vite.config.ts supabase/schema.sql tests/account-sync.test.ts tests/account-rls.sql tests/email-auth.test.ts tests/mobile-layout.html README.md HANDOFF.md DEPLOYMENT.md
```

Then commit and push using your usual editor workflow. No database password, password or SMTP secret belongs in these files. The agent has not committed or pushed this change.

Local verification: 51 automated tests, TypeScript and production build pass; 140 browser layout assertions pass across 320/390/430px portrait and 667px landscape. These viewport tests do not emulate actual iOS browser chrome or keyboard.

`tests/account-sync.test.ts` exercises local persistence, explicit import, account changes, offline retries, conflicting notes and simultaneous device writes. `tests/account-rls.sql` was executed against the project in a rollback transaction: own writes succeed, stale writes return no rows, cross-account reads/writes and wrong-owner RPC calls fail. Anonymous access is denied. Supabase security advisors returned no findings.

Before considering login complete in production, deploy these files, then test real registration/confirmation, password sign-in, confirmation resend, expired recovery links and password reset, Safari and installed PWA separately, sign-out/re-login, and two real devices. Those flows require the owner's email configuration and personal login and have not yet been end-to-end verified.

References: [email/password setup](https://supabase.com/docs/guides/auth/passwords), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Validation in this change

Automated feed validation, request payload/error tests, all previous tests, TypeScript and production build run locally. Live BBC feed collection and browser region filtering/context preview verified. No real provider key supplied, so paid model responses are not end-to-end verified. Actual iPhone Safari and published Pages verification remain owner checks.

## Profile and summary update

The profile now supports a local display name, bio and four avatar choices, included in reading backups. Existing backups get default profile fields. Achievements count days with at least 60 seconds of existing reading/graph activity (1, 10, 30, 100 days), not login events. Settings has its own route.

World summaries, diplomacy/policy filtering and 30-date local history are implemented. Summaries use the shared AI endpoint/model/key by default; an optional custom backend can follow [SUMMARY-API.md](SUMMARY-API.md). Supabase login and account synchronization are implemented; scheduled global analysis is available after configuring the repository API secret and variables below. Owner login-provider configuration and live sign-in verification are still required.

## Update recovery

The worker validates every precached resource against its build's SHA-256 integrity and bypasses the HTTP cache during installation. An incomplete deployment fails installation while retaining the previous worker. Two previous app caches remain available for existing tabs requesting old bundles; navigation always uses the active build's HTML. Reading data in localStorage and IndexedDB is not cleared by updates.

The update button saves reading state before requesting activation and reports a failed or stalled update. First installation no longer forces a reload. Static HTML provides a bilingual reload screen if the JavaScript bundle cannot load.

To publish this fix, include `scripts/sw-runtime.js` alongside the modified build script and application files. Wait for the Pages workflow to succeed, then reopen the installed app online. If an older installed copy is blank, close its window and any Safari tabs for this site, then reopen online to allow the worker to update. Do not clear website data or remove the installed app as the first recovery step: guest or pending records may not be synced to Supabase. Validate the update on an actual iPhone after deployment.


## v0.3.0：每日多来源报道与全局分析

新闻源：BBC World、The Guardian World、DW、Al Jazeera。每家最多 4 条近期标题，保留原始链接。任一来源失败不影响其他来源；全部失败保留旧快照并通过采集时间显示陈旧情况。地区统计是报道分布，不是风险评分。

GitHub → 本仓库 → Settings → Secrets and variables → Actions：

- 在 **Secrets** 添加 `WORLD_AI_KEY`：模型 API Key。可与浏览器设置使用同一服务商/Key，但需要在此单独配置。不要把密钥放进代码、Variables 或聊天。
- 在 **Variables** 添加 `WORLD_AI_ENDPOINT`：完整 HTTPS Chat Completions 地址，例如服务商给出的 `https://…/v1/chat/completions`。
- 在 **Variables** 添加 `WORLD_AI_MODEL`：服务商支持的准确模型 ID。

提交本版本后，在 Actions → Build, test and deploy → Run workflow 手动运行一次，检查日志和页面。此后计划每天 **10:23 UTC** 运行，GitHub 调度可能延迟。发布流程仍会在 push 时刷新报道；模型生成只在每日计划或手动运行时触发。同一 UTC 日若能读取到已发布的分析，会复用它，减少重复请求。

每次新分析最多请求两种语言各一次；服务商按用量计费。密钥仅在 GitHub 任务的请求头使用，不进入 Pages 文件。发布的是公开报道的分析文章，不包含用户聊天、笔记、账号信息或密钥。

`public/world-analysis.json` 保留最多 30 个 UTC 日期的中英文文章和各自证据快照；新部署先读取上次已发布的文件再追加，不自动 commit 生成数据。生成失败保留历史；未配置模型时新闻抓取和手动生成仍可用。浏览器缓存已读到的自动分析供离线使用。若已发布历史因网络错误无法读取，任务会停止部署以免覆盖历史，可稍后重试；首次发布的 404 会正常初始化。

本地检查：`node --import tsx scripts/fetch-world.mjs`；自动文章：`WORLD_GENERATE=true` 并通过本机环境配置上述三项后运行 `node --import tsx scripts/generate-world.ts`。不要把密钥写进 shell 历史。通常直接在 GitHub Secrets 配置后手动运行工作流更简单。

图标已同步更新 SVG、192/512 PNG 和 Apple touch icon。iOS 主屏幕可能继续显示系统缓存的旧图标；应用正文的版本号可用于确认代码更新。
