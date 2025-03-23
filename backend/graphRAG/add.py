from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

def add_medical_data_to_neo4j():
    # Load environment variables
    load_dotenv()
    
    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    
    # Connect to the database
    driver = GraphDatabase.driver(uri, auth=(username, password))
    
    # Clear existing data (optional)
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    
    # All Cypher commands to create medical data
    cypher_commands = [
        # Sample 1: Type 2 Diabetes
        """
        CREATE (d1:Disease {id: 'type_2_diabetes', name: 'Type 2 Diabetes Mellitus'})
        CREATE (s1:Symptom {id: 'polyuria', name: 'Excessive urination'})
        CREATE (s2:Symptom {id: 'polydipsia', name: 'Excessive thirst'})
        CREATE (s3:Symptom {id: 'unexplained_weight_loss', name: 'Unexplained weight loss'})
        CREATE (s4:Symptom {id: 'fatigue', name: 'Fatigue'})
        CREATE (f1:Medical_finding {id: 'hyperglycemia', name: 'Elevated blood glucose'})
        CREATE (m1:Medication {id: 'metformin', name: 'Metformin'})
        CREATE (m2:Medication {id: 'glipizide', name: 'Glipizide'})
        
        CREATE (d1)-[:HAS_SYMPTOM]->(s1)
        CREATE (d1)-[:HAS_SYMPTOM]->(s2)
        CREATE (d1)-[:HAS_SYMPTOM]->(s3)
        CREATE (d1)-[:HAS_SYMPTOM]->(s4)
        CREATE (d1)-[:HAS_FINDING]->(f1)
        CREATE (d1)-[:TREATED_WITH]->(m1)
        CREATE (d1)-[:TREATED_WITH]->(m2)
        """,
        
        # Sample 2: Hypertension
        """
        CREATE (d2:Disease {id: 'hypertension', name: 'Hypertension'})
        CREATE (s5:Symptom {id: 'headache', name: 'Headache'})
        CREATE (s6:Symptom {id: 'dizziness', name: 'Dizziness'})
        CREATE (s7:Symptom {id: 'blurred_vision', name: 'Blurred vision'})
        CREATE (f2:Medical_finding {id: 'elevated_bp', name: 'Elevated blood pressure'})
        CREATE (m3:Medication {id: 'lisinopril', name: 'Lisinopril'})
        CREATE (m4:Medication {id: 'amlodipine', name: 'Amlodipine'})
        
        CREATE (d2)-[:HAS_SYMPTOM]->(s5)
        CREATE (d2)-[:HAS_SYMPTOM]->(s6)
        CREATE (d2)-[:HAS_SYMPTOM]->(s7)
        CREATE (d2)-[:HAS_FINDING]->(f2)
        CREATE (d2)-[:TREATED_WITH]->(m3)
        CREATE (d2)-[:TREATED_WITH]->(m4)
        """,
        
        # Sample 3: Asthma
        """
        CREATE (d3:Disease {id: 'asthma', name: 'Asthma'})
        CREATE (s8:Symptom {id: 'wheezing', name: 'Wheezing'})
        CREATE (s9:Symptom {id: 'shortness_of_breath', name: 'Shortness of breath'})
        CREATE (s10:Symptom {id: 'chest_tightness', name: 'Chest tightness'})
        CREATE (s11:Symptom {id: 'coughing', name: 'Coughing'})
        CREATE (m5:Medication {id: 'albuterol', name: 'Albuterol'})
        CREATE (m6:Medication {id: 'fluticasone', name: 'Fluticasone'})
        
        CREATE (d3)-[:HAS_SYMPTOM]->(s8)
        CREATE (d3)-[:HAS_SYMPTOM]->(s9)
        CREATE (d3)-[:HAS_SYMPTOM]->(s10)
        CREATE (d3)-[:HAS_SYMPTOM]->(s11)
        CREATE (d3)-[:TREATED_WITH]->(m5)
        CREATE (d3)-[:TREATED_WITH]->(m6)
        """,
        
        # Sample 4: Coronary Artery Disease
        """
        CREATE (d4:Disease {id: 'coronary_artery_disease', name: 'Coronary Artery Disease'})
        CREATE (s12:Symptom {id: 'chest_pain', name: 'Chest pain'})
        CREATE (s13:Symptom {id: 'shortness_of_breath', name: 'Shortness of breath'})
        CREATE (s14:Symptom {id: 'fatigue', name: 'Fatigue'})
        CREATE (p1:Medical_procedure {id: 'angiogram', name: 'Coronary angiogram'})
        CREATE (m7:Medication {id: 'aspirin', name: 'Aspirin'})
        CREATE (m8:Medication {id: 'atorvastatin', name: 'Atorvastatin'})
        
        CREATE (d4)-[:HAS_SYMPTOM]->(s12)
        CREATE (d4)-[:HAS_SYMPTOM]->(s13)
        CREATE (d4)-[:HAS_SYMPTOM]->(s14)
        CREATE (d4)-[:DIAGNOSED_BY]->(p1)
        CREATE (d4)-[:TREATED_WITH]->(m7)
        CREATE (d4)-[:TREATED_WITH]->(m8)
        """,
        
        # Sample 5: GERD
        """
        CREATE (d5:Disease {id: 'gerd', name: 'Gastroesophageal Reflux Disease'})
        CREATE (s15:Symptom {id: 'heartburn', name: 'Heartburn'})
        CREATE (s16:Symptom {id: 'regurgitation', name: 'Regurgitation'})
        CREATE (s17:Symptom {id: 'chest_pain', name: 'Chest pain'})
        CREATE (s18:Symptom {id: 'difficulty_swallowing', name: 'Difficulty swallowing'})
        CREATE (m9:Medication {id: 'omeprazole', name: 'Omeprazole'})
        CREATE (m10:Medication {id: 'famotidine', name: 'Famotidine'})
        
        CREATE (d5)-[:HAS_SYMPTOM]->(s15)
        CREATE (d5)-[:HAS_SYMPTOM]->(s16)
        CREATE (d5)-[:HAS_SYMPTOM]->(s17)
        CREATE (d5)-[:HAS_SYMPTOM]->(s18)
        CREATE (d5)-[:TREATED_WITH]->(m9)
        CREATE (d5)-[:TREATED_WITH]->(m10)
        """,
        
        # Sample 6: Rheumatoid Arthritis
        """
        CREATE (d6:Disease {id: 'rheumatoid_arthritis', name: 'Rheumatoid Arthritis'})
        CREATE (s19:Symptom {id: 'joint_pain', name: 'Joint pain'})
        CREATE (s20:Symptom {id: 'joint_swelling', name: 'Joint swelling'})
        CREATE (s21:Symptom {id: 'joint_stiffness', name: 'Joint stiffness'})
        CREATE (s22:Symptom {id: 'fatigue', name: 'Fatigue'})
        CREATE (m11:Medication {id: 'methotrexate', name: 'Methotrexate'})
        CREATE (m12:Medication {id: 'prednisone', name: 'Prednisone'})
        
        CREATE (d6)-[:HAS_SYMPTOM]->(s19)
        CREATE (d6)-[:HAS_SYMPTOM]->(s20)
        CREATE (d6)-[:HAS_SYMPTOM]->(s21)
        CREATE (d6)-[:HAS_SYMPTOM]->(s22)
        CREATE (d6)-[:TREATED_WITH]->(m11)
        CREATE (d6)-[:TREATED_WITH]->(m12)
        """,
        
        # Sample 7: Migraine
        """
        CREATE (d7:Disease {id: 'migraine', name: 'Migraine'})
        CREATE (s23:Symptom {id: 'headache', name: 'Severe headache'})
        CREATE (s24:Symptom {id: 'nausea', name: 'Nausea'})
        CREATE (s25:Symptom {id: 'sensitivity_to_light', name: 'Sensitivity to light'})
        CREATE (s26:Symptom {id: 'sensitivity_to_sound', name: 'Sensitivity to sound'})
        CREATE (m13:Medication {id: 'sumatriptan', name: 'Sumatriptan'})
        CREATE (m14:Medication {id: 'propranolol', name: 'Propranolol'})
        
        CREATE (d7)-[:HAS_SYMPTOM]->(s23)
        CREATE (d7)-[:HAS_SYMPTOM]->(s24)
        CREATE (d7)-[:HAS_SYMPTOM]->(s25)
        CREATE (d7)-[:HAS_SYMPTOM]->(s26)
        CREATE (d7)-[:TREATED_WITH]->(m13)
        CREATE (d7)-[:TREATED_WITH]->(m14)
        """,
        
        # Sample 8: Pneumonia
        """
        CREATE (d8:Disease {id: 'pneumonia', name: 'Pneumonia'})
        CREATE (s27:Symptom {id: 'fever', name: 'Fever'})
        CREATE (s28:Symptom {id: 'cough', name: 'Cough with phlegm'})
        CREATE (s29:Symptom {id: 'shortness_of_breath', name: 'Shortness of breath'})
        CREATE (s30:Symptom {id: 'chest_pain', name: 'Chest pain'})
        CREATE (f3:Medical_finding {id: 'infiltrates', name: 'Pulmonary infiltrates'})
        CREATE (m15:Medication {id: 'azithromycin', name: 'Azithromycin'})
        CREATE (m16:Medication {id: 'amoxicillin', name: 'Amoxicillin'})
        
        CREATE (d8)-[:HAS_SYMPTOM]->(s27)
        CREATE (d8)-[:HAS_SYMPTOM]->(s28)
        CREATE (d8)-[:HAS_SYMPTOM]->(s29)
        CREATE (d8)-[:HAS_SYMPTOM]->(s30)
        CREATE (d8)-[:HAS_FINDING]->(f3)
        CREATE (d8)-[:TREATED_WITH]->(m15)
        CREATE (d8)-[:TREATED_WITH]->(m16)
        """,
        
        # Sample 9: Depression
        """
        CREATE (d9:Disease {id: 'depression', name: 'Major Depressive Disorder'})
        CREATE (s31:Symptom {id: 'persistent_sadness', name: 'Persistent sadness'})
        CREATE (s32:Symptom {id: 'loss_of_interest', name: 'Loss of interest'})
        CREATE (s33:Symptom {id: 'sleep_changes', name: 'Sleep changes'})
        CREATE (s34:Symptom {id: 'fatigue', name: 'Fatigue'})
        CREATE (m17:Medication {id: 'sertraline', name: 'Sertraline'})
        CREATE (m18:Medication {id: 'bupropion', name: 'Bupropion'})
        
        CREATE (d9)-[:HAS_SYMPTOM]->(s31)
        CREATE (d9)-[:HAS_SYMPTOM]->(s32)
        CREATE (d9)-[:HAS_SYMPTOM]->(s33)
        CREATE (d9)-[:HAS_SYMPTOM]->(s34)
        CREATE (d9)-[:TREATED_WITH]->(m17)
        CREATE (d9)-[:TREATED_WITH]->(m18)
        """,
        
        # Sample 10: Hyperthyroidism
        """
        CREATE (d10:Disease {id: 'hyperthyroidism', name: 'Hyperthyroidism'})
        CREATE (s35:Symptom {id: 'weight_loss', name: 'Weight loss'})
        CREATE (s36:Symptom {id: 'rapid_heartbeat', name: 'Rapid heartbeat'})
        CREATE (s37:Symptom {id: 'anxiety', name: 'Anxiety'})
        CREATE (s38:Symptom {id: 'tremor', name: 'Tremor'})
        CREATE (f4:Medical_finding {id: 'elevated_t4', name: 'Elevated T4 levels'})
        CREATE (m19:Medication {id: 'methimazole', name: 'Methimazole'})
        CREATE (m20:Medication {id: 'propranolol', name: 'Propranolol'})
        
        CREATE (d10)-[:HAS_SYMPTOM]->(s35)
        CREATE (d10)-[:HAS_SYMPTOM]->(s36)
        CREATE (d10)-[:HAS_SYMPTOM]->(s37)
        CREATE (d10)-[:HAS_SYMPTOM]->(s38)
        CREATE (d10)-[:HAS_FINDING]->(f4)
        CREATE (d10)-[:TREATED_WITH]->(m19)
        CREATE (d10)-[:TREATED_WITH]->(m20)
        """
    ]
    
    # Execute each Cypher command
    with driver.session() as session:
        for command in cypher_commands:
            session.run(command)
            
    print("Medical data has been successfully added to Neo4j database")
    
    # Close the driver connection
    driver.close()

if __name__ == "__main__":
    add_medical_data_to_neo4j()