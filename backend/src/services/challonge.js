const fetch = require('node-fetch')

const BASE_URL = 'https://api.challonge.com/v2.1'

const headers = {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/json',
    'Authorization-Type': 'v1',
    'Authorization': process.env.CHALLONGE_API_KEY
}

// função base
async function request(method, path, body = null){
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    })
    return res.json()
}

// torneios 
const listarTorneios = () => request('GET', '/tournaments')
const criarTorneio = (nome, tipo) => request('POST', '/tournaments', {
    data: { type: 'Tournament', attributes: { name: nome, tournament_type: tipo } }
})

// participantes
const listarParticipantes = (torneioId) => request('GET', `/tournaments/${torneioId}/participants`)
const criarParticipante = (torneioId, nome) => request('POST', `tournaments/${torneioId}/participants`, {
    data: { type: 'Participant', attributes: { name: nome } }
})

// partidas
const listarPartidas = torneioId => request('GET', `tournaments/${torneioId}/matches`)


module.exports = {
    listarTorneios,
    criarTorneio,
    listarParticipantes,
    criarParticipante,
    listarPartidas
}