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
    model="gemini-1.5-pro",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    # other params...
)
chain = GraphCypherQAChain.from_llm(llm=llm, graph=graph, verbose=True,allow_dangerous_requests=True )

# Query
response = chain.run("If a patient has symptoms of fever, cough, and shortness of breath, what conditions might they have and what are the recommended treatments?")
print(response)