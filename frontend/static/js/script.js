async function login() {

    const user = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    try{
        const resposta = await fetch('/login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: user, senha: senha })
        })

        const data = await resposta.json();

        if (resposta.ok) {
            localStorage.setItem('token', data.token);

            window.location.href = '/home'
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
    }
    

}