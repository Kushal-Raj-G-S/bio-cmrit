from app.domain.models import FieldMetadata
from app.rag.retrieval.query_builder import build_retrieval_query


def test_build_retrieval_query_contains_natural_query() -> None:
    field = FieldMetadata(
        location="Harohalli, Karnataka",
        zone="Southern Karnataka",
        soil_type="Red loam",
        irrigation="Sprinkler",
        season="Rabi",
        current_crop="Barley",
    )
    query = build_retrieval_query(field)
    assert "natural_query" in query
