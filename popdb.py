import lancedb
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import CharacterTextSplitter
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

# Function to split large text into smaller chunks using LangChain's CharacterTextSplitter
def split_text(text: str, chunk_size: int = 2000) -> list:
    # LangChain's CharacterTextSplitter will split the text into manageable chunks.
    text_splitter = CharacterTextSplitter(
        separator="\n",  # You can choose a separator based on your needs
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
    
    # Generate embeddings and insert into the database
    for chunk in chunks:
        embedding = generate_embedding(chunk)
        
        document = {
            "vector": embedding,
            "text": text,
            "meta" :  json.dumps({"source": source, "comment": meta})
        }
        
        # Insert into the embeddings table
        db["embeddings"].add([document])

# Main function to drive the process
def main():
    # Example input text (You can replace this with any document)
    text = open('test-doc.txt').read();

    source = "Immanuel Kant, Critique of Pure Reason"
    meta = "Taken from gutenberg"
    
    # Initialize the LanceDB database and table
    db = initialize_lancedb()
    
    # Process and insert the text with embeddings
    process_and_insert(text, source, meta, db)
    print("Text successfully processed and embeddings inserted.")

if __name__ == "__main__":
    main()
