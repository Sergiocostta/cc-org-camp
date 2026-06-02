document.getElementById('formulario-criacao').addEventListener('submit', async function(e){
    e.preventDefault()

    const tipo = document.getElementById('tipo-evento').value
    const nome = document.getElementById('nome-campeonato').value
    const modalidade = document.getElementById('modalidade').value
    const categoria = document.getElementById('categoria').value
    const qtdCompetidores = document.getElementById('qtd-competidores').value

    const resposta = await fetch('/criar-campeonato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, nome, modalidade, categoria, qtdCompetidores })
    })

})