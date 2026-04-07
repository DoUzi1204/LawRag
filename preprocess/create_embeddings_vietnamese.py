#!/usr/bin/env python3
"""
Create dense and sparse embeddings for ingest_data_vietnamese.py.

This script is specialized for BGEM3/Vietnamese embedding flow and writes:
- dense_embeddings.pkl
- sparse_embeddings.pkl

Example:
    python preprocess/create_embeddings_vietnamese.py \
        --docs-file data/processed_chunksize_512_vietnamese/documents.json \
        --output-dir data/processed_chunksize_512_vietnamese
"""

import argparse
import json
import logging
import pickle
import sys
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _extract_text(doc: Dict[str, Any]) -> str:
    """Extract text from a document item and sanitize null bytes."""
    if isinstance(doc, dict) and "page_content" in doc:
        text = doc["page_content"]
    elif isinstance(doc, dict) and "content" in doc:
        text = doc["content"]
    else:
        text = str(doc)

    if text is None:
        return ""

    return str(text).replace("\x00", " ")


def load_documents(docs_file: str) -> List[Dict[str, Any]]:
    """Load documents from JSON file."""
    logger.info("Loading documents from %s", docs_file)
    with open(docs_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "documents" in data:
        docs = data["documents"]
    elif isinstance(data, list):
        docs = data
    else:
        raise ValueError("Invalid documents format. Expected list or {'documents': [...]}.")

    logger.info("Loaded %d documents", len(docs))
    return docs


def create_dense_embeddings(
    documents: List[Dict[str, Any]],
    model_name: str,
    batch_size: int,
    max_length: int,
    device: str,
) -> np.ndarray:
    """Create dense embeddings using SentenceTransformer."""
    logger.info("Loading dense model: %s", model_name)
    model = SentenceTransformer(model_name, device=device)
    model.max_seq_length = max_length

    texts = [_extract_text(doc) for doc in documents]
    dense_rows: List[np.ndarray] = []
    for start in tqdm(range(0, len(texts), batch_size), desc="Dense embedding batches"):
        batch_texts = texts[start : start + batch_size]
        batch_emb = model.encode(
            batch_texts,
            batch_size=len(batch_texts),
            show_progress_bar=False,
            convert_to_numpy=True,
        )
        dense_rows.extend(np.asarray(batch_emb, dtype=np.float32))

    dense_embeddings = np.asarray(dense_rows, dtype=np.float32)
    logger.info("Created dense embeddings with shape: %s", dense_embeddings.shape)
    return dense_embeddings


def create_sparse_embeddings(
    documents: List[Dict[str, Any]],
    model_name: str,
) -> List[Dict[str, float]]:
    """Create sparse token-frequency vectors as {token_id_string: normalized_weight}."""
    logger.info("Loading tokenizer for sparse embeddings: %s", model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    sparse_embeddings: List[Dict[str, float]] = []

    for doc in tqdm(documents, desc="Sparse embedding rows"):
        text = _extract_text(doc)
        token_ids = tokenizer.encode(text, add_special_tokens=False)

        counts: Dict[int, int] = {}
        for token_id in token_ids:
            counts[token_id] = counts.get(token_id, 0) + 1

        total = sum(counts.values())
        if total > 0:
            sparse_embeddings.append(
                {str(token_id): count / total for token_id, count in counts.items()}
            )
        else:
            sparse_embeddings.append({})

    logger.info("Created sparse embeddings: %d", len(sparse_embeddings))
    return sparse_embeddings


def save_embeddings(
    dense_embeddings: np.ndarray,
    sparse_embeddings: List[Dict[str, float]],
    output_dir: str,
) -> None:
    """Persist embeddings to pickle files expected by ingest_data_vietnamese.py."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    dense_file = output_path / "dense_embeddings.pkl"
    sparse_file = output_path / "sparse_embeddings.pkl"

    with open(dense_file, "wb") as f:
        pickle.dump(dense_embeddings, f)
    with open(sparse_file, "wb") as f:
        pickle.dump(sparse_embeddings, f)

    logger.info("Saved dense embeddings to %s", dense_file)
    logger.info("Saved sparse embeddings to %s", sparse_file)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create Vietnamese dense+sparse embeddings for ingest_data_vietnamese.py"
    )
    parser.add_argument(
        "--docs-file",
        type=str,
        default="data/processed_chunksize_512_vietnamese/documents.json",
        help="Path to documents.json",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="data/processed_chunksize_512_vietnamese",
        help="Output directory where dense_embeddings.pkl and sparse_embeddings.pkl are saved",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="AITeamVN/Vietnamese_Embedding_v2",
        help="Embedding model for dense and tokenizer-based sparse vectors",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Batch size for embedding generation",
    )
    parser.add_argument(
        "--max-length",
        type=int,
        default=512,
        help="Maximum sequence length passed to model.encode",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cuda",
        choices=["cpu", "cuda"],
        help="Device for dense embedding model",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable debug logs",
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        documents = load_documents(args.docs_file)
        dense_embeddings = create_dense_embeddings(
            documents=documents,
            model_name=args.model,
            batch_size=args.batch_size,
            max_length=args.max_length,
            device=args.device,
        )
        sparse_embeddings = create_sparse_embeddings(
            documents=documents,
            model_name=args.model,
        )

        if len(dense_embeddings) != len(sparse_embeddings):
            raise ValueError(
                f"Length mismatch: dense={len(dense_embeddings)}, sparse={len(sparse_embeddings)}"
            )
        if len(dense_embeddings) != len(documents):
            raise ValueError(
                f"Length mismatch: embeddings={len(dense_embeddings)}, documents={len(documents)}"
            )

        save_embeddings(dense_embeddings, sparse_embeddings, args.output_dir)
        logger.info("Embeddings created successfully")
        return 0

    except Exception as exc:
        logger.error("Error while creating embeddings: %s", exc, exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
