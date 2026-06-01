const express = require('express');
const router = express.Router();
const {
  listarTorneios,
  criarTorneio,
  listarParticipantes,
  criarParticipante,
  listarPartidas,
  iniciarTorneio,
} = require('../services/challonge');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

router.get('/', async (req, res) => {
  try {
    const torneios = await listarTorneios();
    const formatados = torneios.map(({ data }) => ({
      id:            data.id,
      nome:          data.attributes.name,
      tipo:          data.attributes.tournament_type,
      status:        data.attributes.state,
      participantes: data.attributes.participants_count,
      criado_em:     data.attributes.created_at,
      url:           data.attributes.full_challonge_url,
    }));
    const em_andamento = formatados.filter(t => t.status === 'underway' || t.status === 'pending');
    const concluidos   = formatados.filter(t => t.status === 'complete');
    res.json({ em_andamento, concluidos });
  } catch (err) {
    res.status(500).json({ erro: 'Não foi possível carregar os torneios.' });
  }
});

router.post('/', async (req, res) => {
  const { nome, tipo, modalidade, categoria } = req.body;
  if (!nome || !tipo) return res.status(400).json({ erro: 'Nome e tipo são obrigatórios.' });
  try {
    const nomeCompleto = [nome, modalidade, categoria].filter(Boolean).join(' — ');
    const resposta = await criarTorneio(nomeCompleto, 'single elimination');
    const torneio  = resposta.data;
    res.status(201).json({
      id:     torneio.id,
      nome:   torneio.attributes.name,
      tipo:   torneio.attributes.tournament_type,
      status: torneio.attributes.state,
      url:    torneio.attributes.full_challonge_url,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar torneio no Challonge.' });
  }
});

router.get('/:id/participantes', async (req, res) => {
  try {
    const participantes = await listarParticipantes(req.params.id);
    const formatados = participantes.map(({ data }) => ({
      id:   data.id,
      nome: data.attributes.name,
      seed: data.attributes.seed,
    }));
    res.json(formatados);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar participantes.' });
  }
});

router.post('/:id/participantes', async (req, res) => {
  const { competidores } = req.body;
  if (!Array.isArray(competidores) || competidores.length < 2)
    return res.status(400).json({ erro: 'Envie ao menos 2 competidores.' });
  try {
    const sorteados = shuffle(competidores);
    const inseridos = [];
    for (let i = 0; i < sorteados.length; i++) {
      const nome = sorteados[i].trim();
      if (!nome) continue;
      const resposta = await criarParticipante(req.params.id, nome);
      inseridos.push({
        id:   resposta.data.id,
        nome: resposta.data.attributes.name,
        seed: i + 1,
      });
    }
    res.status(201).json({
      mensagem:      `${inseridos.length} competidores inseridos com sorteio realizado.`,
      sorteio:       inseridos.map(c => c.nome),
      participantes: inseridos,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao inserir competidores.' });
  }
});

router.get('/:id/partidas', async (req, res) => {
  try {
    const [partidas, participantes] = await Promise.all([
      listarPartidas(req.params.id),
      listarParticipantes(req.params.id),
    ]);
    const nomes = {};
    participantes.forEach(({ data }) => { nomes[data.id] = data.attributes.name; });
    const porRodada = {};
    partidas.forEach(({ data }) => {
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
    const bracket = Object.keys(porRodada).map(Number).sort((a, b) => a - b).map(rodada => ({
      rodada,
      label:   rodada === maxRodada ? 'Final' : rodada === maxRodada - 1 ? 'Semifinal' : `Rodada ${rodada}`,
      partidas: porRodada[rodada],
    }));
    res.json({ torneio_id: req.params.id, bracket });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar bracket.' });
  }
});

router.post('/:id/iniciar', async (req, res) => {
  try {
    await iniciarTorneio(req.params.id);
    res.json({ mensagem: 'Torneio iniciado! Bracket gerado.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao iniciar torneio.' });
  }
});

module.exports = router;