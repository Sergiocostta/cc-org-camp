// Middleware simples para validar token no formato "Bearer <usuarioId>"
module.exports = function verificarToken(req, res, next) {
    const auth = req.headers['authorization'] || req.headers['Authorization'] || req.headers['Authorization-Type'];
    if (!auth) return res.status(401).json({ erro: 'Token não informado.' });

    const parts = auth.split(' ');
    // aceita tanto 'Bearer 123' quanto somente '123'
    const token = parts.length === 2 ? parts[1] : parts[0];

    // aqui o token é tratado como o id do usuário (apenas para desenvolvimento)
    const usuarioId = Number(token);
    if (!usuarioId || Number.isNaN(usuarioId)) {
        return res.status(401).json({ erro: 'Token inválido.' });
    }

    req.usuarioId = usuarioId;
    next();
}
