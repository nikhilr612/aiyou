import { vecstore } from '../../lib/db';
import { generateTextEmbedding } from '../../lib/model';

// let embedder: FeatureExtractionPipeline;  // To store the pipeline instance
const retriever_limit = 10;

export async function POST(req: any) {
	let body = await req.json();

	let query_text: string = body.text;
	let api_method: string = body.method;
	let meta: string       = body.meta;

	try {
		switch (api_method) {
		
		case "ingest":
			// Add text embeddings into the vector store.
			// Here 'meta' is some information about the source of the text being ingested.
			await insertTextIntoStore(query_text, meta, '');
			return new Response(JSON.stringify({ error: false }));

		case "retrieve":
			// Retrieve documents [array of strings ranked according to similarity score]. Do not return documents that don't belong to the user.
			let relevant_documents = await queryVectorStore(query_text);
			return new Response(JSON.stringify({ error: false, documents: relevant_documents }));

		case "index":
			// Re-create the vector search index on MongoDB.
			// Log user request to re-create vector search index.
			// Here 'meta' is the cause for request to re-create vector search index.
			// Reject is user is 'anon'.
			await createVectorSearchIndex();
			return new Response(JSON.stringify({ error: false }));

		default:
			return new Response(JSON.stringify({ error: true, message: "Invalid API method" }));
		
		}
	} catch (error) {
		let errorMessage: string;

		// Just JS things.
		if (error instanceof Error) errorMessage = error.message;
		else errorMessage = String(error);

		return new Response(JSON.stringify({ error: true, message: errorMessage }));
	}
}

/**
 * Retrieve documents from 
 * */
async function queryVectorStore(query_text: string): Promise<string[]> {
	let embeddings = await generateTextEmbedding(query_text);
  let documents = await vecstore
    .search(embeddings.tolist())
    .limit(retriever_limit).toArray();

  return documents.map((d: any) => {
  	let meta = JSON.parse(d.meta);
  	let source: string = meta.source;
  	return `${d.text}\n\t- ${source}`;
  });
}

async function createVectorSearchIndex() {
  await vecstore.createIndex("vector", {
    replace: true
  });
}

/**
 * Insert `text` into vector store taken from `source` with additional information in `meta`.
 * */
async function insertTextIntoStore(text: string, source: string, meta: string) {
  let embeddings = generateTextEmbedding(text);
  await vecstore.add([{vector: embeddings, source: source}]);
}