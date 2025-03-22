import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI

# Initialize the LLM
llm = ChatGoogleGenerativeAI(
model="models/gemini-1.5-flash",
google_api_key="AIzaSyD2nLQBuG7fKoUtn3DDxM-6hs1sYAh4-EA",
)

# Test query (patient-like input)
query = "I have influenza with fever, what medicine shall I use"

# Generate response
response = llm.invoke(query)

# Print the response
print("Query:", query)
print("Response:", response.content)