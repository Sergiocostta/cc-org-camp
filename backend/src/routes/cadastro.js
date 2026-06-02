const formulario = document.getElementById('formulario-cadastro');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dados = {
        usuario: document.getElementById('novo-usuario').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('nova-senha').value
    };

    try {
        const resposta = await fetch('http://localhost:3000/usuarios/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'index.html';
        } else {
            const erro = await resposta.json();
            alert('Erro ao cadastrar: ' + erro.message);
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Não foi possível conectar ao servidor.');
    }
});