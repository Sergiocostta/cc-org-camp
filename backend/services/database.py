import psycopg
import os
from psycopg.rows import dict_row

DATABASE_URL = os.getenv('DATABASE_URL')



def conectarDB():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def criarDB():
    gerarTabelas()


def tabelaUsuarios():
    with conectarDB() as conn:
        try:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    senha TEXT NOT NULL
                );
            ''')
            conn.commit()
        except Exception as e:
            print(f"Erro ao criar tabela 'usuarios': {e}")


def tabelaCampeonatos():
    with conectarDB() as conn:
        try: 
            conn.execute('''
                CREATE TABLE IF NOT EXISTS campeonatos (
                    id SERIAL PRIMARY KEY,
                    url_api TEXT,
                    user_id INTEGER,
                    FOREIGN KEY (user_id) REFERENCES usuarios(id)
                )
            ''')
            conn.commit()
        except Exception as e:
            print(f"Erro ao criar tabela 'campeonatos': {e}")


def gerarTabelas():
    tabelaUsuarios()
    tabelaCampeonatos()


def usuarioExiste(email):
    with conectarDB() as conn:
        try:
            cursor = conn.execute(
                'SELECT * FROM usuarios WHERE email = %s',
                (email,)
            )
            return cursor.fetchone() is not None
        
        except Exception as e:
            print(f"Erro ao verificar existência do usuário: {e}")
            return False


def cadastrar_usuario(nome, email, senha):
    with conectarDB() as conn:
        try:
            conn.execute(
                'INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)',
                (nome, email, senha)
            )
            conn.commit()
            return True
        except psycopg.errors.UniqueViolation:
            print(f"Erro: O email '{email}' já está cadastrado.")
            return False
        except Exception as e:
            print(f"Erro ao cadastrar usuário: {e}")
            return False


def verificar_usuario(email, senha):
    with conectarDB() as conn:
        try:
            cursor = conn.execute(
                'SELECT * FROM usuarios WHERE email = %s AND senha = %s',
                (email, senha)
            )
            return cursor.fetchone()
        except Exception as e:
            print(f"Erro ao verificar usuário: {e}")
            return None


def novo_campeonato(userId, url):
    with conectarDB() as conn:
        try:
            conn.execute(
                'INSERT INTO campeonatos (url_api, user_id) VALUES (%s, %s)',
                (url, userId)
            )
            conn.commit()
            return True
        
        except Exception as e:
            print(f"Erro ao criar campeonato: {e}")
            return False

def filtrar_campeonatos(userId):
    with conectarDB() as conn:
        try:
            cursor = conn.execute(
                'SELECT url_api FROM campeonatos WHERE user_id = %s',
                (userId,)
            )
            return [row['url_api'] for row in cursor.fetchall()]
        
        except Exception as e:
            print(f'Erro ao filtrar os campeonatos: {e}')
            return False
