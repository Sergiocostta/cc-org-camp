const titulo = document.getElementById('titulo')
const url = window.location.pathname.split('/').pop()
const torneios = JSON.parse(sessionStorage.getItem('torneios'))
const torneio = torneios.find(t => t.tournament.url === url)

titulo.innerText = torneio.tournament.name

const participantes = {}
torneio.tournament.participants.forEach(p => {
    participantes[p.participant.id] = p.participant.name
})

async function carregarChaveamento() {
    const resposta = await fetch(`/torneios/${url}/partidas`)
    const partidas = await resposta.json()

    const container = document.querySelector('.chaveamento-container')
    container.innerHTML = ''

    const rodadas = {}
    partidas.forEach(p => {
        const r = p.match.round
        if (!rodadas[r]) rodadas[r] = []
        rodadas[r].push(p.match)
    })

    for (const [rodada, jogos] of Object.entries(rodadas)) {
        const fase = document.createElement('div')
        fase.className = 'fase-torneio'
        fase.innerHTML = `<h3>Rodada ${rodada}</h3>`

        jogos.forEach(jogo => {
            const player1 = participantes[jogo.player1_id] || 'A definir'
            const player2 = participantes[jogo.player2_id] || 'A definir'
            const concluido = jogo.state === 'complete'

            fase.innerHTML += `
                <div class="card-jogo">
                    <form onsubmit="salvarPlacar(event, '${jogo.id}', ${jogo.player1_id}, ${jogo.player2_id})">
                        <div class="linha-time">
                            <span>${player1}</span>
                            <input type="number" name="placar1" min="0" class="entrada-placar" ${concluido ? 'disabled' : ''} required>
                        </div>
                        <div class="divisor-vs">VS</div>
                        <div class="linha-time">
                            <span>${player2}</span>
                            <input type="number" name="placar2" min="0" class="entrada-placar" ${concluido ? 'disabled' : ''} required>
                        </div>
                        <button type="submit" class="botao-salvar-placar" ${concluido ? 'disabled' : ''}>
                            ${concluido ? 'Concluído' : 'Salvar Placar'}
                        </button>
                    </form>
                </div>
            `
        })

        container.appendChild(fase)
    }
}

async function salvarPlacar(e, jogoId, player1Id, player2Id) {
    e.preventDefault()
    const form = e.target
    const placar1 = parseInt(form.placar1.value)
    const placar2 = parseInt(form.placar2.value)
    const winnerId = placar1 > placar2 ? player1Id : player2Id

    const resposta = await fetch(`/torneios/${url}/partidas/${jogoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            winner_id: winnerId,
            scores_csv: `${placar1}-${placar2}`
        })
    })

    if (resposta.ok) {
        await carregarChaveamento()
    }
}

carregarChaveamento()