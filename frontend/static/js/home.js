async function carregarTorneios(){
    try {
        const listaTorneios = JSON.parse(sessionStorage.getItem('torneios'))

        const containerEmAndamento = document.getElementById('lista-em-andamento')
        const containerConcluidos = document.getElementById('lista-concluidos')
        
        const concluidos = []
        const emAndamento = []

        listaTorneios.forEach(torneio => {
            if (
                torneio.tournament.state === 'complete'
            ) {
                concluidos.push(torneio)
            } else {
                emAndamento.push(torneio)
            }
        })

        if (emAndamento.length > 0){
            containerEmAndamento.innerHTML = ''
        } else {
            containerEmAndamento.textContent = 'Sem campeonatos em andamento'
        }
        if (concluidos.length > 0){
            containerConcluidos.innerHTML = ''
        } else {
            containerConcluidos.textContent = 'Sem campeonatos concluídos'
        }

        
        emAndamento.forEach(torneio => {
            containerEmAndamento.innerHTML += `
                <a href="/torneios/${torneio.tournament.url}">
                    <h3>${torneio.tournament.id}. ${torneio.tournament.name}</h3>
                </a>
            `
        })

        concluidos.forEach(torneio => {
            containerConcluidos.innerHTML += `
                <a href="/torneios/${torneio.tournament.url}">
                    <h3>${torneio.tournament.id}. ${torneio.tournament.name}</h3>
                </a>
            `
        })


    } catch (error) {
        console.error('Erro ao carregar torneios:', error)
    }
}

carregarTorneios()