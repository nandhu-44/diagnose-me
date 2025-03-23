from graphRAG import graph_query as gq
from rag import query_db
import combine_llm

def combine(query):
    rag_response = query_db.query(query)
    graph_response = gq.graph_query("")
    return rag_response, graph_response

# sample_text = "hello fever me bad shiver high temp what to do"
text="I've been dealing with diabetes, hypertension, hyperlipidemia, and obesity. Over the past couple of months, I’ve had chest burning with exertion, but it used to go away with rest. Lately, even walking brings it on, and now I’m also getting nausea, sweating, and shortness of breath. In the last two days, I’ve had symptoms even while resting. I recently had an exercise test that showed significant EKG changes, and today my cardiac catheterization revealed left main artery disease. I was given nitroglycerin, IV Lopressor, and Ativan, which helped, and an intra-aortic balloon pump was placed. Right now, I don’t have pain, but I’m worried about what all this means for my heart health. What should I do next?"

combined_query_response = combine(text)

# summarized_rag_response = combine_llm.summarize_response(combined_query_response[0])
combined_response = combine_llm.get_response(text, combined_query_response[0], combined_query_response[1])

print(combined_response)
# print(summarized_rag_response)
