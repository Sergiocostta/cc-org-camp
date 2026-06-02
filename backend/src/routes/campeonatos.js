const express = require('express');
const router = express.Router();
const { executar, buscarUm, buscarTodos } = require('../database');
const verificarToken = require('../middlewares/verificarToken');
const {
    criarTorneio,
    listarTorneios,
    iniciarTorneio,
    criarParticipante,
    listarParticipantes,
    listarPartidas
} = require('../services/challonge');

// UTILITÁRIO: embaralha array aleatoriamente 
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Lista todos os campeonatos do banco do usuário + status atualizado do Challonge
router.get('/', verificarToken, async (req, res) => { // <-- TOKEN AQUI
    const usuario_id = req.usuarioId; // <-- PEGA DO TOKEN, NÃO MAIS DA URL

    try {
        // Busca campeonatos salvos no banco local
        const campeonatos = await buscarTodos(
            `SELECT * FROM campeonatos WHERE usuario_id = ? ORDER BY criado_em DESC`,
            [usuario_id]
        );

        // Busca status atualizado do Challonge para sincronizar
        let torneiosChallonge = [];
        try {
            const resposta = await listarTorneios();
            torneiosChallonge = resposta.map(({ data }) => ({
                challonge_id: data.id,
                status: data.attributes.state,
                url: data.attributes.full_challonge_url,
            }));
        } catch {
            // Se Challonge falhar, retorna só os dados locais
        }

        // Mescla dados locais com status do Challonge
        const resultado = campeonatos.map(camp => {
            const challonge = torneiosChallonge.find(t => t.challonge_id === camp.challonge_id);
            return {
                ...camp,
                status:        challonge?.status  ?? camp.status,
                challonge_url: challonge?.url     ?? null,
            };
        });

        const em_andamento = resultado.filter(c => c.status !== 'complete' && c.status !== 'concluido');
        const concluidos   = resultado.filter(c => c.status === 'complete' || c.status === 'concluido');

        res.json({ em_andamento, concluidos });

    } catch (err) {
        console.error('[GET /campeonatos]', err.message);
        res.status(500).json({ erro: 'Erro ao listar campeonatos.' });
    }
});

// Detalhe de um campeonato com seus competidores e partidas
router.get('/:id', verificarToken, async (req, res) => { // <-- TOKEN AQUI
    const usuario_id = req.usuarioId;

    try {
        const campeonato = await buscarUm(
            'SELECT * FROM campeonatos WHERE id = ? AND usuario_id = ?', // Protegido para só o dono ver
            [req.params.id, usuario_id]
        );

        if (!campeonato)
            return res.status(404).json({ erro: 'Campeonato não encontrado ou acesso negado.' });

        // Busca competidores inscritos (com posição do sorteio)
        const competidores = await buscarTodos(
            `SELECT c.id, c.nome, i.posicao
             FROM competidores c
             JOIN inscricoes i ON i.competidor_id = c.id
             WHERE i.campeonato_id = ?
             ORDER BY i.posicao`,
            [req.params.id]
        );

        // Busca partidas salvas no banco
        const partidas = await buscarTodos(
            `SELECT p.*,
                    c1.nome AS competidor1_nome,
                    c2.nome AS competidor2_nome,
                    cv.nome AS vencedor_nome
             FROM partidas p
             LEFT JOIN competidores c1 ON c1.id = p.competidor1_id
             LEFT JOIN competidores c2 ON c2.id = p.competidor2_id
             LEFT JOIN competidores cv ON cv.id = p.vencedor_id
             WHERE p.campeonato_id = ?
             ORDER BY p.fase, p.id`,
            [req.params.id]
        );

        // Se tiver challonge_id, busca o bracket atualizado
        let bracket = null;
        if (campeonato.challonge_id) {
            try {
                const [partidasChallonge, participantes] = await Promise.all([
                    listarPartidas(campeonato.challonge_id),
                    listarParticipantes(campeonato.challonge_id)
                ]);

                const nomes = {};
                participantes.forEach(({ data }) => {
                    nomes[data.id] = data.attributes.name;
                });

                const porRodada = {};
                partidasChallonge.forEach(({ data }) => {
                    const attr   = data.attributes;
                    const rodada = attr.round;
                    if (!porRodada[rodada]) porRodada[rodada] = [];
                    porRodada[rodada].push({
                        id:            data.id,
                        rodada,
                        competidor1:   { id: attr.player1_id, nome: nomes[attr.player1_id] ?? 'A definir' },
                        competidor2:   { id: attr.player2_id, nome: nomes[attr.player2_id] ?? 'A definir' },
                        vencedor_id:   attr.winner_id,
                        vencedor_nome: nomes[attr.winner_id] ?? null,
                        estado:        attr.state,
                    });
                });

                const maxRodada = Math.max(...Object.keys(porRodada).map(Number));
                bracket = Object.keys(porRodada).map(Number).sort((a, b) => a - b).map(r => ({
                    rodada: r,
                    label:  r === maxRodada ? 'Final' : r === maxRodada - 1 ? 'Semifinal' : `Rodada ${r}`,
                    partidas: porRodada[r],
                }));
            } catch {
                // Challonge indisponível, usa partidas do banco local
            }
        }

        res.json({ ...campeonato, competidores, partidas, bracket });

    } catch (err) {
        console.error('[GET /campeonatos/:id]', err.message);
        res.status(500).json({ erro: 'Erro ao buscar campeonato.' });
    }
});

// Cria campeonato no banco SQLite e no Challonge ao mesmo tempo
router.post('/', verificarToken, async (req, res) => { // <-- TOKEN AQUI
    const { tipo_evento, nome, modalidade, categoria, quantidade_competidores } = req.body;
    const usuario_id = req.usuarioId; // <-- PEGA DO TOKEN 

    if (!tipo_evento || !nome || !modalidade || !quantidade_competidores)
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });

    if (quantidade_competidores < 2)
        return res.status(400).json({ erro: 'Mínimo de 2 competidores.' });

    try {
        // 1. Salva no banco local primeiro
        const nomeCompleto = [nome, modalidade, categoria].filter(Boolean).join(' — ');

        const resultado = await executar(
            `INSERT INTO campeonatos
             (usuario_id, tipo_evento, nome, modalidade, categoria, quantidade_competidores, status)
             VALUES (?, ?, ?, ?, ?, ?, 'em_andamento')`,
            [usuario_id, tipo_evento, nomeCompleto, modalidade, categoria ?? null, quantidade_competidores]
        );

        const campeonatoId = resultado.id;

        // 2. Cria no Challonge e salva o ID retornado
        let challongeId  = null;
        let challongeUrl = null;
        try {
            const resposta  = await criarTorneio(nomeCompleto, 'single elimination');
            challongeId     = resposta.data.id;
            challongeUrl    = resposta.data.attributes.full_challonge_url;

            // Salva o challonge_id no banco para usar depois
            await executar(
                'UPDATE campeonatos SET challonge_id = ? WHERE id = ?',
                [challongeId, campeonatoId]
            );
        } catch (err) {
            console.warn('[Challonge] Não foi possível criar no Challonge:', err.message);
            // Continua mesmo sem Challonge — dados ficam no banco local
        }

        res.status(201).json({
            mensagem:      'Campeonato criado com sucesso!',
            id:            campeonatoId,
            nome:          nomeCompleto,
            challonge_id:  challongeId,
            challonge_url: challongeUrl,
        });

    } catch (err) {
        console.error('[POST /campeonatos]', err.message);
        res.status(500).json({ erro: 'Erro ao criar campeonato.' });
    }
});

// Recebe lista de nomes → sorteia → salva no banco → envia pro Challonge
router.post('/:id/competidores', verificarToken, async (req, res) => { // <-- TOKEN AQUI
    const { competidores } = req.body; 

    if (!Array.isArray(competidores) || competidores.length < 2)
        return res.status(400).json({ erro: 'Envie ao menos 2 competidores.' });

    try {
        const campeonato = await buscarUm(
            'SELECT * FROM campeonatos WHERE id = ? AND usuario_id = ?',
            [req.params.id, req.usuarioId]
        );

        if (!campeonato)
            return res.status(404).json({ erro: 'Campeonato não encontrado ou acesso negado.' });

        // ── SORTEIO ALEATÓRIO ─────────────────────────────────────────────
        const sorteados = shuffle(competidores.map(n => n.trim()).filter(Boolean));

        const inseridos = [];

        for (let i = 0; i < sorteados.length; i++) {
            const nome = sorteados[i];

            // Salva competidor no banco
            const comp = await executar(
                'INSERT INTO competidores (nome) VALUES (?)',
                [nome]
            );

            // Salva inscrição com posição do sorteio
            await executar(
                'INSERT INTO inscricoes (campeonato_id, competidor_id, posicao) VALUES (?, ?, ?)',
                [req.params.id, comp.id, i + 1]
            );

            inseridos.push({ id: comp.id, nome, posicao: i + 1 });
        }

        // ── ENVIA PRO CHALLONGE (se tiver challonge_id) ───────────────────
        let challongeOk = false;
        if (campeonato.challonge_id) {
            try {
                for (const comp of inseridos) {
                    await criarParticipante(campeonato.challonge_id, comp.nome);
                }
                // Inicia o torneio no Challonge (gera bracket oficial)
                await iniciarTorneio(campeonato.challonge_id);
                challongeOk = true;
            } catch (err) {
                console.warn('[Challonge] Erro ao inserir participantes:', err.message);
            }
        }

        // ── GERA PARTIDAS DA PRIMEIRA RODADA NO BANCO LOCAL ───────────────
        for (let i = 0; i < inseridos.length - 1; i += 2) {
            const c1 = inseridos[i];
            const c2 = inseridos[i + 1] ?? null;

            await executar(
                `INSERT INTO partidas
                 (campeonato_id, competidor1_id, competidor2_id, fase, status)
                 VALUES (?, ?, ?, 'Primeira fase', 'pendente')`,
                [req.params.id, c1.id, c2?.id ?? null]
            );
        }

        res.status(201).json({
            mensagem:     `${inseridos.length} competidores inscritos e chaves sorteadas!`,
            sorteio:      inseridos.map(c => c.nome),
            competidores: inseridos,
            challonge_sincronizado: challongeOk,
        });

    } catch (err) {
        console.error('[POST /campeonatos/:id/competidores]', err.message);
        res.status(500).json({ erro: 'Erro ao inserir competidores.' });
    }
});

// Atualiza status do campeonato no banco (ex: concluir)
router.patch('/:id/status', verificarToken, async (req, res) => { // <-- TOKEN AQUI
    const { status } = req.body;
    const statusValidos = ['em_andamento', 'concluido', 'cancelado'];

    if (!statusValidos.includes(status))
        return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });

    try {
        await executar(
            'UPDATE campeonatos SET status = ? WHERE id = ? AND usuario_id = ?',
            [status, req.params.id, req.usuarioId]
        );
        res.json({ mensagem: 'Status atualizado.' });
    } catch (err) {
        console.error('[PATCH /campeonatos/:id/status]', err.message);
        res.status(500).json({ erro: 'Erro ao atualizar status.' });
    }
});

module.exports = router;