#!/usr/bin/env python3
"""
Create dense and sparse embeddings from documents.json

Usage:
    python preprocess/create_embeddings.py \
        --docs-file data/processed_chunksize_1024_alibaba/documents.json \
        --model Alibaba-NLP/gte-multilingual-base \
        --output-dir data/processed_chunksize_1024_alibaba
"""

import argparse
import json
import logging
import pickle
import sys
from pathlib import Path
from typing import List, Dict, Any

import numpy as np
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _extract_text(doc: Dict[str, Any]) -> str:
    """Extract and sanitize text content from one document item."""
    if isinstance(doc, dict) and "page_content" in doc:
        text = doc["page_content"]
    elif isinstance(doc, dict) and "content" in doc:
        text = doc["content"]
    else:
        text = str(doc)

    if text is None:
        return ""

    text = str(text)
    # Avoid tokenizer/model crashes on null bytes.
    return text.replace("\x00", " ")


def load_documents(docs_file: str) -> List[Dict[str, Any]]:
    """Load documents from JSON file."""
    logger.info(f"Loading documents from {docs_file}...")
    with open(docs_file, 'r', encoding='utf-8') as f:
        # Handle both direct list and dict with "documents" key
        data = json.load(f)
        if isinstance(data, dict) and "documents" in data:
            docs = data["documents"]
        elif isinstance(data, list):
            docs = data
        else:
            raise ValueError("Invalid documents format")
    logger.info(f"Loaded {len(docs)} documents")
    return docs


def create_dense_embeddings(
    documents: List[Dict],
    model_name: str,
    trust_remote_code: bool = False,
    batch_size: int = 16,
    device: str | None = None,
    max_seq_length: int = 512,
) -> np.ndarray:
    """Create dense embeddings using SentenceTransformer."""
    logger.info(f"Creating dense embeddings with model: {model_name}")
    
    model = SentenceTransformer(
        model_name,
        trust_remote_code=trust_remote_code,
        device=device,
    )
    model.max_seq_length = max_seq_length
    
    # Create embeddings in batches with robust fallback for problematic rows.
    # Build texts per batch to avoid duplicating all document text in memory.
    dim = model.get_sentence_embedding_dimension()
    embedding_rows: List[np.ndarray] = []
    failed_rows = 0

    for start in tqdm(
        range(0, len(documents), batch_size), desc="Dense embedding batches"
    ):
        batch_docs = documents[start : start + batch_size]
        batch_texts = [_extract_text(doc) for doc in batch_docs]
        try:
            batch_emb = model.encode(
                batch_texts,
                batch_size=len(batch_texts),
                show_progress_bar=False,
                convert_to_numpy=True,
            )
            embedding_rows.extend(batch_emb)
            continue
        except Exception:
            # Fall back to per-item encoding to isolate bad samples.
            pass

        for text in batch_texts:
            try:
                emb = model.encode(
                    [text],
                    batch_size=1,
                    show_progress_bar=False,
                    convert_to_numpy=True,
                )[0]
            except Exception:
                # Retry with aggressively truncated content.
                try:
                    short_text = text[:2000]
                    emb = model.encode(
                        [short_text],
                        batch_size=1,
                        show_progress_bar=False,
                        convert_to_numpy=True,
                    )[0]
                except Exception:
                    failed_rows += 1
                    emb = np.zeros(dim, dtype=np.float32)
            embedding_rows.append(emb)

    embeddings = np.asarray(embedding_rows, dtype=np.float32)
    if failed_rows:
        logger.warning(
            f"Dense fallback used zero vectors for {failed_rows} problematic documents"
        )
    
    logger.info(f"Created {len(embeddings)} dense embeddings, shape: {embeddings.shape}")
    return embeddings


def create_sparse_embeddings(
    documents: List[Dict],
    model_name: str,
    trust_remote_code: bool = False,
    max_seq_length: int | None = 512,
) -> List[Dict[str, float]]:
    """Create sparse embeddings using tokenizer."""
    logger.info(f"Creating sparse embeddings with model: {model_name}")
    
    tokenizer = AutoTokenizer.from_pretrained(
        model_name, trust_remote_code=trust_remote_code
    )
    
    sparse_embeddings: List[Dict[str, float]] = []
    # Cache ID -> token conversion to avoid repeated slow tokenizer calls.
    token_cache: Dict[int, str] = {}
    
    for doc in tqdm(documents, desc="Creating sparse embeddings"):
        # Extract page content
        text = _extract_text(doc)
        
        # Tokenize directly to IDs and optionally truncate very long inputs.
        token_ids = tokenizer.encode(
            text,
            add_special_tokens=False,
            truncation=max_seq_length is not None,
            max_length=max_seq_length,
        )
        
        # Count token frequencies for sparse representation
        token_counts: Dict[int, int] = {}
        for token_id in token_ids:
            token_counts[token_id] = token_counts.get(token_id, 0) + 1
        
        # Normalize frequencies to weights
        total = sum(token_counts.values())
        if total > 0:
            token_dict: Dict[str, float] = {}
            for token_id, count in token_counts.items():
                token_str = token_cache.get(token_id)
                if token_str is None:
                    token_str = tokenizer.convert_ids_to_tokens(token_id)
                    token_cache[token_id] = token_str
                token_dict[token_str] = count / total
            sparse_embeddings.append(token_dict)
        else:
            sparse_embeddings.append({})
    
    logger.info(f"Created {len(sparse_embeddings)} sparse embeddings")
    return sparse_embeddings


def save_embeddings(
    dense_embeddings: np.ndarray,
    sparse_embeddings: List[Dict],
    output_dir: str,
    output_version: str = "v2",
    legacy_output_names: bool = False,
) -> None:
    """Save embeddings to pickle files."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    if legacy_output_names:
        dense_file = output_path / "dense_embeddings.pkl"
        sparse_file = output_path / "sparse_embeddings.pkl"
    else:
        safe_version = output_version.strip().replace(" ", "_")
        if safe_version:
            dense_file = output_path / f"dense_embeddings_{safe_version}.pkl"
            sparse_file = output_path / f"sparse_embeddings_{safe_version}.pkl"
        else:
            dense_file = output_path / "dense_embeddings.pkl"
            sparse_file = output_path / "sparse_embeddings.pkl"

    # Save dense embeddings
    with open(dense_file, 'wb') as f:
        pickle.dump(dense_embeddings, f, protocol=pickle.HIGHEST_PROTOCOL)
    logger.info(f"Saved dense embeddings to {dense_file}")

    # Save sparse embeddings
    with open(sparse_file, 'wb') as f:
        pickle.dump(sparse_embeddings, f, protocol=pickle.HIGHEST_PROTOCOL)
    logger.info(f"Saved sparse embeddings to {sparse_file}")


def _resolve_output_dir(base_output_dir: str, output_dir_suffix: str) -> str:
    """Resolve final output directory, optionally appending a suffix like _v2."""
    suffix = output_dir_suffix.strip().replace(" ", "_")
    if not suffix:
        return base_output_dir

    base = Path(base_output_dir)
    expected_suffix = f"_{suffix}"
    if base.name.endswith(expected_suffix):
        return str(base)

    return str(base.with_name(f"{base.name}{expected_suffix}"))


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Create embeddings from documents")
    
    parser.add_argument(
        "--docs-file",
        type=str,
        required=True,
        help="Path to documents.json file",
    )
    
    parser.add_argument(
        "--model",
        type=str,
        default="Alibaba-NLP/gte-multilingual-base",
        help="HuggingFace model name for embeddings",
    )
    
    parser.add_argument(
        "--output-dir",
        type=str,
        required=True,
        help="Output directory for embedding files",
    )

    parser.add_argument(
        "--output-dir-suffix",
        type=str,
        default="v2",
        help="Append suffix to output directory name (default: v2 -> *_v2). Set empty string to disable.",
    )

    parser.add_argument(
        "--output-version",
        type=str,
        default="v2",
        help="Version suffix for output files, e.g. v2 -> dense_embeddings_v2.pkl",
    )

    parser.add_argument(
        "--legacy-output-names",
        action="store_true",
        help="Write legacy filenames dense_embeddings.pkl and sparse_embeddings.pkl",
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )

    parser.add_argument(
        "--trust-remote-code",
        action="store_true",
        help="Allow loading custom model code from Hugging Face repositories",
    )

    parser.add_argument(
        "--device",
        type=str,
        default=None,
        help="Force embedding device: cpu or cuda (default: auto, but Alibaba defaults to cpu)",
    )

    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Batch size for dense embedding generation (default: 16)",
    )

    parser.add_argument(
        "--max-seq-length",
        type=int,
        default=512,
        help="Maximum tokens per input passed to embedding model (default: 512)",
    )

    parser.add_argument(
        "--sparse-max-seq-length",
        type=int,
        default=512,
        help="Maximum tokens per input for sparse tokenizer pass (default: 512)",
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        trust_remote_code = args.trust_remote_code or (
            "Alibaba-NLP/gte-multilingual-base" in args.model
        )
        if trust_remote_code:
            logger.info("trust_remote_code is enabled for model loading")

        device = args.device
        if device is None and "Alibaba-NLP/gte-multilingual-base" in args.model:
            # This model often triggers CUDA device-side assert with some envs.
            device = "cpu"
        if device:
            logger.info(f"Using device for dense embedding: {device}")

        output_dir = _resolve_output_dir(args.output_dir, args.output_dir_suffix)
        logger.info(f"Resolved output directory: {output_dir}")

        # Load documents
        documents = load_documents(args.docs_file)
        
        # Create embeddings
        dense_embeddings = create_dense_embeddings(
            documents,
            args.model,
            trust_remote_code=trust_remote_code,
            batch_size=args.batch_size,
            device=device,
            max_seq_length=args.max_seq_length,
        )
        sparse_embeddings = create_sparse_embeddings(
            documents,
            args.model,
            trust_remote_code=trust_remote_code,
            max_seq_length=args.sparse_max_seq_length,
        )
        
        # Verify lengths match
        if len(dense_embeddings) != len(sparse_embeddings):
            raise ValueError(f"Length mismatch: dense={len(dense_embeddings)}, sparse={len(sparse_embeddings)}")
        
        if len(dense_embeddings) != len(documents):
            raise ValueError(f"Length mismatch: embeddings={len(dense_embeddings)}, documents={len(documents)}")
        
        # Save embeddings
        save_embeddings(
            dense_embeddings,
            sparse_embeddings,
            output_dir,
            output_version=args.output_version,
            legacy_output_names=args.legacy_output_names,
        )
        
        logger.info("✓ Embeddings created successfully")
        return 0
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
