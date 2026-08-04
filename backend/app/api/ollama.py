from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/ollama", tags=["Ollama"])

OLLAMA_BASE_URL = "http://localhost:11434"


@router.get("/status")
async def ollama_status() -> dict[str, object]:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            response.raise_for_status()

        data = response.json()
        models = [model["name"] for model in data.get("models", [])]

        return {
            "status": "online",
            "models": models,
        }
    except httpx.HTTPError:
        return {
            "status": "offline",
            "models": [],
        }