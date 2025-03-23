from unstructured.chunking.basic import chunk_elements
from unstructured.partition.auto import partition
import hashlib
import os
from pathlib import Path

def handle_document(doc_path):
    """
    Process a document and chunk it for vector database storage.
    
    Args:
        doc_path (str): Path to the document file
        
    Returns:
        list: List of chunks with content and metadata
    """
    elements = partition(doc_path)
    chunks = chunk_elements(elements, max_characters=512, overlap=50)
    
    doc_id = hashlib.md5(Path(doc_path).read_bytes()).hexdigest()
    
    formatted_chunks = []
    for i, chunk in enumerate(chunks):
        formatted_chunks.append({
            'id': f"{doc_id}_{i}",  # Unique ID for each chunk
            'page_content': chunk.text,
            'metadata': {
                'filename': os.path.basename(doc_path),
                'filepath': doc_path,
                'filetype': 'txt',
                'page_number': chunk.metadata.page_number if hasattr(chunk.metadata, 'page_number') else None,
                'chunk_index': i,
                'total_chunks': len(chunks),
                'chunk_size': len(chunk.text),
            }
        })
    return formatted_chunks

def process_folder(folder_path, max_files=None):
    all_chunks = []
    
    all_txt_files = list(Path(folder_path).glob('*.txt'))
    
    if max_files is not None:
        total_files = len(all_txt_files)
        all_txt_files = all_txt_files[:max_files]
        print(f"Processing {len(all_txt_files)} out of {total_files} files")
    
    for file_path in all_txt_files:
        try:
            chunks = handle_document(str(file_path))
            all_chunks.extend(chunks)
            print(f"Processed {file_path}: {len(chunks)} chunks extracted")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"Total chunks extracted: {len(all_chunks)}")
    return all_chunks

