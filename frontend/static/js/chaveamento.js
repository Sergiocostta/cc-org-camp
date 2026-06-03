const titulo = document.getElementById('titulo')

const url = window.location.pathname.split('/').pop()
const torneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = torneios.find(t => t.tournament.url === url)

