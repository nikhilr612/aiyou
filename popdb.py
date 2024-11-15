import lancedb
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter as TextSplitter
import numpy as np
import os
import pyarrow as pa
import json

# Initialize the sentence-transformer model
model_name = "sentence-transformers/all-mpnet-base-v2"
model = SentenceTransformer(model_name)

# Function to generate embeddings using the sentence-transformer model
def generate_embedding(text: str) -> list:
    embedding = model.encode(text)
    return embedding.tolist()  # Convert numpy array to list for JSON compatibility

# Function to split large text into smaller chunks using LangChain's RecursiveTextSplitter
def split_text(text: str, chunk_size: int = 512) -> list:
    # LangChain's RecursiveTextSplitter will split the text into manageable chunks.
    text_splitter = TextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=0  # If you want overlap, set it here
    )
    return text_splitter.split_text(text)

# Function to initialize the LanceDB database and table
def initialize_lancedb():
    # Connect to LanceDB (or create a new one if it doesn't exist)
    db = lancedb.connect("./text-embeddings-db")

    # Create the schema and table if it doesn't exist
    schema = pa.schema([
        pa.field("vector", pa.list_(pa.float32(), list_size=768)),
        pa.field("text", pa.utf8()),
        pa.field("meta", pa.utf8())
    ]);
    
    db.create_table("embeddings", schema=schema, mode="overwrite")
    
    return db

# Function to recursively process text and insert embeddings into the database
def process_and_insert(text: str, source: str, meta: str, db):
    # Split text into chunks using LangChain's splitter
    chunks = split_text(text)
    i = 0
    
    # Generate embeddings and insert into the database
    for chunk in chunks:
        embedding = generate_embedding(chunk)
        
        document = {
            "vector": embedding,
            "text": chunk,  # Use chunk instead of text
            "meta" :  json.dumps({"source": source, "comment": meta})
        }
        
        # Insert into the embeddings table
        db["embeddings"].add([document])

        i += 1

        print("Chunk: ", i, "\n\tdocument: ", chunk);

# Main function to drive the process
def main():
    # Example input text (You can replace this with any document)
    text = open('test-doc.txt').read()

    source = "The Common Law in 19th century Britain"
    meta = "Taken from gutenberg.org"
    
    # Initialize the LanceDB database and table
    db = initialize_lancedb()
    
    # Process and insert the text with embeddings
    process_and_insert(text, source, meta, db)
    print("Text successfully processed and embeddings inserted.")

if __name__ == "__main__":
    main()
