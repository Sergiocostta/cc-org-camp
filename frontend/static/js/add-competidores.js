const h1 = document.getElementById('titulo-torneio')
const url = window.location.pathname.split('/')[2]
const torneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = torneios.find(t => t.tournament.url === url)
const lista = document.getElementById('inserir-competidores-container')
const qtdMax = torneio.tournament.signup_cap || 64

let competidores = []

h1.innerText = torneio.tournament.name

function renderizarLista() {
    lista.innerHTML = ''
    competidores.forEach((nome, index) => {
        lista.innerHTML += `
            <div class="linha-competidor">
                <span class="num-competidor">${index + 1}</span>
                <input class="entrada-campo" value="${nome}" readonly>
                <button type="button" class="btn-remover" onclick="removerCompetidor(${index})">×</button>
            </div>
        `
    })
}

function addCompetidores() {
    const nome = window.prompt('Digite o nome do atleta:')
    if (nome && nome.trim()) {
        competidores.push(nome.trim())
        renderizarLista()
    }
}

function removerCompetidor(index) {
    competidores.splice(index, 1)
    renderizarLista()
}

document.getElementById('formulario-competidores').addEventListener('submit', async function(e) {
    e.preventDefault()

    if (competidores.length < 2) {
        document.getElementById('msg-erro').style.display = 'block'
        document.getElementById('msg-erro').textContent = 'Adicione pelo menos 2 competidores.'
        return
    }

    const resposta = await fetch(`/torneios/${url}/participantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantes: competidores })
    })

    const data = await resposta.json()

    if (resposta.ok) {
        const iniciar = await fetch(`/torneios/${url}/iniciar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })

        const dataIniciar = await iniciar.json()

        if (iniciar.ok) {
            const torneios = await fetch('/req')
            const listaTorneios = await torneios.json()
            sessionStorage.setItem('torneios', JSOHN.stringify(listaTorneios))

            window.location.href = `/torneios/${url}`
        }
    }
    else {
        document.getElementById('msg-erro').style.display = 'block'
        document.getElementById('msg-erro').textContent = data.message
    }
})