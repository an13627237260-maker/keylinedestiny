# 命理测算 Web 应用 (fortune-mingli)

娱乐型命理测算 Web 软件。核心原则是**算法准确性优先、计算过程可复核、AI 仅负责解读**。

> **本结果基于传统命理规则与 AI 生成，仅供娱乐参考，不构成现实决策依据。**

## 功能

- 生辰八字（四柱、五行、十神、合冲刑害、神煞、大运、流年）
- 塔罗抽牌（78 张完整牌组，多种牌阵）
- 星座分析（确定性 seed 运势）
- 姓名分析（五格剖象法简化模型）
- 情感合盘
- OpenAI 个性化报告 + 本地 fallback
- 历史报告（SQLite + localStorage）

## 安装

```bash
cd ~/Projects/fortune-mingli
npm install
cp .env.example .env   # 或编辑 .env
npm run db:generate
npm run db:push
```

## 环境变量

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=          # 可选，无 key 时使用本地模板
OPENAI_MODEL=gpt-4.1-mini
```

## 启动

```bash
npm run dev     # http://localhost:3000
npm run build && npm start
```

## 测试

```bash
npm test
```

## OpenAI 配置

1. 在 `.env` 中设置 `OPENAI_API_KEY`
2. 可选设置 `OPENAI_MODEL`（默认 `gpt-4.1-mini`）
3. 无 API Key 时自动使用本地模板报告
4. AI 输出经 schema 校验、禁止词过滤、命盘编造检测

## 算法说明

### 八字

- **年柱**：以立春为界，1984 年甲子为基准
- **月柱**：以十二节为界，五虎遁起月干
- **日柱**：儒略日算法，基准 1984-02-02 甲子日；支持 `midnight` / `ziHour` 换日
- **时柱**：五鼠遁，子时含 23:00-00:59
- **节气**：内置寿星天文历近似公式，误差约 ±30 分钟
- **真太阳时**：经度修正 `(longitude - timezoneOffset*15) * 4` 分钟
- **大运**：阳年男/阴年女顺排；三天折一年

### 塔罗

- `crypto` 随机 seed，同 seed 可复核
- 同一次牌阵不重复

### 星座

- `seed = hash(date + sign + period)`，同一天同星座输出稳定

### 姓名

- 五格剖象法简化模型，缺少笔画不会猜测

## 已知限制

1. **不能保证现实预测准确**——系统追求的是传统规则计算准确、过程透明、输出一致
2. 节气使用近似公式，交节前后 24 小时内结果可能有偏差
3. 均时差 `useEquationOfTime` 已预留但未实现
4. 姓名笔画库有限，需扩展 `lib/fortune/name/strokes.ts`
5. 神煞、喜用神等为简化模型，流派争议处通过 `options` 配置
6. AI 只负责解释和表达，**不决定命盘硬数据**

## 娱乐参考声明

- 当前系统不能保证现实预测准确
- 系统追求的是传统规则计算准确、过程透明、输出一致
- AI 只负责解释和表达，不负责决定命盘硬数据
- 所有报告均含免责声明，禁止绝对化表达

## 项目结构

```
app/           # 页面与 API 路由
components/    # UI 组件
lib/fortune/   # 命理算法（独立模块）
lib/ai/        # OpenAI 接入
tests/         # Vitest 单元测试
prisma/        # 数据库 schema
```

## 开发阶段

1. ✅ 项目基础（Next.js、Prisma、Vitest、shared types）
2. ✅ 八字算法核心 + 测试
3. ✅ OpenAI 接入 + fallback
4. ✅ 前端八字页面
5. ✅ 塔罗、星座、姓名、合盘
6. ✅ 历史报告
7. ✅ 错误处理与 disclaimer
