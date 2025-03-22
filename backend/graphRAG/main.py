import os
import pandas as pd
from langchain_community.graphs import Neo4jGraph
from langchain.chains import GraphCypherQAChain
from langchain.llms.base import LLM
from typing import Optional, List, Mapping, Any
import google.generativeai as genai
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Custom Gemini LLM
class GeminiLLM(LLM):
    model_name: str = "gemini-1.5-pro"
    temperature: float = 0.0

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-pro", temperature: float = 0.0):
        super().__init__()
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        self.temperature = temperature

    def _call(self, prompt: str, stop: Optional[List[str]] = None, **kwargs) -> str:
        response = self.model.generate_content(
            prompt,
            generation_config={"temperature": self.temperature}
        )
        return response.text

    @property
    def _identifying_params(self) -> Mapping[str, Any]:
        return {"model_name": self.model_name, "temperature": self.temperature}

    @property
    def _llm_type(self) -> str:
        return "gemini"

# Environment setup from .env file
os.environ.setdefault("NEO4J_URI", "neo4j+s://fe863993.databases.neo4j.io")
os.environ.setdefault("NEO4J_USERNAME", "neo4j")
os.environ.setdefault("NEO4J_PASSWORD", "ucnO0D7gMmaaIdHS94pQRlLeFCFVTETP-qWVTDNpK8k")
os.environ.setdefault("GOOGLE_API_KEY", "AIzaSyAuRTNzpXkv3b63x5AoR83PmFB2oqb2ZKo")

# Connect to Neo4j
graph = Neo4jGraph()

# Create indexes and constraints for better performance
print("Setting up database schema and constraints...")
graph.query("CREATE CONSTRAINT IF NOT EXISTS FOR (c:Condition) REQUIRE c.name IS UNIQUE")
graph.query("CREATE CONSTRAINT IF NOT EXISTS FOR (s:Symptom) REQUIRE s.name IS UNIQUE")
graph.query("CREATE CONSTRAINT IF NOT EXISTS FOR (t:Treatment) REQUIRE t.name IS UNIQUE")
graph.query("CREATE INDEX IF NOT EXISTS FOR (c:Condition) ON (c.name)")
graph.query("CREATE INDEX IF NOT EXISTS FOR (s:Symptom) ON (s.name)")

# Load and preprocess CSV
print("Loading data...")
df = pd.read_csv("/home/nazal/Downloads/pubmed.csv").fillna("")

# Process meshMajor and meshroot as symptom-condition relationships
df["meshMajor"] = df["meshMajor"].apply(lambda x: x.split("|") if isinstance(x, str) and x else [])
df["meshroot"] = df["meshroot"].apply(lambda x: x.split("|") if isinstance(x, str) and x else [])

# Process only 5000 rows
print(f"Processing 5000 rows out of {len(df)} total rows...")
sample_df = df.head(5000)

# Batch size for Neo4j operations
BATCH_SIZE = 100
total_batches = (len(sample_df) + BATCH_SIZE - 1) // BATCH_SIZE

# Insert data in batches
start_time = time.time()
for batch_num in range(total_batches):
    start_idx = batch_num * BATCH_SIZE
    end_idx = min((batch_num + 1) * BATCH_SIZE, len(sample_df))
    
    print(f"Processing batch {batch_num+1}/{total_batches} (rows {start_idx}-{end_idx})...")
    
    batch_df = sample_df.iloc[start_idx:end_idx]
    
    # Create Condition nodes from meshMajor
    for idx, row in batch_df.iterrows():
        for major in row["meshMajor"]:
            if major:
                graph.query("""
                MERGE (c:Condition {name: $name})
                SET c.description = $description
                """, {
                    "name": major,
                    "description": row["abstractText"] if isinstance(row["abstractText"], str) else ""
                })
        
        # Create Symptom nodes from meshroot
        for root in row["meshroot"]:
            if root:
                graph.query("""
                MERGE (s:Symptom {name: $name})
                """, {"name": root})
        
        # Create relationships between Symptoms and Conditions
        for symptom in row["meshroot"]:
            if not symptom:
                continue
                
            for condition in row["meshMajor"]:
                if not condition:
                    continue
                    
                # Create INDICATES relationship with relevance score
                graph.query("""
                MATCH (s:Symptom {name: $symptom})
                MATCH (c:Condition {name: $condition})
                MERGE (s)-[r:INDICATES]->(c)
                ON CREATE SET r.relevance = 1
                ON MATCH SET r.relevance = r.relevance + 1
                """, {"symptom": symptom, "condition": condition})

# Add some treatment relationships based on conditions
# This would ideally come from a medical knowledge base
print("Adding treatment information...")
treatments = [
    {"condition": "Hypertension", "treatments": ["ACE inhibitors", "Diuretics", "Beta blockers"]},
    {"condition": "Diabetes", "treatments": ["Insulin", "Metformin", "Dietary changes"]},
    {"condition": "Asthma", "treatments": ["Inhalers", "Corticosteroids", "Bronchodilators"]},
    {"condition": "Migraine", "treatments": ["Triptans", "NSAIDs", "Anti-nausea medication"]}
]

for t in treatments:
    for treatment in t["treatments"]:
        # Create treatment node
        graph.query("""
        MERGE (t:Treatment {name: $name})
        """, {"name": treatment})
        
        # Connect treatment to condition
        graph.query("""
        MATCH (c:Condition) WHERE c.name CONTAINS $condition
        MATCH (t:Treatment {name: $treatment})
        MERGE (c)-[:TREATED_BY]->(t)
        """, {"condition": t["condition"], "treatment": treatment})

# Create ASSOCIATED_WITH relationships between conditions that share symptoms
graph.query("""
MATCH (s:Symptom)-[:INDICATES]->(c1:Condition)
MATCH (s)-[:INDICATES]->(c2:Condition)
WHERE c1 <> c2
MERGE (c1)-[r:ASSOCIATED_WITH]->(c2)
ON CREATE SET r.strength = 1
ON MATCH SET r.strength = r.strength + 1
""")

print(f"Graph population completed in {time.time() - start_time:.2f} seconds")

# Set up Gemini LLM and chain
gemini_llm = GeminiLLM(api_key=os.environ["GOOGLE_API_KEY"])
chain = GraphCypherQAChain.from_llm(
    llm=gemini_llm, 
    graph=graph, 
    verbose=True,
    top_k=50
)

print("\nExample Diagnosis Queries:")
print("1. Find possible conditions based on symptoms:")
cypher = """
MATCH (s:Symptom)-[r:INDICATES]->(c:Condition)
WHERE s.name IN ['Fatigue', 'Headache', 'Nausea']
RETURN c.name as Condition, SUM(r.relevance) as RelevanceScore
ORDER BY RelevanceScore DESC
LIMIT 5
"""
result = graph.query(cypher)
print(result)

print("\n2. Find treatments for a specific condition:")
cypher = """
MATCH (c:Condition)-[:TREATED_BY]->(t:Treatment)
WHERE c.name CONTAINS 'Hypertension'
RETURN c.name as Condition, t.name as Treatment
"""
result = graph.query(cypher)
print(result)

print("\n3. Find related conditions:")
cypher = """
MATCH (c1:Condition)-[r:ASSOCIATED_WITH]->(c2:Condition)
WHERE c1.name CONTAINS 'Diabetes'
RETURN c1.name as Condition, c2.name as RelatedCondition, r.strength as AssociationStrength
ORDER BY r.strength DESC
LIMIT 5
"""
result = graph.query(cypher)
print(result)

print("\n4. Find common symptoms for a condition:")
cypher = """
MATCH (s:Symptom)-[r:INDICATES]->(c:Condition)
WHERE c.name CONTAINS 'Asthma'
RETURN s.name as Symptom, r.relevance as RelevanceScore
ORDER BY r.relevance DESC
LIMIT 10
"""
result = graph.query(cypher)
print(result)

# Interactive query using LangChain
print("\nInteractive Diagnosis Query:")
response = chain.run("If a patient has symptoms of fever, cough, and shortness of breath, what conditions might they have and what are the recommended treatments?")
print(response)