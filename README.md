# CC Org Camp 🏆

[![Deploy](https://img.shields.io/badge/Deploy-Online-success)](https://cc-org-camp.onrender.com/)

Sistema web para organização e gerenciamento de campeonatos eliminatórios, integrado à API do Challonge.

## 📌 Sobre o projeto

O **CC Org Camp** é uma aplicação desenvolvida em **Flask** que permite criar e administrar campeonatos de forma simples e intuitiva.

Com o sistema, os usuários podem:

- Criar uma conta e realizar login;
- Criar campeonatos;
- Adicionar participantes;
- Iniciar torneios;
- Visualizar partidas e chaveamentos;
- Gerenciar torneios utilizando a API do Challonge.

O projeto foi desenvolvido com foco em aprendizado de desenvolvimento web, integração com APIs externas e gerenciamento de banco de dados.

---

## 🚀 Tecnologias Utilizadas

### Backend
- Python
- Flask
- Psycopg

### Frontend
- HTML5
- CSS3
- JavaScript

### Banco de Dados
- PostgreSQL

### Deploy
- Gunicorn
- Procfile

### API Externa
- Challonge API

---

## 📁 Estrutura do Projeto

```text
cc-org-camp/
│
├── app.py
├── config.py
├── requirements.txt
├── Procfile
├── .env.example
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── templates/
│   ├── login.html
│   ├── cadastro.html
│   ├── home.html
│   ├── criar_campeonato.html
│   └── ...
│
├── database/
│   └── scripts.sql
│
└── README.md
```

---

## ⚙️ Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/cc-org-camp.git
cd cc-org-camp
```

### 2. Crie um ambiente virtual

```bash
python -m venv venv
```

### 3. Ative o ambiente virtual

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

### 4. Instale as dependências

```bash
pip install -r requirements.txt
```

### 5. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
CHALLONGE_API_KEY=sua_api_key
DATABASE_URL=postgresql://usuario:senha@localhost:5432/banco
```

### 6. Execute a aplicação

```bash
python app.py
```

---

## 🔑 Funcionalidades

### 👤 Usuários

- Cadastro de usuários
- Login
- Logout
- Controle de sessão

### 🏆 Campeonatos

- Criação de torneios
- Associação de torneios ao usuário
- Listagem de campeonatos criados

### 👥 Participantes

- Cadastro de participantes
- Inserção em lote
- Sincronização com a API do Challonge

### ⚔️ Partidas

- Início de torneios
- Visualização do chaveamento
- Atualização de resultados
- Encerramento de torneios

---

## 🌐 Rotas Principais

| Rota | Método | Descrição |
|--------|--------|--------|
| `/` | GET | Página inicial |
| `/login` | POST | Realiza login |
| `/cadastro` | GET / POST | Cadastro de usuário |
| `/home` | GET | Painel principal |
| `/criar-campeonato` | GET / POST | Criação de campeonato |
| `/torneios/<url>/participantes` | GET / POST | Gerenciamento de participantes |
| `/torneios/<url>/iniciar` | POST | Inicia o torneio |
| `/torneios/<url>` | GET | Exibe o torneio |

---

## 🔗 Integração com a API Challonge

A API do Challonge é utilizada para:

- Criar torneios;
- Cadastrar participantes;
- Gerenciar partidas;
- Iniciar e finalizar torneios;
- Atualizar resultados.
