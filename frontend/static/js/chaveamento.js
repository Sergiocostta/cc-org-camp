const titulo = document.getElementById('titulo')

const url = window.location.pathname.split('/').pop()
const listaTorneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = listaTorneios.find(t => t.tournament.url === url)
        
titulo.textContent = torneio.tournament.name

