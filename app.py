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


@app.route('/req', methods=['GET'])
def get_challonge():
    if 'user_id' not in session:
        return redirect('/')
    
    try:
        userId = session.get('user_id')
        urls = db.filtrar_campeonatos(userId)
        
        # Tratamento: quando usuário não tem torneios
        if not urls or urls is False:
            print(f"Usuário {userId} não tem torneios")
            return jsonify([]), 200
        
        print(f"urls no banco para user {userId}: {urls}")

        torneios = api.listar_torneios()
        print(f"urls na api: {[t['tournament']['url'] for t in torneios.json()]}")

        torneiosFiltr = [t for t in torneios.json() if t['tournament']['url'] in urls]
        for t in torneiosFiltr:
            url = t['tournament']['url']
            resposta = api.listar_participantes(url)
            t['tournament']['participants'] = resposta.json()

        return jsonify(torneiosFiltr), 200

    
    except Exception as e:
        print(f"Erro ao fazer a requisição na api: {e}")
        return jsonify({'success': False, 'message': 'Erro ao fazer a requisição na api'}), 500


@app.route('/criar-campeonato', methods=['GET', 'POST'])
def criar_campeonato():
    if 'user_id' not in session:
        return redirect('/')
    
    if request.method == 'POST':
        try:
            dados = request.get_json()
            userId = session.get('user_id')
            url_api = dados.get('url')

            api.criar_torneio({
                'name': dados.get('name'),
                'url': url_api,
                'tournament_type': 'single elimination'
            })

            db.novo_campeonato(userId, url_api)
            print(f"campeonato salvo: {url_api} para user {userId}")

            return jsonify({'success': True, 'url':url_api}), 201

        except Exception as e:
            print(f"Erro ao processar criação de campeonato: {e}")
            return jsonify({'success': False, 'message': 'Erro ao processar criação de campeonato'}), 500

    
    return render_template('criar-campeonato.html')


@app.route('/torneios/<torneioUrl>/verif', methods=['GET'])
def verificar_status(torneioUrl):
    """
    Verifica o status do torneio na API Challonge.
    - Se estado == 'pending': redireciona para adicionar participantes
    - Caso contrário: redireciona para ver o chaveamento
    """
    if 'user_id' not in session:
        return redirect('/')
    
    userId = session.get('user_id')
    urls_torneios = db.filtrar_campeonatos(userId)
    
    if torneioUrl not in urls_torneios:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    try:
        # Chamar API para obter informações do torneio
        resposta = api.listar_torneios()
        torneios = resposta.json()
        
        # Buscar o torneio atual
        torneio_encontrado = next(
            (t for t in torneios if t['tournament']['url'] == torneioUrl), 
            None
        )
        
        if not torneio_encontrado:
            return jsonify({'success': False, 'message': 'Torneio não encontrado'}), 404
        
        estado = torneio_encontrado['tournament']['state']
        
        # Retornar URL de redirecionamento apropriada
        if estado == 'pending':
            redirect_url = f'/torneios/{torneioUrl}/participantes'
        else:
            redirect_url = f'/torneios/{torneioUrl}'
        
        return jsonify({'success': True, 'redirect': redirect_url}), 200

    except Exception as e:
        print(f"Erro ao verificar status do torneio: {e}")
        return jsonify({'success': False, 'message': 'Erro ao verificar status do torneio'}), 500


@app.route('/torneios/<torneioUrl>/iniciar', methods=['POST'])
def iniciar_torneio(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    # Verificação de autorização: usuário é o dono?
    userId = session.get('user_id')
    urls_torneios = db.filtrar_campeonatos(userId)
    if torneioUrl not in urls_torneios:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    try:
        resposta = api.iniciar_torneio(torneioUrl)
        return jsonify(resposta.json()), resposta.status_code
    except Exception as e:
        print(f'Erro ao iniciar torneio: {e}')
        return jsonify({'success': False, 'message': 'Erro ao iniciar torneio'}), 500


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


@app.route('/torneios/<torneioUrl>/participantes', methods=['GET', 'POST'])
def add_participante(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    try:
        userId = session.get('user_id')
        urls_torneios = db.filtrar_campeonatos(userId)
        
        # Verificação de autorização: retornar 403 para consistency
        if torneioUrl not in urls_torneios:
            if request.method == 'POST':
                return jsonify({'success': False, 'message': 'Acesso negado'}), 403
            return redirect('/home')
        
        if request.method == 'POST':
            dados = request.get_json()
            participantes = dados.get('participantes')
            
            # Validação: verificar se participantes foi enviado
            if not participantes:
                return jsonify({'success': False, 'message': 'Lista de participantes não fornecida'}), 400
            
            resposta = api.adicionar_participantes_bulk(torneioUrl, participantes)
            return jsonify({'success': True, 'participantes': resposta.json()}), 200
        
        # GET: retorna template HTML
        return render_template('inserir-competidores.html')

    except Exception as e:
        print(f'Erro ao adicionar participantes: {e}')
        return jsonify({'success': False, 'message': 'Erro ao adicionar participantes'}), 500


@app.route('/torneios/<torneioUrl>/partidas', methods=['GET'])
def listar_partidas(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    # Verificação de autorização: usuário é o dono?
    userId = session.get('user_id')
    urls_torneios = db.filtrar_campeonatos(userId)
    if torneioUrl not in urls_torneios:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    try:
        resposta = api.listar_partidas(torneioUrl)
        return jsonify(resposta.json()), resposta.status_code
    except Exception as e:
        print(f'Erro ao listar partidas: {e}')
        return jsonify({'success': False, 'message': 'Erro ao listar partidas'}), 500


@app.route('/torneios/<torneioUrl>/partidas/<int:partidaId>', methods=['PUT'])
def atualizar_partida(torneioUrl, partidaId):
    if 'user_id' not in session:
        return redirect('/')
    
    # Verificação de autorização: usuário é o dono?
    userId = session.get('user_id')
    urls_torneios = db.filtrar_campeonatos(userId)
    if torneioUrl not in urls_torneios:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    try:
        dados = request.get_json()
        resposta = api.atualizar_partida(torneioUrl, partidaId, dados)
        return jsonify(resposta.json()), resposta.status_code
    except Exception as e:
        print(f'Erro ao atualizar partida: {e}')
        return jsonify({'success': False, 'message': 'Erro ao atualizar partida'}), 500


@app.route('/torneios/<torneioUrl>/encerrar', methods=['POST'])
def encerrar_torneio(torneioUrl):
    if 'user_id' not in session:
        return redirect('/')
    
    # Verificação de autorização: usuário é o dono?
    userId = session.get('user_id')
    urls_torneios = db.filtrar_campeonatos(userId)
    if torneioUrl not in urls_torneios:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    try:
        api.finalizar_torneio(torneioUrl)

        participantes = api.listar_participantes(torneioUrl).json()
        campeao = next((p['participant']['name'] for p in participantes if p['participant']['final_rank'] == 1), None)

        api.listar_torneios()
        return jsonify({'campeao': campeao}), 200
    
    except Exception as e:
        print(f'Erro ao encerrar torneio: {e}')
        return jsonify({'success': False, 'message': 'Erro ao encerrar torneio'}), 500





@app.errorhandler(404)
def pagina_nao_encontrada(error):
    if 'user_id' not in session:
        return redirect('/')
    
    return redirect('/home')


if __name__ == '__main__':
    app.run()
