import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GOOGLE_KEY')
# print(api_key)
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.0-flash')

def summarize_response(response):
    response = model.generate_content("summarize this into 2-3 lines max while keeping the context,if nothing return nothing")
    return response.text

def get_response(query, rag_response,graph_response, previouse_response=""):
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
    You are a helpful medical assistant who has access to a database of medical articles. You need to provide information based on the user query. Use the information from the articles to answer the user query.
    based on the retieved chunks answer the user query .
    1. you are given the data from a vector database top 5 chunks and the response from neo4j graph database
    2. you are to carefully analyze the chunks and the response from the neo4j database and provide the user with proper medical advice based on the user query.with proper terms not generalised ones.
    3. If the information recieved does not cover the query, respond with "I can't find info on that" only but give a short response on what they should do and consult a doctor immediatly.
    4.you are given the graph data and vector db data to not make mistakes properly analyse relations between the users query and data recieve form a response pointing out how these conclusions are reached
    5. If the user query is a simple question, answer it directly. with minimal information.and ask the user to describe the symptoms in detail.
    6. if there is a previous response from the user provide a context based on it.
    **Response:**
    """

    try:
        response = model.generate_content(prompt)
        # summary = summarize_response(response.text)
        return response.text if response and response.text else "No response generated."
    except Exception as e:
        return f"An error occurred: {str(e)}"