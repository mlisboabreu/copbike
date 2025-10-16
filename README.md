# 🚴 COPBike - Mobilidade Sustentável para a COP30

## 📝 Resumo do Projeto

O **COPBike** é um aplicativo móvel desenvolvido para incentivar o uso de bicicletas como transporte sustentável na região de Belém, Pará, no contexto da conferência COP30. A plataforma utiliza a gamificação para transformar o ato de pedalar em uma atividade interativa, social e com impacto ambiental mensurável.

Nossa missão é promover a mobilidade urbana sustentável e o engajamento comunitário, oferecendo uma ferramenta para o monitoramento do impacto positivo individual.

## ✨ Funcionalidades Principais

* **Rastreamento via GPS:** Registro automático de rotas e quilometragem percorrida.
* **Cálculo de CO2 Evitado:** Retorno imediato ao usuário sobre seu impacto ambiental.
* **Sistema de Ranking:** Classificação dos ciclistas por quilometragem para incentivo via gamificação.
* **Desafios Comunitários:** Participação em metas coletivas de pedalada para fins sociais/ambientais.

## 🛠️ Stack Tecnológico

A arquitetura do COPBike é Cliente-Servidor (API RESTful), garantindo escalabilidade e desacoplamento.

| Componente | Tecnologia | Detalhe |
| :--- | :--- | :--- |
| **Front-end (Móvel)** | `React Native` com `Expo` | Desenvolvimento multiplataforma (iOS e Android). |
| **Back-end (Servidor)** | `Django Framework` (Python) | API RESTful robusta, segurança e lógica de negócios. |
| **Banco de Dados** | `SQLite` | Nativo do Django, ideal para prototipagem e desenvolvimento local. |
| **Gestão** | `Scrum` (Metodologia Ágil) e `Jira` | Para entregas rápidas e organização em sprints. |

## ⚙️ Como Rodar o Projeto Localmente (Instalação)

Siga os passos abaixo para configurar o projeto em sua máquina:

### 1. Configuração do Back-end (`/backend`)

O Back-end é essencial para a API, o banco de dados e as regras de negócio.

1.  **Pré-requisitos:** Certifique-se de ter o **Python (versão 3.x)**. O **SQLite** é confiurado automaticamnete pelo Django
2.  Clone este repositório: `git clone git clone https://github.com/mlisboabreu/copbike.git`
3.  Navegue até a pasta `backend`: `cd copbike/backend`
4.  Crie um ambiente virtual (recomendado): `python -m venv venv`
5.  Ative o ambiente: `source venv/bin/activate` (Linux/macOS) ou `.\venv\Scripts\activate` (Windows)
6.  Instale as dependências: `pip install -r requirements.txt` (Assuma que existe esse arquivo)
7.  Execute as migrações (cria o banco de dados SQLite): `python manage.py migrate`
8.  Inicie o servidor Django: `python manage.py runserver`

O servidor da API estará rodando em `http://127.0.0.1:8000/`.

### 2. Configuração do Front-end (`/frontend`)

O Front-end é o aplicativo móvel desenvolvido com React Native/Expo.

1.  **Pré-requisitos:** Certifique-se de ter o **Node.js** e o **npm/yarn** instalados.
2.  Navegue até a pasta `frontend`: `cd ../frontend`
3.  Instale as dependências: `npm install` ou `yarn install`
4.  Inicie o Expo: `npx expo start`


