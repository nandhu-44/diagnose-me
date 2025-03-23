from flask import Flask, request, jsonify, Response
import os
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin
import json
import google.generativeai as genai
from graphRAG.graph_query import graph_query  # Import the function directly
from rag import query_db
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

# Configure Google Generative AI
api_key = os.getenv('GOOGLE_KEY')
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')

def get_medical_context(user_data):
    age = calculate_age(user_data.get('dateOfBirth', ''))
    gender = user_data.get('gender', '')
    history = user_data.get('medicalHistory', '')
    meds = user_data.get('currentMedications', [])
    allergies = user_data.get('allergies', [])
    conditions = user_data.get('chronicConditions', [])
    
    return f"""
    Based on the following patient profile:
    - Age: {age}
    - Gender: {gender}
    - Chronic Conditions: {', '.join(conditions)}
    - Current Medications: {', '.join(meds)}
    - Known Allergies: {', '.join(allergies)}
    - Medical History: {history}
    """

def get_response(query, user_data=None):
    try:
        # Get responses from both knowledge sources
        sources_response = ""
        
        # Get Graph Database response first
        try:
            graph_data = graph_query(query)
            if graph_data and graph_data["result"]:
                sources_response += "\nFrom Medical Knowledge Graph:\n" + graph_data["result"]
        except Exception as e:
            print(f"Graph query error: {str(e)}")

        # Get Vector DB (RAG) response
        try:
            rag_result = query_db.query(query)
            if rag_result:
                sources_response += "\nFrom Similar Cases:\n" + str(rag_result)
        except Exception as e:
            print(f"RAG query error: {str(e)}")

        # Format complete context for AI
        full_context = f"""
        {get_medical_context(user_data)}
        
        Patient Query: {query}

        Knowledge Base Information:
        {sources_response}

        Instructions:
        Based on the patient's profile and the medical knowledge provided:
        1. Prioritize information relevant to the patient's specific conditions
        2. Consider potential interactions with current medications
        3. Account for any allergies in recommendations
        4. Use the knowledge base to support your response
        """
        # Generate response from AI model
        response = model.generate_content(full_context)
        return response.text if response and hasattr(response, 'text') else "No response generated."
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return f"An error occurred: {str(e)}"

def process_markdown(text):
    """Process markdown text into properly formatted chunks"""
    chunks = []
    current_section = []
    
    for line in text.split('\n'):
        # Start new section for headers
        if line.startswith('#'):
            if current_section:
                chunks.append('\n'.join(current_section))
                current_section = []
            current_section.append(line)
        
        # Group list items together
        elif line.strip().startswith(('-', '*', '1.')) and current_section and not current_section[-1].strip().startswith(('-', '*', '1.')):
            if current_section:
                chunks.append('\n'.join(current_section))
                current_section = []
            current_section.append(line)
        
        # Keep list items together
        elif line.strip().startswith(('-', '*', '1.')):
            current_section.append(line)
        
        # Regular paragraph text
        else:
            if current_section and current_section[-1].strip().startswith(('-', '*', '1.')):
                chunks.append('\n'.join(current_section))
                current_section = []
            current_section.append(line)

        # Split long sections
        if len(current_section) > 5:
            chunks.append('\n'.join(current_section))
            current_section = []
    
    if current_section:
        chunks.append('\n'.join(current_section))
    
    return [chunk.strip() for chunk in chunks if chunk.strip()]

@app.route('/process', methods=['POST', 'OPTIONS'])
@cross_origin()
def process():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.json
    query = data.get('prompt', '')
    user_data = data.get('userData', {})

    def generate():
        try:
            # Get unified response
            response = get_response(query, user_data)
            
            # Process into markdown-aware chunks
            chunks = process_markdown(response)
            
            # Stream each chunk with proper formatting
            for chunk in chunks:
                chunk_data = {'chunk': chunk + '\n\n'}
                yield f"data: {json.dumps(chunk_data)}\n\n"
                
        except Exception as e:
            print(f"Error: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(generate(), mimetype='text/event-stream')

def calculate_age(dob_str):
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d')
        today = datetime.now()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return f"{age} years"
    except:
        return "Unknown"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
