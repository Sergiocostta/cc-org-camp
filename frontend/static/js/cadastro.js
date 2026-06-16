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

document.getElementById('formulario-cadastro').addEventListener('submit', async function(e) {
    e.preventDefault();
    limparMensagens()

    const nome = document.getElementById('nome').value
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    if (!nome || !email || !senha) {
        exibirMensagem('mensagem-erro', 'Preencha todos os campos antes de prosseguir.', 'error')
        return
    }

    try {
        const resposta = await fetch('/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        })

        const data = await resposta.json()

        if (resposta.ok) {
            exibirMensagem('mensagem-sucesso', data.message || 'Cadastro realizado com sucesso', 'success')
            setTimeout(() => window.location.href = '/', 1200)
        } else {
            exibirMensagem('mensagem-erro', data.message || 'Não foi possível concluir o cadastro', 'error')
        }
    } catch (error) {
        exibirMensagem('mensagem-erro', 'Não foi possível conectar. Tente novamente.', 'error')
    }
})
