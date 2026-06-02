import psycopg
from psycopg import errors
from dotenv import load_dotenv
import os

load_dotenv()
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
NEW_DB_NAME = 'cc_org_camp'

def conectarDB():
    try:
        conn = psycopg.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=NEW_DB_NAME
        )
        conn.autocommit = True

        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

def criarDB():
    conn = conectarDB()
    cursor = conn.cursor()

    try:
        cursor.execute(f'CREATE DATABASE {NEW_DB_NAME};')
        print(f"Banco de dados '{NEW_DB_NAME}' criado com sucesso.")
    except errors.DuplicateDatabase:
        print(f"Banco de dados '{NEW_DB_NAME}' já existe.")
    finally:
        cursor.close()
        conn.close()

def tabelaUsuarios():
    conn = conectarDB()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL
            );
        ''')
        conn.commit()
    except Exception as e:
        print(f"Erro ao criar tabela 'usuarios': {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    criarDB()
    tabelaUsuarios()

def verificar_usuario(email, senha):
    conn = conectarDB()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM usuarios WHERE email = %s AND senha = %s', (email, senha))
        usuario = cursor.fetchone()
        return usuario
    except Exception as e:
        print(f"Erro ao verificar usuário: {e}")
        return None
    finally:
        cursor.close()
        conn.close()