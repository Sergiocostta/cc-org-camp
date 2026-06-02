document.getElementById('formulario-login').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const resposta = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    const data = await resposta.json();

    if (resposta.ok) {
        window.location.href = '/home';
    } else {
        alert(data.message);
    }
});