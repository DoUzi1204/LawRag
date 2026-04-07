import logging
from typing import Optional, Dict, List, Any
import json
import pickle as pkl
from tqdm import tqdm  # Import progress bar
import time
from transformers import AutoTokenizer

# LangChain Imports
from langchain_qdrant import QdrantVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document
from qdrant_client.http.models import (
    Distance, 
    VectorParams, 
    SparseVectorParams, 
    SparseIndexParams, 
    PointStruct,
    SparseVector
)
from collections import defaultdict


from qdrant_client.http.models import Distance, VectorParams
from qdrant_client.models import PointStruct
from qdrant_client import QdrantClient, models
from qdrant_client.http.exceptions import ResponseHandlingException

logger = logging.getLogger(__name__)

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Config(BaseSettings):
    QDRANT_PORT: int = 6333
    DOCS_ROOT: str = "./law_crawler/vbpl_documents"
    CHUNK_SIZE: int = 1024
    COLLECTION_NAME: str = f"laws_alibaba"
    # If None, infer dense vector size from loaded embeddings.
    DENSE_VECTOR_SIZE: Optional[int] = 768
    MODEL_NAME: str = "Alibaba-NLP/gte-multilingual-base"
    DENSE_EMBEDDINGS_FILE: str = f"data/processed_chunksize_{CHUNK_SIZE}_alibaba/dense_embeddings.pkl"
    SPARSE_EMBEDDINGS_FILE: str = f"data/processed_chunksize_{CHUNK_SIZE}_alibaba/sparse_embeddings.pkl"
    DOCS_FILE: str = f"data/processed_chunksize_{CHUNK_SIZE}_alibaba/documents.json"
    BATCH_SIZE: int = 32
    UPSERT_TIMEOUT_SECONDS: int = 180
    MAX_RETRIES: int = 5
    RETRY_BACKOFF_SECONDS: float = 2.0
    RECREATE_COLLECTION: bool = False
    WAIT_FOR_UPSERT: bool = True
    
def _read_embeddings_from_pkl(input_file):
    with open(input_file, 'rb') as f:
        embeddings = pkl.load(f)
    return embeddings
    
def _load_docs_from_json(input_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        json_docs = json.load(f)
        docs = [Document(**doc) for doc in json_docs]
    return docs

def to_qdrant_sparse(token_weights_dict, tokenizer):
    """
    Converts a dictionary of {token_string: weight} into a Qdrant SparseVector
    by mapping strings back to integer IDs and ensuring unique indices.
    """
    # Use a dictionary to aggregate weights by index ID
    aggregated_weights = defaultdict(float)

    for token_str, weight in token_weights_dict.items():
        token_id = tokenizer.convert_tokens_to_ids(token_str)
        
        # Ensure we have a valid integer ID
        if isinstance(token_id, int):
            aggregated_weights[token_id] += weight

    # Qdrant requires indices and values to be separate lists
    # It is also good practice (and sometimes required) to keep indices sorted
    sorted_indices = sorted(aggregated_weights.keys())
    values = [aggregated_weights[idx] for idx in sorted_indices]
    
    return models.SparseVector(
        indices=sorted_indices, 
        values=values
    )
    
config = Config()


def _upsert_with_retry(
    client: QdrantClient,
    collection_name: str,
    points: List[PointStruct],
    max_retries: int,
    retry_backoff_seconds: float,
    timeout_seconds: int,
    wait_for_upsert: bool,
) -> None:
    for attempt in range(1, max_retries + 1):
        try:
            client.upsert(
                collection_name=collection_name,
                points=points,
                wait=wait_for_upsert,
                timeout=timeout_seconds,
            )
            return
        except ResponseHandlingException as exc:
            if attempt == max_retries:
                raise
            sleep_seconds = retry_backoff_seconds * attempt
            logger.warning(
                f"Upsert timeout on attempt {attempt}/{max_retries}. "
                f"Retrying in {sleep_seconds:.1f}s..."
            )
            time.sleep(sleep_seconds)


def _infer_dense_dim(dense_embeddings: List[Any]) -> int:
    if len(dense_embeddings) == 0:
        raise ValueError("Dense embeddings are empty.")

    first = dense_embeddings[0]
    if not hasattr(first, "__len__"):
        raise ValueError("Dense embedding row is not a vector-like sequence.")

    inferred_dim = len(first)
    if inferred_dim <= 0:
        raise ValueError("Dense embedding dimension must be > 0.")

    return inferred_dim


def _extract_collection_dense_dim(client: QdrantClient, collection_name: str) -> Optional[int]:
    info = client.get_collection(collection_name=collection_name)
    vectors_cfg = info.config.params.vectors

    # Named vectors config: {"dense": VectorParams(...)}
    if isinstance(vectors_cfg, dict):
        dense_cfg = vectors_cfg.get("dense")
        if dense_cfg is not None and hasattr(dense_cfg, "size"):
            return int(dense_cfg.size)
        return None

    # Single vector config: VectorParams(...)
    if hasattr(vectors_cfg, "size"):
        return int(vectors_cfg.size)

    return None


def _create_hybrid_collection(client: QdrantClient, collection_name: str, dense_dim: int) -> None:
    client.create_collection(
        collection_name=collection_name,
        vectors_config={
            "dense": VectorParams(
                size=dense_dim,
                distance=Distance.COSINE,
            )
        },
        sparse_vectors_config={
            "sparse": SparseVectorParams(
                index=SparseIndexParams(
                    on_disk=False
                )
            )
        },
    )

def ingest_data() -> None:
    client = QdrantClient(
        host="localhost",
        port=config.QDRANT_PORT,
        timeout=config.UPSERT_TIMEOUT_SECONDS,
    )
    collection_name = config.COLLECTION_NAME

    # Load data first so collection dimension always matches embedding dimension.
    docs = _load_docs_from_json(config.DOCS_FILE)
    dense_embeddings = _read_embeddings_from_pkl(config.DENSE_EMBEDDINGS_FILE)
    sparse_embeddings = _read_embeddings_from_pkl(config.SPARSE_EMBEDDINGS_FILE)

    if not (len(docs) == len(dense_embeddings) == len(sparse_embeddings)):
        raise ValueError("Mismatch in length between docs, dense, and sparse embeddings!")

    inferred_dense_dim = _infer_dense_dim(dense_embeddings)
    dense_dim = config.DENSE_VECTOR_SIZE or inferred_dense_dim

    if dense_dim != inferred_dense_dim:
        raise ValueError(
            f"Configured dense dim ({dense_dim}) does not match embedding dim ({inferred_dense_dim})."
        )
    
    # 1. Handle Collection Recreation
    if client.collection_exists(collection_name=collection_name):
        existing_dense_dim = _extract_collection_dense_dim(client, collection_name)
        dim_mismatch = existing_dense_dim is not None and existing_dense_dim != dense_dim

        if config.RECREATE_COLLECTION:
            client.delete_collection(collection_name=collection_name)
            logger.info(f"Deleted existing collection '{collection_name}'.")
            _create_hybrid_collection(client, collection_name, dense_dim)
        elif dim_mismatch:
            raise ValueError(
                f"Collection '{collection_name}' dense dim is {existing_dense_dim}, "
                f"but embeddings are {dense_dim}. "
                "Set RECREATE_COLLECTION=True or use a different collection name."
            )
        else:
            logger.info(
                f"Collection '{collection_name}' already exists. "
                "Keeping existing data (resume mode)."
            )
    else:
        # 2. Create Collection with Hybrid Support
        _create_hybrid_collection(client, collection_name, dense_dim)

    BATCH_SIZE = config.BATCH_SIZE
    total_docs = len(docs)
    
    tokenizer = AutoTokenizer.from_pretrained(config.MODEL_NAME)

    # 4. Ingest in Batches
    for i in tqdm(range(0, total_docs, BATCH_SIZE), desc="Uploading Hybrid Points"):
        batch_docs = docs[i : i + BATCH_SIZE]
        batch_dense = dense_embeddings[i : i + BATCH_SIZE]
        batch_sparse = sparse_embeddings[i : i + BATCH_SIZE]
        
        points = []
        for j, (doc, dense_vec, sparse_dict) in enumerate(zip(batch_docs, batch_dense, batch_sparse)):
            
            # SentenceTransformers return sparse as {token_id: weight}
            # Qdrant expects SparseVector(indices=[...], values=[...])
            sparse_vector = to_qdrant_sparse(sparse_dict, tokenizer)  # Provide tokenizer if needed

            points.append(
                PointStruct(
                    id=i + j,
                    vector={
                        "dense": dense_vec.tolist() if hasattr(dense_vec, 'tolist') else dense_vec,
                        "sparse": sparse_vector
                    },
                    payload={
                        "page_content": doc.page_content,
                        "metadata": doc.metadata
                    }
                )
            )

        _upsert_with_retry(
            client=client,
            collection_name=collection_name,
            points=points,
            max_retries=config.MAX_RETRIES,
            retry_backoff_seconds=config.RETRY_BACKOFF_SECONDS,
            timeout_seconds=config.UPSERT_TIMEOUT_SECONDS,
            wait_for_upsert=config.WAIT_FOR_UPSERT,
        )

    count = client.count(collection_name=collection_name, exact=True).count
    logger.info(f"Hybrid data ingestion completed. Exact points in '{collection_name}': {count}")

if __name__ == "__main__":
    ingest_data()