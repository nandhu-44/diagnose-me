import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
model="models/gemini-1.5-flash",
google_api_key="AIzaSyD2nLQBuG7fKoUtn3DDxM-6hs1sYAh4-EA",
)

query = "I have influenza with fever, what medicine shall I use"

response = llm.invoke(query)

print("Query:", query)
print("Response:", response.content)