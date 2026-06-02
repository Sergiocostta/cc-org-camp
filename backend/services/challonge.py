import requests
from dotenv import load_dotenv
import os

load_dotenv()

CHALLONGE_API_KEY = os.getenv('CHALLONGE_API_KEY')
URL = 'https://api.challonge.com/v1'

def challonge(method, path, **kwargs):
    url = f'{URL}{path}.json'
    params = kwargs.get('params', {})
    params['api_key'] = CHALLONGE_API_KEY
    
    return requests.request(method, url, params=params, json=kwargs.get('json'))

def listar_torneios():
    resposta = challonge('GET', '/tournaments')
    print(resposta.status_code)
    print(resposta.text)
    return resposta
