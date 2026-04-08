from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger(__name__)

ENGINES = {
    "fast": [
        ("nvidia/llama-3.3-nemotron-super-49b-v1.5", 45),
        ("meta/llama-3.3-70b-instruct", 20),
        ("mistralai/devstral-2-123b-instruct-2512", 50),
        ("nvidia/nemotron-3-nano-30b-a3b", 20),
    ],
    "ultra": [
        ("nvidia/llama-3.1-nemotron-ultra-253b-v1", 45),
        ("minimaxai/minimax-m2.5", 35),
        ("mistralai/devstral-2-123b-instruct-2512", 50),
        ("nvidia/llama-3.3-nemotron-super-49b-v1.5", 40),
        ("meta/llama-3.3-70b-instruct", 20),
    ],
}


def generate_chat_completion(model: str, messages: list[dict], timeout: int) -> str:
    logger.info("llm attempt", model=model, timeout=timeout, message_count=len(messages))
    # TODO: wire real HTTPX calls to NVIDIA / other providers
    return (
        '{'
        '"id": "demo-plan-001", '
        '"years": ['
        '{"year_index": 1, "season": "Kharif", "crop": "Finger Millet", "notes": "Water efficient"},'
        '{"year_index": 2, "season": "Rabi", "crop": "Chickpea", "notes": "Legume nitrogen benefit"},'
        '{"year_index": 3, "season": "Kharif", "crop": "Groundnut", "notes": "Diversification"}'
        '], '
        '"confidence": "medium", '
        '"sources": ["chunk-1", "chunk-2"]'
        '}'
    )
