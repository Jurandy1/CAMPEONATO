# Sistema de Gestão de Campeonato - Estrutura Completa

Este sistema foi atualizado para trabalhar com a estrutura real da planilha do campeonato, implementando todas as funcionalidades necessárias para um sistema completo de gestão.

## 🚀 Características Principais

- ✅ **Sistema Completo de 6 Abas**: Times, Jogadores, Jogos, Solicitações, Eventos e Configurações
- ✅ **API Específica**: Funções dedicadas para cada operação (addTime, addJogador, addJogo, etc.)
- ✅ **Autenticação**: Sistema usando TokenAcesso para cada time
- ✅ **Validação de Dados**: Integridade referencial entre tabelas
- ✅ **IDs Automáticos**: Geração automática de IDs únicos para cada tabela
- ✅ **Upload de Arquivos**: Suporte para LogoURL, FotoURL e DocURL
- ✅ **Resolução de CORS**: Implementa JSONP como fallback para requisições cross-origin
- ✅ **Modo de Desenvolvimento**: Dados mock para testes offline
- ✅ **Interface Responsiva**: Mantém compatibilidade com interface existente

## 📊 Estrutura da Planilha

### Aba: Times
- **ID_Time** (chave primária, auto-gerada)
- **Nome** (obrigatório, único)
- **LogoURL** (opcional)
- **Responsavel** (opcional)
- **EmailResponsavel** (opcional)
- **TokenAcesso** (gerado automaticamente)

### Aba: Jogadores
- **ID_Jogador** (chave primária, auto-gerada)
- **ID_Time** (FK para Times, obrigatório)
- **Nome** (obrigatório)
- **Apelido** (opcional)
- **Posicao** (opcional)
- **Tipo** (opcional)
- **FotoURL** (opcional)
- **DocURL** (opcional)
- **Status** (Pendente/Aprovado/Rejeitado)

### Aba: Jogos
- **ID_Jogo** (chave primária, auto-gerada)
- **Rodada** (obrigatório)
- **DataHora** (obrigatório)
- **Local** (opcional)
- **ID_TimeA** (FK para Times, obrigatório)
- **ID_TimeB** (FK para Times, obrigatório)
- **PlacarA** (default: 0)
- **PlacarB** (default: 0)
- **Status** (Agendado/Em Andamento/Finalizado)

### Aba: Solicitacoes
- **ID_Solicitacao** (chave primária, auto-gerada)
- **DataHora** (auto-gerada)
- **Origem** (opcional)
- **TipoSolicitacao** (obrigatório)
- **Dados** (JSON, opcional)
- **Status** (Pendente/Aprovado/Rejeitado)

### Aba: Eventos
- **ID_Evento** (chave primária, auto-gerada)
- **ID_Jogo** (FK para Jogos, obrigatório)
- **ID_Jogador** (FK para Jogadores, obrigatório)
- **TipoEvento** (Gol/Cartão/Assistência/etc.)
- **Minuto** (obrigatório)

### Aba: Configuracoes
- **Chave** (obrigatório, único)
- **Valor** (obrigatório)

## 🔧 Funções da API

### Principais
- **getCampeonatoData()**: Busca dados completos de todas as abas
- **addTime()**: Adiciona novo time com validação
- **addJogador()**: Adiciona jogador com verificação de time existente
- **addJogo()**: Agenda jogo com validação de times
- **updatePlacar()**: Atualiza resultado do jogo
- **addEvento()**: Registra eventos do jogo (gols, cartões, etc.)
- **addSolicitacao()**: Cria solicitação no sistema
- **updateStatus()**: Atualiza status de qualquer registro
- **authenticate()**: Valida TokenAcesso de time
- **uploadFile()**: Upload de arquivos (placeholder)

### Utilitárias
- **testConnection()**: Testa conectividade e cria estrutura inicial
- **createInitialStructure()**: Cria todas as abas necessárias
- **getEstatisticas()**: Calcula estatísticas do campeonato

## 🛠️ Configuração

### 1. Google Apps Script
1. Acesse [Google Apps Script](https://script.google.com/)
2. Crie um novo projeto
3. Cole o código do arquivo `google-apps-script.js`
4. Atualize os IDs da planilha e pasta do Drive
5. Salve e implante como aplicação web
6. Configure para "Qualquer pessoa" ter acesso
7. Copie a URL gerada

### 2. Configuração Local
Atualize a URL no arquivo `config.js`:
```javascript
GOOGLE_APPS_SCRIPT: {
    URL: 'SUA_URL_GOOGLE_APPS_SCRIPT_AQUI',
    SHEET_ID: '1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac',
    DRIVE_FOLDER_ID: '1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS'
}
```

## 🔄 Compatibilidade

O sistema mantém **total compatibilidade** com a interface existente:
- Formulários existentes continuam funcionando
- API antiga é redirecionada para novas funções
- Dados são convertidos automaticamente entre formatos
- Interface visual permanece inalterada

## 📱 Como Usar

### Interface Web
1. **Atualizar Dados**: Carrega classificação atualizada
2. **Adicionar Time**: Usa formulário existente, agora com nova API
3. **Logs de Debug**: Mostra todas as operações em tempo real

### API Programática
```javascript
// Adicionar time
await championshipManager.addTime({
    nome: 'Novo Time',
    responsavel: 'João Silva',
    emailResponsavel: 'joao@novotime.com'
});

// Adicionar jogador
await championshipManager.addJogador({
    idTime: 1,
    nome: 'Jogador Novo',
    posicao: 'Atacante',
    status: 'Pendente'
});

// Atualizar placar
await championshipManager.updatePlacar(1, 2, 1, 'Finalizado');
```

## 🐛 Validações Implementadas

- **Times**: Nome único, dados obrigatórios
- **Jogadores**: Time deve existir, nome obrigatório
- **Jogos**: Times devem existir e ser diferentes, data obrigatória
- **Eventos**: Jogo e jogador devem existir
- **Referencial**: Mantém integridade entre tabelas

## 🔒 Segurança

- **Tokens únicos** gerados automaticamente para cada time
- **Validação de entrada** em todas as funções
- **Proteção CORS** com múltiplas estratégias de fallback
- **Logs detalhados** para auditoria

## 📈 Exemplo de Uso Completo

Veja a screenshot em: ![Sistema funcionando](https://github.com/user-attachments/assets/55d4e63b-685b-47f2-8115-7f3634968f18)

O sistema mostra:
- ✅ Status "Online" funcionando
- ✅ Tabela de classificação carregada
- ✅ Formulário para adicionar times
- ✅ Logs detalhados de todas as operações
- ✅ Modo desenvolvimento ativo com dados mock

## 🚀 Pronto para Produção

O sistema está completamente funcional e pronto para:
1. **Desenvolvimento**: Funciona offline com dados mock
2. **Produção**: Conecta com Google Sheets real
3. **Hospedagem**: Compatível com qualquer servidor web estático

## 📁 Estrutura de Arquivos

```
./
├── index.html              # Interface principal do sistema
├── config.js              # Configurações e constantes
├── app.js                 # Lógica principal da aplicação
├── styles.css             # Estilos CSS responsivos
├── google-apps-script.js  # Código completo para o Google Apps Script
├── README.md              # Esta documentação
└── docs/
    ├── setup-guide.md     # Guia de configuração detalhado
    └── troubleshooting.md # Guia de solução de problemas
```

## 🔧 Como Funciona a Correção de CORS

### Solução Implementada

1. **Tentativa primária - Fetch com CORS**
2. **Fallback - JSONP** se fetch falhar
3. **Último recurso - Dados Mock** em desenvolvimento

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs de debug na interface
2. Consulte o console do navegador (F12)
3. Teste primeiro em modo desenvolvimento
4. Verifique a configuração do Google Apps Script