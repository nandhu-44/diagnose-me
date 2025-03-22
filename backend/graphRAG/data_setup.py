from weaviate.util import generate_uuid5
import weaviate
import json
import pandas as pd
import logging
import numpy as np
import os
from weaviate.auth import AuthClientCredentials  # v3.x auth method
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# Read the CSV file
df = pd.read_csv("/home/nazal/Downloads/data.zip")
print(df.head())

# Replace infinity values with NaN and then fill NaN values
df.replace([np.inf, -np.inf], np.nan, inplace=True)
df.fillna('', inplace=True)

# Convert columns to string type
df['Title'] = df['Title'].astype(str)
df['abstractText'] = df['abstractText'].astype(str)

# Log the data types
logging.info(f"Title column type: {df['Title'].dtype}")
logging.info(f"abstractText column type: {df['abstractText'].dtype}")

# Get Weaviate credentials from environment variables
weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
google_key = os.environ["GOOGLE_KEY"]

# Connect to Weaviate Cloud (v3.x syntax)
client = weaviate.Client(
    url=weaviate_url,
    auth_client_secret=AuthClientCredentials(api_key=weaviate_api_key),
    additional_headers={
        "X-Goog-Studio-Api-Key": google_key
    }
)

# Use batch processing with v3.x syntax
with client.batch(batch_size=10, num_workers=2) as batch:
    for index, row in df.iterrows():
        try:
            question_object = {
                "title": row.Title,
                "abstractText": row.abstractText,
            }
            batch.add_data_object(
                data_object=question_object,
                class_name="articles",
                uuid=generate_uuid5(question_object)
            )
        except Exception as e:
            logging.error(f"Error processing row {index}: {e}")

# Close the client connection (optional, good practice)
client = None  # In v3.x, no explicit close method; just dereference