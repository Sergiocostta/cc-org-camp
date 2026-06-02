from flask import Flask, render_template, jsonify, request, session, redirect
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

app.secret_key = 'cc-org-camp'

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

        if usuario:
            session['user_id'] = usuario['id']
            session['usuario_nome'] = usuario['nome']
            session['usuario_email'] = usuario['email']

            return jsonify({'success': True}), 200
        
        return jsonify({'success': False, 'message': 'Email ou senha incorretos'}), 401
    except Exception as e:
        print(f"Erro ao processar login: {e}")
        return jsonify({'success': False, 'message': 'Erro ao processar login'}), 500

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/home')
def home():
    if 'user_id' not in session:
        return redirect('/')
    
    return render_template('home.html', usuario=session.get('usuario_nome'))


if __name__ == '__main__':
    app.run(debug=True)