document.getElementById('formulario-criacao').addEventListener('submit', async function(e){
    e.preventDefault()

    const tipo = document.getElementById('tipo-evento').value
    const nome = document.getElementById('nome-campeonato').value
    const modalidade = document.getElementById('modalidade').value
    const categoria = document.getElementById('categoria').value
    const qtdCompetidores = document.getElementById('qtd-competidores').value

    const nomeCompleto = `${nome} — ${modalidade} — ${categoria}`

    const url = nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    + '_' + Date.now()

    const resposta = await fetch('/criar-campeonato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nomeCompleto, url, tipo, qtdCompetidores })
    })

    const data = await resposta.json()
    if (resposta.ok) {
        const torneiosAtuais = JSON.parse(sessionStorage.getItem('torneios')) || []
        
        torneiosAtuais.push({
            tournament: {
                name: nomeCompleto,
                url: url,
                state: 'pending',
                participants: [],
                participants_count: 0,
                tournament_type: 'single elimination'
            }
        })

        sessionStorage.setItem('torneios', JSON.stringify(torneiosAtuais))
        window.location.href = '/home'
    }
})
