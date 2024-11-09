import * as lancedb from '@lancedb/lancedb';

/// "Default" model for creating text embeddings. Should be the same as the one used to make the RAG database.
/// Improvement: Bring in another model (cross-encoder) for computing scores for reranking.
const sentence_transformer_model = "sentence-transformers/all-mpnet-base-v2";
const embeddings_size = 768;

const DB_NAME    = "./text-embeddings-db";
const TABLE_NAME = "embeddings";

export const vector_db = await lancedb.connect(DB_NAME);
export const vecstore = await vector_db.openTable(TABLE_NAME);