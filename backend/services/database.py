import sqlite3

DB_NAME = 'cc_org_camp.db'


def conectarDB():
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None


def criarDB():
    gerarTabelas()
    print(f"Banco de dados '{DB_NAME}' pronto.")


def tabelaUsuarios():
    with conectarDB() as conn:
        try:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS usuarios (
                    id    INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome  TEXT    NOT NULL,
                    email TEXT    UNIQUE NOT NULL,
                    senha TEXT    NOT NULL
                );
            ''')
            conn.commit()
        except Exception as e:
            print(f"Erro ao criar tabela 'usuarios': {e}")

def gerarTabelas():
    tabelaUsuarios()

def usuarioExiste(email):
    with conectarDB() as conn:
        try:
            cursor = conn.execute(
                'SELECT * FROM usuarios WHERE email = ?',
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
                'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                (nome, email, senha)
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            print(f"Erro: O email '{email}' já está cadastrado.")
            return False
        except Exception as e:
            print(f"Erro ao cadastrar usuário: {e}")
            return False


def verificar_usuario(email, senha):
    with conectarDB() as conn:
        try:
            cursor = conn.execute(
                'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
                (email, senha)
            )
            return cursor.fetchone()
        except Exception as e:
            print(f"Erro ao verificar usuário: {e}")
            return None


if __name__ == "__main__":
    criarDB()