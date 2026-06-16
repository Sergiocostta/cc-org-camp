// Funções auxiliares para mensagens
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

// Lógica de força da senha
const calcularForcaSenha = (senha) => {
    let forca = 0
    if (senha.length >= 8) forca += 25
    if (/[A-Z]/.test(senha)) forca += 25
    if (/[0-9]/.test(senha)) forca += 25
    if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) forca += 25
    return forca
}

const atualizarIndicadorForca = (senha) => {
    const container = document.getElementById('forca-senha')
    const progresso = document.getElementById('progresso-forca')
    const texto = document.getElementById('texto-forca')

    if (!senha) {
        container.style.display = 'none'
        return
    }

    container.style.display = 'block'
    const forca = calcularForcaSenha(senha)
    progresso.style.width = `${forca}%`

    if (forca <= 25) {
        progresso.style.backgroundColor = '#ff4d4d'; texto.textContent = 'Senha fraca'
    } else if (forca <= 50) {
        progresso.style.backgroundColor = '#ffa64d'; texto.textContent = 'Senha razoável'
    } else if (forca <= 75) {
        progresso.style.backgroundColor = '#ffff4d'; texto.textContent = 'Senha boa'
    } else {
        progresso.style.backgroundColor = '#4dff4d'; texto.textContent = 'Senha forte'
    }
}

const validarForcaSenha = (senha) => {
    if (senha.length < 8) return "A senha deve ter pelo menos 8 caracteres."
    if (!/[A-Z]/.test(senha)) return "A senha deve conter pelo menos uma letra maiúscula."
    if (!/[a-z]/.test(senha)) return "A senha deve conter pelo menos uma letra minúscula."
    if (!/[0-9]/.test(senha)) return "A senha deve conter pelo menos um número."
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter pelo menos um caractere especial."
    return null
}

// Listener para atualizar a barra enquanto o usuário digita
document.getElementById('senha').addEventListener('input', (e) => {
    atualizarIndicadorForca(e.target.value)
})

document.getElementById('formulario-cadastro').addEventListener('submit', async function (e) {
    e.preventDefault();
    limparMensagens(); // Limpa mensagens anteriores

    const nome = document.getElementById('nome').value
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    // Validação de campos vazios
    if (!nome || !email || !senha) {
        exibirMensagem('mensagem-erro', 'Preencha todos os campos.', 'error')
        return
    }

    // Validação de senha
    const erroSenha = validarForcaSenha(senha)
    if (erroSenha) {
        exibirMensagem('mensagem-erro', erroSenha, 'error')
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
            exibirMensagem('mensagem-sucesso', data.message || 'Cadastro realizado!', 'success')
            setTimeout(() => window.location.href = '/', 1500)
        } else {
            exibirMensagem('mensagem-erro', data.message || 'Erro no cadastro', 'error')
        }
    } catch (error) {
        exibirMensagem('mensagem-erro', 'Erro de conexão com o servidor.', 'error')
    }
})
