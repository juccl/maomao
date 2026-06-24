# 《甜度补给站》网页版小游戏 Demo

一个原创的三关横版平台跳跃小游戏，包含蓝白猫猫主角、一体化甜度路线地图、角色状态动画、程序生成背景音乐、进度存档、关卡结算与最终奖励页。无第三方图片、角色、地图、音乐或音效素材；画面由 CSS 与 Canvas 绘制，声音由 Web Audio API 即时生成。

## 运行

最简单的方式：直接双击 `index.html`。

macOS 也可以双击 `启动本地网站.command`。它会在普通 Terminal 中启动服务，并自动打开：

```text
http://127.0.0.1:4173
```

停止网站时，在打开的 Terminal 窗口按 `Control + C`。

也可以在项目目录运行静态服务器：

```bash
npx serve .
```

然后打开终端显示的本地地址。

## 操作

- `A / D` 或 `← / →`：左右移动
- `W / Space / ↑`：跳跃；空中再按一次可二段跳
- `P / Esc`：暂停
- 手机和平板：使用页面底部虚拟按键
- 从敌人上方踩下可击败敌人；正面碰撞会损失生命

## 游戏流程

1. 首页点击“开始挑战”进入关卡选择地图，并在用户交互后启动轻量背景音乐。
2. 第 1 关“冰淇淋小路”：至少收集 5 杯奶茶并抵达终点。
3. 第 2 关“糖霜高地”：至少收集 7 杯奶茶并抵达终点。
4. 第 3 关“奶茶补给站”：至少收集 9 杯奶茶、拿到吸管钥匙并抵达奶茶店。
5. 完成前一关后自动解锁下一关。
6. 三关均设有蓝白猫爪检查点；掉坑、碰到陷阱或敌人会扣 1 点生命。
7. 生命归零只重开当前关卡。
8. 通关状态、最佳奶茶数量、最佳用时和奖励状态保存在浏览器 `localStorage`。
9. 在地图上直接点击已解锁的数字节点即可进入关卡。

## 角色与声音

- 统一主角为原创白猫“甜度补给猫”：浅蓝针织帽、白色帽檐绒球、珊瑚围巾、浅蓝额头斑和奶茶挂饰。
- 角色支持待机、奔跑、起跳、下落、二段跳、受伤与通关庆祝状态。
- 奔跑动画由移动速度驱动步频，双脚和手臂交替摆动；转向有短暂惯性，落地有压缩回弹。
- 二段跳会生成浅蓝粒子，不改变原有物理判定。
- 关卡 checkpoint 使用蓝白猫爪旗帜；激活时会变亮、显示对勾并产生浅蓝泡泡。
- 关卡中途装饰均为无字、低对比背景轮廓，终点仅通过专属门和奖励图标识别。
- 白天与傍晚关卡分别使用多层视差背景，装饰不会改变平台碰撞或关卡坐标。
- 背景音乐和跳跃、收集、受伤、通关、按钮音效均由 Web Audio API 生成。
- 右上角音乐按钮控制全局静音；设置保存在 `sweet-supply-station-audio-v1`。

## 修改内容

主要配置都在 `main.js` 顶部。

### 修改标题和奖励文案

编辑 `GAME_CONFIG`：

```js
const GAME_CONFIG = {
  title: "甜度补给站",
  subtitle: "一款轻量横版跳跃闯关 Demo",
  rewardText: {
    level1: "冰淇淋奖励券 × 1",
    level2: "小蛋糕奖励券 × 1",
    level3: "奶茶奖励券 × 1",
    final: "奖励已经存档。至于怎么兑换，可以等一个合适的时机再决定。",
  },
};
```

### 修改或清除存档

存档键名为：

```text
sweet-supply-station-progress-v2
```

可以在关卡选择页点击“重置进度”，或在浏览器开发者工具中删除对应的 `localStorage` 项目。

### 调整生命值和跳跃手感

- `maxHealth`：生命上限
- `player.moveSpeed`：普通移动速度
- `player.jumpForce`：第一次跳跃力度
- `player.secondJumpForce`：二段跳力度
- `player.gravity`：重力；越大下落越快
- `player.invincibleSeconds`：受伤后的无敌时间

### 修改通关条件和奶茶数量

在 `LEVELS` 对应关卡中修改：

- `requiredMilkTea`：通关所需奶茶数量
- `requiredKey`：是否必须拿钥匙
- `milkTeas`：地图上的奶茶坐标
- `goal`：终点位置和尺寸

地图中放置的奶茶数量应大于通关要求，给玩家留少量选择空间。

### 调整关卡难度

每关都由以下数组配置：

- `platforms`：普通、移动和摇晃平台
- `milkTeas`：奶茶
- `enemies`：巡逻敌人、速度和巡逻范围
- `traps`：尖刺和路障
- `checkpoints`：检查点
- `decorations`：场景装饰
- `key`：吸管钥匙
- `boost`：甜度加速
- `goal`：终点

移动平台使用 `toX`、`toY` 和 `speed` 设置轨迹。摇晃平台将 `type` 设为 `"shaky"`。

### 新增关卡

1. 在 `LEVELS` 数组末尾复制一个关卡对象。
2. 修改名称、宽度、起点、通关条件和各类地图对象。
3. 在 `showLevelResult()` 与“下一关”按钮逻辑中补充新的页面流转。
4. 如需新主题，可在 `drawBackground()` 中增加主题分支。

### 替换角色素材

当前角色由 `drawPlayer()` 直接绘制。可以：

1. 保留角色碰撞尺寸 `player.w / player.h`。
2. 在加载阶段创建 `Image` 对象。
3. 在 `drawPlayer()` 中按站立、移动、跳跃、受伤和庆祝状态切换 `drawImage()`。
4. 把图片放入 `assets/character/`，并确认素材原创或拥有使用授权。

## 部署

这是纯静态项目，不需要构建命令。

### Vercel

1. 将项目推送到 GitHub/GitLab。
2. 在 Vercel 中选择 **Add New Project** 并导入仓库。
3. Framework Preset 选择 **Other**。
4. Build Command 留空，Output Directory 填 `.`。
5. 点击 Deploy。

也可以安装 Vercel CLI 后，在目录中执行 `vercel`。

### Netlify

1. 在 Netlify 选择 **Add new site → Deploy manually**。
2. 将整个项目文件夹拖入上传区域。

使用 Git 仓库时，Build Command 留空，Publish Directory 填 `.`。

### Cloudflare Pages

1. 在 Cloudflare 控制台进入 **Workers & Pages → Create → Pages**。
2. 连接 Git 仓库。
3. Framework preset 选择 **None**。
4. Build command 留空，Build output directory 填 `.`。

### 腾讯云静态网站

可使用对象存储 COS：

1. 新建公开读取的 COS 存储桶。
2. 开启“静态网站”功能。
3. 索引文档设置为 `index.html`。
4. 上传 `index.html`、`style.css`、`main.js` 和 `assets/`。
5. 使用静态网站访问域名，或绑定已备案的自定义域名。

正式分享前，建议按腾讯云当前控制台提示检查访问权限、HTTPS 和域名备案要求。

## 后续迁移微信小程序方案

- Canvas 游戏状态、物理更新、碰撞检测和关卡配置可以继续复用。
- 页面结构需要从 HTML/CSS 改为 WXML/WXSS。
- `canvas` 绘制 API 需要适配微信小程序 Canvas 2D 上下文。
- 键盘和 Pointer 输入改为小程序 `touchstart / touchend` 事件。
- 静态资源放入小程序项目 `assets`，并注意包体大小。
- 首页、暂停页、结算页和奖励页可拆成小程序页面或自定义组件。
- 分享入口可接入小程序的分享能力。
- 当前 MVP 先验证玩法、游玩时长和互动感受，再决定是否迁移。

## 文件结构

```text
.
├── index.html
├── style.css
├── main.js
├── assets/
│   └── README.md
└── README.md
```
