const titulo = document.getElementById('titulo')

const url = window.location.pathname.split('/').pop()
const torneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = torneios.find(t => t.tournament.url === url)

console.log(JSON.stringify(torneio, null, 8))
console.log(torneio.tournament.participants.length)
