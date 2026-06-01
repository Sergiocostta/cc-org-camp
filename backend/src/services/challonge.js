const fetch = require('node-fetch')

const BASE_URL = 'https://api.challonge.com/v2.1'

const headers = {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/json',
    'Authorization-Type': 'v1',
    'Authorization': process.env.CHALLONGE_API_KEY
}

async function request(method, path, body = null){
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    })
    return res.json()
}

module.exports = { request }