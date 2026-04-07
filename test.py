from sentence_transformers import SentenceTransformer

model = SentenceTransformer("Alibaba-NLP/gte-multilingual-base")

print(model.get_sentence_embedding_dimension())