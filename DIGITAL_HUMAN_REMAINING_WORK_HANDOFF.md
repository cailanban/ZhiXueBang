# 智学帮数字人模块剩余工作交接文档

更新时间：2026-07-19  
项目目录：`v8_web_implementation`  
交接目标：让下一位 AI 直接完成“智学帮内嵌高质量数字人”的联调、验证和生产化，不再重复排查已经跑通的 TURN 与 GPU 服务。

## 1. 当前结论

数字人的底层能力已经跑通，但智学帮前端仍未完成协议适配，所以当前页面显示“已断开连接”。

| 模块 | 状态 | 已有证据 |
| --- | --- | --- |
| Coturn TURN | 已跑通 | UDP、TCP relay 均通过；浏览器可获得 `relay` candidate |
| AutoDL GPU 数字人 | 已跑通 | LiveTalking 页面有画面；文本可驱动语音和口型 |
| MuseTalk 模型 | 已跑通 | `teacher1` 形象能够正常渲染、说话和同步口型 |
| 独立 LiveTalking WebRTC | 已跑通 | 经 SSH 隧道访问 `http://127.0.0.1:16006/index.html` 成功 |
| 智学帮数字人 UI | 已存在 | 聊天页已有数字人面板、连接按钮和状态 UI |
| 智学帮到 LiveTalking 的协议适配 | 未完成 | 现有代码仍调用旧网关接口，与实际 LiveTalking API 不一致 |
| WebRTC 协商时序 | 未完成 | 前端未等待 ICE gathering 完成便发送 SDP |
| AI 流式回答驱动数字人 | 未完成 | 尚未完成分句、排队播报、打断和恢复逻辑 |
| 生产部署 | 未完成 | 当前依赖本地 SSH 隧道，没有稳定 HTTPS 反向代理与鉴权 |

不要把 `/api/ice-config` 可访问等同于整个数字人链路成功。最终验收必须同时满足：连接成功、有画面、有声音、有口型、可打断、可重连。

## 2. 已验证的真实 LiveTalking 协议

当前 GPU 服务的实际协议如下，后续代码必须按此适配。

### 2.1 获取 ICE 配置

```http
GET /api/ice-config
```

响应包含：

```json
{
  "iceServers": [],
  "iceTransportPolicy": "relay"
}
```

必须保留服务端返回的 `relay`，不要强制覆盖成 `all`。

### 2.2 WebRTC Offer

```http
POST /offer
Content-Type: application/json
```

请求：

```json
{
  "sdp": "浏览器完成 ICE gathering 后的完整 SDP",
  "type": "offer",
  "avatar": "teacher1"
}
```

响应：

```json
{
  "sdp": "服务端 answer SDP",
  "type": "answer",
  "sessionid": "服务端会话 ID"
}
```

### 2.3 文本驱动

```http
POST /human
Content-Type: application/json
```

请求：

```json
{
  "type": "echo",
  "text": "需要数字人讲解的文本",
  "interrupt": true,
  "sessionid": "服务端 sessionid"
}
```

### 2.4 打断

```http
POST /interrupt
Content-Type: application/json
```

```json
{
  "sessionid": "服务端 sessionid"
}
```

### 2.5 当前不存在的接口

本地 LiveTalking 不提供以下旧网关接口，前端不得继续调用：

- `POST /api/webrtc/offer`
- `POST /api/speak`
- `GET /api/speaking`
- `DELETE /api/session/:id`
- 默认端口 `18010`

本地服务也没有可靠的 speaking-status 查询接口。说话状态应由前端队列和时长估算维护，不能高频轮询一个不存在的接口。

## 3. P0：必须完成的代码修改

### 3.1 改造本地 GPU API 适配层

文件：`src/services/avatarGatewayApi.ts`

要求：

1. 本地 GPU 基础地址改用 `VITE_DIGIHUMAN_GPU_URL`，默认 `/digi-api`。
2. 保留现有生产 Supabase Edge Function 路径，不能为了本地调试破坏生产实现。
3. 在浏览器内维护映射：

```ts
Map<frontendSessionId, {
  remoteSessionId?: string;
  avatarId: string;
}>
```

4. `createSession`：
   - 请求 `/api/ice-config`。
   - 保留返回的 `iceTransportPolicy`。
   - 创建前端临时 UUID。
   - 默认形象为 `teacher1`。
5. `sendOffer`：
   - 改为请求 `/offer`。
   - 请求体为 `{ sdp, type: 'offer', avatar }`。
   - 从响应读取 `sessionid` 并写入映射。
   - 向 Hook 返回 answer SDP。
6. `speak`：
   - 改为请求 `/human`。
   - 请求体为 `{ type: 'echo', text, interrupt: true, sessionid }`。
   - 将 LiveTalking 的空响应或非 JSON 响应适配成现有 `SpeakResponse`。
7. `interrupt`：改为 `/interrupt`，字段名必须是 `sessionid`。
8. `deleteSession`：本地模式只做 best-effort interrupt 和删除 Map，不调用不存在的 DELETE 接口。
9. `getSpeakingStatus`：本地模式不发网络请求；返回本地维护状态或安全默认值。
10. `sendAudio`：如果暂不实现 `/humanaudio` multipart，必须明确返回“不支持”，不能静默假成功。
11. `devFetch` 必须同时兼容 JSON、纯文本和空响应。

### 3.2 修复 WebRTC 协商时序

文件：`src/hooks/useAvatarSession.ts`

必须新增等待函数：

```ts
async function waitForIceGatheringComplete(
  pc: RTCPeerConnection,
  timeoutMs = 15000,
): Promise<void>
```

连接和重连都必须执行：

```ts
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
await waitForIceGatheringComplete(pc);

const completeSdp = pc.localDescription?.sdp;
if (!completeSdp) throw new Error('ICE gathering 后没有本地 SDP');

const answer = await avatarGatewayApi.sendOffer(sessionId, completeSdp);
await pc.setRemoteDescription({ type: 'answer', sdp: answer.sdp });
```

同时完成：

- 保留 `audio`、`video` 的 `recvonly` transceiver。
- 删除客户端主动创建的 `visual-events` DataChannel。当前 LiveTalking 不接受该方式。
- 如未来服务端主动发送 DataChannel，只保留 `pc.ondatachannel` 监听。
- 本地模式关闭 speaking-status 心跳轮询。
- 连接失败时必须关闭 PeerConnection、清除计时器和会话映射。
- 重连三次不能产生重复 PeerConnection 或幽灵 session。

### 3.3 配置 Vite 开发代理

文件：`vite.config.ts`

建议配置：

```ts
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 保留现有配置
    server: {
      proxy: {
        '/digi-api': {
          target: env.DIGIHUMAN_PROXY_TARGET || 'http://127.0.0.1:16006',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/digi-api/, ''),
        },
      },
    },
  };
});
```

本地环境文件：`.env.local`

```dotenv
VITE_USE_LOCAL_GPU=true
VITE_DIGIHUMAN_GPU_URL=/digi-api
VITE_DIGIHUMAN_AVATAR_ID=teacher1
DIGIHUMAN_PROXY_TARGET=http://127.0.0.1:16006
```

TURN 密码、Spark 密钥等秘密不得放进任何 `VITE_` 变量，因为它们会进入浏览器产物。

### 3.4 修复数字人 UI 与降级体验

重点文件：

- `src/pages/ChatPage.tsx`
- `src/contexts/DigitalHumanContext.tsx`
- `src/components/digital-human/DigitalHumanPanel.tsx`
- `src/components/digital-human/AvatarVideo.tsx`
- `src/components/digital-human/AvatarControls.tsx`
- `src/hooks/useAvatarSpeech.ts`

要求：

- 默认 Avatar ID 使用 `teacher1`，不能继续使用不存在的旧 ID。
- 明确显示：未连接、连接中、已连接、正在说话、连接失败、GPU 未启动。
- 失败后提供重试按钮和可读错误信息。
- GPU 不可用时，常驻 AI 助手仍然可正常文本对话。
- 不允许无限加载动画。
- 断开连接后清空远端媒体流和会话 ID。

## 4. P0 验证流程

### 4.1 启动 GPU 服务和隧道

GPU 实例启动后，用当前有效的 AutoDL 登录信息建立隧道。不要把密码写进代码或文档：

```bash
ssh -N \
  -L 16006:127.0.0.1:6006 \
  -p <SSH端口> \
  root@<AutoDL连接主机>
```

验证：

```bash
curl http://127.0.0.1:16006/api/ice-config
```

### 4.2 启动智学帮

```bash
pnpm install
pnpm dev
```

进入智能对话页，点击“连接 AI 教师”。

### 4.3 浏览器验收

必须逐项通过：

1. 连接后状态变成“已连接”。
2. 能看到 `teacher1` 数字人画面。
3. 输入文本后能听到语音。
4. 口型与语音同步。
5. 点击打断后 1 秒左右停止播报。
6. 断开后可重新连接。
7. 连续断开、重连三次没有卡死或达到最大 session。
8. TURN-only 场景下连接成功。

浏览器 Network 中本地模式只应出现：

- `/digi-api/api/ice-config`
- `/digi-api/offer`
- `/digi-api/human`
- `/digi-api/interrupt`

不得再出现旧的 `/api/session`、`/api/webrtc/offer`、`/api/speak`、`/api/speaking`。

浏览器控制台应记录：

- 已加载认证 TURN 配置，但不能打印密码。
- ICE gathering 完成。
- 出现 `relay` candidate。
- `iceConnectionState` 最终为 `connected` 或 `completed`。
- `connectionState` 最终为 `connected`。

### 4.4 工程验证

```bash
pnpm typecheck
pnpm test
pnpm build
```

若仓库测试较多，至少保证 `typecheck` 与 `build` 通过，并在交付报告中说明未执行的测试。

## 5. P1：流式 AI 回答驱动数字人

P0 跑通后再做，禁止在连接链路未稳定前混做。

### 5.1 真实流式输出

- 保留 Spark Lite 的 SSE/流式输出。
- UI 每收到增量文本立即更新，不得等完整答案后一次性显示。
- 增加首字延迟、总响应时间和中断状态埋点。

### 5.2 分句播报队列

大模型 token 不能逐 token 送给 TTS。应实现：

```text
Spark 流式 token
  -> 文本缓冲区
  -> 按 。！？；\n 或合理长度分句
  -> 数字人播报队列
  -> /human
```

建议规则：

- 遇到完整标点立即提交。
- 无标点时达到约 40–80 个汉字再提交。
- 流结束时提交剩余文本。
- 新问题或用户点击打断时，立即清空队列并调用 `/interrupt`。
- 不重复播放已经提交的文本。
- GPU 未开启时只显示文字，不尝试播报。

### 5.3 交互状态

- `ready`：可输入。
- `thinking`：Spark 正在生成。
- `speaking`：队列中存在正在播报的句子。
- `interrupted`：用户打断。
- `error`：连接或 TTS 失败，但文本回答仍应保留。

## 6. P1：生产化接入

当前 SSH 隧道只适合测试和演示，不能作为正式部署。

下一步需要：

1. GPU 服务增加稳定域名和 HTTPS 反向代理。
2. WebRTC/HTTP 跨域策略仅允许智学帮正式域名。
3. TURN 改为短期动态凭证，避免客户端永久静态密码。
4. GPU 网关增加用户鉴权、会话限额、超时回收和速率限制。
5. 记录但不泄露以下指标：
   - 模型冷启动时间
   - WebRTC 建连时间
   - ICE candidate 类型
   - TTS 首音延迟
   - 数字人首帧延迟
   - 打断延迟
   - 会话异常退出原因
6. AutoDL 关闭时自动降级为常驻 AI 助手，不弹出阻塞性错误。

## 7. P2：后续增强项

### 7.1 动态绘图与语音微课

当前前端的 `visual-events` DataChannel 与 LiveTalking 不兼容。建议改成应用层 WebSocket、SSE 或 Supabase Realtime：

```text
AI 教学脚本
  -> 时间轴事件
  -> 语音分句队列
  -> 数字人口播
  -> 同步白板绘图/公式/高亮/翻页
```

事件示例：

```json
{
  "atMs": 4200,
  "type": "draw_formula",
  "payload": {
    "latex": "f(x)=x^2",
    "x": 320,
    "y": 180
  }
}
```

### 7.2 录音与音频上传

- 如确实需要上传音频驱动，适配 LiveTalking `/humanaudio` 的 multipart 协议。
- 增加格式、大小、时长校验。
- 上传失败不能影响当前文本会话。

### 7.3 数字人形象管理

- 增加可用形象列表与预览。
- 用户选择保存在个人设置中。
- 服务端校验 avatar ID，不允许客户端任意路径访问。

### 7.4 教学内容输出链

后续可把同一教学脚本输出为：

- PPTX
- PDF
- 教师讲稿
- HTML 演示
- 数字人讲解视频

这部分应作为异步生成任务，不要与实时 WebRTC 建连代码耦合。

## 8. 明确禁止事项

- 不要重新安装或重新配置已经验证通过的 Coturn，除非外部连通性重新失败。
- 不要把独立 LiveTalking 页面能工作误报成智学帮集成完成。
- 不要覆盖现有生产 Supabase Edge Function 路径。
- 不要在前端硬编码 TURN、Spark、Tavily、DeepSeek 或 SSH 密钥。
- 不要把密码写进日志、截图、提交记录或 Markdown。
- 不要使用假 session、假 speaking 状态或硬编码“已连接”。
- 不要在 ICE gathering 完成前发送 offer SDP。
- 不要重新引入 `test123`、`127.0.0.1:3478` 等历史测试配置。

## 9. 安全收尾

本项目排查过程中曾在对话或截图中出现过多种凭据。交付前必须轮换：

- AutoDL/SSH 密码
- TURN 用户密码
- Spark HTTP APIPassword
- Spark AppID、APIKey、APISecret
- Tavily API Key
- DeepSeek API Key（如已配置）
- 其他曾进入终端、截图或聊天记录的密钥

轮换后只存入服务端 Secret 管理或本地不提交的 `.env` 文件。

## 10. 下一位 AI 首先检查的文件

```text
src/services/avatarGatewayApi.ts
src/hooks/useAvatarSession.ts
src/hooks/useAvatarSpeech.ts
src/contexts/DigitalHumanContext.tsx
src/components/digital-human/DigitalHumanPanel.tsx
src/components/digital-human/AvatarVideo.tsx
src/components/digital-human/AvatarControls.tsx
src/pages/ChatPage.tsx
src/types/digital-human.ts
vite.config.ts
package.json
```

历史运行手册仅作为补充背景：

```text
/Users/jxy/WorkBuddy/2026-07-18-12-31-09/zhixuebang/digital-human-handbook.md
```

以本交接文档中的真实 API 和验收标准为准。

## 11. 推荐执行顺序

1. 阅读本文件和上述代码，输出当前调用链。
2. 修改 `avatarGatewayApi.ts` 的本地协议适配。
3. 修复 `useAvatarSession.ts` 的 ICE gathering 时序及清理逻辑。
4. 增加 Vite `/digi-api` 代理和本地环境变量。
5. 修改默认 Avatar ID 和错误/降级 UI。
6. 执行 `typecheck`、`test`、`build`。
7. 启动 GPU 与隧道，完成浏览器端端到端验收。
8. 提交证据：Network 请求、ICE 状态、画面、语音、口型、打断、三次重连。
9. P0 验收后才开始流式分句播报队列。
10. 最后再处理正式域名、动态 TURN 凭证和监控。

## 12. 可直接交给下一位 AI 的提示词

```text
你接手的是智学帮数字人模块。请先完整阅读
DIGITAL_HUMAN_REMAINING_WORK_HANDOFF.md，随后检查其中列出的真实代码文件。

目标不是重新搭建 TURN 或 LiveTalking。TURN、AutoDL GPU、MuseTalk、独立
LiveTalking 页面已经验证通过：有画面，文本可说话，并有同步口型。当前问题是
智学帮前端仍使用旧网关协议，并且在 ICE gathering 完成前发送 SDP。

请严格按文档 P0 顺序实施：
1. 适配 /api/ice-config、/offer、/human、/interrupt；
2. 等待 ICE gathering complete 后再发送 pc.localDescription.sdp；
3. 删除客户端主动创建的 DataChannel；
4. 配置 /digi-api Vite 代理；
5. 默认 avatar=teacher1；
6. 保持生产 Supabase Edge Function 路径不变；
7. 禁止在前端和日志中暴露任何秘密。

实施后必须运行 pnpm typecheck、pnpm test、pnpm build，并完成浏览器端端到端
验证：连接、有画面、有声音、有口型、打断、连续三次重连。不要仅凭接口返回 200
宣称完成。每完成一个阶段，汇报已完成、证据、未完成和下一步。
```

