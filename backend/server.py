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

def get_response(query, user_data=None):
    try:
        # Format the medical context
        medical_context = f"""
        Patient Context:
        - Age: {calculate_age(user_data.get('dateOfBirth', ''))}
        - Gender: {user_data.get('gender', '')}
        - Medical History: {user_data.get('medicalHistory', '')}
        - Current Medications: {', '.join(user_data.get('currentMedications', []))}
        - Allergies: {', '.join(user_data.get('allergies', []))}
        - Chronic Conditions: {', '.join(user_data.get('chronicConditions', []))}

        Patient Query: {query}
        """
        
        response = model.generate_content(medical_context)
        return response.text if response and hasattr(response, 'text') else "No response generated."
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return f"An error occurred: {str(e)}"

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
            # Get AI response with user context
            response = get_response(query, user_data)
            
            # Try graph query if available using the function directly
            try:
                result = graph_query(query)
                graph_response = result.get('result', '')
                if graph_response:
                    response += "\n\nAdditional Information from Medical Database:\n" + graph_response
            except Exception as e:
                print(f"Graph query error: {str(e)}")

            # Improved streaming that preserves markdown
            # Split by sentences or markdown elements while preserving structure
            chunks = []
            current_chunk = []
            lines = response.split('\n')
            
            for line in lines:
                if line.strip():  # Skip empty lines
                    if line.startswith(('#', '-', '*', '1.')) or len(current_chunk) > 50:
                        if current_chunk:
                            chunks.append(' '.join(current_chunk))
                            current_chunk = []
                    current_chunk.append(line)
            
            if current_chunk:
                chunks.append(' '.join(current_chunk))

            # Stream chunks with proper formatting
            for chunk in chunks:
                yield f"data: {json.dumps({'chunk': chunk + '\n'})}\n\n"
                
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
