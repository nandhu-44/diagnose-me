from graphRAG import graph_query as gq
from rag import query_db
import combine_llm

def combine(query):
    rag_response = query_db.query(query)
    graph_response = gq.graph_query(query)
    return rag_response, graph_response

sample_text = "hello fever me bad shiver high temp what to do"
combined_query_response = combine(sample_text)

# summarized_rag_response = combine_llm.summarize_response(combined_query_response[0])
combined_response = combine_llm.get_response(sample_text, combined_query_response[0], combined_query_response[1])

print(combined_response)
# print(summarized_rag_response)
