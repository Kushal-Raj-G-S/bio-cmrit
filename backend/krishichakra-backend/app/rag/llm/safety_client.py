from __future__ import annotations


def run_safety_check(text: str) -> dict:
    _ = text
    # TODO: wire real safety model
    return {"safe": True, "reason": "demo"}
