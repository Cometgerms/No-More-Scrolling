import React from "react";
import { createRoot } from "react-dom/client";
import { ChatAnswer } from "../src/ChatAnswer";
import { LanguageProvider } from "../src/i18n";
import "../src/styles.css";
import "katex/dist/katex.min.css";

const text = String.raw`## 为什么零概率仍然可能发生？
**Almost surely** 并不等于逻辑上的必然。
- 单个点的概率是 \(P(X=x)=0\)。
- 区间的概率可以大于零。
\[P(a\le X\le b)=\int_a^b f_X(x)\,dx\]
| 概念 | 含义 |
| --- | --- |
| Probability zero | 在这个分布下概率为零 |
| Impossible | 事件根本不属于样本空间 |

1. 先确定 sample space。
2. 再看 measure。

下面代码可横向滚动：
` + "```python\nprobability = integrate(density, lower_bound, upper_bound) # a deliberately long example\n```";

createRoot(document.getElementById("root")!).render(<LanguageProvider initialLanguage="zh"><main style={{maxWidth:390,margin:"24px auto",padding:16}}><p className="hint">390px · Chat rendering fixture · No API requests</p><div className="chat-message assistant"><small>AI · 概率与测度</small><ChatAnswer text={text}/></div></main></LanguageProvider>);
