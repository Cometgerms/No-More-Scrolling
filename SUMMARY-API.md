# World summary API

Set the full endpoint under **Profile → Settings → World summary API**. The frontend is implemented; a model backend is not bundled or provisioned. Empty configuration shows source reports and a clear setup prompt instead of fabricated summaries.

## Request

`POST /summarize` with `Content-Type: application/json`:

```json
{
  "version": 1,
  "language": "zh",
  "focus": "international diplomacy and public policy",
  "instructions": "Summarize only the supplied evidence…",
  "events": [
    {
      "id": "source-event-id",
      "title": "Original publisher headline",
      "url": "https://publisher.example/article",
      "publishedAt": "2026-10-18T00:00:00Z",
      "source": "Publisher",
      "region": "europe"
    }
  ]
}
```

`language` is `zh` or `en`. At most eight currently filtered reports are sent, only after pressing Generate summaries. No personal profile, chat history, reading notes or API keys are included.

## Response

```json
{
  "summaries": [
    {
      "id": "source-event-id",
      "summary": "用请求语言概括有来源支持的报道要点。",
      "significance": "区分可能的外交或政策影响与已证实事实，并说明证据不足之处。",
      "category": "diplomacy"
    }
  ]
}
```

IDs must match the request; each may appear once. `category` is `diplomacy`, `policy` or `other`. Both text fields must be nonempty and shorter than 5,000 characters. Partial responses are allowed; omitted reports remain marked as not summarized. The original source URL always stays attached. Never treat a headline as sufficient evidence for invented article details. To summarize full articles, the backend needs lawful access to the underlying text and should preserve provenance.

Keep model keys on the backend. The frontend accepts HTTPS endpoints, plus HTTP loopback (`localhost`, `127.0.0.1`, `[::1]`) for local development. Permit the app's exact origin with CORS, including OPTIONS preflight. Production Pages/mobile should use a reachable HTTPS service: a phone's localhost is the phone, and browsers may restrict local-network access from public HTTPS pages. The frontend sends no cookies and follows no redirects. Apply service-side authentication/rate limits before exposing a paid model backend publicly.

The request can be stopped and times out after 60 seconds. Errors preserve source reports. Generated summaries are saved locally, separated by language and report edition/filter, up to 60 cached batches. Source history keeps the latest visited snapshot for each UTC day, up to 30 dates; this is browser-local history, not a continuously collected server archive. The export button exports source snapshots. Browser data deletion removes these records; source history and summary cache are separate from the reading/profile backup.

## Map attribution

`src/world-land.json` contains equirectangular SVG paths generated from Natural Earth's 1:110m land dataset. Data: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson . Natural Earth data is public domain. No external map script, API key or network request is required to render the map.
