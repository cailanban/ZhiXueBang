## Vibe
- Cyberpunk Dark × Glassmorphism：深宇宙黑底+蓝紫渐变发光，参考 zhmt88.com 高端AI平台风格

## Color
- Primary: #4F46E5
- On Primary: #FFFFFF
- Accent: #7C3AED
- On Accent: #FFFFFF
- Background: #0a0b0d
- Foreground: #E5E7EB
- Muted: #1a1b1e
- Border: #2D2F3A
- Secondary: #1F2230

## Typography
- Heading: Montserrat (family: 'Montserrat', sans-serif, weight: 700, url: https://resource-static.bj.bcebos.com/fonts/Montserrat-VariableFont_wght.woff2)
- Body: Montserrat (family: 'Montserrat', sans-serif, weight: 400, url: https://resource-static.bj.bcebos.com/fonts/Montserrat-VariableFont_wght.woff2)

## Visual Language
- 核心视觉签名：蓝紫渐变光晕边框（border-image gradient #4F46E5→#7C3AED）+ hover时卡片发光效果（box-shadow with rgba(79,70,229,0.3)）
- 材质与深度：深色半透明卡片（rgba(26,27,30,0.8) + backdrop-filter blur）+ 极细边框1px渐变描边
- 容器与按钮：圆角卡片12-16px，主按钮蓝紫渐变填充，次操作按钮透明底+渐变边框；hover时微妙发光
- 布局节奏：大号渐变标题文字，Hero居中+统计数字卡，功能区编号列表（01/02/03），品牌Logo横向滚动

## Animation
- 入场：卡片从下方淡入上移 translateY(20px)→0，duration 600ms ease-out，stagger 100ms
- 交互：hover卡片发光强度提升，scale(1.02) + glow加深，200ms ease
- 滚动/过渡：使用 tailwindcss-intersect opacity-0 intersect:opacity-100 transition duration-700；页面切换 fade 150ms

## Forbidden
- 禁大块纯色铺底（Primary/Accent禁大面积填充背景区域）
- 禁通用投影/圆角卡片作为唯一视觉签名，必须有发光/渐变边框特征
- 禁 Emoji 图标出现在标题/导航/按钮中

## Additional Notes
- 默认暗色模式，亮色模式下背景切为 #F8F9FC，卡片 #FFFFFF，文字 #111215
- Landing页（/）：Hero全屏深色背景+渐变文字标题+统计卡片+品牌滚动条，参考 zhmt88.com
- 登录页：分屏布局（左侧品牌视觉+右侧表单），禁纯白底孤立表单
- 数学公式渲染区使用等宽字体，代码块使用深色 #111215 背景