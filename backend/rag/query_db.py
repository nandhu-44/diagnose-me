import vector_db
import llm_response

def query(query: str, k: int = 3):
    db = vector_db.VectorDatabase()
    results = db.perform_similarity_search(query, k=k)
    return results

text="condition on discharge: upon discharge, the patient's condition was stable. follow up: the patient is to be followed up in three to four weeks. , m.d. dictated by: medquist36 Procedure: Single internal mammary-coronary artery bypass Extracorporeal circulation auxiliary to "
q = query(text)
print(q)
response = llm_response.get_response(text,q)
# print(response )