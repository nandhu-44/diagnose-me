import os
from dotenv import load_dotenv
import weaviate
from weaviate.classes.init import Auth
from weaviate.auth import AuthClientCredentials

# Load environment variables from .env file
load_dotenv()

weaviate_url = os.environ["WEAVIATE_URL"]
weaviate_api_key = os.environ["WEAVIATE_API_KEY"]
google_key=os.environ["GOOGLE_KEY"]

# Connect to Weaviate Cloud
client = weaviate.connect_to_weaviate_cloud(
    cluster_url=weaviate_url,
    auth_client_secret=AuthClientCredentials.api_key(weaviate_api_key),
)

# client = weaviate.connect_to_weaviate_cloud(
#     cluster_url=weaviate_url,
#     auth_credentials=Auth.api_key(weaviate_api_key),
#     headers={
#         "X-Goog-Studio-Api-Key": google_key,
#     }
# )

# class_obj = {
#     # Class definition
#     "class": "articles",

#     # Property definitions
#     "properties": [
#         {
#             "name": "title",
#             "dataType": ["text"],
#         },
#         {
#             "name": "abstractText",
#             "dataType": ["text"],
#         },
#     ],
#     "vectorizer": "text2vec-weviate",
# }
# client.schema.create_class(class_obj)
# print(client.is_ready())