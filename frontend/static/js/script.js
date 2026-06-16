const exibirMensagem = (id, mensagem, status) => {
    const el = document.getElementById(id)
    if (!el) return
    el.textContent = mensagem
    el.style.display = 'block'
    el.classList.toggle('mensagem-sucesso', status === 'success')
    el.classList.toggle('mensagem-erro', status === 'error')
}

const limparMensagens = () => {
    const erros = document.querySelectorAll('.mensagem-erro, .mensagem-sucesso')
    erros.forEach(el => el.style.display = 'none')
}

document.getElementById('formulario-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    limparMensagens()

    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    try {
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await resposta.json()

        if (resposta.ok) {
            sessionStorage.clear()

            const listaTorneios = await fetch('/req')
            const torneios = await listaTorneios.json()

            sessionStorage.setItem('torneios', JSON.stringify(torneios))
            window.location.href = '/home'
        } else {
            exibirMensagem('mensagem-erro', data.message || 'Erro ao fazer login', 'error')
        }
    } catch (error) {
        exibirMensagem('mensagem-erro', 'Não foi possível conectar. Tente novamente.', 'error')
    }
});
