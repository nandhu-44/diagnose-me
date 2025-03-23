import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GOOGLE_KEY')
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.0-flash')

def summarize_response(response_text):
    try:
        prompt = f"Summarize this into 2-3 lines max while keeping the context. If empty, return nothing:\n{response_text}"
        response = model.generate_content(prompt)
        return response.text if response and hasattr(response, 'text') else "No summary generated."
    except Exception as e:
        print(f"Error in summarize_response: {str(e)}")
        return "Failed to generate summary."

def get_response(query, rag_response, graph_response, previouse_response=""):
    # Construct the prompt
    prompt = f"""
    **User Query:**
    {query}

    **rag response**
    {rag_response}
    
    **graph response**
    {graph_response}

    **previous response**
    {previouse_response}

    """

    prompt += """
    **Instructions:**
    You are a medical assistant in the DiagnoseMe application. Your role is to provide helpful medical information based on the data available in our medical database.
    
    1. Analyze the information from both the vector database (rag response) and graph database (graph response).
    2. Provide factual medical information using proper medical terminology based on the user's query.
    3. NEVER include disclaimers like "I am an AI" or "I cannot provide medical advice" in your responses.
    4. If you don't have sufficient information to address the query, suggest that the user consult with a healthcare professional, but still provide any relevant information you can based on available data.
    5. If the user mentions concerning symptoms (like chest pain, difficulty breathing, etc.), emphasize the importance of seeking immediate medical attention while still providing relevant information.
    6. For simple questions, provide direct answers and ask for more details about symptoms if needed.
    7. Consider any previous conversation context when responding.
    
    IMPORTANT: FORMAT YOUR RESPONSE USING PROPER MARKDOWN WITH CORRECT SYNTAX:
    - Use **bold** for emphasis
    - Use *italic* for subtle emphasis
    - Use # headings for sections (e.g., # Symptoms, # Treatment)
    - For bullet points, use ONLY the dash symbol (-) followed by a space:
      - Like this
      - And this
    - Ensure each bullet point is on its own line with a blank line before the list starts
    - For numbered lists, use numbers followed by a period and space (1. 2. 3.) with each item on its own line
    - Use double line breaks between paragraphs
    - For medical terminology requiring mathematical notation, use LaTeX syntax with $...$ for inline math and $$...$$ for block math
    - For tables, use proper Markdown table syntax with pipes and dashes

    FORMAT YOUR RESPONSE AS A MEDICAL ASSISTANT WOULD, WITHOUT AI DISCLAIMERS.
    
    **Response:**
    """

    try:
        response = model.generate_content(prompt)
        return response.text if response and hasattr(response, 'text') else "No response generated."
    except Exception as e:
        print(f"Error in get_response: {str(e)}")
        return f"An error occurred: {str(e)}"