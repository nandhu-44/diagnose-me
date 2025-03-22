import faiss
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from unstructured.chunking.basic import chunk_elements
from unstructured.partition.auto import partition
import pickle
import os
from pathlib import Path

class VectorDatabase:
    def __init__(self, faiss_index_path="vectorstore.pkl"):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.faiss_index_path = faiss_index_path
        self.vector_store = self._initialize_vector_store()
        
    def _initialize_vector_store(self):
        if os.path.exists(self.faiss_index_path):
            print(f"Loading existing vector store from {self.faiss_index_path}")
            with open(self.faiss_index_path, 'rb') as f:
                vector_store = pickle.load(f)
        else:
            print("Creating a new vector store.")
            vector_store = None
        return vector_store
        
    def add_docs(self, documents):
        if self.vector_store:
            print("Merging documents into the existing vector store.")
            new_vector_store = FAISS.from_documents(documents, self.embeddings)
            self.vector_store.merge_from(new_vector_store)
        else:
            print("Adding documents to a new vector store.")
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
        self._save_vector_store()
        
    def _save_vector_store(self):
        print(f"Saving vector store to {self.faiss_index_path}")
        with open(self.faiss_index_path, 'wb') as f:
            pickle.dump(self.vector_store, f)
            
    def perform_similarity_search(self, query, k=2):
        if not self.vector_store:
            print("Vector store is empty. Please add documents first.")
            return []
        print(f"Performing similarity search for query: {query}")
        results = self.vector_store.similarity_search(query, k=k)
        if not results:
            print("No results found.")
        else:
            print(f"Found {len(results)} results.")
        return results

def process_text_files(folder_path, max_files=10):
    """
    Process text files in a folder and return formatted documents
    
    Args:
        folder_path (str): Path to folder containing text files
        max_files (int, optional): Maximum number of files to process. Default is None (all files).
        
    Returns:
        list: List of Document objects
    """
    from langchain_core.documents import Document
    
    all_docs = []
    file_count = 0
    
    for file_path in Path(folder_path).glob("*.txt"):
        # Check if we've reached the maximum number of files
        if max_files is not None and file_count >= max_files:
            print(f"Reached limit of {max_files} files. Stopping.")
            break
            
        try:
            elements = partition(str(file_path))
            chunks = chunk_elements(elements, max_characters=512, overlap=50)
            
            # Convert to LangChain Documents
            for i, chunk in enumerate(chunks):
                doc = Document(
                    page_content=chunk.text,
                    metadata={
                        "source": str(file_path),
                        "filename": file_path.name,
                        "chunk": i
                    }
                )
                all_docs.append(doc)
                
            print(f"Processed {file_path.name}: {len(chunks)} chunks extracted")
            file_count += 1
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            
    print(f"Total files processed: {file_count}")
    print(f"Total documents created: {len(all_docs)}")
    return all_docs

# Example usage
if __name__ == "__main__":
    # Initialize the vector database
    vector_db = VectorDatabase()
    
    # Process text files from a folder
    folder_path = "/home/nazal/Downloads/med_data/dataset"  # Replace with your folder path
    documents = process_text_files(folder_path)
    
    # Add documents to the vector database
    if documents:
        vector_db.add_docs(documents)
        
        # Test with a query
        query = "Your test query here"  # Replace with your query
        results = vector_db.perform_similarity_search(query, k=3)
        
        # Display results
        print("\nQuery Results:")
        for i, doc in enumerate(results):
            print(f"\nResult {i+1}:")
            print(f"Source: {doc.metadata['source']}")
            print(f"Chunk: {doc.metadata['chunk']}")
            print(f"Content: {doc.page_content[:200]}...")  # Show first 200 chars