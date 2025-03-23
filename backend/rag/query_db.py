import pickle
from .llm_response import get_response

def load_vector_db(pickle_path):
    with open(pickle_path, 'rb') as f:
        db = pickle.load(f)
    return db

def query(query_text, k=5):
    pickle_path = "rag/vectorstore.pkl"
    vector_db = load_vector_db(pickle_path)
    results = vector_db.similarity_search(query_text, k=k)
    return results


# text = "I have heart disease, diabetes, and high blood pressure. My blood pressure dropped really low, I couldn't pee for a long time, and when I did, it was brown. They gave me fluids and some meds. Should I be worried? What could be wrong"
# print(query(text))

# response = get_response(text, q)
# print(response)