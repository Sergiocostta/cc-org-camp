import requests
from dotenv import load_dotenv
import os

load_dotenv()

CHALLONGE_USERNAME = os.getenv('CHALLONGE_USERNAME')
CHALLONGE_API_KEY = os.getenv('CHALLONGE_API_KEY')
URL = 'https://api.challonge.com/v1'

print(f"CHALLONGE_USERNAME: {CHALLONGE_USERNAME}")
print(f"CHALLONGE_API_KEY: {CHALLONGE_API_KEY}")

