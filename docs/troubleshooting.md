# Guia de Solução de Problemas

## 🚨 Problemas Comuns e Soluções

### 1. Erro CORS - "Cross-origin request blocked"

#### Sintomas
- Mensagem: "A diretiva Same Origin não permite a leitura do recurso remoto"
- Status 405 ou falha de rede
- Requisições bloqueadas no console

#### Soluções

**Opção A: Verificar Google Apps Script**
1. Confirme que está implantado como "Aplicativo da web"
2. Verifique se "Quem tem acesso" está como "Qualquer pessoa"
3. Reimplante se necessário

**Opção B: Testar JSONP**
1. O sistema tenta JSONP automaticamente
2. Verifique logs: "Tentando JSONP..."
3. Se falhar, verifique URL no `config.js`

**Opção C: Modo Desenvolvimento**
1. Teste localmente com dados mock
2. Clique em "Alternar Modo" para desenvolvimento
3. Dados funcionarão offline

### 2. Erro 405 - Method Not Allowed

#### Sintomas
- HTTP 405 nas requisições
- Método não permitido

#### Soluções
1. **Verifique o Google Apps Script**:
   - Deve ter funções `doGet` E `doPost`
   - Ambas devem retornar resposta válida

2. **Use apenas GET**:
   - Sistema configurado para usar GET com parâmetros
   - Evita preflight requests

3. **Teste direto no navegador**:
```
https://script.google.com/.../exec?action=test
```

### 3. NetworkError - Falha na Requisição

#### Sintomas
- "TypeError: NetworkError when attempting to fetch resource"
- Requisições que não completam

#### Soluções
1. **Verifique conectividade**:
   - Clique em "Testar Conexão"
   - Verifique se está online

2. **Timeout configurado**:
   - Padrão: 10 segundos
   - Aumente em `config.js` se necessário

3. **Modo offline**:
   - Sistema funciona offline em desenvolvimento
   - Use dados mock para testes

### 4. Dados Não Carregam

#### Sintomas
- Tabela vazia ou mensagem "Nenhum dado encontrado"
- Loading infinito

#### Diagnóstico
1. **Abra ferramentas de desenvolvedor** (F12)
2. **Verifique Console** - procure erros
3. **Verifique Network** - veja requisições
4. **Verifique Logs visuais** na interface

#### Soluções
1. **Planilha vazia ou inexistente**:
   - Execute `createSampleSpreadsheet` no Apps Script
   - Ou use dados mock

2. **URL incorreta**:
   - Verifique URL no `config.js`
   - Confirme que Apps Script está ativo

3. **Permissões**:
   - Apps Script deve ter permissões para planilha
   - Verifique "Executar como" nas configurações

### 5. Erro de Timeout

#### Sintomas
- "Timeout na requisição"
- Operações que não completam

#### Soluções
1. **Aumentar timeout**:
```javascript
REQUEST: {
    TIMEOUT: 20000, // 20 segundos
}
```

2. **Verificar conexão**:
   - Teste velocidade da internet
   - Use rede mais estável

3. **Usar modo offline**:
   - Dados mock não dependem de rede

### 6. Google Apps Script Não Responde

#### Sintomas
- 500 Internal Server Error
- Tempo limite excedido
- Execução falha

#### Soluções
1. **Verificar logs do Apps Script**:
   - Vá em "Execuções" no editor
   - Procure erros ou timeouts

2. **Reimplantar**:
   - Crie nova implantação
   - Atualize URL no sistema

3. **Verificar quotas**:
   - Google Apps Script tem limites diários
   - Verifique uso na conta

### 7. Interface Não Carrega

#### Sintomas
- Página em branco
- Elementos não aparecem
- JavaScript não executa

#### Diagnóstico
```javascript
// Console do navegador (F12)
console.log(window.CONFIG);        // Deve mostrar configuração
console.log(window.championshipManager); // Deve mostrar instância
```

#### Soluções
1. **Arquivos em ordem**:
   - `config.js` antes de `app.js`
   - Verifique ordem no HTML

2. **Erros JavaScript**:
   - Verifique console (F12)
   - Procure por syntax errors

3. **Navegador incompatível**:
   - Use navegador moderno
   - Verifique suporte a ES6+

## 🔧 Ferramentas de Debug

### 1. Console do Navegador
```javascript
// Verificar estado
console.log(championshipManager.isOnline);
console.log(championshipManager.currentMode);

// Testar requisição manual
championshipManager.makeRequest('test').then(console.log);

// Forçar modo desenvolvimento
CONFIG.ENVIRONMENT.current = 'development';
```

### 2. Logs Visuais
- Ativados automaticamente em desenvolvimento
- Mostram requisições e respostas
- Incluem timestamps

### 3. Status Indicators
- **Online/Offline**: Status da conexão
- **Modo atual**: Desenvolvimento/Produção
- **Logs em tempo real**: Debug visual

## 📊 Monitoramento

### Google Apps Script
1. **Painel de Execuções**:
   - Monitore execuções em tempo real
   - Veja erros e timeouts
   - Configure alertas

2. **Logs personalizados**:
```javascript
console.log('Requisição recebida:', e.parameter);
```

### Sistema Web
1. **Analytics** (opcional):
   - Google Analytics
   - Monitore uso e erros

2. **Error Tracking**:
   - Sentry.io
   - Bugsnag

## 🚀 Otimização de Performance

### 1. Reduzir Timeouts
- Use timeouts apropriados
- Implemente retry logic
- Cache dados quando possível

### 2. Otimizar Planilha
- Evite fórmulas complexas
- Use índices para busca
- Limite tamanho da planilha

### 3. Compressão
- Minifique CSS/JS em produção
- Use gzip no servidor
- Otimize imagens

## 🔄 Recuperação de Desastres

### Backup do Código
1. **Git repository**:
   - Mantenha histórico de versões
   - Use branches para desenvolvimento

2. **Google Apps Script**:
   - Exporte código regularmente
   - Mantenha cópias locais

### Backup de Dados
1. **Google Sheets**:
   - Backup automático do Google Drive
   - Exporte planilhas regularmente

2. **Dados locais**:
   - LocalStorage para cache
   - Exporte dados importantes

## 📞 Quando Buscar Ajuda

### Antes de Reportar
1. ✅ Verifique este guia
2. ✅ Teste em modo desenvolvimento
3. ✅ Consulte logs detalhados
4. ✅ Tente em navegador diferente

### Informações para Incluir
- **Erro exato** (copie da console)
- **Passos para reproduzir**
- **Navegador e versão**
- **Modo** (desenvolvimento/produção)
- **URL do Apps Script** (sem parâmetros sensíveis)

### Recursos Adicionais
- [Documentação Google Apps Script](https://developers.google.com/apps-script)
- [MDN Web Docs - CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-apps-script)

## 🎯 Checklist de Verificação

### ✅ Configuração Básica
- [ ] Google Apps Script implantado
- [ ] URL atualizada no config.js
- [ ] Permissões configuradas
- [ ] Teste de conexão bem-sucedido

### ✅ Funcionalidades
- [ ] Carregamento de dados
- [ ] Salvamento de dados
- [ ] Modo desenvolvimento
- [ ] Logs de debug
- [ ] Tratamento de erros

### ✅ Produção
- [ ] Deploy realizado
- [ ] Testes em ambiente real
- [ ] Monitoramento ativo
- [ ] Backup configurado