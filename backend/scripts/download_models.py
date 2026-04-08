import os
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from sentence_transformers import SentenceTransformer

def download_models():
    print("Downloading translation model (NLLB-200-distilled-600M)...")
    translate_model = "facebook/nllb-200-distilled-600M"
    AutoTokenizer.from_pretrained(translate_model)
    AutoModelForSeq2SeqLM.from_pretrained(translate_model)
    print("Translation model downloaded and cached safely.")

    print("Downloading embedding fallback model (all-MiniLM-L6-v2)...")
    embed_model = "all-MiniLM-L6-v2"
    SentenceTransformer(embed_model)
    print("Embedding model downloaded and cached safely.")

    print("All necessary models successfully cached locally!")

if __name__ == "__main__":
    download_models()
