# Diagnose-Me: GraphRAG-Based Medical Diagnosis System

## Overview
Diagnose-Me is a GraphRAG-based medical diagnosis system that integrates graph-based entity relationships with Retrieval-Augmented Generation (RAG) techniques. This project leverages a combination of Neo4j for knowledge graphs, FAISS for vector-based retrieval, and LLMs to generate accurate medical diagnoses based on user queries.

### Folder Structure
```
📦 
├─ .gitignore
├─ Readme.md
├─ backend
│  ├─ combine_llm.py
│  ├─ combine_response.py
│  ├─ graphRAG
│  │  ├─ add.py
│  │  ├─ graph_query.py
│  │  ├─ llm_response.py
│  │  ├─ query.py
│  │  ├─ query_test.py
│  │  └─ weviate_setup.py
│  ├─ rag
│  │  ├─ add_data.py
│  │  ├─ llm_response.py
│  │  ├─ load_data.py
│  │  ├─ query_db.py
│  │  ├─ vector_db.py
│  │  └─ vectorstore.pkl
│  ├─ requirements.txt
│  └─ server.py
├─ frontend
│  ├─ .gitignore
│  ├─ README.md
│  ├─ components.json
│  ├─ jsconfig.json
│  ├─ next.config.mjs
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ public
│  │  ├─ diagnose-me-logo.svg
│  │  ├─ doctor.png
│  │  └─ patient.png
│  ├─ src
│  │  ├─ app
│  │  │  ├─ admin
│  │  │  │  ├─ doctor-signup
│  │  │  │  │  └─ page.jsx
│  │  │  │  └─ success
│  │  │  │     └─ page.jsx
│  │  │  ├─ api
│  │  │  │  ├─ auth
│  │  │  │  │  ├─ doctor-signup
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  ├─ get-profile
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  ├─ login
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  ├─ signup
│  │  │  │  │  │  └─ route.js
│  │  │  │  │  └─ update-profile
│  │  │  │  │     └─ route.js
│  │  │  │  ├─ chat
│  │  │  │  │  └─ route.js.txt
│  │  │  │  └─ chats
│  │  │  │     ├─ action
│  │  │  │     │  └─ route.js
│  │  │  │     ├─ doctor
│  │  │  │     │  ├─ pending
│  │  │  │     │  │  └─ route.js
│  │  │  │     │  └─ review
│  │  │  │     │     └─ route.js
│  │  │  │     ├─ patient
│  │  │  │     │  └─ route.js
│  │  │  │     └─ query
│  │  │  │        ├─ [chatId]
│  │  │  │        │  └─ route.js
│  │  │  │        └─ route.js
│  │  │  ├─ chat
│  │  │  │  ├─ [chatId]
│  │  │  │  │  └─ page.jsx
│  │  │  │  └─ page.jsx
│  │  │  ├─ globals.css
│  │  │  ├─ layout.js
│  │  │  ├─ page.jsx
│  │  │  └─ signup
│  │  │     └─ page.jsx
│  │  ├─ components
│  │  │  ├─ DoctorDashboard.jsx
│  │  │  ├─ Header.jsx
│  │  │  ├─ PatientChat.jsx
│  │  │  └─ ui
│  │  │     ├─ alert.jsx
│  │  │     ├─ avatar.jsx
│  │  │     ├─ badge.jsx
│  │  │     ├─ button.jsx
│  │  │     ├─ card.jsx
│  │  │     ├─ dialog.jsx
│  │  │     ├─ form.jsx
│  │  │     ├─ input.jsx
│  │  │     ├─ label.jsx
│  │  │     ├─ select.jsx
│  │  │     ├─ tabs.jsx
│  │  │     ├─ textarea.jsx
│  │  │     └─ tooltip.jsx
│  │  ├─ lib
│  │  │  ├─ MongoConnect.js
│  │  │  ├─ auth.js
│  │  │  └─ utils.js
│  │  └─ models
│  │     ├─ Chat.js
│  │     ├─ Doctor.js
│  │     └─ Patient.js
│  └─ tailwind.config.js
├─ graphrag.ipynb
└─ sample_query.txt
```

## Features
- **GraphRAG Entity Relationship Mapping**: Utilizes a knowledge graph to structure medical entities and their relationships.
- **RAG for Contextual Search**: Implements a chunking mechanism with overlap to store medical data in a FAISS vector database, allowing for accurate similarity comparisons.
- **Hybrid Query Processing**: User queries are converted to vector representations and compared against both the vector database and knowledge graph for relevant results.
- **LLM-Based Diagnosis**: The combined results from the vector database and graph database are sent to an LLM to generate a proper medical diagnosis.
- **Doctor Approval System**: Doctors can review and approve the generated diagnosis for better reliability.
- **Patient Medical History Contextualization**: Users can enter their medical history, enhancing the relevance of diagnoses.
- **Chat Storage**: Patient-doctor chats are stored securely in MongoDB, along with user credentials.

## Technical Stack
### Backend
- **Flask**: Manages the API and backend logic.
- **Neo4j**: Stores medical entities and relationships in a structured knowledge graph.
- **FAISS**: Handles vector-based retrieval for efficient similarity searches.
- **MongoDB**: Stores patient and doctor chats securely.

### Frontend
- **Next.js**: Provides an interactive and user-friendly interface for patients and doctors.
- **Tailwind CSS**: Enhances UI aesthetics.

## Implementation Details
### GraphRAG
- Implemented using `llmgraphtransformer` in turning natural language into entity relations which uploads data to Neo4j.
- Graph relationships improve diagnosis accuracy by structuring medical knowledge.

### RAG with FAISS
- Medical texts are chunked with overlap and indexed in FAISS for similarity comparison.
- Queries are vectorized and matched against stored chunks to retrieve relevant medical data.

### Query Processing
- The system retrieves relevant data from both FAISS and Neo4j.
- The retrieved results, along with the user query, are sent to the LLM.
- The LLM generates a diagnosis based on symptoms and contextual information.
- The processed response can be approved and edited by doctor for further use

## Basic Workflow
```
                   User Query
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
     FAISS Vector DB           Neo4j Graph DB
   (Document Similarity)    (Entity Relationships)
           │                       │
           └───────────┬───────────┘
                       ▼
                Gemini LLM Processor
                       │
                       ▼
          Combined Diagnostic Report
                       │
                       ▼
          Doctor Review & Approval
                       │
                       ▼
          Patient Feedback & History
                       │
                       ▼
          MongoDB (Chat History Storage)
```

## Folder Structure
```
backend/
  ├── graphRAG/ (Graph-based entity relationship scripts)
  ├── rag/ (Vector database and retrieval components)
  ├── server.py (Flask backend API)
  ├── requirements.txt (Dependencies)

frontend/
  ├── src/
  │   ├── app/ (Pages and API routes)
  │   ├── components/ (UI components)
  │   ├── lib/ (MongoDB and authentication utilities)
  ├── package.json (Frontend dependencies)
```

## How to Run
### Backend
1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Run the Flask server:
   ```bash
   python server.py
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Next.js frontend:
   ```bash
   npm run dev
   ```

## Future Improvements
- Enhance the graph-based reasoning with additional medical knowledge sources.
- Improve user experience with real-time chat and multilingual support.
- Optimize FAISS indexing for faster vector retrieval.
-Add option to to improve knowledge from previous chats

