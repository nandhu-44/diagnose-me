from langchain.chains import GraphCypherQAChain
from typing import Optional, List, Mapping, Any
import os
from langchain_community.graphs import Neo4jGraph
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from .llm_response import get_response

def graph_query(text_input):
    load_dotenv()
    
    NEO4J_URI = os.getenv("NEO4J_URI")
    NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
    GOOGLE_API_KEY = os.getenv("GOOGLE_KEY")
    
    graph = Neo4jGraph(
        url=NEO4J_URI, 
        username=NEO4J_USERNAME, 
        password=NEO4J_PASSWORD
    )
    
    llm_query = ChatGoogleGenerativeAI(
        model="models/gemini-1.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0,
        allow_dangerous_requests=True,
        system_message="""You are a specialized assistant for generating Neo4j Cypher queries based on user requests related to medical data.
        The database contains the following entity types:
        - Body_part, Brain_region, Device, Disease, Medical_condition, Medical_finding, Medical_procedure
        - Medical_record, Medication, Metric, Nutrition, Patient, Person, Place, Procedure, Symptom
        
        And relationships between entities such as:
        - ADMITTED_TO, ASSISTED, ASSISTED_IN, CHILD_OF, CONNECTED_TO, DIAGNOSED_WITH
        - DONOR_FOR, FED_WITH, FOLLOWING, HAS_CONDITION, HAS_FINDING, HAS_HISTORY_OF
        - HAS_MEDICAL_HISTORY, HAS_PROCEDURE, HAS_SURGICAL_HISTORY, HAS_SYMPTOM
        - HOSPITAL_COMPLICATION, HOSPITAL_DIAGNOSIS, LIKELY, LOCATION_OF, PERFORMED
        - POSSIBLE_FINDING, REASON_FOR_ADMISSION, RECEIVED, RECEIVED_PROCEDURE
        - SECONDARY_TO, SUSPECTED_DIAGNOSIS, TRANSFERRED_FROM, TRANSFERRED_TO, UNDERWENT
        
        -do not use exist use is not null
        -use id property for nodes, not description
        -use HAS_SYMPTOM relationship between Person and Symptom, not SUFFERS_FROM
        
        provide the user with proper medical advice based on the user query with proper terms not generalised ones.
        """
    )
    
    chain = GraphCypherQAChain.from_llm(
        llm=llm_query,
        graph=graph,
        verbose=True,
        allow_dangerous_requests=True,
        return_direct=True,
    )
    
    response = chain.invoke(text_input)
    
    # formatted_response = get_response(text_input, response)
    return response

# sample_text = "woman with diabetes, hypertension, hyperlipidemia and obesity, with a one to two months of chest burning with exertion. for the past six months, she has been participating in a new vigorous exercise program to lose weight. her symptoms do gradually resolve with rest, but they have started to occur now with walking. she does acknowledge that there is associated nausea, diaphoresis and shortness of breath. now recently she started to get symptoms for the past two days while at rest. she was referred for an outpatient exercise tolerance test, where she had chest pain and significant ekg changes. she was referred to for cardiac catheterization today, which revealed significant left main artery disease. just prior to her transfer to , she did complain of chest pain and back pain at about 7/10 intensity and a nitroglycerin drip was started and she received 5 mg of iv lopressor and 2 mg of iv ativan, which did resolve her pain. while she was in the cath lab, she had an intraaortic balloon pump placed, and now she is not actively complaining of any pain. review of systems: she denies any orthopnea, lower extremity edema, but she does acknowledge that she does have dysmenorrhea. prior medical history: she has diabetes mellitus, type 2, diagnosed in . she has been able to control it with diet since ; hypertension and obesity; however, she has lost 40 pounds in the last six months. she has an allergy to shellfish. medications on transfers to : atenolol 50 mg a day, lisinopril 10 mg a day, lipitor 20 mg a day, aspirin 325 mg once a day, progesterone, nitroglycerin drip, lopressor, ativan"
# result = graph_query(sample_text)
# print(result)