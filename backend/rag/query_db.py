import vector_db

def query(query: str, k: int = 3):
    db = vector_db.VectorDatabase()
    results = db.perform_similarity_search(query, k=k)
    return results

response = query("baby")
for res in response:
    print(res.page_content)