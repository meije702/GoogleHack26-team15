"""
Marketing AI Agency -- FastAPI backend.

Provides REST endpoints for text-based agent chat, a WebSocket endpoint for
voice interaction via the Gemini Live API (bidirectional audio streaming),
and CRUD endpoints for the mock Instagram service.
"""

import os
import asyncio
import base64
import json
import logging
import traceback

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google.adk.runners import Runner
from google.adk.agents.live_request_queue import LiveRequestQueue
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agents.onboarding_agent import onboarding_agent, business_info_store
from app.agents.strategy_agent import strategy_agent
from app.agents.content_agent import content_agent
from app.agents.instagram_agent import instagram_agent
from app.agents.root_agent import root_agent
from app.services.instagram_mock import instagram_service
from app.services.memory_service import session_service, APP_NAME

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# GCP / Vertex AI configuration
# ---------------------------------------------------------------------------
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "qwiklabs-asl-01-964394115550")
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "us-central1")

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Marketing AI Agency",
    version="0.1.0",
    description="AI-powered marketing agency backend with Google ADK agents",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Agent registry and runner cache
# ---------------------------------------------------------------------------
AGENTS = {
    "onboarding": onboarding_agent,
    "strategy": strategy_agent,
    "content": content_agent,
    "instagram": instagram_agent,
    "root": root_agent,
}

_runners: dict[str, Runner] = {}


def _get_runner(agent_name: str) -> Runner:
    """Return a cached Runner for the given agent, creating one if needed."""
    if agent_name not in _runners:
        if agent_name not in AGENTS:
            raise ValueError(f"Unknown agent: {agent_name}")
        _runners[agent_name] = Runner(
            agent=AGENTS[agent_name],
            app_name=APP_NAME,
            session_service=session_service,
        )
    return _runners[agent_name]


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    user_id: str = "default_user"


class ChatResponse(BaseModel):
    response: str
    session_id: str


class CreatePostRequest(BaseModel):
    image_url: str
    caption: str
    hashtags: list[str] = []


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0",
        "project": os.environ.get("GOOGLE_CLOUD_PROJECT"),
        "location": os.environ.get("GOOGLE_CLOUD_LOCATION"),
        "agents": list(AGENTS.keys()),
    }


# ---------------------------------------------------------------------------
# Text chat endpoint (REST)
# ---------------------------------------------------------------------------

@app.post("/api/chat/{agent_name}", response_model=ChatResponse)
async def chat(agent_name: str, request: ChatRequest):
    """Send a text message to a specific agent and receive a response."""
    if agent_name not in AGENTS:
        raise HTTPException(status_code=404, detail=f"Unknown agent: {agent_name}")

    runner = _get_runner(agent_name)

    session_id = request.session_id
    if not session_id:
        session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=request.user_id,
        )
        session_id = session.id

    user_message = types.Content(
        role="user",
        parts=[types.Part.from_text(text=request.message)],
    )

    response_text = ""
    async for event in runner.run_async(
        user_id=request.user_id,
        session_id=session_id,
        new_message=user_message,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    response_text += part.text

    return ChatResponse(response=response_text, session_id=session_id)


# ---------------------------------------------------------------------------
# WebSocket endpoint -- text chat (streaming)
# ---------------------------------------------------------------------------

@app.websocket("/api/ws/chat/{agent_name}")
async def ws_chat(websocket: WebSocket, agent_name: str):
    """WebSocket endpoint for streaming text chat with any agent."""
    if agent_name not in AGENTS:
        await websocket.close(code=4004, reason=f"Unknown agent: {agent_name}")
        return

    await websocket.accept()
    runner = _get_runner(agent_name)

    try:
        session = await session_service.create_session(
            app_name=APP_NAME,
            user_id="ws_user",
        )

        await websocket.send_json({
            "type": "session_started",
            "session_id": session.id,
            "agent": agent_name,
        })

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "text")
            text = data.get("text", "")

            if msg_type == "text" and text:
                user_message = types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=text)],
                )

                response_text = ""
                async for event in runner.run_async(
                    user_id="ws_user",
                    session_id=session.id,
                    new_message=user_message,
                ):
                    if event.is_final_response() and event.content and event.content.parts:
                        for part in event.content.parts:
                            if part.text:
                                response_text += part.text

                await websocket.send_json({
                    "type": "response",
                    "text": response_text,
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("WebSocket text chat disconnected for agent %s", agent_name)
    except Exception:
        logger.exception("Error in ws_chat for agent %s", agent_name)
        await websocket.close(code=1011, reason="Internal error")


# ---------------------------------------------------------------------------
# WebSocket endpoint -- voice / Gemini Live API (bidirectional streaming)
# ---------------------------------------------------------------------------

_LIVE_MODEL = "gemini-live-2.5-flash-native-audio"


@app.websocket("/api/voice/{agent_name}")
async def voice_stream(websocket: WebSocket, agent_name: str):
    """Bidirectional audio streaming using Google GenAI Live API directly.

    Uses the genai SDK Live API (not ADK run_live which has a bug in v1.27).
    The agent's system instruction is passed to the Live session so the model
    behaves like the configured ADK agent.

    Protocol (JSON over WebSocket):
      Client -> Server:
        {"type": "audio", "data": "<base64 PCM16 mono 16kHz>"}
        {"type": "text",  "text": "Hello"}
        {"type": "end"}
      Server -> Client:
        {"type": "connected", "session_id": "...", "message": "..."}
        {"type": "audio", "data": "<base64 PCM 24kHz>", "mime_type": "..."}
        {"type": "text",  "text": "transcript"}
        {"type": "turn_complete"}
        {"type": "error", "message": "..."}
    """
    if agent_name not in AGENTS:
        await websocket.close(code=4004, reason=f"Unknown agent: {agent_name}")
        return

    await websocket.accept()
    logger.info("Voice WebSocket connected for agent: %s", agent_name)

    agent = AGENTS[agent_name]
    session_id = f"voice_{agent_name}_{id(websocket)}"

    try:
        from google import genai

        client = genai.Client(
            vertexai=True,
            project=os.environ.get("GOOGLE_CLOUD_PROJECT"),
            location=os.environ.get("GOOGLE_CLOUD_LOCATION"),
        )

        live_config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            system_instruction=types.Content(
                parts=[types.Part.from_text(text=agent.instruction)]
            ),
        )

        async with client.aio.live.connect(
            model=_LIVE_MODEL,
            config=live_config,
        ) as live_session:

            await websocket.send_json({
                "type": "connected",
                "session_id": session_id,
                "agent": agent_name,
                "message": "Connected! I'm your onboarding assistant. Click the mic and start speaking.",
            })

            async def _upstream():
                """Client WebSocket -> Gemini Live session."""
                try:
                    while True:
                        raw = await websocket.receive_text()
                        data = json.loads(raw)
                        msg_type = data.get("type", "")

                        if msg_type == "audio":
                            audio_bytes = base64.b64decode(data["data"])
                            await live_session.send_realtime_input(
                                audio=types.Blob(
                                    mime_type="audio/pcm;rate=16000",
                                    data=audio_bytes,
                                )
                            )
                        elif msg_type == "text":
                            text = data.get("text", "")
                            if text:
                                await live_session.send_client_content(
                                    turns=types.Content(
                                        role="user",
                                        parts=[types.Part.from_text(text=text)],
                                    ),
                                    turn_complete=True,
                                )
                        elif msg_type == "end":
                            break
                except WebSocketDisconnect:
                    pass
                except Exception:
                    logger.exception("Error in voice upstream")

            async def _downstream():
                """Gemini Live session -> Client WebSocket."""
                try:
                    while True:
                        async for response in live_session.receive():
                            # Audio chunks
                            if response.data:
                                audio_b64 = base64.b64encode(
                                    response.data
                                ).decode("utf-8")
                                await websocket.send_json({
                                    "type": "audio",
                                    "data": audio_b64,
                                    "mime_type": "audio/pcm;rate=24000",
                                })
                            # Text / transcript
                            if response.text:
                                await websocket.send_json({
                                    "type": "text",
                                    "text": response.text,
                                })
                            # Turn complete
                            if (
                                response.server_content
                                and response.server_content.turn_complete
                            ):
                                await websocket.send_json(
                                    {"type": "turn_complete"}
                                )
                except WebSocketDisconnect:
                    pass
                except Exception:
                    logger.exception("Error in voice downstream")

            upstream_task = asyncio.create_task(_upstream())
            downstream_task = asyncio.create_task(_downstream())

            done, pending = await asyncio.wait(
                [upstream_task, downstream_task],
                return_when=asyncio.FIRST_COMPLETED,
            )
            for task in pending:
                task.cancel()
                try:
                    await task
                except (asyncio.CancelledError, Exception):
                    pass

    except WebSocketDisconnect:
        logger.info("Voice WebSocket disconnected for agent %s", agent_name)
    except Exception:
        logger.exception("Error in voice_stream for agent %s", agent_name)
        try:
            await websocket.send_json({
                "type": "error",
                "message": "Internal server error in voice streaming.",
            })
        except Exception:
            pass
    finally:
        logger.info("Voice WebSocket cleanup complete for agent %s", agent_name)


# ---------------------------------------------------------------------------
# Instagram REST endpoints
# ---------------------------------------------------------------------------

@app.get("/api/instagram/profile")
async def get_instagram_profile():
    """Get the Instagram profile summary."""
    return instagram_service.get_profile_summary()


@app.get("/api/instagram/posts")
async def get_instagram_posts():
    """Get all Instagram posts."""
    return instagram_service.get_posts()


@app.get("/api/instagram/posts/{post_id}")
async def get_instagram_post(post_id: str):
    """Get a single Instagram post by ID."""
    post = instagram_service.get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail=f"Post '{post_id}' not found")
    return post


@app.post("/api/instagram/posts")
async def create_instagram_post(request: CreatePostRequest):
    """Create a new Instagram post."""
    post = instagram_service.create_post(
        image_url=request.image_url,
        caption=request.caption,
        hashtags=request.hashtags,
    )
    return post


@app.get("/api/instagram/metrics")
async def get_instagram_metrics():
    """Get Instagram engagement metrics."""
    return instagram_service.get_engagement_metrics()


# ---------------------------------------------------------------------------
# Business info endpoints
# ---------------------------------------------------------------------------

@app.get("/api/businesses")
async def list_businesses():
    """List all onboarded businesses."""
    if not business_info_store:
        return {"businesses": [], "count": 0}
    return {
        "businesses": [
            {"key": key, **info}
            for key, info in business_info_store.items()
        ],
        "count": len(business_info_store),
    }


@app.get("/api/businesses/{business_key}")
async def get_business(business_key: str):
    """Get a specific business's onboarding data."""
    info = business_info_store.get(business_key)
    if not info:
        raise HTTPException(status_code=404, detail=f"Business '{business_key}' not found")
    return {"key": business_key, **info}


# ---------------------------------------------------------------------------
# Agent info endpoint
# ---------------------------------------------------------------------------

@app.get("/api/agents")
async def list_agents():
    """List all available agents and their descriptions."""
    return {
        "agents": [
            {
                "name": name,
                "description": agent.description,
                "model": agent.model,
            }
            for name, agent in AGENTS.items()
        ]
    }
