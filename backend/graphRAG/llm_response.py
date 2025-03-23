import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv('GOOGLE_KEY')
# print(api_key)
genai.configure(api_key=api_key)

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-pro')

def get_response(query, graph_response):
    prompt = f"""
**Role**: You are a Medical Triage Assistant. Analyze this patient's symptoms and database response to:
1. Identify urgent medical concerns
2. Explain potential condition connections
3. Provide clear patient guidance
check if the data is correct from your own data base and provide the user with proper medical advice based on the user query.with proper terms not generalised ones.


**Patient Report**:
{query}

**Database Context** (Technical Notes for Accuracy):
{graph_response}

**Response Requirements**:
1. Start with empathetic acknowledgement of concerns
2. Analyze symptom patterns using medical knowledge
3. Highlight 3 most critical risks with explanations
4. Suggest immediate actions vs follow-up steps
5. Add important disclaimers

**Format**:
[Empathetic opening]

patterns shown
- [Pattern 1] → [Possible condition]  
- [Pattern 2] → [Possible complication]  

urgent concerns
1. [Critical issue 1] - Why it matters  
2. [Critical issue 2] - Short explanation  

next steps
- [Action 1]  
- [Action 2]  

follow up
- [Specialist] for [condition suspicion]  
- [Test] to rule out [possibility]  

 
"[Clear disclaimer about needing professional evaluation]"

"""

    try:
        response = model.generate_content(prompt)
        return response.text if response and response.text else "Please consult a doctor immediately."
    except Exception as e:
        return e