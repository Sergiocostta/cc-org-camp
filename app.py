from dotenv import load_dotenv
load_dotenv()

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
    if 'user_id' in session:
        return redirect('/home')
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
            url_api = dados.get('url')
            qtdParticipantes = int(dados.get('qtdCompetidores'))

            api.criar_torneio({
                'name': dados.get('name'),
                'url': url_api,
                'tournament_type': 'single elimination'
            })

            db.novo_campeonato(userId, url_api, qtdParticipantes)

            return jsonify({'success': True, 'url':url_api}), 201

        except Exception as e:
            print(f"Erro ao processar criação de campeonato: {e}")
            return jsonify({'success': False, 'message': 'Erro ao processar criação de campeonato'}), 500

    
    return render_template('criar-campeonato.html')


@app.route('/req', methods=['GET'])
def get_challonge():
    if 'user_id' not in session:
        return redirect('/')
    
    try:
        userId = session.get('user_id')
        urls = db.filtrar_campeonatos(userId)

        torneios = api.listar_torneios()

        torneiosFiltr = [t for t in torneios.json() if t['tournament']['url'] in urls]
        for t in torneiosFiltr:
            url = t['tournament']['url']
            resposta = api.listar_participantes(url)
            t['tournament']['participants'] = resposta.json()

        return jsonify(torneiosFiltr), 200

    
    except Exception as e:
        print(f"Erro ao fazer a requisição na api: {e}")
        return jsonify({'success': False, 'message': 'Erro ao fazer a requisição na api'}), 500


@app.route('/torneios/<torneioUrl>/verif')
def verificar_participantes(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    userId = session.get('user_id')
    urls_torneios = db.filtrar_campeonatos(userId)
    
    if torneioUrl not in urls_torneios:
        return redirect('/home')
    
    try:
        torneio = request.get_json()
        print(torneio)





    except Exception as e:
        print(f"Erro ao verificar o torneio: {e}")
        return jsonify({'success': False, 'message': 'Erro ao verificar o torneio'})


@app.route('/torneios/<torneioUrl>', methods=['GET'])
def torneio(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    try:
        userId = session.get('user_id')
        urls_torneios = db.filtrar_campeonatos(userId)
        
        if torneioUrl not in urls_torneios:
            return redirect('/home')
        
        return render_template('chaveamento.html')


    
    except Exception as e:
        print(f"Erro ao abrir o torneio: {e}")
        return jsonify({'success': False, 'message': 'Erro ao abrir o torneio'})


@app.route('/torneios/<torneioUrl>/add-participante', methods=['GET'])
def add_participante(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    try:
        userId = session.get('user_id')
        urls_torneios = db.filtrar_campeonatos(userId)
        
        if torneioUrl not in urls_torneios:
            return redirect('/home')
        
        return render_template('inserir-competidores.html')

    
    except Exception as e:
        print(f'Erro ao abrir página de adicionar os participantes: {e}')
        return jsonify({'success': False, 'message': 'Erro ao abrir página de adicionar os participantes'})





@app.errorhandler(404)
def pagina_nao_encontrada(error):
    if 'user_id' not in session:
        return redirect('/')
    
    return redirect('/home')



if __name__ == '__main__':
    app.run(debug=True)
