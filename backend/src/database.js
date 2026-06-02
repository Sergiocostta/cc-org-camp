const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Define o caminho para o arquivo do banco de dados SQLite
const caminhoBanco = path.join(__dirname, '..', 'campeonatos.sqlite');

const db = new sqlite3.Database(caminhoBanco, (erro) => {
    if (erro) {
        console.error('Erro ao conectar no banco:', erro.message);
        return;
    }

    console.log('Banco SQLite conectado:', caminhoBanco);
});

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS campeonatos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            tipo_evento TEXT NOT NULL,
            nome TEXT NOT NULL,
            modalidade TEXT NOT NULL,
            categoria TEXT,
            quantidade_competidores INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'em_andamento',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS competidores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS inscricoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campeonato_id INTEGER NOT NULL,
            competidor_id INTEGER NOT NULL,
            posicao INTEGER NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (campeonato_id)
                REFERENCES campeonatos(id)
                ON DELETE CASCADE,

            FOREIGN KEY (competidor_id)
                REFERENCES competidores(id)
                ON DELETE CASCADE,

            UNIQUE (campeonato_id, posicao)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS partidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campeonato_id INTEGER NOT NULL,
            competidor1_id INTEGER NOT NULL,
            competidor2_id INTEGER,
            placar1 INTEGER,
            placar2 INTEGER,
            vencedor_id INTEGER,
            fase TEXT NOT NULL DEFAULT 'Primeira fase',
            status TEXT NOT NULL DEFAULT 'pendente',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (campeonato_id)
                REFERENCES campeonatos(id)
                ON DELETE CASCADE,

            FOREIGN KEY (competidor1_id)
                REFERENCES competidores(id),

            FOREIGN KEY (competidor2_id)
                REFERENCES competidores(id),

            FOREIGN KEY (vencedor_id)
                REFERENCES competidores(id)
        )
    `);
});

function executar(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, parametros, function (erro) {
            if (erro) {
                reject(erro);
                return;
            }

            resolve({ id: this.lastID, alteracoes: this.changes });
        });
    });
}

function buscarUm(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, parametros, (erro, linha) => {
            if (erro) {
                reject(erro);
                return;
            }

            resolve(linha);
        });
    });
}

function buscarTodos(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, parametros, (erro, linhas) => {
            if (erro) {
                reject(erro);
                return;
            }

            resolve(linhas);
        });
    });
}

module.exports = {
    db,
    executar,
    buscarUm,
    buscarTodos
};
