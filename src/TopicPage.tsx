import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useContent, useLanguage } from "./i18n";
import { TOPICS, topicProgress } from "./topics";
import { SubjectIcon, BadgeIcon } from "./ProfileArt";
import { badgeProgress } from "./achievements";
import { localDate } from "./logic";
import { SUBJECTS, type State } from "./model";

export function Topics({ state, selected, navigate, open }: { state: State; selected?: string; navigate: (path: string) => void; open: (id: string, topic?: string) => void }) {
  const { language } = useLanguage(), en = language === "en", { articles } = useContent();
  const topic = TOPICS.find(t => t.id === selected);
  if (!topic) return <section className="topics-page"><div className="page-heading"><span className="eyebrow">CHOOSE A THREAD</span><h1>{en ? "Topic mode" : "专题模式"}</h1><p>{en ? "Four subjects. Follow one thread at your own pace; progress is shared with daily reading." : "保留四个学科，沿一个问题连续读。专题与每日阅读共用进度。"}</p></div><div className="topic-grid">{TOPICS.map(t => { const p = topicProgress(t, state); return <button key={t.id} className="topic-card" onClick={() => navigate(`topics/${t.id}`)}><SubjectIcon subject={t.subject} size={28}/><h2>{en ? t.en : t.zh}</h2><p>{en ? t.descriptionEn : t.description}</p><progress max={p.total} value={p.completed} aria-label={en ? t.en : t.zh}/><span>{p.completed} / {p.total} {en ? "completed" : "已读完"} <ArrowRight size={16}/></span></button>; })}</div></section>;
  const progress = topicProgress(topic, state);
  const badges = badgeProgress(state, localDate()).filter(b => b.id.startsWith(topic.id === "abstract-algebra" ? "aa-" : `topic-${topic.id}`));
  return <section className="topics-page" style={{"--subject":SUBJECTS[topic.subject].color} as React.CSSProperties}>
    <button className="text-button" onClick={() => navigate("topics")}><ArrowLeft size={17}/>{en ? "All four topics" : "全部四个专题"}</button>
    <div className="page-heading"><span className="eyebrow">{topic.id === "abstract-algebra" ? "AA · FIRST STEPS" : "A GUIDED READING PATH"}</span><h1>{en ? topic.en : topic.zh}</h1><p>{en ? topic.descriptionEn : topic.description}</p></div>
    <div className="topic-summary"><SubjectIcon subject={topic.subject} size={30}/><strong>{progress.completed} / {progress.total}</strong><span>{en ? "lessons completed" : "讲已读完"}</span><progress max={progress.total} value={progress.completed} aria-label={en ? "Topic progress" : "专题进度"}/></div>
    {progress.next ? <button className="primary" onClick={() => open(progress.next!,topic.id)}>{en ? "Continue next unread lesson" : "继续下一讲未读内容"}<ArrowRight size={18}/></button> : <p className="topic-finished">{en ? "This introduction is complete. You can revisit any lesson below." : "本专题入门内容已读完。下方各讲仍可随时回顾。"}</p>}
    <div className="topic-lessons">{topic.lessons.map((id,i) => { const a=articles.find(a=>a.id===id)!; const done=state.progress[id]?.complete; return <button className="related-article" key={id} onClick={()=>open(id,topic.id)}><span className="lesson-number">{done?<Check size={20}/>:String(i+1).padStart(2,"0")}</span><span><strong>{a.title}</strong><small>{a.minutes} MIN · {done ? (en?"Completed · revisit":"已读完 · 回顾") : (en?"Unread":"未读完")}</small></span><ArrowRight size={18}/></button>; })}</div>
    <h2>{en ? "Topic achievements" : "专题成就"}</h2><div className="topic-badges">{badges.map(b=><div key={b.id} className={`topic-badge ${b.earned?"earned":""}`}><BadgeIcon kind={b.icon}/><strong>{en?b.en:b.zh}</strong><span>{Math.min(b.value,b.target)} / {b.target}</span></div>)}</div>
    <p className="hint">{en ? "Completion records participation, not mastery. Earned badges can be displayed from your profile." : "完成记录学习参与，不代表已经掌握。已解锁成就可在个人资料里选择展示。"}</p>
  </section>;
}
