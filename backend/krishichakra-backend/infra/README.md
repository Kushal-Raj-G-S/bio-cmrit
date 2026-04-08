# KrishiChakra Backend

This service provides a production-minded RAG skeleton for 3-year crop rotation planning for Indian farms.

## Run locally

1. Create and activate a Python 3.11 virtual environment.
2. Install dependencies:

```bash
pip install -r infra/requirements.txt
```

3. Start API server:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 9000
```
