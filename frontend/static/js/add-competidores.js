const h1 = document.getElementById('titulo-torneio')
const url = window.location.pathname.split('/')[2]
const torneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = torneios.find(t => t.tournament.url === url)


h1.innerText = torneio.tournament.name