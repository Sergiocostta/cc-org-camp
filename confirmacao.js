
(function () {
    function criarModal() {
        const overlay = document.createElement('div')
        overlay.id = 'overlay-confirmacao'
        overlay.className = 'overlay-confirmacao'
        overlay.innerHTML = `
            <div class="modal-confirmacao" role="alertdialog" aria-modal="true" aria-labelledby="titulo-confirmacao">
                <h2 id="titulo-confirmacao" class="modal-confirmacao-titulo"></h2>
                <p id="texto-confirmacao" class="modal-confirmacao-texto"></p>
                <div class="modal-confirmacao-acoes">
                    <button type="button" id="btn-confirmacao-cancelar" class="botao-sair">Cancelar</button>
                    <button type="button" id="btn-confirmacao-confirmar" class="botao-confirmar-perigo">Confirmar</button>
                </div>
            </div>
        `
        document.body.appendChild(overlay)
        return overlay
    }

    const overlay = criarModal()
    const titulo = overlay.querySelector('#titulo-confirmacao')
    const texto = overlay.querySelector('#texto-confirmacao')
    const btnCancelar = overlay.querySelector('#btn-confirmacao-cancelar')
    const btnConfirmar = overlay.querySelector('#btn-confirmacao-confirmar')

    let resolverAtual = null

    function fechar(resultado) {
        overlay.classList.remove('ativo')
        if (resolverAtual) {
            resolverAtual(resultado)
            resolverAtual = null
        }
    }

    btnCancelar.addEventListener('click', () => fechar(false))
    btnConfirmar.addEventListener('click', () => fechar(true))

    // Clicar fora do card cancela a ação
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fechar(false)
    })

    // Esc cancela a ação
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('ativo')) fechar(false)
    })

    window.confirmarAcao = function (mensagem, tituloTexto) {
        titulo.textContent = tituloTexto || 'Confirmar ação'
        texto.textContent = mensagem
        overlay.classList.add('ativo')
        btnCancelar.focus()

        return new Promise((resolve) => {
            resolverAtual = resolve
        })
    }
})()
