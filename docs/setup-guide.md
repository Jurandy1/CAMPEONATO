# Guia de Configuração Detalhado

## 🎯 Objetivo
Este guia fornece instruções passo a passo para configurar o Sistema de Gestão de Campeonato e resolver problemas de CORS.

## 📋 Pré-requisitos
- Conta Google (para Google Apps Script)
- Navegador web moderno
- Editor de texto ou IDE
- Servidor web (opcional, para produção)

## 🔧 Configuração do Google Apps Script

### Passo 1: Criar Projeto
1. Acesse [script.google.com](https://script.google.com/)
2. Clique em **"Novo projeto"**
3. Renomeie para "Sistema Campeonato"

### Passo 2: Configurar Código
1. Delete o código padrão
2. Cole o conteúdo do arquivo `google-apps-script.js`
3. Atualize as constantes no topo:
```javascript
const SHEET_ID = 'SEU_SHEET_ID_AQUI';
const DRIVE_FOLDER_ID = 'SEU_FOLDER_ID_AQUI';
```

### Passo 3: Salvar e Implantar
1. Pressione **Ctrl+S** para salvar
2. Clique em **"Implantar"** > **"Nova implantação"**
3. Configure:
   - **Tipo**: Aplicativo da web
   - **Executar como**: Eu (sua conta)
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em **"Implantar"**
5. **COPIE A URL** gerada

### Passo 4: Configurar Permissões
1. Na primeira execução, será solicitada autorização
2. Clique em **"Revisar permissões"**
3. Selecione sua conta Google
4. Clique em **"Avançado"**
5. Clique em **"Ir para [nome do projeto] (não seguro)"**
6. Clique em **"Permitir"**

## 📊 Configuração da Planilha Google

### Opção 1: Usar Planilha Existente
1. Abra sua planilha no Google Sheets
2. Copie o ID da URL:
```
https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
```

### Opção 2: Criar Nova Planilha
1. No Google Apps Script, execute a função `createSampleSpreadsheet`
2. Vá em **"Executar"** > **"createSampleSpreadsheet"**
3. Copie o ID gerado nos logs

### Estrutura da Planilha
A planilha deve ter as seguintes colunas:
| id | teamName | points | matchesPlayed | wins | draws | losses |
|----|----------|--------|---------------|------|-------|--------|
| 1  | Equipe A | 15     | 5             | 5    | 0     | 0      |

## 🌐 Configuração do Sistema Web

### Passo 1: Atualizar config.js
```javascript
GOOGLE_APPS_SCRIPT: {
    URL: 'COLE_A_URL_DO_GOOGLE_APPS_SCRIPT_AQUI',
    SHEET_ID: 'SEU_SHEET_ID',
    DRIVE_FOLDER_ID: 'SEU_FOLDER_ID'
}
```

### Passo 2: Testar Localmente
1. Abra `index.html` no navegador
2. Clique em **"Testar Conexão"**
3. Verifique os logs de debug

### Passo 3: Deploy em Produção

#### GitHub Pages
1. Faça commit dos arquivos
2. Vá em Settings > Pages
3. Selecione source branch
4. Acesse a URL gerada

#### Netlify
1. Arraste a pasta para netlify.com/drop
2. Ou conecte com repositório Git

#### Servidor Próprio
1. Faça upload dos arquivos
2. Configure servidor web (Apache/Nginx)

## 🔐 Configurações de Segurança

### Google Apps Script
- Sempre use "Executar como: Eu"
- Para produção, considere "Qualquer pessoa na organização"
- Monitore logs de execução regularmente

### Validação de Dados
O sistema valida automaticamente:
- Nomes de equipe não vazios
- Pontos numéricos não negativos
- Jogos disputados não negativos

## 📱 Configuração Mobile

### Responsividade
O sistema é totalmente responsivo, mas para melhor experiência:

1. Adicione meta viewport (já incluído):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

2. Teste em diferentes tamanhos de tela

### PWA (Opcional)
Para transformar em PWA, adicione:
- `manifest.json`
- Service Worker
- Ícones da aplicação

## 🧪 Modo de Desenvolvimento

### Ativação Automática
O modo desenvolvimento é ativado automaticamente quando:
- `hostname === 'localhost'`
- `hostname === '127.0.0.1'`
- `hostname.startsWith('192.168.')`
- `protocol === 'file:'`

### Recursos do Modo Dev
- Dados mock automáticos
- Logs detalhados
- Simulação de falhas de rede
- Debug visual ativo

### Forçar Modo Produção
Para testar em produção localmente:
```javascript
CONFIG.ENVIRONMENT.current = 'production';
CONFIG.DEBUG.ENABLED = false;
```

## 📊 Monitoramento e Analytics

### Logs do Google Apps Script
1. No editor, vá em **"Execuções"**
2. Monitore execuções e erros
3. Configure alertas por email

### Logs do Sistema
- Console do navegador (F12)
- Interface visual de logs
- Status de conectividade

## 🔄 Backup e Recuperação

### Dados da Planilha
1. Configure backup automático no Google Drive
2. Exporte dados regularmente
3. Mantenha histórico de versões

### Código
1. Use controle de versão (Git)
2. Faça backup do código do Apps Script
3. Documente mudanças importantes

## 🎨 Personalização

### Cores e Tema
No `styles.css`, modifique:
```css
:root {
    --primary-color: #2196f3;
    --secondary-color: #9e9e9e;
    --success-color: #4caf50;
    --error-color: #f44336;
}
```

### Mensagens
No `config.js`, altere:
```javascript
UI: {
    MESSAGES: {
        CONNECTION_SUCCESS: 'Sua mensagem aqui',
        // ...
    }
}
```

## 📞 Próximos Passos

Após a configuração:
1. Teste todas as funcionalidades
2. Configure backup automático
3. Monitore logs regularmente
4. Considere adicionar autenticação
5. Implemente notificações

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique o `troubleshooting.md`
2. Consulte logs do Google Apps Script
3. Use o modo desenvolvimento para debug
4. Verifique configurações de CORS