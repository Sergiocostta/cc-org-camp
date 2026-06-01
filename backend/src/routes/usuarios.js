const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { executar, buscarUm } = require('../database');

//usuarios/cadastrar
router.post('/cadastrar', async (req, res) => {
    const { usuario, email, senha } = req.body;

    if (!usuario || !email || !senha) {
        return res.status(400).json({ erro: 'Usuário, e-mail e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    try {
// Verifica se usuário ou email já existe
        const jaExiste = await buscarUm(
            'SELECT id FROM usuarios WHERE usuario = ? OR email = ?',
            [usuario, email]
        );

        if (jaExiste) {
            return res.status(409).json({ erro: 'Usuário ou e-mail já cadastrado.' });
        }

// Criptografa a senha antes de salvar
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const resultado = await executar(
            'INSERT INTO usuarios (usuario, email, senha) VALUES (?, ?, ?)',
            [usuario, email, senhaCriptografada]
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.id,
            usuario,
            email
        });

    } catch (err) {
        console.error('[POST /usuarios/cadastrar]', err.message);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
});

//usuarios/login
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
    }

    try {
// Busca pelo usuário ou pelo e-mail (aceita os dois)
        const encontrado = await buscarUm(
            'SELECT * FROM usuarios WHERE usuario = ? OR email = ?',
            [usuario, usuario]
        );

        if (!encontrado) {
            return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, encontrado.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
        }

        res.json({
            mensagem: 'Login realizado com sucesso!',
            id: encontrado.id,
            usuario: encontrado.usuario,
            email: encontrado.email
        });

    } catch (err) {
        console.error('[POST /usuarios/login]', err.message);
        res.status(500).json({ erro: 'Erro ao realizar login.' });
    }
});

module.exports = router;