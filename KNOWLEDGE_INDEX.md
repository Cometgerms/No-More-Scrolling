# 知识与资源索引

由 `node --import tsx scripts/knowledge-index.ts` 从内容库生成；不要手动修改。编辑过程和证据限制见 [CONTENT_LOG.md](CONTENT_LOG.md)。

当前收录 12 篇文章、21 个概念、18 条编辑关联。

这里的核验日期是内容库的编辑记录，不等于独立专家审稿。链接不构成转载授权；不得把用户提供的整本教材发布到仓库。

## 概念总表

| ID | 概念 | 学科 | 定义与边界 | 对应文章 |
| --- | --- | --- | --- | --- |
| group | Group / 群 | math | 集合配合封闭的二元运算，满足结合律、单位元和逆元条件；交换律不是必要条件。 | clockwork-groups |
| cyclic | Cyclic group / 循环群 | math | 所有元素都由一个生成元的整数次幂（加法记号下为整数倍）得到的群。 | clockwork-groups |
| decision-tree | Decision tree / 决策树 | cs | 把算法根据比较结果作出的分支展开成树；叶子表示可区分的输出情况。 | sorting-information-limit |
| lower-bound | Lower bound / 复杂度下界 | cs | 在规定计算模型中，对所有正确算法都成立的资源需求限制。 | sorting-information-limit |
| natural-experiment | Natural experiment / 自然实验 | history | 利用研究者未主动随机分配的暴露差异作比较；可比性仍需要论证。 | snow-beyond-the-map |
| repeated-game | Repeated game / 重复博弈 | politics | 同一阶段博弈多次发生，策略可以依赖历史；未来收益可能改变今天的激励。 | states-and-the-future |
| verification | Verification / 核查机制 | politics | 通过制度化的信息收集与检查评估履约；不等于拥有无误的监测或自动执行惩罚。 | states-and-the-future |
| measure | Measure / 测度 | math | 在 σ-algebra 上定义的非负、可数可加的集合函数。它把长度与概率放进同一个框架。 | zero-is-not-impossible, cantor-dust |
| countable | Countable additivity / 可数可加性 | math | 可数个两两不交的可测集合，其并的测度等于测度之和；条件中的“可数”不能删去。 | zero-is-not-impossible |
| cantor | Cantor set / 康托集 | math | 标准三分 Cantor set 是不可数的闭集，Lebesgue measure 为零。 | zero-is-not-impossible, cantor-dust |
| diagonal | Diagonalization / 对角线论证 | math | 对假设中的完整列表，构造一个至少在自身索引位置与每项不同的新对象。 | cantor-dust, machine-against-itself |
| halting | Halting problem / 停机问题 | cs | 不存在总能停机且正确判定任意程序在任意输入上是否停机的算法。 | machine-against-itself |
| decidability | Decidability / 可判定性 | cs | 一个判定问题是否存在对所有输入都停机且正确给出是或否的算法。 | machine-against-itself |
| cache | Cache mapping / 缓存映射 | cs | 地址被划分为 tag、set index 与 block offset；映射冲突可以使小工作集反复 miss。 | tiny-cache-big-miss |
| modular | Modular arithmetic / 模运算 | math | 把相差某个整数倍的数视为等价；cache 的组索引就是 block number 对组数取模。 | tiny-cache-big-miss, clockwork-groups |
| credit | Credible commitment / 可信承诺 | politics | 承诺在未来仍值得遵守的机制。制度、激励与执行能力共同影响其可信度。 | borrowing-power, history-counterfactual |
| bank | Financial Revolution / 金融革命 | history | 17 世纪末英格兰财政与融资制度变化的历史主题；其解释涉及战争、税收、议会与金融组织。 | borrowing-power, history-counterfactual |
| causal | Causal inference / 因果推断 | history | 区分时间先后、相关性与因果作用；反事实推断需要额外假设与证据。 | borrowing-power, history-counterfactual, snow-beyond-the-map |
| voting | Condorcet cycle / 孔多塞循环 | politics | 每个个体的偏好均可传递，但逐对多数关系可能形成 A 胜 B、B 胜 C、C 胜 A。 | majority-without-winner, who-sets-the-agenda |
| relation | Transitivity / 传递性 | math | 若 aRb 且 bRc，则 aRc。个体的关系有此性质，不保证聚合后的关系仍有。 | majority-without-winner, who-sets-the-agenda |
| agenda | Agenda setting / 议程设置 | politics | 在某些顺序表决规则中，提案顺序会影响最终胜者；结论依赖具体规则与投票行为。 | majority-without-winner, who-sets-the-agenda |

## 文章与来源

### zero-is-not-impossible

**零概率，怎么拼出整个世界？** · math · theorem

- 核心问题：每个点的概率都是 0，为什么总概率是 1？
- 前置知识：Infinite series；Countable sets
- 概念：measure, countable, cantor
- 交互：measure；拖动区间的右端点，比较连续均匀分布的区间概率与单点概率。图中的点只是标记，不是离散样本空间。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 一个必然发生的零概率事件：想象一支理想飞镖，落在长度为 1 的线段上，每一段等长区间被击中的机会相同。你问它恰好落在 1/2 的概率。直觉可能说：很小，但总不能是零吧？如果每个点都有相同的正概率 p，那么只挑足够多的不同点，概率之和就会超过 1。 所以每个指定的 singleton \(\{x\}\) 都只能分到零概率。但 \(X\in[0,1]\) 必然发生。关键区别是 null event（零测事件）与 empty event（空事件）：\(\mathbb P(A)=0\) 并不推出 \(A=\varnothing\)。
- 02 · 加法有一条隐藏的边界：Probability space 写作 \( (\Omega,\mathcal F,\mathbb P) \)：sample space \(\Omega\)、σ-algebra \(\mathcal F\)、probability measure \(\mathbb P\)。其中 \(\mathcal F\) 对补集和可数并封闭，\(\mathbb P(\Omega)=1\)。对 pairwise disjoint 的可测事件，要求 countable additivity： 关键在于 n 能按自然数排队。区间里的所有实数无法这样列成一个序列，因此把区间拆成所有 singleton 后，不能直接套这条公理。这个等式的适用条件从来没有覆盖那个拆法。
- 03 · 连稠密也救不了有理数：现在把目标从单点换成所有有理数。有理数在每一小段区间都存在，称为 dense；但它们也能排成可数序列。于是这次加法可以合法使用。 因此随机点 almost surely 是无理数。Dense 描述每个邻域都能碰到这个集合，measure 描述集合的大小。这两种视角回答不同的问题。一个在屏幕上画得密密麻麻的点集，也不能因此被赋予正长度。
- 04 · 回到飞镖：测量的是区间：现实测量只能告诉你落点在某个分辨率范围内，比如 0.49 到 0.51；这个事件有正概率。缩小范围时，区间概率连续下降到零。单点是这个极限，但这个极限不妨碍最终观测到某个数。 现在试着改变下面的区间宽度。随后再问一个更难的问题：所有零测度集合都可数吗？下一张 Cantor set 卡会拆掉这个直觉。

参考资料：

- [MIT · Measure and Integration](https://ocw.mit.edu/courses/18-125-measure-and-integration-fall-2003/pages/lecture-notes/) — Measure、countable additivity 与 Lebesgue measure 的大学课程讲义。

### cantor-dust

**删掉所有长度，还剩多少点？** · math · theorem

- 核心问题：一个长度为零的集合，能和整个区间一样多点吗？
- 前置知识：Geometric series；Binary sequences
- 概念：cantor, measure, diagonal
- 交互：cantor；每按一次，移去所有剩余区间的开中间三分之一。有限步仍有正长度；零长度是无穷过程的极限。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 一条线段的消失实验：从 \([0,1]\) 出发，删掉开区间 \((1/3,2/3)\)。留下两端，再从每一段的中间删掉三分之一。端点始终保留。重复 \(n\) 次后，有 \(2^n\) 个 closed intervals，每段长度 \(3^{-n}\)。 屏幕越来越像灰尘，但我们关心的 C 是全部有限步骤的交集，不是某一帧。
- 02 · 长度确实消失了：这些 closed sets 递减，初始测度有限。由 continuity from above，极限集合的测度等于测度的极限。所以 \(\lambda(C)=0\)。到这里你也许会猜：只剩少数端点了吧？ 这个猜测忽略了另一种留下来的方式：每一步都选左或右，从不落入被删除的中间区域。一份无限长的左右选择，决定一个唯一的点。
- 03 · 每个点都有一份无限地址：把左记作 0，右记作 2，这就是一个只含 0 与 2 的三进制展开。任意二进制序列 b 都能映射到 Cantor set 中： 两份序列首次在第 k 位不同，该位贡献的差为 2/3ᵏ，后续所有差的绝对值之和至多为 1/3ᵏ。因此它们映射到不同点。无限二进制序列不可数，所以 Cantor set 也不可数。
- 04 · 你的直觉用了哪把尺？：Cardinality 问能否配对，measure 问大小。Cantor set 与实数区间有同样的基数，却有不同的 Lebesgue measure。把它放大一点或画得粗一点，都不会改变这两个数学事实。

参考资料：

- [MIT · Measure and Integration](https://ocw.mit.edu/courses/18-125-measure-and-integration-fall-2003/pages/lecture-notes/) — Measure、countable additivity 与 Lebesgue measure 的大学课程讲义。

### machine-against-itself

**让程序预测自己，然后反着做** · cs · theorem

- 核心问题：为什么更快的电脑，也造不出万能停机检测器？
- 前置知识：Functions；Proof by contradiction
- 概念：halting, diagonal, decidability
- 交互：halting；假装 H 能预测 D(D)。分别选择两种预测，逐步查看 D 的反应。无论哪条分支，都会与假设冲突。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 你接到一份看似合理的需求：有一个程序可能卡死。运行它，等一分钟，没有结束；等一年，仍然没有。你知道这不是无限循环的证明，因为它也许明天就停。于是你决定写一个更聪明的静态分析器 H，直接读代码和输入，回答“会停”或“不会停”。 要求很强：H 对所有合法程序与输入都必须在有限时间内给出正确答案。只对一部分程序有效，并不能满足这份需求。
- 02 · 把代码也当成数据：程序可以编码成字符串，所以“把一个程序作为另一个程序的输入”没有神秘之处。编译器每天都在这样做。现在利用 H 写一个新程序 D：先问 H，输入程序拿自己当输入时会不会停，然后故意反着做。 注意 D 本身允许不停机。我们假设总能停机的是检测器 H，不是所有被检测的程序。
- 03 · 最刁钻的输入：把 D 自己的编码交给 D。若 H(D,D)=1，D 会进入无限循环，预测错了。若 H(D,D)=0，D 会立即返回，预测仍然错了。两种答案已经穷尽。 这个矛盾否定了最初对 H 的假设。我们没有证明某台机器太慢，而是证明这种同时满足 total、correct、general 的算法不存在。
- 04 · 边界反而告诉我们怎么做工程：实际分析器可以限制输入语言、允许回答 unknown，或者只保证一侧结论正确。只运行程序直到它结束，也能识别会停机的情况，却不能保证对不会停机的情况给出答案。 所以这里的教训不是放弃分析，而是明确你牺牲了哪一项保证。现在用下面的两条分支，把矛盾亲手走一遍。

参考资料：

- [L. Moss · Invitation to Computability](https://lmoss.github.io/undecidability/haltingProblem.html) — Halting problem 的构造与不可判定性证明。

### tiny-cache-big-miss

**明明放得下，为什么一直 miss？** · cs · theorem

- 核心问题：只有两个数据块，怎么击败一个有四行的 cache？
- 前置知识：Binary addresses；Arrays
- 概念：cache, modular
- 交互：cache；一个 4-set、direct-mapped、block size=16 B 的空缓存。逐步执行 A=0x00、B=0x40、A、B，再与 B=0x10 对比。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 容量足够，直觉失效：你反复访问两个小数据块。缓存明明能放四块，第一次访问各 miss 一次之后，似乎就该一直 hit。然而 direct-mapped cache 并不让每个块自由选择位置：地址决定它唯一能待的组。 B 是 block size，S 是 set 数。先除 B 丢掉块内偏移，再对 S 取模得到组号。
- 02 · 两个地址争同一把椅子：设 B=16，S=4。地址 0x00 的 block number 是 0，地址 0x40 的 block number 是 4。它们对 4 取模都得 0，所以争用同一行，尽管其余三行空着。 第一轮是 compulsory miss；之后 A 刚进入，B 就把它挤出，反复造成 conflict miss。这里的地址访问都只读取一个字节，避免跨块访问的额外问题。
- 03 · 换个间距，换个结果：把 B 放到 0x10，它映射到 set 1。于是 A、B 第一次各 miss，后续都 hit。移动布局或提高 associativity 可以缓解冲突，但也会引入其他工程权衡。
- 04 · 从模运算回到代码：矩阵访问时固定步幅可能反复命中同一组。一个优化若只计算 working-set 大小，可能漏掉映射这一层。理解地址之间相差多少块，往往比背“cache 很快”更有用。下面亲手追踪 valid、tag 和替换。

参考资料：

- [Bryant & O’Hallaron · CS:APP](https://csapp.cs.cmu.edu/3e/home.html) — Computer Systems: A Programmer’s Perspective, 3rd ed., Chapter 6，cache organization。

### borrowing-power

**限制国王，为什么能增强国家？** · history · historical-analysis

- 核心问题：权力受到约束，为什么有时反而更容易筹到钱？
- 前置知识：Basic historical chronology
- 概念：bank, credit, causal
- 交互：timeline；先预测顺序，再逐项揭示事件。这个时间线建立背景，不把时间先后自动当作因果证明。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 借钱给一个能改规则的人：站在一个债权人的位置：你愿意把钱借给一个今天答应还款、明天却能随意改规则的统治者吗？即使他有资源，你仍会担心承诺是否可信。国家的军事需求很紧迫，但借款人的强制权本身也可能让出借人犹豫。
- 02 · 先把能够确认的事件排好：1689 年的 Bill of Rights 限制君主绕过议会征税等做法。1694 年，英格兰银行成立；其早期档案记载了 £1.2 million 的初始认购。融资与当时的战争需求有关。这里的制度不是现代普选民主，参与权与代表性仍有明显限制。
- 03 · 把承诺系在机制上：一种解释是：议会参与财政与专门安排还款收入，使政府的承诺不再只依赖个人意愿。债权人预期的还款可靠性提高，国家便可能在更有利的条件下融资。约束某种任意权力，同时可能提高组织动员资源的能力。 这就是 credible commitment 的视角。但制度约束本身不自动保证一切：税收能力、战争形势、金融组织和债权人的政治影响也很重要。我们不能从“议会更强”直接推出一个普遍、无条件的利率定律。
- 04 · 故事动听，还需要什么证据？：如果改革后借贷条件改善，这是一条线索；若同时战争风险下降、税源扩大，就出现 competing explanations。比较不同借款、不同时间和不同制度安排，能帮助检验机制。 读到这里，你可以把 Financial Revolution 连到 Credible commitment，再给这条关系写上自己的疑问。图谱的连线也应携带解释，而不是只说“相关”。

参考资料：

- [Bank of England · Founding documents](https://www.bankofengland.co.uk/museum/online-collections/archive-gallery/founding-documents) — 1694 年特许状、认购记录等档案；可支持事件与融资规模，不能单独证明因果关系。
- [UK Parliament · The Financial Revolution](https://www.parliament.uk/about/living-heritage/evolutionofparliament/parliamentaryauthority/revolution/overview/financialrevolution/) — 议会财政控制与英格兰银行的制度背景；属于机构的历史解释。
- [Bank of England · History](https://www.bankofengland.co.uk/about/history) — 互动时间线中 1946 年国有化的来源。

### history-counterfactual

**把一件历史事件拿走，会怎样？** · history · historical-analysis

- 核心问题：“如果没有某项改革”究竟是分析，还是小说？
- 前置知识：Correlation vs causation
- 概念：causal, bank, credit
- 交互：evidence；逐条判断一份虚构研究档案中的材料属于事实、机制解释还是反事实。材料中的数值是教学假设，不是历史统计。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 你已经知道结局：历史最容易骗人的地方，是我们总在知道结果之后挑选原因。你看到某次制度改革随后出现融资增长，就很容易把整条路径写成必然。可在当时，参与者不知道结局；还有很多可能同时起作用的变化。
- 02 · 给缺席的世界起个名字：用 potential outcomes 的简化语言，Y(1) 表示有改革时的结果，Y(0) 表示没有改革时的结果。同一个历史单位在同一时刻，我们只能观察其中一个。 这个表达式让问题变清楚，也暴露了困难：我们没有同时存在的两个英格兰。随便写出一个 Y(0) 不会使因果效应自动可识别。
- 03 · 寻找可信的比较：另一个地区、另一个时期、未受改革影响的相似工具，都可能提供对照，但必须说明为什么可比。战争强度、税收基础与金融市场结构的差异，会让比较失真。研究者需要过程证据与对照共同支持，而不是只画两条折线。
- 04 · 一条好的反事实会暴露假设：可以说：“如果其他融资渠道及战争压力近似不变，该制度缺席可能提高违约担忧。”这句话把机制和假设摆在桌面。若直接说“没有它，国家必败”，就跳过了替代路径与不确定性。你不必禁止想象，但应让读者看到推断从哪里开始。

参考资料：

- [UK Parliament · The Financial Revolution](https://www.parliament.uk/about/living-heritage/evolutionofparliament/parliamentaryauthority/revolution/overview/financialrevolution/) — 议会财政控制与英格兰银行的制度背景；属于机构的历史解释。
- [Hernán & Robins · Causal Inference: What If](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/) — Potential outcomes、identification 与因果推断的开放教材。

### majority-without-winner

**每个人都理性，多数却绕成了圈** · politics · formal-model

- 核心问题：A 赢 B，B 赢 C，为什么 C 还能赢 A？
- 前置知识：Ordering relations
- 概念：voting, relation, agenda
- 交互：voting；调整三类选民的人数，看三场 pairwise election 的票数如何变化。每个人的排序始终保持传递。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 三个朋友决定去哪里：A、B、C 是三个选项。第一位喜欢 A 胜过 B 胜过 C；第二位喜欢 B 胜过 C 胜过 A；第三位喜欢 C 胜过 A 胜过 B。每个人都有清楚、一致的完整排序，没有人在自己的偏好里绕圈。
- 02 · 把选择交给多数：A 对 B：第一、第三位支持 A，A 以 2:1 获胜。B 对 C：第一、第二位支持 B。C 对 A：第二、第三位支持 C。多数关系现在形成一个循环。 个人偏好具有 transitivity，并不保证聚合后的 majority relation 也具有。这里没有 Condorcet winner，也就是不存在一个在逐对比较中击败所有其他选项的候选。
- 03 · 改个规则，就能做出决定吗？：当然可以规定规则，例如只看第一偏好、使用计分，或先淘汰一个再比较。但每种方法引入不同选择标准。给出一个赢家与保留全部理想性质，是两件不同的任务。
- 04 · 看看循环什么时候消失：如果某一类选民人数增多到足够程度，可能出现一个逐对都赢的候选。下面的交互保持每类排序不变，只改变人数。注意平票也不等于获胜；如果任何一对票数相同，我们会明确标出 tie。 你现在可以把政治问题连到数学中的关系性质。一个很小的反例，说明聚合不是简单地放大个体。

参考资料：

- [E. Pacuit · Voting Methods](https://plato.stanford.edu/entries/voting-methods/) — Condorcet cycle、投票规则与规则之间的取舍。

### who-sets-the-agenda

**谁决定先投什么，谁就更接近胜利？** · politics · formal-model

- 核心问题：不改一张选票，只改表决顺序，能换掉最终赢家吗？
- 前置知识：Condorcet cycle
- 概念：agenda, voting, relation
- 交互：agenda；保持三位选民的偏好不变。选择第一轮对决；第一轮赢家与剩余选项进行决赛。假设每轮都按真实偏好投票。
- 首发：2026-10-17；记录中的核验日期：2026-10-17
- 核验说明：对照所列参考资料整理；数学推导逐步检查，交互有限案例由自动测试验证。未经外部专家审稿。

- 01 · 主持人只负责排顺序？：沿用 A 胜 B、B 胜 C、C 胜 A 的多数循环。现在大家决定分两轮：先比较两个选项，赢家再对第三个。主持人不投票，只安排顺序。看似中立的工作，开始影响结果。
- 02 · 把三条路径走完：先 A 对 B，A 胜；再对 C，C 胜。先 B 对 C，B 胜；再对 A，A 胜。先 C 对 A，C 胜；再对 B，B 胜。相同偏好、相同人数、相同逐轮多数规则，最终可以产生三个不同赢家。 因此，在这个模型里，选择顺序足以改变结果。请注意我们一直假设 sincere voting：每轮按本轮真实偏好选择。
- 03 · 如果选民会预判呢？：一个人可能知道当前喜欢的选项进入决赛后会输给最讨厌的选项，于是策略性地投另一票。一旦允许 sophisticated voting，结果分析就需要引入策略与信息。刚才的路径不能不加修改地当成所有政治过程的定律。
- 04 · 从选票走向制度设计：现实制度会用预先固定的日程、提案权限制、修正案规则等办法组织决策。研究“谁有议程权”补充了“谁有投票权”的问题。但把模型应用到某个议会之前，还要核实真实程序与参与者行为。

参考资料：

- [E. Pacuit · Voting Methods](https://plato.stanford.edu/entries/voting-methods/) — Condorcet cycle、投票规则与规则之间的取舍。

### clockwork-groups

**每次走五格，为什么能走遍整个钟面？** · math · theorem

- 核心问题：十二格钟面上，走五格与走八格有什么本质区别？
- 前置知识：整数与余数
- 概念：group, cyclic, modular
- 交互：cyclic；改变钟面大小 n 和步长 k。亮点是从 0 出发能访问的余数；重复到 0 时结束。
- 首发：2026-10-18；记录中的核验日期：2026-10-18
- 核验说明：核对所列教材或原始资料；形式模型另有边界测试。交互数据若为示例会明确标注。未经外部专家审稿。

- 01 · 先说运算，再说集合：把十二格钟面记作 0 到 11。走八格再走七格，落在 3；我们把结果取模 12。这里的对象是余数，运算是加法，不是把钟面上的数随意相乘。
- 02 · Group 的四个检查：结果仍在集合里，这是 closure。加法满足 associativity；0 是 identity；a 的 inverse 是 −a 的余数。因此模加法构成群。这里还满足交换律，所以是 Abelian group；群本身不要求交换律。
- 03 · 一个元素能生成多少？：从 0 每次加 8，只会看到 0、8、4，再回到 0；每次加 5 却能访问全部十二格。反复使用一个元素得到的集合叫 generated subgroup。能生成整个群的元素叫 generator；存在这种元素的群叫 cyclic group。
- 04 · Order 不是数值大小：元素的 order 是第一次回到单位元所需的正整数步数。令 d=gcd(n,k)，写成 n=dn′、k=dk′。回到 0 等价于 n 整除 mk，也就是 n′ 整除 mk′。因为 n′ 与 k′ 互素，最小正整数 m 就是 n′。

参考资料：

- [Joseph A. Gallian · Contemporary Abstract Algebra, 8e · Ch. 2 & 4](https://www.cengage.com/) — 用户提供的教材：印刷页 42–43、77–80（PDF 第 62–63、97–100 页）。链接为出版社入口，不是教材全文。

### sorting-information-limit

**排序为什么不能一直更快？** · cs · theorem

- 核心问题：只允许比较两个数，能保证在线性时间内排好任意输入吗？
- 前置知识：阶乘与以 2 为底的对数
- 概念：decision-tree, lower-bound
- 交互：sorting；选 n，再给算法 h 次比较预算。看二叉决策树最多能区分多少种情况。预算够大只是必要条件，不自动构造算法。
- 首发：2026-10-18；记录中的核验日期：2026-10-18
- 核验说明：核对所列教材或原始资料；形式模型另有边界测试。交互数据若为示例会明确标注。未经外部专家审稿。

- 01 · 先划定计算模型：考虑确定性的 comparison sort，输入是 n 个互异元素。算法只能通过两元素的大小比较获得排序信息。一次比较在这个前提下有两个结果，可以画成决策树的一个分叉。
- 02 · 叶子必须够多：正确算法要区分 n! 种相对排列。高度为 h 的二叉树最多有 2ʰ 个叶子，所以最坏情况的比较次数至少是 log₂(n!) 向上取整。
- 03 · 三张卡片的检验：A、B、C 有六种排列。两次比较只有四种结果路径，因此至少某个输入需要第三次比较。这里证明的是所有正确算法都绕不开的限制，不是某段程序写得不够好。
- 04 · 下界必须带着前提读：阶乘中至少一半因子不小于 n/2，由此得到 Ω(n log n) 下界。Counting sort 利用整数范围与数组索引，不只做比较，因此不违反这个结论。

参考资料：

- [MIT 6.006 · Lecture 5: Linear Sorting (2020)](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/78a3c3444de1ff837f81e52991c24a86_MIT6_006S20_lec5.pdf) — 第 2 页：comparison sort lower bound；第 3–4 页：非比较排序的模型差别。

### snow-beyond-the-map

**John Snow：一张地图，够证明什么？** · history · historical-analysis

- 核心问题：病例集中在水泵附近，是否已经证明水泵导致了疫情？
- 前置知识：相关与因果的区别
- 概念：natural-experiment, causal
- 交互：snow；这些是教学用虚构人数，不是 Snow 的原始数据。切换两组人口规模，观察病例总数与每千人发生率为什么会给出不同印象。
- 首发：2026-10-18；记录中的核验日期：2026-10-18
- 核验说明：核对所列教材或原始资料；形式模型另有边界测试。交互数据若为示例会明确标注。未经外部专家审稿。

- 01 · 人物与问题：1854 年，伦敦医生 John Snow 调查 Broad Street 附近的霍乱。他追问患者实际喝过什么水，而不只记录住在哪里。1855 年的著作把访谈、地点与时间资料组织成了论证。
- 02 · 地图不是结论按钮：地图显示空间聚集，但人口本身也会聚集。Snow 还调查了住得远却饮用该水源的人，以及附近有不同供水的机构。这些例外帮助检验解释：如果原因是水，哪些看似反常的观察反而说得通？
- 03 · 拆掉把手之后：水泵把手在 1854 年 9 月 8 日被移除。但 Snow 自己记载，疫情此前已减弱，居民外逃也是重要背景。于是“移除后下降”不能独立证明下降全部由这次行动造成。保护性行动与精确估计行动效果，是不同任务。
- 04 · 从地点走向比较：Snow 的另一项调查比较伦敦南部不同供水公司的住户。供水差异提供了近似自然实验的机会，但并不是研究者做的随机试验。理解这段历史，需要同时问：谁被计入、分母是什么、两组是否可比？

参考资料：

- [John Snow · On the Mode of Communication of Cholera (1855), pp. 38–55](https://epi-snow.ph.ucla.edu/Stream2_BSPoutbreak_a.html) — UCLA 收录的原始著作节选，页面下半部；区分上方现代叙述与原文。
- [UCLA · Handle Removal, Index Case and Rev. Whitehead](https://epi-snow.ph.ucla.edu/Stream2_BSPoutbreak_e.html) — 移除日期、疫情时间序列与调查背景。
- [John Snow · The Grand Experiment (1855), pp. 55–98](https://epi-snow.ph.ucla.edu/Stream3_GrandExperiment_a.html) — 不同供水公司的比较与分母；本文交互未复用历史数值。

### states-and-the-future

**国家为什么会遵守明天的承诺？** · politics · formal-model

- 核心问题：没有世界政府强制执行，合作怎样可能维持？
- 前置知识：收益矩阵与等比级数
- 概念：repeated-game, verification
- 交互：cooperation；拖动 δ，比较长期合作与一次背叛后的总收益。数字是抽象效用，不代表任何国家的 GDP、军力或真实偏好。
- 首发：2026-10-18；记录中的核验日期：2026-10-18
- 核验说明：核对所列教材或原始资料；形式模型另有边界测试。交互数据若为示例会明确标注。未经外部专家审稿。

- 01 · 一个刻意简化的局面：设两个国家每轮选合作 C 或背叛 D。双方合作各得 3；单方面背叛者得 5，对方得 0；双方背叛各得 1。单轮中 D 严格占优，却让双方停在比合作更差的结果。这是示例 Prisoner’s Dilemma，不是给真实国家打分。
- 02 · 把明天放进今天：假设无限重复、行动被准确观察，双方用 grim trigger：先合作，一旦任何人背叛，此后永远背叛。δ 表示未来收益的折扣权重。合作与当期背叛的收益可以直接比较。
- 03 · 核查为什么重要：国际合作还要解决如何判断履约。IAEA 的保障监督是核不扩散体系的一部分，提供制度化核查。现实监测并不完美，也不自动执行惩罚：误报、无法观察的行动与政治成本，都会让刚才的策略需要重写。
- 04 · 用模型向新闻提问：阅读两国间的关税谈判、军控或制裁新闻时，可以逐项记录：下一轮互动是否重要？违约能否被辨认？报复是否可信？国内政治会不会改变收益？这些问题组织分析，但不能由 δ≥1/2 推断某国必然合作。

参考资料：

- [Yale ECON 159 · Lecture 22: Repeated Games](https://oyc.yale.edu/economics/econ-159/lecture-22) — Chapter 1：任意一方背叛后永久进入惩罚的策略，以及可信性检查。
- [MIT 17.810 · Repeated Games (2021)](https://ocw.mit.edu/courses/17-810-game-theory-spring-2021/mit17_810s21_lec5.pdf) — Discounting 与 Grim Trigger Strategy；本文用自设收益演算。
- [IAEA · Nuclear Safeguards: Staying Ahead of the Game (2007)](https://www.iaea.org/newscenter/news/nuclear-safeguards-staying-ahead-game) — 保障监督在核不扩散体系中的制度角色；不用于证明任何当日履约状态。

## 编辑关联

- group → cyclic：由单个元素生成的特例
- cyclic → modular：有限循环群的加法模型
- decision-tree → lower-bound：用叶子数约束树高
- lower-bound → decidability：资源限制与可计算性是不同问题
- natural-experiment → causal：需要比较组可比性的论证
- repeated-game → verification：历史策略依赖可观察的行动
- repeated-game → credit：未来承诺改变当下激励；是类比而非等同
- measure → countable：定义要求
- measure → cantor：零测度的不可数例子
- cantor → diagonal：不可数性可用此法证明
- diagonal → halting：证明方法
- halting → decidability：不可判定的例子
- cache → modular：组索引使用
- bank → credit：一种制度解释
- bank → causal：历史解释需要
- voting → relation：多数关系可能失去
- voting → agenda：循环带来顺序效应
- credit → agenda：均涉及制度规则与激励
