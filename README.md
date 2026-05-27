# DGUT VR 全景漫游

东莞理工学院智能制造KineticRobotics机器人实验室 360° VR 全景漫游平台。基于 Next.js + Three.js，首屏即全景，通过热点跳转穿梭实验室各区域。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| 3D 引擎 | Three.js via @react-three/fiber + @react-three/drei |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS v4 |
| 动画 | framer-motion + GSAP |

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`，即进入 VR 全景。

## 项目结构

```
vr_ultimate/
├── DESIGN.md              # 系统架构与产品设计文档
├── frontend/              # Next.js 前端
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   ├── components/    # React 组件
│   │   │   ├── panorama/  # 全景引擎核心
│   │   │   └── ui/        # 通用 UI 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── lib/           # 工具函数 & 场景数据
│   │   ├── stores/        # Zustand 状态
│   │   └── types/         # TypeScript 类型定义
│   └── public/panoramas/  # 全景图片资源
└── 全景照片/              # 原始拍摄素材
```

## 已实现

- 360° 全景渲染（球面投影 + 等距柱状纹理）
- 鼠标/触摸拖拽旋转视角
- 3D 热点系统（导航热点 / 信息热点，实时投影到 2D 屏幕）
- 场景间切换动画（FOV 缩放过渡）
- 场景缩略图导航栏
- 侧边菜单面板（场景列表 + 智慧校园入口占位）
- 全屏模式 / 帮助说明
- 4 个实验室实景场景 + 设备介绍

## 待开发

- NestJS 后端 API + PostgreSQL 场景数据管理
- 后台 CMS（场景编辑器、热点配置）
- 智慧校园服务页面（课表、成绩、报修、图书馆）
- AI 校园助手对话面板
- 移动端陀螺仪支持
- 语音导览
- Docker 部署

## License

MIT
