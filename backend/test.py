import os
import pandas as pd
from langchain_community.graphs import Neo4jGraph
from langchain.chains import GraphCypherQAChain
from langchain.llms.base import LLM
from typing import Optional, List, Mapping, Any
import google.generativeai as genai
import random

# Environment setup
os.environ["NEO4J_URI"] = "neo4j+s://fe863993.databases.neo4j.io"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "ucnO0D7gMmaaIdHS94pQRlLeFCFVTETP-qWVTDNpK8k"
os.environ["GOOGLE_API_KEY"] = "AIzaSyAuRTNzpXkv3b63x5AoR83PmFB2oqb2ZKo"

# Generate random disease-related data
diseases = ["Influenza", "Diabetes", "Hypertension", "Asthma", "Migraine"]
symptoms = ["Fever", "Cough", "Fatigue", "High Blood Sugar", "Headache", "Shortness of Breath", "Nausea"]
treatments = ["Rest", "Medication", "Diet Change", "Inhaler", "Therapy"]
medicines = ["Paracetamol", "Insulin", "Lisinopril", "Albuterol", "Ibuprofen"]

# Curated data with meaningful entries (not random)
data = {
    "Title": [
        "Case Study: Seasonal Influenza Outbreak",
        "Case Study: Type 2 Diabetes Management",
        "Case Study: Hypertension in Adults",
        "Case Study: Asthma Attack Emergency",
        "Case Study: Chronic Migraine Relief"
    ],
    "abstractText": [
        "A patient with seasonal influenza presented with high fever and cough. Treated with antiviral medication and rest.",
        "A Type 2 diabetes patient experienced fatigue and high blood sugar. Managed with insulin and diet adjustments.",
        "An adult with hypertension showed fatigue and headache. Controlled with blood pressure medication and lifestyle changes.",
        "An asthma patient had shortness of breath and cough during an attack. Relieved with an inhaler and therapy.",
        "A chronic migraine sufferer reported severe headache and nausea. Treated with pain relief medication and rest."
    ],
    "meshMajor": [
        ["Influenza", "Fever", "Cough"],                  # Influenza symptoms
        ["Diabetes", "Fatigue", "High Blood Sugar"],      # Diabetes symptoms
        ["Hypertension", "Fatigue", "Headache"],          # Hypertension symptoms
        ["Asthma", "Shortness of Breath", "Cough"],       # Asthma symptoms
        ["Migraine", "Headache", "Nausea"]                # Migraine symptoms
    ],
    "meshroot": [
        ["Paracetamol (recommended)", "Rest"],            # Influenza: fever reducer + rest
        ["Insulin (recommended)", "Diet Change"],         # Diabetes: blood sugar control + lifestyle
        ["Lisinopril (recommended)", "Diet Change"],      # Hypertension: BP control + lifestyle
        ["Albuterol (recommended)", "Inhaler"],           # Asthma: bronchodilator + delivery method
        ["Ibuprofen (recommended)", "Rest"]               # Migraine: pain relief + rest
    ]
}

# Create DataFrame
df = pd.DataFrame(data)
print(df)

# Connect to Neo4j
graph = Neo4jGraph()

# Clear existing data (optional, for fresh start)
graph.query("MATCH (n) DETACH DELETE n")

# Insert data into Neo4j
for index, row in df.iterrows():
    graph.query("""
        MERGE (d:Document {id: $id})
        SET d.title = $title, d.abstract = $abstract
    """, {"id": str(index), "title": row["Title"], "abstract": row["abstractText"]})

    for major_term in row["meshMajor"]:
        if major_term:
            graph.query("""
                MERGE (mt:MajorTopic {name: $term})
                WITH mt
                MATCH (d:Document {id: $id})
                MERGE (d)-[:HAS_MAJOR_TOPIC]->(mt)
            """, {"term": major_term, "id": str(index)})

    for root_term in row["meshroot"]:
        if root_term:
            graph.query("""
                MERGE (t:Topic {name: $term})
                WITH t
                MATCH (d:Document {id: $id})
                MERGE (d)-[:HAS_TOPIC]->(t)
            """, {"term": root_term, "id": str(index)})
