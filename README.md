# 🏆 Sistema de Gestão de Campeonato

Um sistema web completo para gestão de campeonato de futebol integrado com Google Sheets, Google Drive e Google Apps Script.

![Homepage](https://github.com/user-attachments/assets/73f07eb4-cc49-4c1d-9e4f-c1caab7bd064)

## 📋 Visão Geral

Este sistema oferece uma solução completa para gerenciar campeonatos de futebol, incluindo:

- **Homepage Pública**: Classificação em tempo real, próximos jogos, resultados e artilharia
- **Painel Administrativo**: Gestão completa de times, jogadores, partidas e solicitações
- **Painel dos Times**: Interface para técnicos gerenciarem seus elencos
- **Integração Google**: Dados sincronizados com Google Sheets e arquivos no Google Drive

## 🚀 Funcionalidades

### 🏠 Homepage Pública (index.html)
- ✅ Classificação em tempo real
- ✅ Próximos jogos
- ✅ Resultados das últimas rodadas
- ✅ Tabela de artilharia
- ✅ Design responsivo moderno com tema azul
- ✅ Cadastro de novos times
- ✅ Sistema de login (times e admin)

### 👨‍💼 Painel Administrativo (admin.html)
- ✅ Gestão completa de times e jogadores
- ✅ Aprovação de solicitações
- ✅ Gerenciamento de jogos e resultados
- ✅ Lançamento de súmulas
- ✅ Upload de arquivos para Google Drive
- ✅ Geração automática de partidas
- ✅ Controles administrativos avançados

### ⚽ Painel do Time (team-dashboard.html)
- ✅ Autenticação por token único
- ✅ Cadastro de novos jogadores
- ✅ Visualização do elenco completo
- ✅ Status das solicitações enviadas
- ✅ Upload de documentos dos jogadores

## 🔧 Configurações Fornecidas

O sistema já está configurado com as seguintes integrações:

```javascript
// Google Apps Script URL
https://script.google.com/macros/s/AKfycbwislttP0hq3zh1DP4hGxYGrltcPE3IFCisFPJH5WwDKygMy489PXM4DNc1C78f4hV3/exec

// Google Sheets ID
1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac

// Google Drive Folder ID
1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS
```

### 📊 Estrutura do Banco de Dados (Google Sheets)

**Aba: Times**
- ID_Time, Nome, LogoURL, Responsavel, EmailResponsavel, TokenAcesso

**Aba: Jogadores** 
- ID_Jogador, ID_Time, Nome, Apelido, Posicao, Tipo, FotoURL, DocURL, Status

**Aba: Jogos**
- ID_Jogo, Rodada, DataHora, Local, ID_TimeA, ID_TimeB, PlacarA, PlacarB, Status

**Aba: Solicitacoes**
- ID_Solicitacao, DataHora, Origem, TipoSolicitacao, Dados, Status

**Aba: Eventos**
- ID_Evento, ID_Jogo, ID_Jogador, TipoEvento, Minuto

**Aba: Configuracoes**
- Chave, Valor

## 📁 Estrutura de Arquivos

```
Campeonato/
├── index.html              # Homepage pública
├── admin.html              # Painel administrativo
├── team-dashboard.html     # Painel dos times
├── config.js               # Configurações do sistema
├── app.js                  # Lógica principal
├── styles.css              # Estilos adicionais
├── google-apps-script.js   # Código do Google Apps Script
├── js/
│   ├── main.js            # Lógica da homepage
│   ├── admin.js           # Lógica do painel admin
│   ├── team.js            # Lógica do painel dos times
│   ├── api.js             # Integração com APIs
│   └── auth.js            # Sistema de autenticação
├── css/
│   ├── main.css           # Estilos principais
│   ├── admin.css          # Estilos do painel admin
│   └── team.css           # Estilos do painel dos times
└── docs/
    ├── setup-guide.md     # Guia de configuração
    ├── troubleshooting.md # Solução de problemas
    └── estrutura-completa.md # Documentação técnica
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: CSS Grid, Flexbox, Design Responsivo
- **Icons**: Font Awesome 6.0
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Storage**: Google Drive
- **API**: RESTful via Google Apps Script

## 🚀 Como Usar

### 1. Acesso Público
- Visite a homepage para ver classificação, jogos e estatísticas
- Cadastre um novo time usando o botão "Cadastrar Time"
- Guarde o token fornecido para acesso posterior

### 2. Painel do Time
- Acesse `team-dashboard.html`
- Faça login com o token do seu time
- Gerencie jogadores e acompanhe solicitações

### 3. Painel Administrativo
- Acesse `admin.html`
- Faça login com credenciais de administrador
- Gerencie todo o sistema, aprovar solicitações e configurar partidas

## 🎨 Design e Interface

### Tema Visual
- **Cor Primária**: Azul (#667eea)
- **Cor Secundária**: Roxo (#764ba2)
- **Gradientes**: Modernos e suaves
- **Tipografia**: Segoe UI / Sans-serif
- **Ícones**: Font Awesome

### Responsividade
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)

### Componentes
- Cards informativos
- Modais para formulários
- Tabelas responsivas
- Loading states
- Toast notifications
- Sistema de navegação intuitivo

## 🔐 Sistema de Autenticação

### Times
- **Método**: Token único gerado no cadastro
- **Acesso**: Painel do time
- **Funcionalidades**: Gestão de jogadores, visualização de dados

### Administradores
- **Método**: Senha de administrador
- **Acesso**: Painel administrativo completo
- **Funcionalidades**: Controle total do sistema

## 📱 Recursos Avançados

### Modo Offline
- Dados em cache para funcionamento offline
- Sincronização automática quando conectado
- Mensagens de status de conectividade

### Performance
- Lazy loading de dados
- Cache inteligente com TTL
- Otimização de requisições
- Minificação automática

### Experiência do Usuário
- Transições suaves
- Feedback visual
- Estados de carregamento
- Validação em tempo real
- Mensagens de erro amigáveis

## 🔗 Links Importantes

- **Google Sheets**: [Planilha do Campeonato](https://docs.google.com/spreadsheets/d/1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac/edit?gid=2085469335#gid=2085469335)
- **Google Drive**: [Pasta de Arquivos](https://drive.google.com/drive/folders/1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS?usp=sharing)
- **Google Apps Script**: Integração backend configurada

## 📋 API Endpoints

O sistema se comunica com Google Apps Script através dos seguintes endpoints:

### Times
- `getTeams()` - Lista todos os times
- `createTeam(teamData)` - Cadastra novo time
- `updateTeam(teamId, teamData)` - Atualiza time
- `authenticateTeam(token)` - Autentica time

### Jogadores
- `getPlayers(teamId)` - Lista jogadores
- `createPlayer(playerData)` - Cadastra jogador
- `approvePlayer(playerId)` - Aprova jogador

### Partidas
- `getMatches()` - Lista partidas
- `updateMatchResult(matchId, scores)` - Atualiza resultado
- `generateMatches()` - Gera partidas automaticamente

### Classificação
- `getRankings()` - Classificação atualizada
- `getStatistics()` - Estatísticas gerais

## 🛡️ Segurança

- Validação de dados no frontend e backend
- Tokens únicos para cada time
- Sanitização de entradas
- Proteção contra XSS
- Rate limiting nas APIs

## 📞 Suporte

Para dúvidas e problemas:

1. Consulte a documentação em `/docs/`
2. Verifique os logs do navegador (F12)
3. Teste em modo desenvolvimento
4. Valide configurações no Google Apps Script

## 🎯 Status do Projeto

✅ **Completo e Funcional**
- Sistema totalmente implementado
- Todas as funcionalidades requisitadas
- Design moderno e responsivo
- Integração Google configurada
- Documentação completa

O sistema está pronto para uso imediato com as configurações fornecidas!

---

**Desenvolvido com ❤️ para gestão de campeonatos de futebol**