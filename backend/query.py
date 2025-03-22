from langchain.chains import GraphCypherQAChain
from langchain.llms.base import LLM
from typing import Optional, List, Mapping, Any
import google.generativeai as genai
import os
from langchain_community.graphs import Neo4jGraph
from langchain_google_genai import ChatGoogleGenerativeAI

os.environ["NEO4J_URI"] = "neo4j+s://fe863993.databases.neo4j.io"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "ucnO0D7gMmaaIdHS94pQRlLeFCFVTETP-qWVTDNpK8k"
os.environ["GOOGLE_API_KEY"] = "AIzaSyAuRTNzpXkv3b63x5AoR83PmFB2oqb2ZKo"

graph = Neo4jGraph()

# gemini_llm = genai.Gemini(api_key=os.environ["GOOGLE_API_KEY"])

llm = ChatGoogleGenerativeAI(
    model="models/gemini-1.5-flash",
    google_api_key="AIzaSyD2nLQBuG7fKoUtn3DDxM-6hs1sYAh4-EA",
    temperature=0,
)
chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,
    cypher_generation_prompt="""Use MajorTopic for diseases (e.g., Influenza) and symptoms (e.g., Fever), and Topic for medicines (e.g., Paracetamol (recommended)) and treatments (e.g., Rest).""",
    allow_dangerous_requests=True,
)
# Query
response = chain.run("I have a history of heart disease, diabetes, and high blood pressure. Recently, my blood pressure dropped really low (systolic in the 70s-80s), and I wasn’t able to pee for almost 17 hours. When I finally did, my urine was murky brown, and there might have been some discharge too. I was given IV fluids and dopamine to raise my blood pressure. I also have congestive heart failure with a very low ejection fraction (15-20%), Alzheimer’s, and a history of gastrointestinal bleeding. Given all this, should I be concerned? What could be causing my symptoms?")
print(response)