document.getElementById('formulario-cadastro').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value
    
    const resposta = await fetch('/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    })

    const data = await resposta.json()

    if (resposta.ok) {
        alert(data.message)
        window.location.href = '/'
    } else {
        alert(data.message)
    }
})
