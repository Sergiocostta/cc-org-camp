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

def listar_participantes(torneioId):
    return challonge('GET', f'/tournaments/{torneioId}/participants')

def adicionar_participantes_bulk(torneio_url, nomes):
    participantes = [{'name': nome} for nome in nomes]
    return challonge('POST', f'/tournaments/{torneio_url}/participants/bulk_add', json={'participants': participantes})

def iniciar_torneio(torneioUrl):
    return challonge('POST', f'/tournaments/{torneioUrl}/start')

def listar_partidas(torneio_url):
    return challonge('GET', f'/tournaments/{torneio_url}/matches')

def atualizar_partida(torneio_url, partida_id, dados):
    return challonge('PUT', f'/tournaments/{torneio_url}/matches/{partida_id}', json={'match': dados})

def finalizar_torneio(torneio_url):
    return challonge('POST', f'/tournaments/{torneio_url}/finalize')