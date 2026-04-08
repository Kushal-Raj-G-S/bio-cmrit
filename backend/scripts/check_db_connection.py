from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError


def _mask_url(url: str) -> str:
    parsed = urlparse(url)
    netloc = parsed.netloc
    if "@" not in netloc:
        return url

    creds, host = netloc.rsplit("@", 1)
    if ":" in creds:
        user, _ = creds.split(":", 1)
        masked_creds = f"{user}:***"
    else:
        masked_creds = "***"

    return f"{parsed.scheme}://{masked_creds}@{host}{parsed.path or ''}"


def main() -> int:
    backend_root = Path(__file__).resolve().parents[1]
    load_dotenv(backend_root / ".env")

    url = (os.getenv("DATABASE_URL") or "").strip()
    if not url:
        print("ERROR: DATABASE_URL is missing")
        return 1

    print(f"Checking DB connection: {_mask_url(url)}")

    try:
        engine = create_engine(url, pool_pre_ping=True)
        with engine.connect() as conn:
            row = conn.execute(text("SELECT current_database(), current_user, version()"))
            db_name, db_user, db_version = row.fetchone()
            ping = conn.execute(text("SELECT 1")).scalar_one()

        if ping != 1:
            print("ERROR: Ping query failed")
            return 1

        print("SUCCESS: Database connection established")
        print(f"database={db_name}")
        print(f"user={db_user}")
        print(f"version={str(db_version).split(',')[0]}")
        return 0
    except SQLAlchemyError as exc:
        print(f"ERROR: SQLAlchemy connection failed: {exc}")
        return 2
    except Exception as exc:
        print(f"ERROR: Unexpected failure: {exc}")
        return 3


if __name__ == "__main__":
    sys.exit(main())
