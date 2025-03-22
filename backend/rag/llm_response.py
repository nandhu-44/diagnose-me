import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv('GOOGLE_KEY')
# print(api_key)
genai.configure(api_key=api_key)

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash')

def get_response(query, chunks):
    # Construct the prompt
    prompt = f"""
    **User Query:**
    {query}

    **Top Information Chunks:**
    """


    prompt += """
    **Instructions:**
    1. Answer the query based on the provided best chunk that matches the query the best.
    2. If the information in the chunks does not cover the query, respond with "I can't find info on that" only.

    **Response:**
    """

    try:
        response = model.generate_content(prompt)
        if response:
            print(response.text)
        return response.text if response and response.text else "No response generated."
    except Exception as e:
        return f"An error occurred: {str(e)}"