import os
import time
from pathlib import Path

from openai import OpenAI


BASE_URL = "https://integrate.api.nvidia.com/v1"
MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2"
DEFAULT_INPUT = "What is the civil caseload in South Dakota courts?"
DEFAULT_MODALITY = ["text"]
DEFAULT_INPUT_TYPE = "query"
DEFAULT_TRUNCATE = "NONE"


def _read_env_file_value(key: str) -> str:
    env_file = Path(".env")
    if not env_file.exists():
        return ""

    try:
        lines = env_file.read_text(encoding="utf-8-sig", errors="ignore").splitlines()
    except Exception:
        return ""

    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        left, right = line.split("=", 1)
        if left.strip() == key:
            return right.strip().strip('"').strip("'")

    return ""


def _load_api_key() -> str:
    return os.getenv("NVIDIA_API_KEY", "").strip() or _read_env_file_value("NVIDIA_API_KEY")


def _load_input_text() -> str:
    from_env = os.getenv("EMBED_INPUT", "").strip() or _read_env_file_value("EMBED_INPUT")
    return from_env or DEFAULT_INPUT


def _save_run_log(
    model: str,
    input_text: str,
    modality: list[str],
    input_type: str,
    truncate_mode: str,
    first_response_seconds: float,
    total_seconds: float,
    embedding: list[float],
) -> Path:
    logs_dir = Path("logs")
    logs_dir.mkdir(parents=True, exist_ok=True)

    ts = time.strftime("%Y%m%d_%H%M%S")
    model_slug = model.replace("/", "_").replace(":", "_")
    log_path = logs_dir / f"{model_slug}_{ts}.txt"

    content = (
        f"Model: {model}\n"
        f"Modality: {modality}\n"
        f"Input type: {input_type}\n"
        f"Truncate: {truncate_mode}\n"
        f"Input text: {input_text}\n"
        f"Time to first response: {first_response_seconds:.3f} sec\n"
        f"Total generation time: {total_seconds:.3f} sec ({(total_seconds / 60):.3f} min)\n"
        f"Embedding length: {len(embedding)}\n"
        "\n"
        "Embedding:\n"
        f"{embedding}\n"
    )
    log_path.write_text(content, encoding="utf-8")
    return log_path


def main() -> None:
    api_key = _load_api_key()
    if not api_key:
        raise RuntimeError("NVIDIA_API_KEY not found in environment or .env")

    input_text = _load_input_text()

    client = OpenAI(base_url=BASE_URL, api_key=api_key)

    print(f"Model: {MODEL}")
    print(f"Input: {input_text}")

    start_time = time.perf_counter()
    response = client.embeddings.create(
        input=[input_text],
        model=MODEL,
        encoding_format="float",
        extra_body={
            "modality": DEFAULT_MODALITY,
            "input_type": DEFAULT_INPUT_TYPE,
            "truncate": DEFAULT_TRUNCATE,
        },
    )
    first_response_time = time.perf_counter()

    embedding = response.data[0].embedding
    print(embedding)

    total_seconds = time.perf_counter() - start_time
    first_response_seconds = first_response_time - start_time
    total_minutes = total_seconds / 60

    print(f"Time to first response: {first_response_seconds:.3f} sec")
    print(f"Total generation time: {total_seconds:.3f} sec ({total_minutes:.3f} min)")
    print(f"Embedding length: {len(embedding)}")

    log_path = _save_run_log(
        MODEL,
        input_text,
        DEFAULT_MODALITY,
        DEFAULT_INPUT_TYPE,
        DEFAULT_TRUNCATE,
        first_response_seconds,
        total_seconds,
        embedding,
    )
    print(f"Saved run log: {log_path}")


if __name__ == "__main__":
    main()
