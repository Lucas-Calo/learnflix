🎓 Plataforma de Gestão de Atividades Acadêmicas (Web) - Learnflix

Bem-vindo ao repositório da versão Web do sistema de gestão de atividades. Esta aplicação foi desenvolvida em React e permite a interação entre Professores e Alunos para o fluxo de criação, entrega e avaliação de trabalhos acadêmicos.

Funcionalidades Principais 

👨‍🏫 Painel do Professor:

• Gestão de Atividades: Criar, editar e excluir atividades.

• Monitoramento: Visualizar a lista de todos os alunos e o status de entrega de cada um.

• Avaliação:

    • Visualizar ou baixar os arquivos PDF entregues pelos alunos.

    • Atribuir notas (0-10) e fornecer feedback detalhado.

    • Identificar rapidamente quem entregou, quem está pendente e quem já foi avaliado.

👨‍🎓 Painel do Aluno:

• Visualização: Acesso à lista de atividades pendentes e concluídas.

• Entrega de Trabalhos:

   • Upload de arquivos exclusivamente em formato .PDF.

   • Validação de tamanho de arquivo (limite de 20MB).

   • Possibilidade de editar/reenviar uma entrega enquanto o prazo permitir.

• Feedback: Visualização da nota e dos comentários do professor após a correção.

🛠️ Tecnologias Utilizadas:

• Frontend: React.js

• Roteamento: React Router Dom

• Estilização: CSS3 (Metodologia Mobile-First e Responsiva)

• Gestão de Estado: Context API (AuthContext, AtividadeContext)

• Gestão de Gestos: React Swipeable (para navegação mobile)

• Ícones: SVG Inline / Lucide React

Como Rodar o Projeto:

Siga os passos abaixo para executar a aplicação em seu ambiente local:

1. Pré-requisitos

Certifique-se de ter o Node.js (versão 14 ou superior) e o npm instalados em sua máquina.

2. Instalação

Clone o repositório e instale as dependências:

# Clone este repositório
git clone [https://github.com/Lucas-Calo/meu-projeto-de-bloco.git](https://github.com/Lucas-Calo/learnflix.git)

# Acesse a pasta do projeto
cd meu-projeto-de-bloco

# Instale as dependências
npm install


3. Execução

Inicie o servidor de desenvolvimento:

npm run dev


Responsividade:

O layout foi construído pensando primeiramente em dispositivos móveis (Mobile-First), garantindo que alunos possam enviar trabalhos pelo celular. Para telas maiores (Tablets e Desktops), o layout se adapta automaticamente utilizando Media Queries (min-width: 769px).

Notas de Desenvolvimento:

• Upload de PDF: Atualmente, o fluxo de upload simula o envio criando URLs de objeto (URL.createObjectURL) para permitir a visualização imediata sem um backend real configurado neste momento.

• Autenticação: O sistema utiliza um AuthContext para simular o login de perfis diferentes (Professor/Aluno) para fins de teste e desenvolvimento.

👤 Autor

Desenvolvido por Lucas Progetti Coelho Caló como parte do Projeto de Bloco.
