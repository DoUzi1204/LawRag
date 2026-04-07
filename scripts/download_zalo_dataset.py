"""
Script tải dataset Zalo AI Legal Text Retrieval về thư mục data/zalo_ai_retrieval/

Dataset source: GreenNode/zalo-ai-legal-text-retrieval-vn (HuggingFace)
Format chuẩn BEIR/MTEB:
  - corpus.jsonl  : {"_id", "title", "text"}
  - queries.jsonl : {"_id", "text"}
  - qrels/test.jsonl : {"query-id", "corpus-id", "score"}

Usage:
    python scripts/download_zalo_dataset.py
    python scripts/download_zalo_dataset.py --output-dir data/zalo_ai_retrieval
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

DATASET_NAME = "GreenNode/zalo-ai-legal-text-retrieval-vn"
DEFAULT_OUTPUT_DIR = "data/zalo_ai_retrieval"


def check_dependencies():
    """Kiểm tra các thư viện cần thiết."""
    missing = []
    try:
        import datasets  # noqa: F401
    except ImportError:
        missing.append("datasets")
    try:
        import huggingface_hub  # noqa: F401
    except ImportError:
        missing.append("huggingface_hub")

    if missing:
        logger.error(f"Thiếu thư viện: {', '.join(missing)}")
        logger.error(f"Cài đặt bằng lệnh: pip install {' '.join(missing)}")
        sys.exit(1)


def download_dataset(output_dir: str):
    """Tải và chuyển đổi dataset về định dạng JSONL chuẩn."""
    from datasets import load_dataset

    output_path = Path(output_dir)
    qrels_path = output_path / "qrels"
    output_path.mkdir(parents=True, exist_ok=True)
    qrels_path.mkdir(parents=True, exist_ok=True)

    logger.info(f"Tải dataset: {DATASET_NAME}")
    logger.info(f"Output dir: {output_path.resolve()}")

    # ── 1. Corpus ────────────────────────────────────────────────────────────
    corpus_file = output_path / "corpus.jsonl"
    if corpus_file.exists() and corpus_file.stat().st_size > 0:
        logger.info(f"corpus.jsonl đã tồn tại, bỏ qua ({corpus_file})")
    else:
        logger.info("Đang tải corpus...")
        ds = load_dataset(DATASET_NAME, "corpus", split="test")
        logger.info(f"  → {len(ds):,} documents")

        with open(corpus_file, "w", encoding="utf-8") as f:
            for row in ds:
                record = {
                    "_id": str(row["id"]),        # field thực tế là 'id'
                    "title": row.get("title", "") or "",
                    "text": row.get("text", "") or "",
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        logger.info(f"  ✓ Đã lưu corpus.jsonl ({corpus_file.stat().st_size / 1e6:.1f} MB)")

    # ── 2. Queries ───────────────────────────────────────────────────────────
    queries_file = output_path / "queries.jsonl"
    if queries_file.exists() and queries_file.stat().st_size > 0:
        logger.info(f"queries.jsonl đã tồn tại, bỏ qua ({queries_file})")
    else:
        logger.info("Đang tải queries...")
        ds = load_dataset(DATASET_NAME, "queries", split="test")  # split='test'
        logger.info(f"  → {len(ds):,} queries")

        with open(queries_file, "w", encoding="utf-8") as f:
            for row in ds:
                record = {
                    "_id": str(row["id"]),        # field thực tế là 'id'
                    "text": row.get("text", "") or "",
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        logger.info(f"  ✓ Đã lưu queries.jsonl ({queries_file.stat().st_size / 1e3:.1f} KB)")

    # ── 3. Qrels (test) ──────────────────────────────────────────────────────
    qrels_file = qrels_path / "test.jsonl"
    if qrels_file.exists() and qrels_file.stat().st_size > 0:
        logger.info(f"qrels/test.jsonl đã tồn tại, bỏ qua ({qrels_file})")
    else:
        logger.info("Đang tải qrels...")
        ds = load_dataset(DATASET_NAME, "qrels", split="test")
        logger.info(f"  → {len(ds):,} qrel pairs")

        with open(qrels_file, "w", encoding="utf-8") as f:
            for row in ds:
                record = {
                    "query-id": str(row["query-id"]),
                    "corpus-id": str(row["corpus-id"]),
                    "score": int(row.get("score", 1)),
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        logger.info(f"  ✓ Đã lưu qrels/test.jsonl ({qrels_file.stat().st_size / 1e3:.1f} KB)")

    # ── 4. Kiểm tra kết quả ──────────────────────────────────────────────────
    logger.info("\n" + "=" * 50)
    logger.info("KIỂM TRA DỮ LIỆU ĐÃ TẢI")
    logger.info("=" * 50)

    def count_lines(filepath: Path) -> int:
        with open(filepath, "r", encoding="utf-8") as f:
            return sum(1 for line in f if line.strip())

    files = {
        "corpus.jsonl": corpus_file,
        "queries.jsonl": queries_file,
        "qrels/test.jsonl": qrels_file,
    }

    all_ok = True
    for name, fpath in files.items():
        if fpath.exists():
            n = count_lines(fpath)
            size_mb = fpath.stat().st_size / 1e6
            logger.info(f"  ✓ {name:<25} {n:>7,} dòng  ({size_mb:.1f} MB)")
        else:
            logger.error(f"  ✗ {name} KHÔNG TỒN TẠI!")
            all_ok = False

    if all_ok:
        logger.info("\n✅ Tải dữ liệu hoàn tất! Sẵn sàng để benchmark.")
        logger.info(f"   Thư mục: {output_path.resolve()}")
    else:
        logger.error("\n❌ Có file bị thiếu, vui lòng kiểm tra lại.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Tải dataset Zalo AI Legal Text Retrieval"
    )
    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR,
        help=f"Thư mục lưu dữ liệu (mặc định: {DEFAULT_OUTPUT_DIR})",
    )
    args = parser.parse_args()

    check_dependencies()

    # Chạy từ project root
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    logger.info(f"Working directory: {project_root}")

    download_dataset(args.output_dir)


if __name__ == "__main__":
    main()
