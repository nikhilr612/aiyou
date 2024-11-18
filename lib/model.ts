import {
  FeatureExtractionPipeline,
  pipeline,
  Tensor,
} from "@huggingface/transformers";

let embedder: FeatureExtractionPipeline | null;

const sentence_transformer_model = "sentence-transformers/all-mpnet-base-v2";
// const embeddings_size = 768;

try {
  embedder = await pipeline("feature-extraction", sentence_transformer_model);
} catch (error) {
  console.error("Error initializing the pipeline:", error);
  throw new Error("Failed to initialize the embedding pipeline");
}

export async function generateTextEmbedding(text: string): Promise<Tensor> {
  try {
    let embeddings: Tensor;
    if (embedder != null) {
      embeddings = await embedder(text);
      embeddings = embeddings.squeeze();
      const reduced_embeddings = embeddings.mean(0);

      console.debug("Reduced:", reduced_embeddings);
      return reduced_embeddings;
    } else {
      throw new Error("Pipeline not initialized");
    }
  } catch (error) {
    console.error("Query:", text, " Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}

export default embedder;
