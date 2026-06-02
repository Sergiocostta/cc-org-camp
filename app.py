from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
import os
import backend.services.database as db

db.criarDB()
db.tabelaUsuarios()

load_dotenv()
CHALLONGE_API_KEY = os.getenv('CHALLONGE_API_KEY')

app = Flask(__name__,
            static_folder='frontend/static',
            template_folder='frontend/templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    try: 
        dados = request.get_json()
        email = dados.get('email')
        senha = dados.get('senha')

        usuario = db.verificar_usuario(email, senha)
    except Exception as e:
        print(f"Erro ao processar login: {e}")
        return jsonify({'success': False, 'message': 'Erro ao processar login'}), 500

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/home')
def home():
    return render_template('home.html')


if __name__ == '__main__':
    app.run(debug=True)