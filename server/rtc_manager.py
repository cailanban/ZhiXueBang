###############################################################################
#  WebRTC 连接管理 + RTC 音频/视频接收
###############################################################################

import json
import os
import asyncio
import random
import copy
from typing import Dict, Optional
import queue

from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceServer, RTCConfiguration
from aiortc.rtcrtpsender import RTCRtpSender

from utils.logger import logger


# def _rand_session_id(n: int = 6) -> int:
#     """生成 N 位随机 session ID"""
#     return random.randint(10 ** (n - 1), 10 ** n - 1)


from server.session_manager import session_manager
from server.session_manager import MaxSessionError

class RTCManager:
    """
    WebRTC 连接管理器。
    
    管理 PeerConnection 生命周期、音视频轨道收发、DataChannel。
    """

    def __init__(self, opt):
        """
        Args:
            opt: 全局配置
        """
        self.opt = opt
        self.pcs: set = set()

    async def handle_offer(self, request):
        """处理 WebRTC offer 信令"""
        params = await request.json()
        offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

        remote_candidate_types = []
        remote_candidate_count = 0
        for line in offer.sdp.splitlines():
            if line.startswith("a=candidate:"):
                remote_candidate_count += 1
                if " typ " in line:
                    candidate_type = line.split(" typ ", 1)[1].split()[0]
                    remote_candidate_types.append(candidate_type)

        logger.info(
            "Remote ICE candidates count=%s types=%s",
            remote_candidate_count,
            sorted(set(remote_candidate_types)),
        )

        # 通过 SessionManager 构建（内部会检查 max_session）
        try:
            sessionid = await session_manager.create_session(params)
        except MaxSessionError as e:
            logger.warning("Rejecting offer: %s", e)
            return web.Response(
                content_type="application/json",
                text=json.dumps({"code": -1, "msg": str(e)}),
            )
        logger.info('offer sessionid=%s', sessionid)
        avatar_session = session_manager.get_session(sessionid)

        # 创建 PeerConnection
        # Build authenticated ICE configuration from environment variables.
        turn_urls = [
            url.strip()
            for url in os.getenv("TURN_URLS", "").split(",")
            if url.strip()
        ]
        turn_username = os.getenv("TURN_USERNAME", "")
        turn_password = os.getenv("TURN_PASSWORD", "")

        ice_servers = []

        if turn_urls:
            if not turn_username or not turn_password:
                raise RuntimeError(
                    "TURN_URLS is set but TURN_USERNAME/TURN_PASSWORD is missing"
                )
            ice_servers.append(
                RTCIceServer(
                    urls=turn_urls,
                    username=turn_username,
                    credential=turn_password,
                )
            )

        if self.opt.stun:
            ice_servers.append(RTCIceServer(urls=self.opt.stun))

        pc = RTCPeerConnection(
            configuration=RTCConfiguration(iceServers=ice_servers)
        )
        self.pcs.add(pc)

        _ice_complete = asyncio.Event()
        @pc.on("icegatheringstatechange")
        async def on_icegatheringstatechange():
            logger.info(
                "ICE gathering state sessionid=%s state=%s",
                sessionid,
                pc.iceGatheringState,
            )
            if pc.iceGatheringState == "complete":
                _ice_complete.set()

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            logger.info(
                "ICE connection state sessionid=%s state=%s",
                sessionid,
                pc.iceConnectionState,
            )

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.info("Connection state is %s", pc.connectionState)
            if pc.connectionState in ("failed", "closed"):
                await pc.close()
                self.pcs.discard(pc)
                session_manager.remove_session(sessionid)

        # 添加发送轨道
        from server.webrtc import HumanPlayer
        player = HumanPlayer(avatar_session)
        pc.addTrack(player.audio)
        pc.addTrack(player.video)

        # 设置编解码器偏好
        capabilities = RTCRtpSender.getCapabilities("video")
        preferences = list(filter(lambda x: x.name == "H264", capabilities.codecs))
        preferences += list(filter(lambda x: x.name == "VP8", capabilities.codecs))
        preferences += list(filter(lambda x: x.name == "rtx", capabilities.codecs))
        transceiver = pc.getTransceivers()[1]
        transceiver.setCodecPreferences(preferences)

        await pc.setRemoteDescription(offer)

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        # 关键修复：等 ICE 候选收集完再返回 answer SDP，否则浏览器拿不到候选
        try:
            await asyncio.wait_for(_ice_complete.wait(), timeout=8.0)
            logger.info("ICE gathering complete (sessionid=%s), returning SDP with candidates", sessionid)
        except asyncio.TimeoutError:
            logger.warning("ICE gathering timeout (sessionid=%s), returning SDP without candidates", sessionid)

        return web.Response(
            content_type="application/json",
            text=json.dumps({
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type,
                "sessionid": sessionid,
            }),
        )

    async def handle_rtcpush(self, push_url, sessionid: str):
        """RTCPush 模式：主动推流"""
        import aiohttp
        await session_manager.create_session({}, sessionid)
        avatar_session = session_manager.get_session(sessionid)

        pc = RTCPeerConnection()
        self.pcs.add(pc)

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.info("Connection state is %s", pc.connectionState)
            if pc.connectionState == "failed":
                await pc.close()
                self.pcs.discard(pc)

        from server.webrtc import HumanPlayer
        player = HumanPlayer(avatar_session)
        pc.addTrack(player.audio)
        pc.addTrack(player.video)

        await pc.setLocalDescription(await pc.createOffer())

        async with aiohttp.ClientSession() as session:
            async with session.post(push_url, data=pc.localDescription.sdp) as response:
                answer_sdp = await response.text()

        await pc.setRemoteDescription(
            RTCSessionDescription(sdp=answer_sdp, type='answer')
        )

    async def shutdown(self):
        """关闭所有 PeerConnection"""
        coros = [pc.close() for pc in self.pcs]
        await asyncio.gather(*coros)
        self.pcs.clear()
