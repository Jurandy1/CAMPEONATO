# Sistema de Gestão de Campeonato de Futebol

Um sistema completo de gestão de campeonato de futebol com funcionalidades avançadas para administradores, times e acompanhamento público.

## 🏆 Funcionalidades Principais

### 📊 Para o Público Geral
- **Visualização de times cadastrados** com logos e estatísticas
- **Acompanhamento de partidas** em tempo real
- **Classificação atualizada** automaticamente
- **Interface responsiva** para dispositivos móveis
- **Sistema de navegação intuitiva**

### 👥 Para Times
- **Cadastro público** com geração automática de token
- **Painel exclusivo** com dashboard personalizado
- **Gestão de jogadores** com sistema de aprovação
- **Acompanhamento de partidas** do time
- **Estatísticas detalhadas** de desempenho
- **Upload de logos** e documentos

### 🔧 Para Administradores
- **Painel administrativo completo**
- **Gestão de times e jogadores**
- **Controle de súmulas** e resultados
- **Sistema de aprovação** de cadastros
- **Geração automática** de partidas e grupos
- **Relatórios detalhados**
- **Configurações avançadas**

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Google Apps Script
- **Banco de Dados**: Google Sheets
- **Armazenamento**: Google Drive
- **APIs**: Google APIs (Sheets, Drive)
- **UI/UX**: Font Awesome, Design responsivo

## 📋 Estrutura do Projeto

```
campeonato/
├── index.html              # Página principal
├── admin.html              # Painel administrativo
├── team-dashboard.html     # Dashboard dos times
├── css/
│   ├── main.css           # Estilos principais
│   ├── admin.css          # Estilos do admin
│   └── team.css           # Estilos do time
├── js/
│   ├── api.js             # Integração com APIs
│   ├── auth.js            # Sistema de autenticação
│   ├── main.js            # Funcionalidades principais
│   ├── admin.js           # Funcionalidades do admin
│   └── team.js            # Funcionalidades do time
├── assets/
│   └── images/            # Imagens do sistema
└── README.md              # Este arquivo
```

## 🛠 Configuração e Instalação

### Pré-requisitos

1. **Google Account** com acesso ao Google Apps Script
2. **Google Sheets** para banco de dados
3. **Google Drive** para armazenamento de arquivos
4. **Servidor web** para hospedagem (pode ser GitHub Pages)

### 1. Configuração do Google Sheets

Crie uma planilha no Google Sheets com as seguintes abas:

#### Aba: Times
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID_Time | Texto | Chave primária |
| Nome | Texto | Nome do time |
| LogoURL | URL | Link da logo |
| Responsavel | Texto | Nome do responsável |
| EmailResponsavel | Email | Email do responsável |
| TokenAcesso | Texto | Token único para login |

#### Aba: Jogadores
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID_Jogador | Texto | Chave primária |
| ID_Time | Texto | Referência ao time |
| Nome | Texto | Nome completo |
| Apelido | Texto | Apelido do jogador |
| Posicao | Texto | Posição em campo |
| Tipo | Texto | Profissional/Amador |
| FotoURL | URL | Link da foto |
| DocURL | URL | Link do documento |
| Status | Texto | Pendente/Aprovado/Rejeitado |

#### Aba: Jogos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID_Jogo | Texto | Chave primária |
| Rodada | Número | Número da rodada |
| DataHora | Data/Hora | Data e hora do jogo |
| Local | Texto | Local da partida |
| ID_TimeA | Texto | Time mandante |
| ID_TimeB | Texto | Time visitante |
| PlacarA | Número | Gols do time A |
| PlacarB | Número | Gols do time B |
| Status | Texto | Status da partida |

#### Aba: Solicitacoes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID_Solicitacao | Texto | Chave primária |
| DataHora | Data/Hora | Data da solicitação |
| Origem | Texto | Origem da solicitação |
| TipoSolicitacao | Texto | Tipo da solicitação |
| Dados | JSON | Dados da solicitação |
| Status | Texto | Status da solicitação |

#### Aba: Eventos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID_Evento | Texto | Chave primária |
| ID_Jogo | Texto | Referência ao jogo |
| ID_Jogador | Texto | Referência ao jogador |
| TipoEvento | Texto | Tipo do evento |
| Minuto | Número | Minuto do evento |

#### Aba: Configuracoes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Chave | Texto | Chave da configuração |
| Valor | Texto | Valor da configuração |

### 2. Configuração do Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com)
2. Crie um novo projeto
3. Implemente as funções necessárias para integração
4. Configure as permissões para Google Sheets e Drive
5. Publique como aplicação web
6. Copie a URL do script

### 3. Configuração do Sistema

1. Clone este repositório
2. Abra o arquivo `js/api.js`
3. Atualize as constantes com seus dados:

```javascript
const API_CONFIG = {
    SCRIPT_URL: 'SUA_URL_DO_GOOGLE_APPS_SCRIPT',
    SHEET_ID: 'SEU_ID_DA_PLANILHA',
    DRIVE_FOLDER_ID: 'SEU_ID_DA_PASTA_DO_DRIVE'
};
```

### 4. Deploy

1. Faça upload dos arquivos para seu servidor web
2. Configure HTTPS (recomendado)
3. Teste todas as funcionalidades

## 📖 Como Usar

### Para Times

1. **Cadastro**:
   - Acesse a página principal
   - Clique em "Cadastrar Time"
   - Preencha os dados e guarde o token fornecido

2. **Login**:
   - Clique em "Login"
   - Selecione "Acesso de Time"
   - Informe o token recebido

3. **Gestão**:
   - Acesse o painel do time
   - Cadastre jogadores
   - Acompanhe partidas e estatísticas

### Para Administradores

1. **Login**:
   - Clique em "Login"
   - Selecione "Administrador"
   - Informe a senha de administrador

2. **Gestão**:
   - Aprove/rejeite jogadores
   - Gerencie partidas e resultados
   - Configure o campeonato

## 🔐 Sistema de Autenticação

### Tokens de Time
- Gerados automaticamente no cadastro
- Únicos e seguros
- Válidos por 24 horas por sessão

### Senha de Administrador
- Configurada no Google Apps Script
- Criptografada localmente
- Rate limiting para segurança

## 📱 Responsividade

O sistema foi desenvolvido com design mobile-first:

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptativo
- **Mobile**: Navigation drawer e elementos empilhados

## 🔄 Funcionalidades Automáticas

### Geração de Partidas
- Algoritmo de round-robin
- Distribuição equilibrada de jogos
- Configuração de datas e locais

### Cálculo de Classificação
- Pontuação automática (3-1-0)
- Critérios de desempate
- Atualização em tempo real

### Sistema de Cache
- Cache local para performance
- Invalidação inteligente
- Fallback para dados obsoletos

## 🛡 Segurança

- **Validação de dados** no frontend e backend
- **Rate limiting** para login
- **Sanitização** de inputs
- **HTTPS obrigatório** em produção
- **Tokens temporários** com expiração

## 📊 Relatórios Disponíveis

- Relatório de times
- Estatísticas de jogadores
- Resultados de partidas
- Relatório completo do campeonato
- Exportação em diversos formatos

## 🔧 Configurações Avançadas

### Limites Configuráveis
- Número máximo de jogadores por time
- Limite de jogadores profissionais
- Configurações de pontuação

### Customização
- Nome do campeonato
- Logos personalizadas
- Cores e temas
- Mensagens customizadas

## 📞 Suporte e Contribuições

### Reportar Problemas
- Use as Issues do GitHub
- Forneça logs detalhados
- Inclua passos para reprodução

### Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de notificações push
- [ ] Integração com redes sociais
- [ ] Aplicativo mobile nativo
- [ ] Sistema de transmissão ao vivo
- [ ] Inteligência artificial para análises

### Melhorias Planejadas
- [ ] Performance otimizada
- [ ] Mais relatórios
- [ ] Sistema de backup automático
- [ ] Multi-idiomas
- [ ] Temas customizáveis

## 🌟 Demonstração

Acesse nossa [demo online](https://seu-dominio.com) para ver o sistema em funcionamento.

## 📋 Changelog

### v1.0.0 (Atual)
- Sistema completo de gestão
- Interface responsiva
- Autenticação segura
- Integração com Google APIs

---

**Desenvolvido com ❤️ para a comunidade do futebol**