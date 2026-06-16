/* =============================================================================
   TEMA — toggle claro / escuro
   ============================================================================= */

(function () {
    // Aplica o tema salvo ANTES de renderizar (evita flash)
    const temasSalvo = localStorage.getItem('tema');
    if (temasSalvo) {
        document.documentElement.setAttribute('data-theme', temasSalvo);
    }
})();

function criarBotaoTema() {
    const btn = document.createElement('button');
    btn.className = 'botao-tema';
    btn.setAttribute('aria-label', 'Alternar tema');
    btn.setAttribute('title', 'Alternar tema claro/escuro');

    function atualizarIcone() {
        const escuro = document.documentElement.getAttribute('data-theme') === 'dark';
        btn.textContent = escuro ? '☀️' : '🌙';
    }

    btn.addEventListener('click', () => {
        const atual = document.documentElement.getAttribute('data-theme');
        const novo = atual === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', novo);
        localStorage.setItem('tema', novo);
        atualizarIcone();
    });

    atualizarIcone();
    return btn;
}

// Injeta o botão na navegação do header (se existir)
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.navegacao-usuario');
    if (nav) {
        nav.prepend(criarBotaoTema());
        return;
    }

    // Fallback: login/cadastro — canto superior direito
    const container = document.querySelector('.login-container, .cadastro-container');
    if (container) {
        container.style.position = 'relative';
        const btn = criarBotaoTema();
        btn.style.cssText = 'position:absolute;top:16px;right:16px;';
        container.appendChild(btn);
    }
});