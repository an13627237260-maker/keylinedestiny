# Keyline Destiny · 命理星盘

纯算法命理测算平台：所有结果由传统命理算法、规则库与本地模板引擎在浏览器端生成。

> 本结果基于传统命理规则、算法模型与本地规则库生成，仅供娱乐和传统文化参考，不构成现实决策依据。

## 功能

- 生辰八字（四柱、五行、十神、藏干、合冲刑害、神煞、十二长生、纳音、格局、喜用、大运、流年、流月）
- 塔罗抽牌（78 张，本地随机源，可追溯 seed）
- 星座分析（确定性 seed 运势）
- 姓名分析（五格剖象法简化模型）
- 情感合盘
- 规则引擎报告（≥200 条规则，八字报告 ≥1200 字）
- 历史报告（浏览器 localStorage）

## 安装与启动

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

无需服务端配置。

## 测试

```bash
npm test
```

## 报告如何生成

1. 各页面在浏览器中直接 `import` 算法模块（如 `computeBazi`、`drawTarotReading`）
2. `runBaziRules` 对 `algorithm_result` 执行 200+ 条规则，输出 `rule_results`
3. `generateBaziReport` 等模板生成器组装章节化 `report`
4. 测算完成后自动写入 `localStorage`

塔罗 / 星座 / 姓名 / 合盘同理，使用各自的 `*Report.ts` 模板生成器。

## 如何扩展规则

在 `lib/fortune/rules/baziRules.ts` 中按 `Rule` 类型追加：

```ts
{
  id: "unique-id",
  category: "career",
  priority: 70,
  condition: (ctx) => /* 基于 ctx.algo 判断 */,
  score: 65,
  tags: ["标签"],
  message: "规则解读文案",
  evidence: (ctx) => ["依据1", "依据2"],
}
```

规则引擎会自动去重、按类别限流并排序。

## Cloudflare Pages 部署（推荐）

1. 将仓库推送到 GitHub / GitLab
2. 在 Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
3. 配置如下：

| 设置项 | 值 |
|--------|-----|
| Framework preset | Next.js |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | 留空（`package.json` 在仓库根目录时）或 `./` |

4. 无需环境变量
5. 部署完成后访问分配的 `*.pages.dev` 域名

本地预览静态产物：

```bash
npm run build
npx serve out
```

## Vercel 部署

1. 将仓库推送到 GitHub
2. 在 Vercel 导入项目，Framework 选 Next.js
3. 无需配置环境变量
4. Build Command: `npm run build`（`output: "export"` 会自动输出到 `out/`）

## 算法说明

### 八字

- **年柱**：立春为界，1984 甲子基准
- **月柱**：十二节为界，五虎遁
- **日柱**：儒略日，支持 `midnight` / `ziHour`
- **时柱**：五鼠遁
- **节气**：内置近似公式（warnings 会提示）
- **真太阳时**：经度修正
- **大运**：阳年男/阴年女顺排，三天折一年

### 塔罗 / 星座 / 姓名

见 `lib/fortune/tarot`、`zodiac`、`name` 模块注释与测试。

## 已知限制

1. 不能保证现实预测准确——仅供娱乐与传统文化参考
2. 节气为近似值，交节前后 24 小时需谨慎
3. `useEquationOfTime` 已预留未实现
4. 姓名笔画库可扩展 `lib/fortune/name/strokes.ts`
5. 神煞、格局、喜用为简化模型，输出为倾向而非定论
6. 历史报告仅存于浏览器 localStorage，换设备不共享

## 项目结构

```
app/                  # 页面（纯客户端测算）
components/           # UI
lib/fortune/bazi/     # 八字核心算法
lib/fortune/rules/    # 规则引擎与规则库
lib/fortune/report/   # 本地报告模板引擎
lib/client/           # 客户端响应组装
lib/storage/          # localStorage 历史报告
tests/                # Vitest
```
