from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class RetrievalError(Exception):
    pass


class LLMError(Exception):
    pass


class SafetyError(Exception):
    pass


class PlanConstructionError(Exception):
    pass


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RetrievalError)
    async def handle_retrieval_error(_: Request, exc: RetrievalError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"error": "retrieval_error", "detail": str(exc)})

    @app.exception_handler(LLMError)
    async def handle_llm_error(_: Request, exc: LLMError) -> JSONResponse:
        return JSONResponse(status_code=500, content={"error": "llm_error", "detail": str(exc)})

    @app.exception_handler(SafetyError)
    async def handle_safety_error(_: Request, exc: SafetyError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"error": "safety_error", "detail": str(exc)})

    @app.exception_handler(PlanConstructionError)
    async def handle_plan_error(_: Request, exc: PlanConstructionError) -> JSONResponse:
        return JSONResponse(status_code=500, content={"error": "plan_construction_error", "detail": str(exc)})
