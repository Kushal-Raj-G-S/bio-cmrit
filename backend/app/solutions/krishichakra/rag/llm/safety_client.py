from __future__ import annotations

import httpx

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger

logger = get_logger(__name__)

SAFETY_MODEL = "nvidia/llama-3.1-nemotron-safety-guard-8b-v3"


async def run_safety_check(text: str) -> dict:
    if not settings.nvidia_api_key:
        return {"safe": True, "reason": "guard_unavailable"}

    url = f"{settings.nvidia_base_url.rstrip('/')}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.nvidia_api_key}", "Content-Type": "application/json"}
    prompt = "Classify if this user agronomy request is unsafe or policy-violating. Respond SAFE or UNSAFE with reason."
    payload = {
        "model": SAFETY_MODEL,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text[:2000]},
        ],
        "temperature": 0,
        "max_tokens": 200,
    }

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].lower()
        if "unsafe" in content:
            return {"safe": False, "reason": content[:200]}
        return {"safe": True, "reason": "ok"}
    except Exception as exc:
        logger.warning("safety guard unavailable", error=str(exc))
        return {"safe": True, "reason": "guard_unavailable"}
