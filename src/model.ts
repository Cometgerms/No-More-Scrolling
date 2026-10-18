export type Subject = "math" | "cs" | "history" | "politics";
export type Feedback = "basic" | "hard" | "interesting" | "skip";
export type Block = {
  kind: "text" | "math" | "note" | "code" | "figure";
  body: string;
  label?: string;
};
export type Section = { title: string; blocks: Block[] };
export type Concept = {
  id: string;
  name: string;
  zh: string;
  subject: Subject;
  description: string;
};
export type Edge = {
  from: string;
  to: string;
  label: string;
  personal?: boolean;
};
export type Article = {
  id: string;
  subject: Subject;
  title: string;
  subtitle: string;
  question: string;
  difficulty: 2 | 3;
  minutes: number;
  prerequisites: string[];
  concepts: string[];
  sections: Section[];
  lab:
    | "measure"
    | "cantor"
    | "halting"
    | "cache"
    | "timeline"
    | "evidence"
    | "voting"
    | "agenda";
  labIntro: string;
  deep: Section;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanations: string[];
  };
  sources: { title: string; url: string; note: string }[];
  publishedAt: string;
  verifiedAt: string;
  verification: string;
  contentType: "theorem" | "historical-analysis" | "formal-model";
};
export type Progress = {
  section: number;
  complete: boolean;
  answer?: number;
  feedback?: Feedback;
};
export type State = {
  profile: { name: string; bio: string; avatar: number; badges?: string[] };
  unlocked?: string[];
  edgeReasons?: Record<string, string>;
  version: 1;
  saved: string[];
  notes: Record<string, string>;
  edges: Edge[];
  progress: Record<string, Progress>;
  daily: Record<string, string[]>;
  seconds: Record<string, number>;
  theme: "dark" | "light" | "system";
  difficulty: 2 | 3;
  subjects: Subject[];
  goal: number;
  interests: string;
};
export const SUBJECTS: Record<
  Subject,
  { name: string; en: string; color: string; symbol: string }
> = {
  math: { name: "数学", en: "MATHEMATICS", color: "#c1f27b", symbol: "∑" },
  cs: { name: "计算机", en: "COMPUTER SCIENCE", color: "#87d8e4", symbol: "⌘" },
  history: { name: "历史", en: "HISTORY", color: "#edbc83", symbol: "⌛︎" },
  politics: { name: "政治", en: "POLITICS", color: "#c5adf1", symbol: "◎" },
};
export const initialState: State = {
  profile: { name: "", bio: "", avatar: 0 },
  version: 1,
  saved: [],
  notes: {},
  edges: [],
  progress: {},
  daily: {},
  seconds: {},
  theme: "dark",
  difficulty: 3,
  subjects: ["math", "cs", "history", "politics"],
  goal: 10,
  interests: "Measure theory, computability, systems, political institutions",
};
