# 数字校园 VR 全景漫游平台 — 系统架构与产品设计

> VR Panorama 为核心，智慧校园为辅助 | Version 2.0 | 2026-05-25

---

## 核心定位

**主菜**: VR 360° 全景漫游 — 用户进入网站即置身校园全景中，通过热点跳转穿梭校园
**配菜**: 智慧校园服务（课表/成绩/报修/AI助手）— 从全景界面呼出面板访问

参考对象：数字敦煌（全景切换 + 热点交互 + 沉浸叙事）
不是参考：后台管理系统、传统门户网站

---

## 一、用户交互流程

```
用户访问网站
    │
    ▼
┌──────────────────────────────────────────┐
│         进入 VR 全景（首屏即全景）          │
│                                           │
│   ┌─────────────────────────────────┐    │
│   │                                 │    │
│   │      360° 全景场景               │    │
│   │      （默认：正门广场）            │    │
│   │                                 │    │
│   │   ● ← 热点（悬停显示名称）         │    │
│   │   ↓ ← 导航热点（点击跳转场景）      │    │
│   │                                 │    │
│   └─────────────────────────────────┘    │
│                                           │
│   ┌─────────────────────────────────┐    │
│   │ 底部场景缩略图条（横向滚动）        │    │
│   │ [正门] [图书馆] [教学楼] [宿舍]... │    │
│   └─────────────────────────────────┘    │
│                                           │
│   左上角：菜单按钮 → 呼出侧边面板          │
│   右上角：场景信息 / AI助手入口            │
│   右下角：工具栏（音乐/日夜/陀螺仪）       │
└──────────────────────────────────────────┘
```

---

## 二、技术架构

```
┌─────────────────────────────────────────────┐
│                  Nginx                       │
├─────────────────────────────────────────────┤
│                                              │
│  Next.js 16 (App Router)                     │
│  ┌──────────────────────────────────────┐   │
│  │  / (首页)  = VR 全景播放器            │   │
│  │  /panorama/[sceneId] = 直达某个场景   │   │
│  │  /smart/... = 智慧校园（独立页面）     │   │
│  │  /admin/... = 内容管理后台            │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  VR 全景引擎（客户端）                 │   │
│  │  - Three.js 全景球体渲染               │   │
│  │  - 热点系统（3D坐标 → 屏幕投影）        │   │
│  │  - 场景过渡（缩放淡入淡出）             │   │
│  │  - 陀螺仪/鼠标/触摸 手势               │   │
│  │  - 音频空间化（可选）                  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  NestJS API Server                           │
│  ┌──────────────────────────────────────┐   │
│  │  - 场景数据 CRUD                       │   │
│  │  - 全景图片管理（MinIO）               │   │
│  │  - 热点数据管理                        │   │
│  │  - 用户/Auth                           │   │
│  │  - 智慧校园业务                        │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  PostgreSQL + MinIO + Redis                   │
└─────────────────────────────────────────────┘
```

---

## 三、VR 全景引擎设计（核心）

### 3.1 全景渲染原理

```
Equirectangular 图片（2:1 宽高比，360°×180°）
    ↓
贴到球体内壁（SphereGeometry，radius ~100m，只渲染内面）
    ↓
相机放在球心
    ↓
用户拖动鼠标 = 旋转相机（orbit around Y + pitch）
    ↓
看到不同方向的全景图像
```

### 3.2 场景数据结构

```typescript
interface PanoramaScene {
  id: string;
  name: string;              // "正门广场" / "图书馆大厅" / "教学楼B区"
  slug: string;
  category: string;          // entrance/library/teaching/dormitory/canteen/lab/sports
  description: string;
  thumbnail: string;         // 缩略图（列表用）
  panoramaUrl: string;       // 全景图 URL (MinIO, 4096×2048 or larger)
  initialYaw: number;        // 初始视角（度）
  initialPitch: number;
  hotspots: Hotspot[];
  audioGuideUrl?: string;    // 语音导览
  geoPosition?: { lat: number; lng: number }; // 真实GPS
  order: number;             // 排序
}

interface Hotspot {
  id: string;
  type: 'navigation' | 'info' | 'media' | 'link';
  // 3D 球面上的位置（球坐标）
  yaw: number;               // 水平角度 0-360
  pitch: number;             // 垂直角度 -90~90
  // 显示
  icon: string;              // icon 名称
  label: string;             // 标签文字
  tooltip: string;
  // 行为（根据 type）
  targetSceneId?: string;    // navigation: 跳转到哪个场景
  infoContent?: string;      // info: 弹出信息卡片内容
  mediaUrl?: string;         // media: 图片/视频 URL
  linkUrl?: string;          // link: 外部链接
  // 动画
  animation?: 'pulse' | 'float' | 'rotate';
}
```

### 3.3 热点 3D→2D 投影

```typescript
// 球坐标 → 3D 世界坐标 → 屏幕像素坐标
function sphericalToPosition(yaw: number, pitch: number, radius: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - pitch);
  const theta = THREE.MathUtils.degToRad(yaw);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// 判断热点是否在视口内（是否在相机前方 + 是否被遮挡边缘）
function isHotspotVisible(hotspotPos: THREE.Vector3, camera: THREE.Camera): boolean {
  const direction = hotspotPos.clone().normalize();
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  return direction.dot(cameraDir) < -0.1; // 在相机前方
}
```

### 3.4 场景切换过渡

```typescript
// 过渡效果：Zoom blur + Crossfade
async function transitionToScene(from: string, to: string) {
  // 1. 当前场景加速模糊 (zoom in effect, 0.4s)
  await gsap.to(camera, { fov: 90, duration: 0.4, ease: 'power2.in' });

  // 2. 切换全景纹理（0.1s 黑场）
  // 3. 新场景纹理加载完成

  // 4. 新场景从模糊到清晰 (zoom out, 0.6s)
  await gsap.to(camera, { fov: 75, duration: 0.6, ease: 'power2.out' });
}
```

---

## 四、前端路由（VR 核心）

```
/                              # 首页 = VR 全景播放器（默认场景）
/panorama/[slug]               # 直达某个场景（可分享链接）
/smart                         # 智慧校园面板（独立路由，也可从全景呼出）
/smart/schedule                # 课程表
/smart/grades                  # 成绩
/smart/repair                  # 报修
/smart/library                 # 图书馆
/smart/classroom               # 空教室
/admin                         # CMS 管理后台
/admin/scenes                  # 场景管理（上传全景图、编辑热点）
/admin/media                   # 媒体库
/auth/login                    # 登录
```

---

## 五、页面结构

### 5.1 VR 全景页（/）— 主界面

```
┌──────────────────────────────────────────────────┐
│ 左上                                               右上│
│ ☰ 菜单   场景名称 ▾                    🎵 🔔 🌐 登录 │
│                                                    │
│                                                    │
│                                                    │
│             360° 全景画面                           │
│         （鼠标拖动旋转视角）                          │
│                                                    │
│          ● 图书馆 ← 热点                            │
│     ● 教学楼               ● 食堂                   │
│                                                    │
│                                                    │
│                                                    │
│ 左下                                    │  右下    │
│ 场景介绍文字...                          │ [陀螺仪] │
│                                         │ [全屏]   │
├──────────────────────────────────────────┤ [帮助]   │
│ [正门] [图书馆] [教学楼] [宿舍] [食堂] [体育馆] [湖]..│
│              场景缩略图条（横向滚动）                  │
└──────────────────────────────────────────────────┘
```

### 5.2 侧边菜单面板（从全景页呼出）

```
┌──────────────────┐
│  × 关闭           │
│                   │
│  校园VR全景        │
│  ├ 正门广场        │
│  ├ 图书馆          │
│  ├ 教学楼区        │
│  ├ 实验楼          │
│  ├ 宿舍区          │
│  ├ 食堂            │
│  ├ 体育馆          │
│  └ 校园湖景        │
│                   │
│  ──────────────── │
│  智慧校园服务       │
│  ├ 课程表          │
│  ├ 成绩查询        │
│  ├ 校园卡          │
│  ├ 报修申请        │
│  └ 空教室查询      │
│                   │
│  ──────────────── │
│  AI校园助手        │
│  校园文化馆        │
│  数据大屏          │
└──────────────────┘
```

---

## 六、前端目录结构（重设计）

```
frontend/src/
├── app/
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # / = VR 全景主页
│   ├── globals.css
│   ├── panorama/
│   │   └── [slug]/page.tsx        # /panorama/正门广场
│   ├── smart/                     # 智慧校园
│   │   ├── page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── grades/page.tsx
│   │   ├── repair/page.tsx
│   │   ├── library/page.tsx
│   │   └── classroom/page.tsx
│   ├── admin/                     # CMS
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── scenes/page.tsx
│   └── auth/login/page.tsx
│
├── modules/
│   ├── vr-panorama/              # ★ VR 全景核心模块
│   │   ├── PanoramaViewer.tsx    # 全景播放器（Three.js）
│   │   ├── PanoramaSphere.tsx    # 全景球体渲染
│   │   ├── HotspotOverlay.tsx    # 热点系统（HTML overlay）
│   │   ├── SceneThumbnails.tsx   # 底部场景缩略图条
│   │   ├── SceneInfo.tsx         # 场景信息卡片
│   │   ├── MenuPanel.tsx         # 侧边菜单面板
│   │   ├── Toolbar.tsx           # 工具栏（陀螺仪/全屏/音频）
│   │   ├── TransitionEffect.tsx  # 场景切换过渡
│   │   └── AudioGuide.tsx        # 语音导览
│   │
│   ├── smart-campus/             # 智慧校园
│   │   ├── ScheduleView.tsx
│   │   ├── GradeTable.tsx
│   │   ├── RepairForm.tsx
│   │   ├── LibrarySearch.tsx
│   │   └── ClassroomFilter.tsx
│   │
│   ├── admin/                    # 管理后台
│   │   ├── SceneEditor.tsx       # 场景编辑器（上传全景图+拖拽热点）
│   │   ├── MediaLibrary.tsx
│   │   └── Dashboard.tsx
│   │
│   └── ai-assistant/
│       └── ChatPanel.tsx
│
├── components/
│   ├── ui/                       # 基础 UI
│   │   ├── GlassPanel.tsx
│   │   ├── GlowButton.tsx
│   │   ├── GradientText.tsx
│   │   ├── IconButton.tsx
│   │   └── LoadingScreen.tsx
│   └── layout/
│       └── AdminLayout.tsx
│
├── hooks/
│   ├── usePanorama.ts           # 全景核心 hook
│   ├── useGyroscope.ts          # 陀螺仪
│   ├── useFullscreen.ts
│   ├── useMouseDrag.ts          # 鼠标拖拽旋转
│   └── useTouch.ts              # 触摸手势
│
├── stores/
│   ├── panoramaStore.ts         # 全景场景状态
│   ├── uiStore.ts
│   └── authStore.ts
│
├── services/
│   ├── http.ts
│   ├── panorama.service.ts      # 场景API
│   └── smart.service.ts
│
├── lib/
│   ├── cn.ts
│   ├── panorama-utils.ts        # 全景坐标转换工具
│   └── constants.ts
│
└── types/
    └── panorama.ts              # 全景相关类型
```

---

## 七、数据库设计（VR 场景核心表）

```sql
-- 全景场景
CREATE TABLE panorama_scenes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    category        VARCHAR(50)  NOT NULL,  -- entrance/library/teaching/...
    description     TEXT,
    thumbnail_url   VARCHAR(500),
    panorama_url    VARCHAR(500) NOT NULL,   -- MinIO 全景图
    lowres_url      VARCHAR(500),            -- 低分辨率预览
    initial_yaw     DECIMAL(5,1) DEFAULT 0,
    initial_pitch   DECIMAL(5,1) DEFAULT 0,
    audio_guide_url VARCHAR(500),
    geo_lat         DECIMAL(10,7),
    geo_lng         DECIMAL(10,7),
    sort_order      INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'published',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 热点
CREATE TABLE panorama_hotspots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id        UUID REFERENCES panorama_scenes(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,    -- navigation/info/media/link
    yaw             DECIMAL(6,2) NOT NULL,   -- 水平角度
    pitch           DECIMAL(5,2) NOT NULL,   -- 垂直角度
    icon            VARCHAR(50) DEFAULT 'default',
    label           VARCHAR(200) NOT NULL,
    tooltip         VARCHAR(500),
    target_scene_id UUID REFERENCES panorama_scenes(id),
    info_content    TEXT,
    media_url       VARCHAR(500),
    link_url        VARCHAR(500),
    animation       VARCHAR(20) DEFAULT 'pulse',
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hotspots_scene ON panorama_hotspots(scene_id);
```

---

## 八、API 设计（VR 核心）

```
GET    /api/v1/panorama/scenes              # 场景列表
GET    /api/v1/panorama/scenes/:slug        # 场景详情（含热点）
POST   /api/v1/panorama/scenes              # 创建场景（admin）
PATCH  /api/v1/panorama/scenes/:id          # 编辑场景（admin）
DELETE /api/v1/panorama/scenes/:id          # 删除场景（admin）
GET    /api/v1/panorama/scenes/:id/hotspots # 场景热点
POST   /api/v1/panorama/hotspots            # 创建热点（admin）
PATCH  /api/v1/panorama/hotspots/:id        # 编辑热点（admin）
DELETE /api/v1/panorama/hotspots/:id        # 删除热点（admin）
```

---

## 九、VR 全景核心组件实现方案

### PanoramaViewer（主组件）

```typescript
// 核心逻辑
function PanoramaViewer({ initialScene }: { initialScene: PanoramaScene }) {
  const [currentScene, setCurrentScene] = useState(initialScene);
  const [isTransitioning, setTransitioning] = useState(false);
  const { fov } = useTransition();

  const handleHotspotClick = async (hotspot: Hotspot) => {
    if (hotspot.type === 'navigation' && hotspot.targetSceneId) {
      setTransitioning(true);
      await animateOut(); // zoom in blur 0.4s
      const newScene = await fetchScene(hotspot.targetSceneId);
      setCurrentScene(newScene);
      await animateIn();  // zoom out 0.6s
      setTransitioning(false);
    } else if (hotspot.type === 'info') {
      openInfoCard(hotspot);
    }
  };

  return (
    <div className="panorama-container">
      <Canvas camera={{ fov, position: [0, 0, 0] }}>
        <PanoramaSphere textureUrl={currentScene.panoramaUrl} />
      </Canvas>
      <HotspotOverlay
        hotspots={currentScene.hotspots}
        onHotspotClick={handleHotspotClick}
        fov={fov}
      />
      <SceneThumbnails
        scenes={scenes}
        current={currentScene}
        onSelect={handleSceneSwitch}
      />
      <Toolbar />
      <MenuPanel />
    </div>
  );
}
```

### 热点投影（关键算法）

```typescript
// 给定热点球坐标 + 当前相机状态 → 屏幕 (x, y) 坐标
function projectHotspot(
  hotspot: Hotspot,
  camera: THREE.PerspectiveCamera,
  containerSize: { width: number; height: number }
): { x: number; y: number; visible: boolean } | null {
  // 1. 球坐标 → 3D世界坐标
  const worldPos = sphericalToPosition(hotspot.yaw, hotspot.pitch, SPHERE_RADIUS * 0.99);

  // 2. 检查是否在相机前方
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  const toHotspot = worldPos.clone().normalize();
  if (toHotspot.dot(cameraDir) > -0.05) return null; // behind camera

  // 3. 3D → 屏幕坐标
  const screenPos = worldPos.clone().project(camera);
  return {
    x: (screenPos.x * 0.5 + 0.5) * containerSize.width,
    y: (-screenPos.y * 0.5 + 0.5) * containerSize.height,
    visible: screenPos.z < 1,
  };
}
```

---

## 十、全景图拍摄与处理规范

```
设备: Insta360 / Ricoh Theta / DJI 全景相机
分辨率: 至少 8192×4096 (8K)，推荐 16384×8192 (16K)
格式: JPEG (90% quality) / WebP
单张大小: < 15MB (平衡质量与加载速度)

处理流程:
拍摄 RAW → PTGui/Adobe 拼接 → Photoshop 修图（去掉三脚架/调色）
  → 导出 8192×4096 JPEG → 生成 2048×1024 缩略图
  → 上传 MinIO → 后台录入场景信息 → 添加热点 → 发布

场景覆盖（至少20个点位）:
  正门广场、图书馆大厅、图书馆阅览室、教学楼B区大厅
  教学楼教室（大/小）、实验楼（机器人/智能制造/AUV）
  学生宿舍（四人间）、第一食堂、第二食堂、体育馆
  田径场、篮球场、校园湖景、行政楼、学术交流中心
  计算机中心、校史馆、创新创业中心
```

---

## 十一、开发计划

### Phase 1 — VR 核心 MVP（本周）
- [ ] Three.js 全景球体渲染器
- [ ] 鼠标/触摸拖拽旋转
- [ ] 热点投影系统
- [ ] 场景切换功能
- [ ] 底部缩略图条
- [ ] 2 个测试场景 + 模拟热点数据
- [ ] 基础 Layout + 全局样式

### Phase 2 — VR 体验完善
- [ ] 场景切换过渡动画
- [ ] 陀螺仪支持（移动端）
- [ ] 全屏模式
- [ ] 侧边菜单面板
- [ ] 信息热点弹窗
- [ ] 音频导览
- [ ] 缩略图预加载

### Phase 3 — 后端 + CMS
- [ ] NestJS API (panorama CRUD)
- [ ] MinIO 文件存储
- [ ] 场景管理后台（上传全景图、拖拽编辑热点位置）
- [ ] 用户认证 (JWT)
- [ ] 数据库迁移

### Phase 4 — 智慧校园 + 收尾
- [ ] 智慧校园功能页面
- [ ] AI 助手
- [ ] 性能优化
- [ ] Docker 部署
- [ ] Nginx 配置

---

> 下一步：初始化前端项目，实现 VR 全景渲染器核心代码。
