import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GOOGLE_KEY')
# print(api_key)
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-flash-2.0')

def get_response(query, chunks):
    # Construct the prompt
    prompt = f"""
    **User Query:**
    {query}

    **Top Information Chunks:**
    """

    prompt += """
    **Instructions:**
    You are a helpful medical assistant who has access to a database of medical articles. You need to provide information based on the user query. Use the information from the articles to answer the user query.
    based on the retieved chunks answer the user query .
    1. Answer the query based on the provided best chunk that matches the query the best.
    2. If the information in the chunks does not cover the query, respond with "I can't find info on that" only but give a short response on what they should do and consult a doctor immediatly.
    3.If the user query is a simple question, answer it directly. with minimal information.and ask the user to describe the symptoms in detail.
    **Response:**
    """

    try:
        response = model.generate_content(prompt)
        if response:
            print(response.text)
        return response.text if response and response.text else "No response generated."
    except Exception as e:
        return f"An error occurred: {str(e)}"