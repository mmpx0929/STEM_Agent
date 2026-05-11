# STEM_Agent Frontend

当前前端采用 **uni-app + Vite CLI** 模式。它不是普通 `Vue + Vite Web` 重写，而是在保留现有 uni-app 页面、组件、`uni.*` API、`pages.json` 路由和 `/static/...` 资源路径的基础上，补齐命令行 H5 开发与构建能力。

## 当前源码目录

正式源码目录是：

```text
D:\STEM_Agent_backup\frontend\src
```

后续开发只修改 `src/` 下的文件：

```text
src/App.vue
src/main.js
src/manifest.json
src/pages.json
src/uni.scss
src/uni.promisify.adaptor.js
src/pages/
src/components/
src/config/
src/utils/
src/static/
src/assets/
```

`frontend/` 根目录只保留工程配置和依赖文件：

```text
index.html
package.json
package-lock.json
vite.config.cjs
.npmrc
README.md
node_modules/
src/
dist/                  构建产物，可删除后重新生成
```

历史上曾经位于 `frontend/` 根目录的 `App.vue`、`main.js`、`pages/`、`components/`、`config/`、`utils/`、`static/` 等已经迁移到 `frontend/src/`。如果根目录再次出现这些同名源码目录，应先确认是否为历史副本，避免和 `src` 形成双份代码。

## 启动方式一：命令行 H5/Vite

首次使用先安装依赖：

```powershell
cd D:\STEM_Agent_backup\frontend
npm.cmd install
```

启动开发服务：

```powershell
cd D:\STEM_Agent_backup\frontend
npm.cmd run dev:h5
```

构建 H5：

```powershell
cd D:\STEM_Agent_backup\frontend
npm.cmd run build:h5
```

构建结果：

```text
D:\STEM_Agent_backup\frontend\dist
```

## 启动方式二：HBuilderX

仍然可以用 HBuilderX 打开：

```text
D:\STEM_Agent_backup\frontend
```

注意当前工程入口在 `src/` 下：

```text
src/main.js
src/pages.json
src/manifest.json
```

## 依赖版本

`package.json` 已锁定 DCloud/Vite 关键版本，避免 `latest` 拉到 Vue2 或不匹配的 uni-app 包导致依赖冲突。

关键点：

- `@dcloudio/*` 使用 vue3 对应版本。
- `vite` 使用与 `@dcloudio/vite-plugin-uni` 匹配的版本。
- `sass` 和 `webpack` 保留，因为 uni-app CLI 构建链会读取它们。
- 当前 `vite.config.cjs` 使用 CommonJS，避免 `type: module` 与 DCloud CLI 加载方式冲突。

## 后端配置

前端只调用自己的 FastAPI 后端，不直接连接第三方大模型平台。

配置文件：

```text
src/utils/config.js
```

默认值：

```js
export const API_BASE_URL = 'http://127.0.0.1:3000';
export const CHAT_API_PATH = '/api/v1/chat';
export const CHAT_STREAM_API_PATH = '/api/v1/chat/stream';
export const ENABLE_STREAMING = true;
export const ENABLE_FALLBACK = true;
```

真实模型 API Key 不放在前端。请在后端环境变量、`backend/.env.example` 对应变量或根目录 `start_backend.bat` 中配置。

## AIChat 调用链路

```text
src/pages/plan/components/AIChat.vue
  -> src/utils/aiService.js
  -> src/utils/apiClient.js
  -> backend /api/v1/chat 或 /api/v1/chat/stream
```

`aiService.js` 保留本地 mock/local KB fallback：当后端离线、网络失败或真实模型不可用时，课堂流程不会被直接阻断。

## 目录说明

```text
src/pages/        页面：首页、科学流程、工程流程、记录、成长、数据记录等
src/components/   实验流程步骤组件和通用组件
src/config/       实验配置、流程模板、注册表、儿童化文案、虚拟实验配置
src/utils/        API 客户端、AI 调用、状态存储、记录中心、报告版本等逻辑
src/static/       本地静态资源：实验图片、视频、导学素材
src/assets/       README 或页面展示资产
```

## 静态资源规则

源码中的资源位置：

```text
src/static/experiments/<experiment-id>/images
src/static/experiments/<experiment-id>/videos
src/static/Introductory-video
```

运行时仍然使用 `/static/...` 路径，例如：

```text
/static/experiments/engineering-05/videos/8-1.mobile.mp4
```

视频优先使用 `.mobile.mp4` 压缩版，原视频可以作为历史素材保留，但页面配置应指向压缩版，降低手机端和部署后的播放卡顿。

## 清理说明

可以删除并重新生成的目录：

```text
D:\STEM_Agent_backup\frontend\dist
D:\STEM_Agent_backup\frontend\unpackage
D:\STEM_Agent_backup\unpackage
```

不要删除：

```text
D:\STEM_Agent_backup\frontend\src
D:\STEM_Agent_backup\frontend\package.json
D:\STEM_Agent_backup\frontend\package-lock.json
D:\STEM_Agent_backup\frontend\index.html
D:\STEM_Agent_backup\frontend\vite.config.cjs
D:\STEM_Agent_backup\frontend\.npmrc
```