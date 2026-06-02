async function carregarTorneios(){
    try {
        const resposta = await fetch('/torneios')
        const listaTorneios = await resposta.json()

        const containerEmAndamento = document.getElementById('lista-em-andamento')
        const containerConcluidos = document.getElementById('lista-concluidos')
        
        
        const emAndamentos = []
        const concluidos = []


    } catch (error) {
        console.error('Erro ao carregar torneios:', error)
    }
}

carregarTorneios()