from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import httpx

router = APIRouter(prefix="/chat", tags=["Chat"])

OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"
DEFAULT_MODEL = "qwen3:1.7b"


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    model: str = DEFAULT_MODEL


class ChatResponse(BaseModel):
    response: str
    model: str


@router.post("", response_model=ChatResponse)
async def chat_with_ollama(request: ChatRequest) -> ChatResponse:
    payload = {
        "model": request.model,
        "messages": [
            {
                "role": "user",
                "content": request.message,
            }
        ],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OLLAMA_CHAT_URL, json=payload)
            response.raise_for_status()

        data = response.json()
        assistant_message = data.get("message", {}).get("content")

        if not assistant_message:
            raise HTTPException(
                status_code=502,
                detail="Ollama returned an empty response.",
            )

        return ChatResponse(
            response=assistant_message,
            model=request.model,
        )

    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail="Ollama is not running.",
        ) from exc

    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail="Ollama took too long to respond.",
        ) from exc

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail="Ollama request failed.",
        ) from exc