from flask import Flask, render_template, jsonify, request, session, redirect
import backend.services.database as db
import backend.services.challonge as api

db.criarDB()


app = Flask(__name__,
            static_folder='frontend/static',
            template_folder='frontend/templates')

app.secret_key = 'cc-org-camp'

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect('/home')

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

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')


@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        try:
            dados = request.get_json()
            nome = dados.get('nome')
            email = dados.get('email')
            senha = dados.get('senha')

            if db.usuarioExiste(email):
                return jsonify({'success': False, 'message': 'Email já cadastrado'}), 400

            if db.cadastrar_usuario(nome, email, senha):
                return jsonify({'success': True, 'message': 'Usuário cadastrado com sucesso'}), 201
            else:
                return jsonify({'success': False, 'message': 'Erro ao cadastrar usuário'}), 500


        except Exception as e:
            print(f"Erro ao processar cadastro: {e}")
            return jsonify({'success': False, 'message': 'Erro ao processar cadastro'}), 500

    return render_template('cadastro.html')

@app.route('/torneios')
def listar_torneios():
    try:
        torneios = api.listar_torneios()
        return jsonify(torneios.json()), torneios.status_code
    
    except Exception as e:
        print(f"Erro ao listar torneios: {e}")
        return jsonify({'success': False, 'message': 'Erro ao listar torneios'}), 500

@app.route('/home')
def home():
    if 'user_id' not in session:
        return redirect('/')
    
    return render_template('home.html', usuario=session.get('usuario_nome'))

@app.route('/criar-campeonato', methods=['GET', 'POST'])
def criar_campeonato():
    if 'user_id' not in session:
        return redirect('/')
    
    if request.method == 'POST':
        try:
            dados = request.get_json()
            userId = session.get('user_id')




        except Exception as e:
            print(f"Erro ao processar criação de campeonato: {e}")
            return jsonify({'success': False, 'message': 'Erro ao processar criação de campeonato'}), 500

    
    return render_template('criar-campeonato.html')


if __name__ == '__main__':
    app.run(debug=True)