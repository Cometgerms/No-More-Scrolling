import type { Article, Block, Concept, Edge, Section } from "./model";
import { nextArticles, nextConcepts, nextEdges } from "./content-next";
const t = (body: string): Block => ({ kind: "text", body });
const m = (body: string): Block => ({ kind: "math", body });
const f = (body: "measure" | "cantor" | "diagonal"): Block => ({ kind: "figure", body });
const n = (label: string, body: string): Block => ({
  kind: "note",
  label,
  body,
});
const c = (body: string): Block => ({ kind: "code", body });
const s = (title: string, ...blocks: Block[]): Section => ({ title, blocks });
const measureSource = {
  title: "MIT · Measure and Integration",
  url: "https://ocw.mit.edu/courses/18-125-measure-and-integration-fall-2003/pages/lecture-notes/",
  note: "Measure、countable additivity 与 Lebesgue measure 的大学课程讲义。",
};
const computingSource = {
  title: "L. Moss · Invitation to Computability",
  url: "https://lmoss.github.io/undecidability/haltingProblem.html",
  note: "Halting problem 的构造与不可判定性证明。",
};
const voteSource = {
  title: "E. Pacuit · Voting Methods",
  url: "https://plato.stanford.edu/entries/voting-methods/",
  note: "Condorcet cycle、投票规则与规则之间的取舍。",
};
const bankSource = {
  title: "Bank of England · Founding documents",
  url: "https://www.bankofengland.co.uk/museum/online-collections/archive-gallery/founding-documents",
  note: "1694 年特许状、认购记录等档案；可支持事件与融资规模，不能单独证明因果关系。",
};
const parliamentSource = {
  title: "UK Parliament · The Financial Revolution",
  url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/parliamentaryauthority/revolution/overview/financialrevolution/",
  note: "议会财政控制与英格兰银行的制度背景；属于机构的历史解释。",
};
const meta = {
  publishedAt: "2026-10-17",
  verifiedAt: "2026-10-17",
  verification:
    "对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。",
};
export const concepts: Concept[] = [
  ...nextConcepts,
  {
    id: "measure",
    name: "Measure",
    zh: "测度",
    subject: "math",
    description:
      "在 σ-algebra 上定义的非负、可数可加的集合函数。它把长度与概率放进同一个框架。",
  },
  {
    id: "countable",
    name: "Countable additivity",
    zh: "可数可加性",
    subject: "math",
    description:
      "可数个两两不交的可测集合，其并的测度等于测度之和；条件中的“可数”不能删去。",
  },
  {
    id: "cantor",
    name: "Cantor set",
    zh: "康托集",
    subject: "math",
    description: "标准三分 Cantor set 是不可数的闭集，Lebesgue measure 为零。",
  },
  {
    id: "diagonal",
    name: "Diagonalization",
    zh: "对角线论证",
    subject: "math",
    description:
      "对假设中的完整列表，构造一个至少在自身索引位置与每项不同的新对象。",
  },
  {
    id: "halting",
    name: "Halting problem",
    zh: "停机问题",
    subject: "cs",
    description: "不存在总能停机且正确判定任意程序在任意输入上是否停机的算法。",
  },
  {
    id: "decidability",
    name: "Decidability",
    zh: "可判定性",
    subject: "cs",
    description: "一个判定问题是否存在对所有输入都停机且正确给出是或否的算法。",
  },
  {
    id: "cache",
    name: "Cache mapping",
    zh: "缓存映射",
    subject: "cs",
    description:
      "地址被划分为 tag、set index 与 block offset；映射冲突可以使小工作集反复 miss。",
  },
  {
    id: "modular",
    name: "Modular arithmetic",
    zh: "模运算",
    subject: "math",
    description:
      "把相差某个整数倍的数视为等价；cache 的组索引就是 block number 对组数取模。",
  },
  {
    id: "credit",
    name: "Credible commitment",
    zh: "可信承诺",
    subject: "politics",
    description:
      "承诺在未来仍值得遵守的机制。制度、激励与执行能力共同影响其可信度。",
  },
  {
    id: "bank",
    name: "Financial Revolution",
    zh: "金融革命",
    subject: "history",
    description:
      "17 世纪末英格兰财政与融资制度变化的历史主题；其解释涉及战争、税收、议会与金融组织。",
  },
  {
    id: "causal",
    name: "Causal inference",
    zh: "因果推断",
    subject: "history",
    description:
      "区分时间先后、相关性与因果作用；反事实推断需要额外假设与证据。",
  },
  {
    id: "voting",
    name: "Condorcet cycle",
    zh: "孔多塞循环",
    subject: "politics",
    description:
      "每个个体的偏好均可传递，但逐对多数关系可能形成 A 胜 B、B 胜 C、C 胜 A。",
  },
  {
    id: "relation",
    name: "Transitivity",
    zh: "传递性",
    subject: "math",
    description:
      "若 aRb 且 bRc，则 aRc。个体的关系有此性质，不保证聚合后的关系仍有。",
  },
  {
    id: "agenda",
    name: "Agenda setting",
    zh: "议程设置",
    subject: "politics",
    description:
      "在某些顺序表决规则中，提案顺序会影响最终胜者；结论依赖具体规则与投票行为。",
  },
];
export const edges: Edge[] = [
  ...nextEdges,
  { from: "measure", to: "countable", label: "定义要求" },
  { from: "measure", to: "cantor", label: "零测度的不可数例子" },
  { from: "cantor", to: "diagonal", label: "不可数性可用此法证明" },
  { from: "diagonal", to: "halting", label: "证明方法" },
  { from: "halting", to: "decidability", label: "不可判定的例子" },
  { from: "cache", to: "modular", label: "组索引使用" },
  { from: "bank", to: "credit", label: "一种制度解释" },
  { from: "bank", to: "causal", label: "历史解释需要" },
  { from: "voting", to: "relation", label: "多数关系可能失去" },
  { from: "voting", to: "agenda", label: "循环带来顺序效应" },
  { from: "credit", to: "agenda", label: "均涉及制度规则与激励" },
];
export const articles: Article[] = [
  {
    ...meta,
    id: "zero-is-not-impossible",
    subject: "math",
    title: "零概率，怎么拼出整个世界？",
    subtitle: "从一个随机点，走到可数与不可数的边界。",
    question: "每个点的概率都是 0，为什么总概率是 1？",
    difficulty: 3,
    minutes: 7,
    prerequisites: ["Infinite series", "Countable sets"],
    concepts: ["measure", "countable", "cantor"],
    lab: "measure",
    labIntro:
      "拖动区间的右端点，比较连续均匀分布的区间概率与单点概率。图中的点只是标记，不是离散样本空间。",
    contentType: "theorem",
    sections: [
      s(
        "01 · 一个必然发生的零概率事件",
        t(
          "想象一支理想飞镖，落在长度为 1 的线段上，每一段等长区间被击中的机会相同。你问它恰好落在 1/2 的概率。直觉可能说：很小，但总不能是零吧？如果每个点都有相同的正概率 p，那么只挑足够多的不同点，概率之和就会超过 1。",
        ),
        m("X\\sim\\operatorname{Uniform}[0,1],\\qquad \\mathbb P(X=x)=0"),
        t(
          "所以每个指定的 singleton \\(\\{x\\}\\) 都只能分到零概率。但 \\(X\\in[0,1]\\) 必然发生。关键区别是 null event（零测事件）与 empty event（空事件）：\\(\\mathbb P(A)=0\\) 并不推出 \\(A=\\varnothing\\)。",
        ),
        f("measure"),
      ),
      s(
        "02 · 加法有一条隐藏的边界",
        t(
          "Probability space 写作 \\( (\\Omega,\\mathcal F,\\mathbb P) \\)：sample space \\(\\Omega\\)、σ-algebra \\(\\mathcal F\\)、probability measure \\(\\mathbb P\\)。其中 \\(\\mathcal F\\) 对补集和可数并封闭，\\(\\mathbb P(\\Omega)=1\\)。对 pairwise disjoint 的可测事件，要求 countable additivity：",
        ),
        m(
          "\\begin{gathered} A_i\\cap A_j=\\varnothing\\quad(i\\ne j),\\quad A_n\\in\\mathcal F\\\\[6pt] \\mathbb P\\!\\left(\\bigsqcup_{n=1}^{\\infty} A_n\\right) =\\sum_{n=1}^{\\infty}\\mathbb P(A_n) \\end{gathered}",
        ),
        t(
          "关键在于 n 能按自然数排队。区间里的所有实数无法这样列成一个序列，因此把区间拆成所有 singleton 后，不能直接套这条公理。这个等式的适用条件从来没有覆盖那个拆法。",
        ),
        n(
          "Definition · Almost surely",
          "概率为 1 的性质称为 almost surely 成立；它允许一个非空的零测度例外集合。",
        ),
      ),
      s(
        "03 · 连稠密也救不了有理数",
        t(
          "现在把目标从单点换成所有有理数。有理数在每一小段区间都存在，称为 dense；但它们也能排成可数序列。于是这次加法可以合法使用。",
        ),
        m(
          "\\mathbb P(X\\in\\mathbb Q\\cap[0,1])=\\sum_{q\\in\\mathbb Q\\cap[0,1]}\\mathbb P(X=q)=0",
        ),
        t(
          "因此随机点 almost surely 是无理数。Dense 描述每个邻域都能碰到这个集合，measure 描述集合的大小。这两种视角回答不同的问题。一个在屏幕上画得密密麻麻的点集，也不能因此被赋予正长度。",
        ),
      ),
      s(
        "04 · 回到飞镖：测量的是区间",
        t(
          "现实测量只能告诉你落点在某个分辨率范围内，比如 0.49 到 0.51；这个事件有正概率。缩小范围时，区间概率连续下降到零。单点是这个极限，但这个极限不妨碍最终观测到某个数。",
        ),
        m("\\begin{gathered} f_X(x)=\\mathbf 1_{[0,1]}(x)\\\\[6pt] \\mathbb P(a\\le X\\le b)=\\int_a^b f_X(x)\\,dx=b-a\\\\ 0\\le a\\le b\\le1 \\end{gathered}"),
        t(
          "现在试着改变下面的区间宽度。随后再问一个更难的问题：所有零测度集合都可数吗？下一张 Cantor set 卡会拆掉这个直觉。",
        ),
      ),
    ],
    deep: s(
      "深入 · 从上连续性",
      t(
        "对 \\(x\\in[0,1]\\)，令 \\(A_n=[x-1/n,x+1/n]\\cap[0,1]\\)。它们递减到 \\(\\{x\\}\\)，且 \\(\\mathbb P(A_1)<\\infty\\)。Measure 的 continuity from above 给出：",
      ),
      m(
        "A_n\\downarrow\\{x\\}\\quad\\Longrightarrow\\quad\n\\mathbb P(\\{x\\})=\\lim_{n\\to\\infty}\\mathbb P(A_n)=0",
      ),
      t(
        "有限测度条件是一般定理中的必要前提之一；在 probability space 中自动满足。注意这是关于一列集合的极限，仍然处在“可数”的框架内。",
      ),
    ),
    quiz: {
      question: "已知 \\(A\\subseteq[0,1]\\) 不可数，能推出 \\(\\lambda(A)>0\\) 吗？（假设 A 可测。）",
      options: [
        "能；每个点的零累积成正数",
        "不能；标准 Cantor set 是反例",
        "能；不可数就是长度无限",
      ],
      answer: 1,
      explanations: [
        "不可数个零不能用 countable additivity 来求和；不可数也不保证正测度。",
        "正确。标准 Cantor set 不可数，但其 Lebesgue measure 为零。",
        "Cardinality 与 measure 是不同概念，不能混同。",
      ],
    },
    sources: [measureSource],
  },
  {
    ...meta,
    id: "cantor-dust",
    subject: "math",
    title: "删掉所有长度，还剩多少点？",
    subtitle: "一份无穷长的二进制地址，藏在 Cantor dust 里。",
    question: "一个长度为零的集合，能和整个区间一样多点吗？",
    difficulty: 3,
    minutes: 7,
    prerequisites: ["Geometric series", "Binary sequences"],
    concepts: ["cantor", "measure", "diagonal"],
    lab: "cantor",
    labIntro:
      "每按一次，移去所有剩余区间的开中间三分之一。有限步仍有正长度；零长度是无穷过程的极限。",
    contentType: "theorem",
    sections: [
      s(
        "01 · 一条线段的消失实验",
        t(
          "从 \\([0,1]\\) 出发，删掉开区间 \\((1/3,2/3)\\)。留下两端，再从每一段的中间删掉三分之一。端点始终保留。重复 \\(n\\) 次后，有 \\(2^n\\) 个 closed intervals，每段长度 \\(3^{-n}\\)。",
        ),
        m(
          "C_0=[0,1],\\quad C=\\bigcap_{n=0}^{\\infty}C_n,\\quad\\lambda(C_n)=\\left(\\frac23\\right)^n",
        ),
        t(
          "屏幕越来越像灰尘，但我们关心的 C 是全部有限步骤的交集，不是某一帧。",
        ),
        f("cantor"),
      ),
      s(
        "02 · 长度确实消失了",
        t(
          "这些 closed sets 递减，初始测度有限。由 continuity from above，极限集合的测度等于测度的极限。所以 \\(\\lambda(C)=0\\)。到这里你也许会猜：只剩少数端点了吧？",
        ),
        m("\\lambda(C)=\\lim_{n\\to\\infty}\\left(\\frac23\\right)^n=0"),
        t(
          "这个猜测忽略了另一种留下来的方式：每一步都选左或右，从不落入被删除的中间区域。一份无限长的左右选择，决定一个唯一的点。",
        ),
      ),
      s(
        "03 · 每个点都有一份无限地址",
        t(
          "把左记作 0，右记作 2，这就是一个只含 0 与 2 的三进制展开。任意二进制序列 b 都能映射到 Cantor set 中：",
        ),
        m(
          "b=(b_1,b_2,\\ldots)\\in\\{0,1\\}^{\\mathbb N}\n\\quad\\mapsto\\quad x_b=\\sum_{n=1}^{\\infty}\\frac{2b_n}{3^n}",
        ),
        t(
          "两份序列首次在第 k 位不同，该位贡献的差为 2/3ᵏ，后续所有差的绝对值之和至多为 1/3ᵏ。因此它们映射到不同点。无限二进制序列不可数，所以 Cantor set 也不可数。",
        ),
      ),
      s(
        "04 · 你的直觉用了哪把尺？",
        t(
          "Cardinality 问能否配对，measure 问大小。Cantor set 与实数区间有同样的基数，却有不同的 Lebesgue measure。把它放大一点或画得粗一点，都不会改变这两个数学事实。",
        ),
        m("\\begin{gathered} |C|=|[0,1]|=2^{\\aleph_0}\\\\ \\lambda(C)=0\\quad\\text{but}\\quad\\lambda([0,1])=1 \\end{gathered}"),
        n(
          "模型边界",
          "下面显示的是有限级近似 Cₙ。屏幕像素不能展示真正的极限集；动画提供直觉，证明来自上面的极限与单射。",
        ),
      ),
    ],
    deep: s(
      "深入 · 为什么无限地址不可数？",
      t(
        "若所有二进制序列能排成 b¹,b²,…，构造 dₙ=1−bⁿₙ。新序列 d 在第 n 位与第 n 个序列不同，因此不在列表里。这就是 diagonalization，也会出现在停机问题里。",
      ),
      m(
        "\\begin{gathered} d_n=1-b^{(n)}_n\\\\ d\\ne b^{(n)}\\quad\\text{for every }n\\in\\mathbb N \\end{gathered}",
      ),
      f("diagonal"),
    ),
    quiz: {
      question: "进行 5 次删除后，剩余长度是多少？",
      options: ["\\(0\\)", "\\((2/3)^5\\)", "\\(1/3^5\\)"],
      answer: 1,
      explanations: [
        "任意有限步的剩余长度仍为正。只有极限为零。",
        "正确。共 \\(2^5\\) 段，每段 \\(3^{-5}\\)，总长 \\((2/3)^5\\)。",
        "这是一段的长度，漏算了共 2⁵ 段。",
      ],
    },
    sources: [measureSource],
  },
  {
    ...meta,
    id: "machine-against-itself",
    subject: "cs",
    title: "让程序预测自己，然后反着做",
    subtitle: "Halting problem：一个完美预测器的自我崩塌。",
    question: "为什么更快的电脑，也造不出万能停机检测器？",
    difficulty: 3,
    minutes: 8,
    prerequisites: ["Functions", "Proof by contradiction"],
    concepts: ["halting", "diagonal", "decidability"],
    lab: "halting",
    labIntro:
      "假装 H 能预测 D(D)。分别选择两种预测，逐步查看 D 的反应。无论哪条分支，都会与假设冲突。",
    contentType: "theorem",
    sections: [
      s(
        "01 · 你接到一份看似合理的需求",
        t(
          "有一个程序可能卡死。运行它，等一分钟，没有结束；等一年，仍然没有。你知道这不是无限循环的证明，因为它也许明天就停。于是你决定写一个更聪明的静态分析器 H，直接读代码和输入，回答“会停”或“不会停”。",
        ),
        m(
          "H(P,x)=\\begin{cases}1& P(x)\\text{ halts}\\\\0& P(x)\\text{ runs forever}\\end{cases}",
        ),
        t(
          "要求很强：H 对所有合法程序与输入都必须在有限时间内给出正确答案。只对一部分程序有效，并不能满足这份需求。",
        ),
      ),
      s(
        "02 · 把代码也当成数据",
        t(
          "程序可以编码成字符串，所以“把一个程序作为另一个程序的输入”没有神秘之处。编译器每天都在这样做。现在利用 H 写一个新程序 D：先问 H，输入程序拿自己当输入时会不会停，然后故意反着做。",
        ),
        c("D(P):\n  if H(P, P) == 1:\n    loop forever\n  else:\n    return"),
        t(
          "注意 D 本身允许不停机。我们假设总能停机的是检测器 H，不是所有被检测的程序。",
        ),
      ),
      s(
        "03 · 最刁钻的输入",
        t(
          "把 D 自己的编码交给 D。若 H(D,D)=1，D 会进入无限循环，预测错了。若 H(D,D)=0，D 会立即返回，预测仍然错了。两种答案已经穷尽。",
        ),
        m("D(D)\\text{ halts}\\iff H(D,D)=0\\iff D(D)\\text{ does not halt}"),
        t(
          "这个矛盾否定了最初对 H 的假设。我们没有证明某台机器太慢，而是证明这种同时满足 total、correct、general 的算法不存在。",
        ),
      ),
      s(
        "04 · 边界反而告诉我们怎么做工程",
        t(
          "实际分析器可以限制输入语言、允许回答 unknown，或者只保证一侧结论正确。只运行程序直到它结束，也能识别会停机的情况，却不能保证对不会停机的情况给出答案。",
        ),
        n(
          "Distinction · Recognizable ≠ Decidable",
          "Halting 是 recognizable：停机时最终能观察到。但一个 decider 必须在 yes 与 no 两侧都停机。",
        ),
        t(
          "所以这里的教训不是放弃分析，而是明确你牺牲了哪一项保证。现在用下面的两条分支，把矛盾亲手走一遍。",
        ),
      ),
    ],
    deep: s(
      "深入 · 把一个问题归约到另一个",
      t(
        "假设有算法判断任意程序在固定输入 0 上是否停机。给任意 (P,x)，构造 Q，使 Q 忽略输入并模拟 P(x)。那么判断 Q(0) 就能解决原来的停机问题，矛盾。",
      ),
      m(
        "Q(y):=P(x)\\quad\\Longrightarrow\\quad Q(0)\\downarrow\\iff P(x)\\downarrow",
      ),
      t(
        "这叫 reduction：把已知难问题转化成目标问题。方向很重要；要证明目标问题不可判定，就让目标问题的假想求解器能解决已知不可判定的问题。",
      ),
    ),
    quiz: {
      question:
        "一个分析器允许回答 unknown，但它输出“会停”或“不会停”时总是正确。这违反定理吗？",
      options: [
        "违反，因为它读了代码",
        "不违反，因为它不保证每次都作出判定",
        "违反，任何停机分析都不可能",
      ],
      answer: 1,
      explanations: [
        "读代码是允许的，矛盾来自三项要求同时成立。",
        "正确。unknown 放弃了对所有输入给出 yes/no 的要求。",
        "很多受限程序可以判定，通用的不可能性不排除局部工具。",
      ],
    },
    sources: [computingSource],
  },
  {
    ...meta,
    id: "tiny-cache-big-miss",
    subject: "cs",
    title: "明明放得下，为什么一直 miss？",
    subtitle: "一次地址映射，揭开缓存的冲突。",
    question: "只有两个数据块，怎么击败一个有四行的 cache？",
    difficulty: 2,
    minutes: 6,
    prerequisites: ["Binary addresses", "Arrays"],
    concepts: ["cache", "modular"],
    lab: "cache",
    labIntro:
      "一个 4-set、direct-mapped、block size=16 B 的空缓存。逐步执行 A=0x00、B=0x40、A、B，再与 B=0x10 对比。",
    contentType: "theorem",
    sections: [
      s(
        "01 · 容量足够，直觉失效",
        t(
          "你反复访问两个小数据块。缓存明明能放四块，第一次访问各 miss 一次之后，似乎就该一直 hit。然而 direct-mapped cache 并不让每个块自由选择位置：地址决定它唯一能待的组。",
        ),
        m(
          "\\operatorname{set}(a)=\\left\\lfloor\\frac{a}{B}\\right\\rfloor\\bmod S",
        ),
        t(
          "B 是 block size，S 是 set 数。先除 B 丢掉块内偏移，再对 S 取模得到组号。",
        ),
      ),
      s(
        "02 · 两个地址争同一把椅子",
        t(
          "设 B=16，S=4。地址 0x00 的 block number 是 0，地址 0x40 的 block number 是 4。它们对 4 取模都得 0，所以争用同一行，尽管其余三行空着。",
        ),
        m("0\\bmod4=0,\\qquad4\\bmod4=0"),
        t(
          "第一轮是 compulsory miss；之后 A 刚进入，B 就把它挤出，反复造成 conflict miss。这里的地址访问都只读取一个字节，避免跨块访问的额外问题。",
        ),
      ),
      s(
        "03 · 换个间距，换个结果",
        t(
          "把 B 放到 0x10，它映射到 set 1。于是 A、B 第一次各 miss，后续都 hit。移动布局或提高 associativity 可以缓解冲突，但也会引入其他工程权衡。",
        ),
        n(
          "Scope",
          "交互采用理想化的单层、读访问、空缓存模型；没有预取、多级缓存或其他进程的干扰。",
        ),
      ),
      s(
        "04 · 从模运算回到代码",
        t(
          "矩阵访问时固定步幅可能反复命中同一组。一个优化若只计算 working-set 大小，可能漏掉映射这一层。理解地址之间相差多少块，往往比背“cache 很快”更有用。下面亲手追踪 valid、tag 和替换。",
        ),
      ),
    ],
    deep: s(
      "深入 · 地址分解",
      m(
        "a=(\\operatorname{tag}\\cdot S+\\operatorname{set})B+\\operatorname{offset}",
      ),
      t(
        "当 B=2ᵇ、S=2ˢ 时，低 b 位是 offset，接着 s 位是 index，其余高位是 tag。每行的 valid bit 告诉我们这一行是否含有已加载数据。Tag 匹配还不够，valid 也必须为真。",
      ),
    ),
    quiz: {
      question: "在上述配置中，地址 0x80 映射到哪个 set？",
      options: ["0", "2", "8"],
      answer: 0,
      explanations: [
        "正确。128/16=8，8 mod 4=0。",
        "不要把十六进制最高位直接当组索引。",
        "8 是 block number；组索引还要 mod 4。",
      ],
    },
    sources: [
      {
        title: "Bryant & O’Hallaron · CS:APP",
        url: "https://csapp.cs.cmu.edu/3e/home.html",
        note: "Computer Systems: A Programmer’s Perspective, 3rd ed., Chapter 6，cache organization。",
      },
    ],
  },
  {
    ...meta,
    id: "borrowing-power",
    subject: "history",
    title: "限制国王，为什么能增强国家？",
    subtitle: "1694 年：一笔借款背后的制度故事。",
    question: "权力受到约束，为什么有时反而更容易筹到钱？",
    difficulty: 2,
    minutes: 7,
    prerequisites: ["Basic historical chronology"],
    concepts: ["bank", "credit", "causal"],
    lab: "timeline",
    labIntro:
      "先预测顺序，再逐项揭示事件。这个时间线建立背景，不把时间先后自动当作因果证明。",
    contentType: "historical-analysis",
    sections: [
      s(
        "01 · 借钱给一个能改规则的人",
        t(
          "站在一个债权人的位置：你愿意把钱借给一个今天答应还款、明天却能随意改规则的统治者吗？即使他有资源，你仍会担心承诺是否可信。国家的军事需求很紧迫，但借款人的强制权本身也可能让出借人犹豫。",
        ),
        n(
          "分析框架",
          "这个思想实验解释 credible commitment 的问题，不是对所有君主或每笔历史贷款行为的断言。",
        ),
      ),
      s(
        "02 · 先把能够确认的事件排好",
        t(
          "1689 年的 Bill of Rights 限制君主绕过议会征税等做法。1694 年，英格兰银行成立；其早期档案记载了 £1.2 million 的初始认购。融资与当时的战争需求有关。这里的制度不是现代普选民主，参与权与代表性仍有明显限制。",
        ),
        n(
          "已核实事实",
          "年代、法律约束与认购记录可查文末的议会资料及英格兰银行档案。不要把当时的 England 与后来的 United Kingdom 混用。",
        ),
      ),
      s(
        "03 · 把承诺系在机制上",
        t(
          "一种解释是：议会参与财政与专门安排还款收入，使政府的承诺不再只依赖个人意愿。债权人预期的还款可靠性提高，国家便可能在更有利的条件下融资。约束某种任意权力，同时可能提高组织动员资源的能力。",
        ),
        t(
          "这就是 credible commitment 的视角。但制度约束本身不自动保证一切：税收能力、战争形势、金融组织和债权人的政治影响也很重要。我们不能从“议会更强”直接推出一个普遍、无条件的利率定律。",
        ),
      ),
      s(
        "04 · 故事动听，还需要什么证据？",
        t(
          "如果改革后借贷条件改善，这是一条线索；若同时战争风险下降、税源扩大，就出现 competing explanations。比较不同借款、不同时间和不同制度安排，能帮助检验机制。",
        ),
        n(
          "反事实边界",
          "“没有这项改革会怎样”无法直接观测。反事实是一种受证据约束的推理，不能当成已经发生的历史。",
        ),
        t(
          "读到这里，你可以把 Financial Revolution 连到 Credible commitment，再给这条关系写上自己的疑问。图谱的连线也应携带解释，而不是只说“相关”。",
        ),
      ),
    ],
    deep: s(
      "深入 · 国家能力与权力集中",
      t(
        "State capacity、executive discretion 和 political inclusion 不是同一个轴。一个政府能筹集更多收入，不意味着它更平等；一个君主受限制，也不意味着所有人获得政治发言权。历史比较应分别观察融资、执行与代表机制，避免一个“强”字包办所有解释。",
      ),
    ),
    quiz: {
      question: "下列哪项最能区分事实与因果解释？",
      options: [
        "银行成立于 1694 年，因此制度改革必然降低所有借款利率",
        "档案支持成立年代；借贷改善的机制需要另行检验",
        "改革发生在先，足以证明因果",
      ],
      answer: 1,
      explanations: [
        "年份证据不足以支持普遍的因果定律。",
        "正确。事件核实与机制检验是不同任务。",
        "时间先后通常必要，但远非充分条件。",
      ],
    },
    sources: [
      bankSource,
      parliamentSource,
      {
        title: "Bank of England · History",
        url: "https://www.bankofengland.co.uk/about/history",
        note: "互动时间线中 1946 年国有化的来源。",
      },
    ],
  },
  {
    ...meta,
    id: "history-counterfactual",
    subject: "history",
    title: "把一件历史事件拿走，会怎样？",
    subtitle: "练习一个克制的 counterfactual。",
    question: "“如果没有某项改革”究竟是分析，还是小说？",
    difficulty: 3,
    minutes: 6,
    prerequisites: ["Correlation vs causation"],
    concepts: ["causal", "bank", "credit"],
    lab: "evidence",
    labIntro:
      "逐条判断一份虚构研究档案中的材料属于事实、机制解释还是反事实。材料中的数值是教学假设，不是历史统计。",
    contentType: "historical-analysis",
    sections: [
      s(
        "01 · 你已经知道结局",
        t(
          "历史最容易骗人的地方，是我们总在知道结果之后挑选原因。你看到某次制度改革随后出现融资增长，就很容易把整条路径写成必然。可在当时，参与者不知道结局；还有很多可能同时起作用的变化。",
        ),
      ),
      s(
        "02 · 给缺席的世界起个名字",
        t(
          "用 potential outcomes 的简化语言，Y(1) 表示有改革时的结果，Y(0) 表示没有改革时的结果。同一个历史单位在同一时刻，我们只能观察其中一个。",
        ),
        m("\\tau=Y(1)-Y(0)"),
        t(
          "这个表达式让问题变清楚，也暴露了困难：我们没有同时存在的两个英格兰。随便写出一个 Y(0) 不会使因果效应自动可识别。",
        ),
      ),
      s(
        "03 · 寻找可信的比较",
        t(
          "另一个地区、另一个时期、未受改革影响的相似工具，都可能提供对照，但必须说明为什么可比。战争强度、税收基础与金融市场结构的差异，会让比较失真。研究者需要过程证据与对照共同支持，而不是只画两条折线。",
        ),
        n(
          "模型说明",
          "Potential outcomes 在这里用作思维工具；它并不声称某个历史案例满足随机分配或无混杂条件。",
        ),
      ),
      s(
        "04 · 一条好的反事实会暴露假设",
        t(
          "可以说：“如果其他融资渠道及战争压力近似不变，该制度缺席可能提高违约担忧。”这句话把机制和假设摆在桌面。若直接说“没有它，国家必败”，就跳过了替代路径与不确定性。你不必禁止想象，但应让读者看到推断从哪里开始。",
        ),
      ),
    ],
    deep: s(
      "深入 · Post-treatment bias",
      t(
        "若改革改变税收能力，而税收能力又影响融资，控制改革之后的税收能力可能挡住你想研究的中介路径。决定控制什么变量之前，先画出你对因果顺序的假设。数据多不等于识别更清楚。",
      ),
    ),
    quiz: {
      question: "只比较改革前后融资规模，就能识别改革的因果效应吗？",
      options: [
        "能，因为每个国家都可以和自己比较",
        "不能，其他随时间变化的因素也可能影响结果",
        "不能，历史永远不能研究因果",
      ],
      answer: 1,
      explanations: [
        "自我比较仍受同期变化干扰。",
        "正确。需要设计、额外假设和证据处理其他变化。",
        "困难不等于完全不可能；结论强度取决于研究设计。",
      ],
    },
    sources: [
      parliamentSource,
      {
        title: "Hernán & Robins · Causal Inference: What If",
        url: "https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/",
        note: "Potential outcomes、identification 与因果推断的开放教材。",
      },
    ],
  },
  {
    ...meta,
    id: "majority-without-winner",
    subject: "politics",
    title: "每个人都理性，多数却绕成了圈",
    subtitle: "三个人、三个选项，没有最后的赢家。",
    question: "A 赢 B，B 赢 C，为什么 C 还能赢 A？",
    difficulty: 2,
    minutes: 7,
    prerequisites: ["Ordering relations"],
    concepts: ["voting", "relation", "agenda"],
    lab: "voting",
    labIntro:
      "调整三类选民的人数，看三场 pairwise election 的票数如何变化。每个人的排序始终保持传递。",
    contentType: "formal-model",
    sections: [
      s(
        "01 · 三个朋友决定去哪里",
        t(
          "A、B、C 是三个选项。第一位喜欢 A 胜过 B 胜过 C；第二位喜欢 B 胜过 C 胜过 A；第三位喜欢 C 胜过 A 胜过 B。每个人都有清楚、一致的完整排序，没有人在自己的偏好里绕圈。",
        ),
        m(
          "A\\succ_1 B\\succ_1 C\\qquad B\\succ_2 C\\succ_2 A\n\\qquad C\\succ_3 A\\succ_3 B",
        ),
      ),
      s(
        "02 · 把选择交给多数",
        t(
          "A 对 B：第一、第三位支持 A，A 以 2:1 获胜。B 对 C：第一、第二位支持 B。C 对 A：第二、第三位支持 C。多数关系现在形成一个循环。",
        ),
        m("A\\succ_M B,\\qquad B\\succ_M C,\\qquad C\\succ_M A"),
        t(
          "个人偏好具有 transitivity，并不保证聚合后的 majority relation 也具有。这里没有 Condorcet winner，也就是不存在一个在逐对比较中击败所有其他选项的候选。",
        ),
      ),
      s(
        "03 · 改个规则，就能做出决定吗？",
        t(
          "当然可以规定规则，例如只看第一偏好、使用计分，或先淘汰一个再比较。但每种方法引入不同选择标准。给出一个赢家与保留全部理想性质，是两件不同的任务。",
        ),
        n(
          "Scope · 理论模型",
          "这是关于偏好聚合的形式例子，不是现实民调，也不是“民主无效”的证明。三个选民足以给出反例，但不说明循环在真实社会中有多常见。",
        ),
      ),
      s(
        "04 · 看看循环什么时候消失",
        t(
          "如果某一类选民人数增多到足够程度，可能出现一个逐对都赢的候选。下面的交互保持每类排序不变，只改变人数。注意平票也不等于获胜；如果任何一对票数相同，我们会明确标出 tie。",
        ),
        t(
          "你现在可以把政治问题连到数学中的关系性质。一个很小的反例，说明聚合不是简单地放大个体。",
        ),
      ),
    ],
    deep: s(
      "深入 · 不要把循环当作 Arrow theorem",
      t(
        "Condorcet cycle 是某种具体聚合方式的反例。Arrow’s impossibility theorem 则在至少三个备选项与特定公理下，讨论社会排序规则无法同时满足的条件。这里的三人例子能揭示动机，却不是完整的 Arrow 定理证明。",
      ),
    ),
    quiz: {
      question: "这个例子证明了什么？",
      options: [
        "至少一个人的偏好不传递",
        "逐对多数关系可能不传递",
        "任何投票规则都不能选出赢家",
      ],
      answer: 1,
      explanations: [
        "每个人的严格排序都传递。",
        "正确。这是对多数关系传递性的具体反例。",
        "可以规定规则选出赢家，但规则会带来取舍。",
      ],
    },
    sources: [voteSource],
  },
  {
    ...meta,
    id: "who-sets-the-agenda",
    subject: "politics",
    title: "谁决定先投什么，谁就更接近胜利？",
    subtitle: "在循环偏好里，顺序也是一种权力。",
    question: "不改一张选票，只改表决顺序，能换掉最终赢家吗？",
    difficulty: 3,
    minutes: 6,
    prerequisites: ["Condorcet cycle"],
    concepts: ["agenda", "voting", "relation"],
    lab: "agenda",
    labIntro:
      "保持三位选民的偏好不变。选择第一轮对决；第一轮赢家与剩余选项进行决赛。假设每轮都按真实偏好投票。",
    contentType: "formal-model",
    sections: [
      s(
        "01 · 主持人只负责排顺序？",
        t(
          "沿用 A 胜 B、B 胜 C、C 胜 A 的多数循环。现在大家决定分两轮：先比较两个选项，赢家再对第三个。主持人不投票，只安排顺序。看似中立的工作，开始影响结果。",
        ),
      ),
      s(
        "02 · 把三条路径走完",
        t(
          "先 A 对 B，A 胜；再对 C，C 胜。先 B 对 C，B 胜；再对 A，A 胜。先 C 对 A，C 胜；再对 B，B 胜。相同偏好、相同人数、相同逐轮多数规则，最终可以产生三个不同赢家。",
        ),
        m("(A\\text{ vs }B)\\text{ then }C\\longrightarrow C"),
        t(
          "因此，在这个模型里，选择顺序足以改变结果。请注意我们一直假设 sincere voting：每轮按本轮真实偏好选择。",
        ),
      ),
      s(
        "03 · 如果选民会预判呢？",
        t(
          "一个人可能知道当前喜欢的选项进入决赛后会输给最讨厌的选项，于是策略性地投另一票。一旦允许 sophisticated voting，结果分析就需要引入策略与信息。刚才的路径不能不加修改地当成所有政治过程的定律。",
        ),
        n(
          "模型假设",
          "三个选项；奇数选民、无平票；逐轮多数淘汰；每轮真实表达偏好。改变假设后，需要重新分析。",
        ),
      ),
      s(
        "04 · 从选票走向制度设计",
        t(
          "现实制度会用预先固定的日程、提案权限制、修正案规则等办法组织决策。研究“谁有议程权”补充了“谁有投票权”的问题。但把模型应用到某个议会之前，还要核实真实程序与参与者行为。",
        ),
      ),
    ],
    deep: s(
      "深入 · 一个有向图",
      t(
        "把候选看作顶点，若多数偏好 x 胜过 y，就画 x→y。无平票的逐对比较给出 tournament。三点有向环没有击败所有其余顶点的顶点；它的结构直接解释了顺序敏感性。",
      ),
      m("V=\\{A,B,C\\},\\quad E=\\{(A,B),(B,C),(C,A)\\}"),
    ),
    quiz: {
      question:
        "在本文 sincere voting 模型中，若主持人希望 A 最后胜出，应先比较哪一对？",
      options: ["A 与 B", "B 与 C", "C 与 A"],
      answer: 1,
      explanations: [
        "A 先胜 B，但决赛输给 C。",
        "正确。B 先胜 C，随后 A 胜 B。",
        "C 先胜 A，但决赛输给 B。",
      ],
    },
    sources: [voteSource],
  },
];
articles.push(...nextArticles);
