from __future__ import annotations

import math
import re
from collections import Counter


class KeywordStore:
    def __init__(self) -> None:
        self.docs: list[dict] = []

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return re.findall(r"[a-zA-Z]{2,}", text.lower())

    def index_documents(self, docs: list[dict]) -> None:
        self.docs = docs
        for d in self.docs:
            tokens = self._tokenize(d.get("text", ""))
            d["_tf"] = Counter(tokens)
            d["_len"] = len(tokens)

    def search(self, text: str, top_k: int, filters: dict | None = None) -> list[dict]:
        q_tokens = self._tokenize(text)
        if not q_tokens:
            return []

        avg_len = sum(max(1, d.get("_len", 1)) for d in self.docs) / max(len(self.docs), 1)
        out: list[dict] = []
        strict_mode = filters is not None

        for d in self.docs:
            meta = d.get("metadata", {})
            if filters:
                soil = (filters.get("soil") or "").lower()
                irrig = (filters.get("irrigation") or "").lower()
                zone = (filters.get("zone") or "").lower()
                if soil and soil not in str(meta.get("soil", "")).lower() and soil not in d.get("text", "").lower():
                    continue
                if irrig and irrig not in str(meta.get("irrigation", "")).lower() and irrig not in d.get("text", "").lower():
                    continue
                if zone and zone not in str(meta.get("zone", "")).lower() and zone not in d.get("text", "").lower():
                    continue

            score = 0.0
            tf: Counter = d.get("_tf", Counter())
            dl = max(1, d.get("_len", 1))
            k1 = 1.2
            b = 0.75
            for t in q_tokens:
                f = tf.get(t, 0)
                if f == 0:
                    continue
                idf = math.log(1 + (len(self.docs) + 1) / (1 + sum(1 for dd in self.docs if t in dd.get("_tf", {}))))
                score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * dl / avg_len)))

            if score > 0:
                out.append({"id": d["id"], "text": d["text"], "score": score, "metadata": meta})

        out.sort(key=lambda x: x["score"], reverse=True)
        if not out and strict_mode:
            return self.search(text=text, top_k=top_k, filters=None)
        return out[:top_k]
