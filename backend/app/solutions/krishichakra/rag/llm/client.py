from __future__ import annotations

import json
import re
import time
import asyncio

import httpx
from openai import OpenAI

from app.solutions.krishichakra.core.config import settings
from app.solutions.krishichakra.core.logging import get_logger

logger = get_logger(__name__)

ENGINES = {
    "fast": [
        ("meta/llama-3.1-8b-instruct", 20),
        ("nvidia/nemotron-3-nano-30b-a3b", 20),
        ("meta/llama-3.3-70b-instruct", 20),
        ("mistralai/devstral-2-123b-instruct-2512", 50),
    ],
    "ultra": [
        ("nvidia/llama-3.1-nemotron-ultra-253b-v1", 45),
        ("minimaxai/minimax-m2.5", 35),
        ("mistralai/devstral-2-123b-instruct-2512", 50),
        ("nvidia/llama-3.3-nemotron-super-49b-v1.5", 40),
        ("meta/llama-3.3-70b-instruct", 20),
    ],
}

THINKING_MODELS = {"nvidia/llama-3.1-nemotron-ultra-253b-v1"}
PREAMBLE_LEAK_MODELS = {"nvidia/nemotron-3-nano-30b-a3b"}
PREAMBLE_SIGNALS = [
    "We need to respond",
    "The user asks",
    "We must",
    "We should",
    "We can respond",
]

_LAST_MODEL_USED = None
NEMOTRON_SUPER_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5"
HINDI_TRANSLATION_MODEL = "nvidia/nemotron-4-mini-hindi-4b-instruct"
TIER_BUDGET_S = {"fast": 30, "ultra": 120}


def get_last_model_used() -> str | None:
    return _LAST_MODEL_USED


def _clean_raw(raw: str, model_name: str) -> str:
    out = raw
    if model_name in THINKING_MODELS:
        out = re.sub(r"<think>.*?</think>", "", out, flags=re.DOTALL).strip()

    if model_name in PREAMBLE_LEAK_MODELS:
        probe = out[:320]
        if any(sig in probe for sig in PREAMBLE_SIGNALS):
            idx = out.find("{")
            if idx >= 0:
                out = out[idx:]

    return out.strip()


def _extract_content(choice_message: dict) -> str:
    content = choice_message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text_value = item.get("text")
                if isinstance(text_value, str):
                    parts.append(text_value)
            elif isinstance(item, str):
                parts.append(item)
        if parts:
            return "\n".join(parts)

    refusal = choice_message.get("refusal")
    if isinstance(refusal, str) and refusal.strip():
        return refusal
    return ""


def _build_headers() -> dict[str, str]:
    if not settings.nvidia_api_key:
        raise RuntimeError("NVIDIA_API_KEY/API_KEY is required for LLM calls")
    return {"Authorization": f"Bearer {settings.nvidia_api_key}", "Content-Type": "application/json"}


def _extract_stream_delta(chunk_json: dict) -> str:
    choices = chunk_json.get("choices")
    if not choices:
        return ""

    first_choice = choices[0] or {}
    message = first_choice.get("message")
    if isinstance(message, dict):
        msg_text = _extract_content(message)
        if msg_text:
            return msg_text

    delta = first_choice.get("delta") or {}
    content = delta.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                text_value = item.get("text")
                if isinstance(text_value, str):
                    parts.append(text_value)
            elif isinstance(item, str):
                parts.append(item)
        return "\n".join(parts)

    text = first_choice.get("text")
    if isinstance(text, str):
        return text

    return ""


async def _stream_chat_completion(url: str, headers: dict[str, str], payload: dict, timeout_s: int) -> str:
    parts: list[str] = []
    timeout = httpx.Timeout(connect=20.0, read=float(timeout_s), write=20.0, pool=20.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as resp:
            if resp.status_code // 100 != 2:
                text = await resp.aread()
                raise RuntimeError(f"stream status={resp.status_code} body={(text.decode(errors='ignore'))[:220]}")

            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[len("data:") :].strip()
                if not data or data == "[DONE]":
                    continue
                try:
                    obj = json.loads(data)
                except Exception:
                    continue
                piece = _extract_stream_delta(obj)
                if piece:
                    parts.append(piece)

    return "".join(parts).strip()


async def _single_shot_chat_completion(url: str, headers: dict[str, str], payload: dict, timeout_s: int) -> str:
    non_stream_payload = dict(payload)
    non_stream_payload["stream"] = False
    timeout = httpx.Timeout(connect=20.0, read=float(timeout_s), write=20.0, pool=20.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, headers=headers, json=non_stream_payload)

    if resp.status_code // 100 != 2:
        raise RuntimeError(f"non_stream status={resp.status_code} body={resp.text[:220]}")

    data = resp.json()
    choices = data.get("choices") or []
    if not choices:
        return ""

    choice = choices[0] or {}
    if isinstance(choice.get("message"), dict):
        return _extract_content(choice["message"]).strip()

    text = choice.get("text")
    if isinstance(text, str):
        return text.strip()

    return ""


def _openai_streaming_completion(model_name: str, messages: list[dict], timeout_s: int) -> str:
    client = OpenAI(base_url=f"{settings.nvidia_base_url.rstrip('/')}/v1", api_key=settings.nvidia_api_key)

    patched_messages = list(messages)
    if model_name == NEMOTRON_SUPER_MODEL:
        patched_messages = [{"role": "system", "content": "/think"}] + patched_messages
    completion = client.chat.completions.create(
        model=model_name,
        messages=patched_messages,
        temperature=0.6,
        top_p=0.95,
        max_tokens=1800,
        frequency_penalty=0,
        presence_penalty=0,
        stream=True,
        timeout=timeout_s,
    )

    parts: list[str] = []
    for chunk in completion:
        if not getattr(chunk, "choices", None):
            continue
        delta = chunk.choices[0].delta
        content = getattr(delta, "content", None)
        if content:
            parts.append(content)

    return "".join(parts).strip()


async def generate_chat_completion(engine_tier: str, messages: list[dict]) -> str:
    global _LAST_MODEL_USED

    if engine_tier not in ENGINES:
        raise RuntimeError(f"Unknown engine tier: {engine_tier}")

    url = f"{settings.nvidia_base_url.rstrip('/')}/v1/chat/completions"
    headers = _build_headers()
    last_error = None
    chain = [m for m, _ in ENGINES[engine_tier]]
    tier_started = time.perf_counter()
    tier_budget_s = float(TIER_BUDGET_S.get(engine_tier, 45))
    logger.info(f"LLM_CHAIN tier={engine_tier} models={chain}")

    for idx, (model_name, timeout_s) in enumerate(ENGINES[engine_tier], start=1):
        elapsed_s = time.perf_counter() - tier_started
        remaining_s = tier_budget_s - elapsed_s
        if remaining_s <= 1.0:
            last_error = f"tier_timeout budget_s={tier_budget_s} elapsed_s={round(elapsed_s, 2)}"
            logger.warning(
                f"LLM_CHAIN_TIMEOUT tier={engine_tier} budget_s={tier_budget_s} elapsed_s={round(elapsed_s, 2)}"
            )
            break

        attempt_timeout_s = max(2, min(int(remaining_s), timeout_s))
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 900,
            "stream": True,
        }
        if model_name in THINKING_MODELS:
            payload["system_prompt"] = "detailed thinking on"

        try:
            started = time.perf_counter()
            if model_name == NEMOTRON_SUPER_MODEL:
                raw = await asyncio.to_thread(_openai_streaming_completion, model_name, messages, attempt_timeout_s)
            else:
                raw = await _stream_chat_completion(url, headers, payload, attempt_timeout_s)
            latency_ms = round((time.perf_counter() - started) * 1000, 2)

            cleaned = _clean_raw(raw, model_name)
            if not cleaned:
                last_error = f"{model_name} -> empty content"
                logger.warning(
                    f"LLM_TRY_FAIL tier={engine_tier} attempt={idx} model={model_name} status=200 latency_ms={latency_ms} empty_content=True"
                )
                continue

            _LAST_MODEL_USED = model_name
            logger.info("llm model success", model=model_name, latency_ms=latency_ms)
            logger.info(
                f"LLM_SELECTED tier={engine_tier} selected_model={model_name} "
                f"primary_model={chain[0]} fallback_used={idx > 1} attempts={idx} latency_ms={latency_ms}"
            )
            return cleaned
        except Exception as exc:
            err_text = str(exc) or repr(exc)
            last_error = err_text
            logger.warning("llm exception", model=model_name, error=err_text)
            logger.warning(
                f"LLM_TRY_EXCEPTION tier={engine_tier} attempt={idx} model={model_name} "
                f"error_type={type(exc).__name__} error={err_text}"
            )

    raise RuntimeError(f"All models failed for tier {engine_tier}. Last error: {last_error}")


async def generate_single_model_completion(model_name: str, messages: list[dict], timeout_s: int = 25) -> str:
    url = f"{settings.nvidia_base_url.rstrip('/')}/v1/chat/completions"
    headers = _build_headers()
    payload = {"model": model_name, "messages": messages, "temperature": 0.2, "max_tokens": 700, "stream": True}
    if model_name in THINKING_MODELS:
        payload["system_prompt"] = "detailed thinking on"

    if model_name == HINDI_TRANSLATION_MODEL:
        raw = await asyncio.to_thread(_openai_streaming_completion, model_name, messages, timeout_s)
    else:
        raw = await _stream_chat_completion(url, headers, payload, timeout_s)
    cleaned = _clean_raw(raw, model_name)
    if not cleaned:
        retry_raw = await _single_shot_chat_completion(url, headers, payload, timeout_s)
        cleaned = _clean_raw(retry_raw, model_name)
    if not cleaned:
        raise RuntimeError(f"{model_name} returned empty content")
    return cleaned
