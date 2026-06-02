async function carregarTorneios(){
    try {
        const resposta = await fetch('/torneios');
        const torneios = await resposta.json();
        
        alert(JSON.stringify(torneios));

    } catch (error) {
        console.error('Erro ao carregar torneios:', error);
    }
}

carregarTorneios()