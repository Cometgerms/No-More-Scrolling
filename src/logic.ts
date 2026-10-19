import { articles, concepts } from "./content";
import { initialState, type State, type Subject } from "./model";
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dailySelection(date: string, state: State) {
  const previousDate = Object.keys(state.daily).filter(d => d < date).sort().at(-1);
  const previous = new Set(previousDate ? state.daily[previousDate] : []);
  const day = Math.floor(
    Date.UTC(
      ...(date
        .split("-")
        .map(Number)
        .map((n, i) => (i === 1 ? n - 1 : n)) as [number, number, number]),
    ) / 86400000,
  );
  const terms = state.interests
    .toLowerCase()
    .split(/[,，;；\s]+/)
    .filter((x) => x.length > 2);
  return (["math", "cs", "history", "politics"] as Subject[]).flatMap(
    (subject, index) => {
      const pool = articles.filter((a) => a.subject === subject);
      const cached = state.daily[date]?.find(id => pool.some(a => a.id === id));
      // Keep today's completion visible without filling its slot with an endless next article.
      if (cached && state.progress[cached]?.complete && state.progress[cached].completedOn === date) return [cached];
      const unread = pool.filter(a => !state.progress[a.id]?.complete);
      if (!unread.length) return [];
      const fresh = unread.filter(a => !previous.has(a.id));
      const eligible = new Set((fresh.length ? fresh : unread).map(a => a.id));
      if (cached && eligible.has(cached)) return [cached];
      return pool
        .map((a, i) => ({
          a,
          score:
            ((day + index) % pool.length === i ? 3 : 0) +
            (a.difficulty === state.difficulty ? 0.5 : 0) +
            (state.progress[a.id]?.feedback === "skip" ? -5 : 0) +
            (terms.some((term) =>
              (
                a.title +
                " " +
                a.subtitle +
                " " +
                a.prerequisites.join(" ") +
                " " +
                a.concepts
                  .map((id) => concepts.find((c) => c.id === id)?.name)
                  .join(" ")
              )
                .toLowerCase()
                .includes(term),
            )
              ? 0.5
              : 0),
        }))
        .filter(({ a }) => eligible.has(a.id))
        .sort((a, b) => b.score - a.score)[0].a.id;
    },
  );
}
export function cacheTrace(addresses: number[], sets = 4, blockSize = 16) {
  const cache: (number | null)[] = Array(sets).fill(null);
  return addresses.map((address) => {
    const block = Math.floor(address / blockSize),
      set = block % sets,
      tag = Math.floor(block / sets),
      hit = cache[set] === tag;
    cache[set] = tag;
    return { address, set, tag, hit, cache: [...cache] };
  });
}
export function pairwise(counts: number[]) {
  const preferences = [
    ["A", "B", "C"],
    ["B", "C", "A"],
    ["C", "A", "B"],
  ];
  return [
    ["A", "B"],
    ["B", "C"],
    ["C", "A"],
  ].map(([a, b]) => {
    let av = 0,
      bv = 0;
    preferences.forEach((p, i) => {
      if (p.indexOf(a) < p.indexOf(b)) av += counts[i];
      else bv += counts[i];
    });
    return { a, b, av, bv, winner: av === bv ? "tie" : av > bv ? a : b };
  });
}
export function condorcetWinner(counts: number[]) {
  const results = pairwise(counts);
  return (
    ["A", "B", "C"].find((c) =>
      results
        .filter((r) => r.a === c || r.b === c)
        .every((r) => r.winner === c),
    ) ?? null
  );
}
export function cantorIntervals(n: number): [number, number][] {
  let ranges: [number, number][] = [[0, 1]];
  for (let i = 0; i < n; i++)
    ranges = ranges.flatMap(([a, b]) => {
      const d = (b - a) / 3;
      return [
        [a, a + d],
        [b - d, b],
      ] as [number, number][];
    });
  return ranges;
}
export function validateState(raw: unknown): State {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("备份格式不正确");
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) throw new Error("不支持这个备份版本");
  const out: State = structuredClone(initialState),
    validIds = new Set([
      ...articles.map((a) => a.id),
      ...concepts.map((c) => c.id),
    ]),
    isRecord = (v: unknown): v is Record<string, unknown> =>
      !!v && typeof v === "object" && !Array.isArray(v);
  if (isRecord(r.profile)) out.profile = {
    name: typeof r.profile.name === "string" ? r.profile.name.slice(0, 40) : "",
    bio: typeof r.profile.bio === "string" ? r.profile.bio.slice(0, 200) : "",
    avatar: Number.isInteger(r.profile.avatar) && Number(r.profile.avatar) >= 0 && Number(r.profile.avatar) <= 3 ? Number(r.profile.avatar) : 0,
  };
  if (isRecord(r.profile) && Array.isArray(r.profile.badges)) out.profile.badges = r.profile.badges.filter((v): v is string => typeof v === "string" && /^[a-z0-9-]{1,40}$/.test(v)).slice(0, 3);
  if (Array.isArray(r.unlocked)) out.unlocked = r.unlocked.includes("rickroll") ? ["rickroll"] : [];
  if (isRecord(r.edgeReasons)) {
    out.edgeReasons = {};
    for (const [key, value] of Object.entries(r.edgeReasons).slice(0,1000)) {
      const ids = key.split("|");
      if (ids.length === 2 && ids[0] !== ids[1] && ids.every(id => concepts.some(c => c.id === id)) && typeof value === "string") out.edgeReasons[key] = value.slice(0,3000);
    }
  }
  if (Array.isArray(r.saved))
    out.saved = [
      ...new Set(
        r.saved.filter(
          (x): x is string => typeof x === "string" && validIds.has(x),
        ),
      ),
    ];
  if (isRecord(r.notes))
    for (const [k, v] of Object.entries(r.notes))
      if (validIds.has(k) && typeof v === "string")
        out.notes[k] = v.slice(0, 20000);
  if (Array.isArray(r.edges))
    out.edges = r.edges
      .flatMap((e) =>
        isRecord(e) &&
        typeof e.from === "string" &&
        typeof e.to === "string" &&
        concepts.some((c) => c.id === e.from) &&
        concepts.some((c) => c.id === e.to) &&
        e.from !== e.to &&
        typeof e.label === "string"
          ? [
              {
                from: e.from,
                to: e.to,
                label: e.label.slice(0, 300),
                personal: true,
              },
            ]
          : [],
      )
      .slice(0, 1000);
  if (isRecord(r.progress))
    for (const [id, v] of Object.entries(r.progress)) {
      const a = articles.find((a) => a.id === id);
      if (a && isRecord(v))
        out.progress[id] = {
          section: Math.max(
            0,
            Math.min(
              a.sections.length - 1,
              Number.isFinite(v.section) ? Math.floor(Number(v.section)) : 0,
            ),
          ),
          complete: v.complete === true,
          ...(v.complete === true && typeof v.completedOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.completedOn)
            ? { completedOn: v.completedOn } : {}),
          ...(Number.isInteger(v.answer) &&
          Number(v.answer) >= 0 &&
          Number(v.answer) < a.quiz.options.length
            ? { answer: Number(v.answer) }
            : {}),
          ...(["basic", "hard", "interesting", "skip"].includes(
            String(v.feedback),
          )
            ? { feedback: v.feedback as State["progress"][string]["feedback"] }
            : {}),
        };
    }
  if (isRecord(r.daily))
    for (const [date, v] of Object.entries(r.daily))
      if (
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Array.isArray(v) &&
        v.length <= 4 &&
        v.every(
          (x) => typeof x === "string" && articles.some((a) => a.id === x),
        ) &&
        new Set(v.map((id) => articles.find((a) => a.id === id)!.subject))
          .size === v.length
      )
        out.daily[date] = v;
  if (isRecord(r.seconds))
    for (const [date, v] of Object.entries(r.seconds))
      if (
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        typeof v === "number" &&
        Number.isFinite(v) &&
        v >= 0
      )
        out.seconds[date] = Math.min(v, 86400);
  if (["dark", "light", "system"].includes(String(r.theme)))
    out.theme = r.theme as State["theme"];
  if (r.difficulty === 2 || r.difficulty === 3) out.difficulty = r.difficulty;
  if (Array.isArray(r.subjects))
    out.subjects = [
      ...new Set(
        r.subjects.filter((x): x is Subject =>
          ["math", "cs", "history", "politics"].includes(String(x)),
        ),
      ),
    ];
  if ([5, 10, 15].includes(Number(r.goal))) out.goal = Number(r.goal);
  if (typeof r.interests === "string")
    out.interests = r.interests.slice(0, 2000);
  return out;
}
