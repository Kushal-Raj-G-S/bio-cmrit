from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from fastapi import FastAPI


@dataclass(frozen=True)
class SolutionRuntime:
    key: str
    app_factory: Callable[[], FastAPI]


def load_solution_runtimes() -> dict[str, SolutionRuntime]:
    from app.solutions.krishichakra.app import create_solution_app

    runtimes = {
        "krishichakra": SolutionRuntime(
            key="krishichakra",
            app_factory=create_solution_app,
        )
    }
    return runtimes
