const h1 = document.getElementById('titulo-torneio')
const url = window.location.pathname.split('/')[2]
const torneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = torneios.find(t => t.tournament.url === url)
const lista = document.getElementById('inserir-competidores-container')

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

function mostrarErro(mensagem) {
    const msgErro = document.getElementById('msg-erro')
    const msgSucesso = document.getElementById('msg-sucesso')

    msgSucesso.style.display = 'none'
    msgErro.style.display = 'block'
    msgErro.textContent = mensagem
}

function mostrarSucesso(mensagem) {
    const msgErro = document.getElementById('msg-erro')
    const msgSucesso = document.getElementById('msg-sucesso')

    msgErro.style.display = 'none'
    msgSucesso.style.display = 'block'
    msgSucesso.textContent = mensagem
}

function addCompetidores() {
    const inputNome = document.getElementById('nome-competidor')
    const nome = inputNome.value.trim()

    if (!nome) {
        mostrarErro('Digite o nome do competidor antes de adicionar.')
        inputNome.focus()
        return
    }

    const nomeJaExiste = competidores.some(function(competidor) {
        return competidor.toLowerCase() === nome.toLowerCase()
    })

    if (nomeJaExiste) {
        mostrarErro('Esse competidor já foi adicionado.')
        inputNome.focus()
        return
    }

    competidores.push(nome)
    inputNome.value = ''
    inputNome.focus()

    renderizarLista()
    mostrarSucesso('Competidor adicionado com sucesso.')
}

function removerCompetidor(index) {
    competidores.splice(index, 1)
    renderizarLista()
    mostrarSucesso('Competidor removido com sucesso.')
}

document.getElementById('nome-competidor').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault()
        addCompetidores()
    }
})

document.getElementById('formulario-competidores').addEventListener('submit', async function(e) {
    e.preventDefault()

    if (competidores.length < 2) {
        mostrarErro('Adicione pelo menos 2 competidores.')
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

        await iniciar.json()

        if (iniciar.ok) {
            const listaTorneios = JSON.parse(sessionStorage.getItem('torneios'))
            const torneio = listaTorneios.find(t => t.tournament.url === url)

            torneio.tournament.state = 'in_progress'
            torneio.tournament.participants = data.participantes

            sessionStorage.setItem('torneios', JSON.stringify(listaTorneios))
            window.location.href = `/torneios/${url}`
        }
    } else {
        mostrarErro(data.message)
    }
})