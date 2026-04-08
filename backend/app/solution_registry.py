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
    from app.solutions.pashudhansakhi.app import create_solution_app as create_pashudhansakhi_app
    from app.solutions.krishiausadh.app import create_solution_app as create_krishiausadh_app

    runtimes = {
        "krishichakra": SolutionRuntime(
            key="krishichakra",
            app_factory=create_solution_app,
        ),
        "pashudhansakhi": SolutionRuntime(
            key="pashudhansakhi",
            app_factory=create_pashudhansakhi_app,
        ),
        "krishiausadh": SolutionRuntime(
            key="krishiausadh",
            app_factory=create_krishiausadh_app,
        ),
    }
    return runtimes
