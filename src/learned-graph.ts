import type { Article, Concept, Edge, State } from "./model";

/** @requires A curated catalog and validated progress. @ensures Unread concepts and dangling edges are excluded together. */
export function learnedGraph(content: { articles: Article[]; concepts: Concept[]; edges: Edge[] }, state: State) {
  const articles = content.articles.filter(a => state.progress[a.id]?.complete === true);
  const ids = new Set(articles.flatMap(a => a.concepts));
  return {
    articles,
    concepts: content.concepts.filter(c => ids.has(c.id)),
    edges: [...content.edges, ...state.edges].filter(e => ids.has(e.from) && ids.has(e.to)),
    personalEdges: state.edges.filter(e => ids.has(e.from) && ids.has(e.to)),
  };
}
