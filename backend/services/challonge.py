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

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    }
    
    return requests.request(
        method, 
        url, 
        params=params, 
        json=kwargs.get('json'), 
        headers=headers
        )

def listar_torneios():
    return challonge('GET', '/tournaments')

def criar_torneio(dados):
    return challonge('POST', '/tournaments', json={'tournament': dados})

def listar_participantes(torneioUrl):
    return challonge('GET', f'/tournaments/{torneioUrl}/participants')
