# 网球拍分析与查询平台（Tennis Racket Finder）

一个用于**录入、查询、筛选、对比和推荐**网球拍的项目。围绕四个核心维度建立结构化数据，并在此之上提供可交互的查询界面。

四个核心维度：

1. **基本参数** —— 拍面、重量、平衡点、拍框厚度、弦床密度、挥重等可量化指标。
2. **适合打法** —— 上旋型、平击型、底线进攻、发球上网、防守反击等。
3. **球员水平** —— 初学、进阶、半职业、职业，以及对力量/技术的要求。
4. **使用体验 / 对比** —— 舒适度、操控性、容错性，以及与同类拍的横向对比。

---

## 1. 项目目标

- 把分散在各品牌官网、评测、论坛中的球拍数据，整理成**统一、可比较**的结构化数据集。
- 提供一个网站，让用户能够：
  - 按参数 / 打法 / 水平**筛选**出候选球拍；
  - 选择 2–4 支球拍做**并排对比**；
  - 根据「我的打法 + 水平 + 偏好」获得**推荐**。

### 非目标（当前阶段不做）

- 不做电商 / 比价（不接入实时价格与购买链接）。
- 不做用户账号与社区评论系统（后续可作为扩展）。

---

## 2. 数据模型

每支球拍是一条记录，字段定义见下。完整 JSON Schema 见 [`data/schema.json`](data/schema.json)，示例数据见 [`data/rackets.sample.json`](data/rackets.sample.json)。

### 2.1 基本参数（specs）

字段约定对齐 [Tennis Warehouse RacquetFinder](https://www.racquetfinder.com)（行业通用口径），便于做范围筛选。

| 字段 | 含义 | 单位 / 取值 | 备注 |
|------|------|------------|------|
| `headSize` | 拍面大小 | 平方英寸 (sq in)，80–140 | 常见 95–110 |
| `weightStrungG` | 穿线后重量（主用） | 克 (g) | 含线、避震器 |
| `weightUnstrungG` | 空拍重量 | 克 (g) | 未穿线 |
| `weightStrungOz` | 穿线后重量（辅） | 盎司 (oz)，8–14 | RacquetFinder 口径，可由 g 换算 |
| `balancePts` | 平衡点 | −20~20 | 负=头轻(HL)，正=头重(HH)，0=均衡 |
| `balanceMm` | 平衡点（可选） | 毫米 (mm) | 距拍柄底端 |
| `swingWeight` | 挥重 | RDC，250–450 | 越大越稳但越费力 |
| `beamWidth` | 拍框厚度 | 毫米 (mm)，15–35 | 可为区间，如 `23-26-21` |
| `mains` / `crosses` | 弦床密度 | 主弦数 / 横弦数 | 如 16 / 19 |
| `stiffness` | 拍框硬度 (RA) | 45–80 | 越高越硬、力量越大、舒适度越低 |
| `gripSizes` | 可选握把尺寸 | 数组 | 如 `["L1","L2","L3"]` |
| `length` | 拍长 | 英寸 (in)，27–29 | 标准 27 |

### 2.2 适合打法（playStyle）

- `topspin` 上旋型
- `flat` 平击型
- `aggressiveBaseline` 底线进攻
- `defensive` 防守反击
- `serveAndVolley` 发球上网
- `allCourt` 全场型

字段以**标签数组**存储，并对每个标签给出 0–5 的**匹配度评分**：

```json
"playStyle": [
  { "tag": "topspin", "fit": 5 },
  { "tag": "aggressiveBaseline", "fit": 4 }
]
```

### 2.3 球员水平（skillLevel）

| 取值 | 说明 |
|------|------|
| `beginner` | 初学者，需要大容错、轻量、大拍面 |
| `intermediate` | 进阶，技术成型，追求性能与容错平衡 |
| `advanced` | 高阶 / 半职业，能驾驭低容错、高要求球拍 |
| `pro` | 职业级，要求精准操控与稳定性 |

附加要求评分（0–5）：

```json
"requirement": {
  "power": 3,        // 球拍自身提供的力量
  "controlSkill": 4, // 对使用者控制能力的要求
  "physical": 4      // 对体能 / 力量的要求
}
```

### 2.4 使用体验 / 对比（experience）

各项 0–5 评分，便于横向对比：

| 字段 | 含义 |
|------|------|
| `comfort` | 舒适度（减震、手感） |
| `maneuverability` | 操控性 / 灵活度 |
| `forgiveness` | 容错性（甜区大小、偏心打击宽容度） |
| `power` | 力量输出 |
| `control` | 控制精度 |
| `spinPotential` | 制造旋转的潜力 |

### 2.5 元信息（meta）

`brand` 品牌、`model` 型号、`year` 年份、`series` 系列、`priceRange` 价格区间（仅作参考标签，如 `mid` / `high`）、`imageUrl` 图片、`sources` 数据来源链接数组。

---

## 3. 技术方案

| 层 | 选型（建议） | 说明 |
|----|-------------|------|
| 数据 | JSON 文件（`data/rackets.json`）起步 | 体量小，先文件化；后续可迁移 SQLite |
| 前端 | React + Vite + TypeScript | 组件化、类型安全 |
| 样式 | Tailwind CSS | 快速搭建筛选 / 对比界面 |
| 检索 | 前端内存筛选 | 数据量小，无需后端；纯静态可部署 |
| 部署 | 静态托管（GitHub Pages / Vercel / Netlify） | 零后端成本 |

> 数据量增大或需要写入时，再引入轻量后端（如 SQLite + 一个查询 API）。

### 页面规划

1. **列表 / 筛选页** —— 左侧筛选器（拍面、重量、打法、水平、价格），右侧结果卡片。
2. **详情页** —— 单支球拍的全部参数与雷达图（体验 6 项）。
3. **对比页** —— 2–4 支球拍并排，参数对齐、差异高亮。
4. **推荐页** —— 几道问题（你的水平 / 打法 / 偏好），输出排序后的推荐列表。

---

## 4. 目录结构

```
Tennis rackets/
├── README.md                  # 本文档（项目蓝图）
├── data/
│   ├── schema.json            # 球拍数据 JSON Schema
│   ├── rackets.sample.json    # 示例数据（开发用）
│   └── rackets.json           # 正式数据集（逐步录入）
├── src/                        # 前端代码（待初始化）
└── docs/                       # 录入规范、数据来源记录等
```

---

## 5. 路线图

- [ ] **M1 数据先行**：定稿 Schema，录入 20–30 支主流球拍，校对参数。
- [ ] **M2 列表 + 筛选**：搭起前端，实现按参数 / 打法 / 水平筛选。
- [ ] **M3 详情 + 对比**：详情页雷达图、对比页差异高亮。
- [ ] **M4 推荐引擎**：基于打法 + 水平 + 偏好的加权打分推荐。
- [ ] **M5 部署 + 扩充**：静态部署，持续补充数据到 100+ 支。

---

## 6. 录入规范（要点）

- 基本参数优先取 [Tennis Warehouse RacquetFinder](https://www.racquetfinder.com)（含实测挥重/平衡，口径统一），其次官方规格；评分类字段（fit / experience / requirement）注明依据（评测、实测、共识）。
- 每条记录必须填 `sources`，便于复核。
- 评分采用 0–5 整数，避免主观区分过细。
- 同一型号不同年份分开记录，`year` 区分。

---

## 7. 本地开发与部署

### 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务 http://localhost:5173
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

### 部署（Vercel）

纯静态 SPA，托管到 Vercel：

1. 代码推到 GitHub。
2. vercel.com 用 GitHub 登录 → Import 该仓库。
3. Vercel 自动识别 Vite（Build `npm run build`、Output `dist/`），直接 Deploy。
4. 拿到公开链接 `https://<项目名>.vercel.app`。

之后 `git push` 即自动重新构建上线。`vercel.json` 已配置 SPA 路由回退。

