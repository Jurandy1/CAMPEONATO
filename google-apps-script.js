/**
 * Google Apps Script para Sistema de Gestão de Campeonato
 * Este script deve ser implantado como uma aplicação web no Google Apps Script
 * 
 * Configuração necessária:
 * 1. Cole este código no editor do Google Apps Script
 * 2. Salve o projeto
 * 3. Clique em "Implantar" > "Nova implantação"
 * 4. Selecione "Aplicativo da web" como tipo
 * 5. Defina "Executar como" para sua conta
 * 6. Defina "Quem tem acesso" para "Qualquer pessoa"
 * 7. Clique em "Implantar" e copie a URL
 * 8. Use a URL no arquivo config.js

 */

// IDs de configuração - ATUALIZE ESTES VALORES
const SHEET_ID = '1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac';
const DRIVE_FOLDER_ID = '1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS';


/**
 * Função principal que trata todas as requisições
 */
function doGet(e) {
  try {
    // Log da requisição
    console.log('Requisição recebida:', e.parameter);
    
    // Adicionar headers CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Processar a ação
    const action = e.parameter.action;
    const callback = e.parameter.callback; // Para JSONP
    
    let result;
    
    switch (action) {
      case 'test':
        result = testConnection(e.parameter);
        break;
        
      // Times operations
      case 'getTeams':
        result = getTeams(e.parameter);
        break;
      case 'addTeam':
        result = addTeam(e.parameter);
        break;
      case 'updateTeam':
        result = updateTeam(e.parameter);
        break;
      case 'deleteTeam':
        result = deleteTeam(e.parameter);
        break;
        
      // Jogadores operations
      case 'getPlayers':
        result = getPlayers(e.parameter);
        break;
      case 'addPlayer':
        result = addPlayer(e.parameter);
        break;
      case 'updatePlayer':
        result = updatePlayer(e.parameter);
        break;
      case 'deletePlayer':
        result = deletePlayer(e.parameter);
        break;
        
      // Jogos operations
      case 'getMatches':
        result = getMatches(e.parameter);
        break;
      case 'addMatch':
        result = addMatch(e.parameter);
        break;
      case 'updateMatch':
        result = updateMatch(e.parameter);
        break;
      case 'deleteMatch':
        result = deleteMatch(e.parameter);
        break;
        
      // Solicitacoes operations
      case 'getRequests':
        result = getRequests(e.parameter);
        break;
      case 'addRequest':
        result = addRequest(e.parameter);
        break;
      case 'updateRequest':
        result = updateRequest(e.parameter);
        break;
        
      // Eventos operations
      case 'getEvents':
        result = getEvents(e.parameter);
        break;
      case 'addEvent':
        result = addEvent(e.parameter);
        break;
        
      // Configuracoes operations
      case 'getConfigurations':
        result = getConfigurations(e.parameter);
        break;
      case 'updateConfiguration':
        result = updateConfiguration(e.parameter);
        break;
        
      // Upload file
      case 'uploadFile':
        result = uploadFile(e.parameter);
        break;

      default:
        result = {
          success: false,
          error: 'Ação não reconhecida: ' + action
        };
    }
    
    // Se há callback (JSONP), envolver resultado
    if (callback) {
      const jsonpResponse = callback + '(' + JSON.stringify(result) + ');';
      output.setContent(jsonpResponse);
      output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      output.setContent(JSON.stringify(result));
    }
    
    return output;
    
  } catch (error) {
    console.error('Erro no doGet:', error);
    
    const errorResult = {
      success: false,
      error: error.toString()
    };
    
    const output = ContentService.createTextOutput();
    
    // Verificar se é JSONP
    const callback = e.parameter ? e.parameter.callback : null;
    if (callback) {
      const jsonpResponse = callback + '(' + JSON.stringify(errorResult) + ');';
      output.setContent(jsonpResponse);
      output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      output.setContent(JSON.stringify(errorResult));
      output.setMimeType(ContentService.MimeType.JSON);
    }
    
    return output;
  }
}

/**
 * Função para tratar requisições POST (se necessário)
 */
function doPost(e) {
  return doGet(e); // Redirecionar para doGet
}

/**
 * Função para testar conexão
 */
function testConnection(params) {
  try {
    const timestamp = new Date().toISOString();
    return {
      success: true,
      message: 'Conexão estabelecida com sucesso!',
      timestamp: timestamp,
      sheetId: SHEET_ID,
      folderId: DRIVE_FOLDER_ID
    };
  } catch (error) {
    console.error('Erro em testConnection:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Times - Operações CRUD
 */
function getTeams(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Times');
    if (!sheet) {
      // Criar aba se não existir
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet('Times');
      newSheet.appendRow(['ID_Time', 'Nome', 'LogoURL', 'Responsavel', 'EmailResponsavel', 'TokenAcesso']);
      return { success: true, data: [] };
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const team = {};
      headers.forEach((header, index) => {
        team[header] = row[index];
      });
      return team;
    });
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Erro em getTeams:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function addTeam(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Times');
    const timestamp = new Date();
    const teamId = 'TEAM_' + timestamp.getTime();
    const token = generateToken();
    
    const newRow = [
      teamId,
      params.nome || '',
      params.logoURL || '',
      params.responsavel || '',
      params.emailResponsavel || '',
      token
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      data: {
        ID_Time: teamId,
        Nome: params.nome,
        LogoURL: params.logoURL,
        Responsavel: params.responsavel,
        EmailResponsavel: params.emailResponsavel,
        TokenAcesso: token
      }
    };
  } catch (error) {
    console.error('Erro em addTeam:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateTeam(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Times');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Time');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        // Atualizar linha
        if (params.nome !== undefined) values[i][headers.indexOf('Nome')] = params.nome;
        if (params.logoURL !== undefined) values[i][headers.indexOf('LogoURL')] = params.logoURL;
        if (params.responsavel !== undefined) values[i][headers.indexOf('Responsavel')] = params.responsavel;
        if (params.emailResponsavel !== undefined) values[i][headers.indexOf('EmailResponsavel')] = params.emailResponsavel;
        
        range.setValues(values);
        return { success: true, message: 'Time atualizado com sucesso!' };
      }
    }
    
    return { success: false, error: 'Time não encontrado' };
  } catch (error) {
    console.error('Erro em updateTeam:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function deleteTeam(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Times');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Time');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Time excluído com sucesso!' };
      }
    }
    
    return { success: false, error: 'Time não encontrado' };
  } catch (error) {
    console.error('Erro em deleteTeam:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Jogadores - Operações CRUD
 */
function getPlayers(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogadores');
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet('Jogadores');
      newSheet.appendRow(['ID_Jogador', 'ID_Time', 'Nome', 'Apelido', 'Posicao', 'Tipo', 'FotoURL', 'DocURL', 'Status']);
      return { success: true, data: [] };
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    let data = values.slice(1).map(row => {
      const player = {};
      headers.forEach((header, index) => {
        player[header] = row[index];
      });
      return player;
    });
    
    // Filtrar por time se especificado
    if (params.teamId) {
      data = data.filter(player => player.ID_Time === params.teamId);
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Erro em getPlayers:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function addPlayer(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogadores');
    const timestamp = new Date();
    const playerId = 'PLAYER_' + timestamp.getTime();
    
    const newRow = [
      playerId,
      params.teamId || '',
      params.nome || '',
      params.apelido || '',
      params.posicao || '',
      params.tipo || 'TITULAR',
      params.fotoURL || '',
      params.docURL || '',
      params.status || 'ATIVO'
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      data: {
        ID_Jogador: playerId,
        ID_Time: params.teamId,
        Nome: params.nome,
        Apelido: params.apelido,
        Posicao: params.posicao,
        Tipo: params.tipo,
        FotoURL: params.fotoURL,
        DocURL: params.docURL,
        Status: params.status
      }
    };
  } catch (error) {
    console.error('Erro em addPlayer:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updatePlayer(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogadores');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Jogador');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        if (params.nome !== undefined) values[i][headers.indexOf('Nome')] = params.nome;
        if (params.apelido !== undefined) values[i][headers.indexOf('Apelido')] = params.apelido;
        if (params.posicao !== undefined) values[i][headers.indexOf('Posicao')] = params.posicao;
        if (params.tipo !== undefined) values[i][headers.indexOf('Tipo')] = params.tipo;
        if (params.fotoURL !== undefined) values[i][headers.indexOf('FotoURL')] = params.fotoURL;
        if (params.docURL !== undefined) values[i][headers.indexOf('DocURL')] = params.docURL;
        if (params.status !== undefined) values[i][headers.indexOf('Status')] = params.status;
        
        range.setValues(values);
        return { success: true, message: 'Jogador atualizado com sucesso!' };
      }
    }
    
    return { success: false, error: 'Jogador não encontrado' };
  } catch (error) {
    console.error('Erro em updatePlayer:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function deletePlayer(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogadores');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Jogador');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Jogador excluído com sucesso!' };
      }
    }
    
    return { success: false, error: 'Jogador não encontrado' };
  } catch (error) {
    console.error('Erro em deletePlayer:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Jogos - Operações CRUD
 */
function getMatches(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogos');
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet('Jogos');
      newSheet.appendRow(['ID_Jogo', 'Rodada', 'DataHora', 'Local', 'ID_TimeA', 'ID_TimeB', 'PlacarA', 'PlacarB', 'Status']);
      return { success: true, data: [] };
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const match = {};
      headers.forEach((header, index) => {
        match[header] = row[index];
      });
      return match;
    });
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Erro em getMatches:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function addMatch(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogos');
    const timestamp = new Date();
    const matchId = 'MATCH_' + timestamp.getTime();
    
    const newRow = [
      matchId,
      params.rodada || '',
      params.dataHora || '',
      params.local || '',
      params.timeA || '',
      params.timeB || '',
      params.placarA || 0,
      params.placarB || 0,
      params.status || 'AGENDADO'
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      data: {
        ID_Jogo: matchId,
        Rodada: params.rodada,
        DataHora: params.dataHora,
        Local: params.local,
        ID_TimeA: params.timeA,
        ID_TimeB: params.timeB,
        PlacarA: params.placarA,
        PlacarB: params.placarB,
        Status: params.status
      }
    };
  } catch (error) {
    console.error('Erro em addMatch:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateMatch(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogos');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Jogo');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        if (params.rodada !== undefined) values[i][headers.indexOf('Rodada')] = params.rodada;
        if (params.dataHora !== undefined) values[i][headers.indexOf('DataHora')] = params.dataHora;
        if (params.local !== undefined) values[i][headers.indexOf('Local')] = params.local;
        if (params.timeA !== undefined) values[i][headers.indexOf('ID_TimeA')] = params.timeA;
        if (params.timeB !== undefined) values[i][headers.indexOf('ID_TimeB')] = params.timeB;
        if (params.placarA !== undefined) values[i][headers.indexOf('PlacarA')] = params.placarA;
        if (params.placarB !== undefined) values[i][headers.indexOf('PlacarB')] = params.placarB;
        if (params.status !== undefined) values[i][headers.indexOf('Status')] = params.status;
        
        range.setValues(values);
        return { success: true, message: 'Jogo atualizado com sucesso!' };
      }
    }
    
    return { success: false, error: 'Jogo não encontrado' };
  } catch (error) {
    console.error('Erro em updateMatch:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function deleteMatch(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jogos');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Jogo');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Jogo excluído com sucesso!' };
      }
    }
    
    return { success: false, error: 'Jogo não encontrado' };
  } catch (error) {
    console.error('Erro em deleteMatch:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Solicitações - Operações CRUD
 */
function getRequests(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Solicitacoes');
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet('Solicitacoes');
      newSheet.appendRow(['ID_Solicitacao', 'DataHora', 'Origem', 'TipoSolicitacao', 'Dados', 'Status']);
      return { success: true, data: [] };
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const request = {};
      headers.forEach((header, index) => {
        request[header] = row[index];
      });
      return request;
    });
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Erro em getRequests:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function addRequest(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Solicitacoes');
    const timestamp = new Date();
    const requestId = 'REQ_' + timestamp.getTime();
    
    const newRow = [
      requestId,
      timestamp.toISOString(),
      params.origem || '',
      params.tipo || '',
      JSON.stringify(params.dados || {}),
      'PENDENTE'
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      data: {
        ID_Solicitacao: requestId,
        DataHora: timestamp.toISOString(),
        Origem: params.origem,
        TipoSolicitacao: params.tipo,
        Dados: params.dados,
        Status: 'PENDENTE'
      }
    };
  } catch (error) {
    console.error('Erro em addRequest:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateRequest(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Solicitacoes');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const idIndex = headers.indexOf('ID_Solicitacao');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === params.id) {
        if (params.status !== undefined) values[i][headers.indexOf('Status')] = params.status;
        if (params.dados !== undefined) values[i][headers.indexOf('Dados')] = JSON.stringify(params.dados);
        
        range.setValues(values);
        return { success: true, message: 'Solicitação atualizada com sucesso!' };
      }
    }
    
    return { success: false, error: 'Solicitação não encontrada' };
  } catch (error) {
    console.error('Erro em updateRequest:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Eventos - Operações CRUD
 */
function getEvents(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Eventos');
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet('Eventos');
      newSheet.appendRow(['ID_Evento', 'ID_Jogo', 'ID_Jogador', 'TipoEvento', 'Minuto']);
      return { success: true, data: [] };
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    let data = values.slice(1).map(row => {
      const event = {};
      headers.forEach((header, index) => {
        event[header] = row[index];
      });
      return event;
    });
    
    // Filtrar por jogo se especificado
    if (params.matchId) {
      data = data.filter(event => event.ID_Jogo === params.matchId);
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Erro em getEvents:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function addEvent(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Eventos');
    const timestamp = new Date();
    const eventId = 'EVENT_' + timestamp.getTime();
    
    const newRow = [
      eventId,
      params.matchId || '',
      params.playerId || '',
      params.tipo || '',
      params.minuto || 0
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      data: {
        ID_Evento: eventId,
        ID_Jogo: params.matchId,
        ID_Jogador: params.playerId,
        TipoEvento: params.tipo,
        Minuto: params.minuto
      }
    };
  } catch (error) {
    console.error('Erro em addEvent:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Configurações - Operações CRUD
 */
function getConfigurations(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Configuracoes');
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet('Configuracoes');
      newSheet.appendRow(['Chave', 'Valor']);
      return { success: true, data: [] };
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const config = {};
      headers.forEach((header, index) => {
        config[header] = row[index];
      });
      return config;
    });
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Erro em getConfigurations:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function updateConfiguration(params) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Configuracoes');
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      // Primeira configuração
      sheet.appendRow([params.chave, params.valor]);
      return { success: true, message: 'Configuração criada com sucesso!' };
    }
    
    const headers = values[0];
    const keyIndex = headers.indexOf('Chave');
    const valueIndex = headers.indexOf('Valor');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][keyIndex] === params.chave) {
        values[i][valueIndex] = params.valor;
        range.setValues(values);
        return { success: true, message: 'Configuração atualizada com sucesso!' };
      }
    }
    
    // Se não encontrou, adicionar nova
    sheet.appendRow([params.chave, params.valor]);
    return { success: true, message: 'Configuração criada com sucesso!' };
  } catch (error) {
    console.error('Erro em updateConfiguration:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Upload de arquivo
 */
function uploadFile(params) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Decodificar base64 se necessário
    let fileBlob;
    if (params.fileData && params.fileName) {
      const bytes = Utilities.base64Decode(params.fileData);
      fileBlob = Utilities.newBlob(bytes, params.mimeType || 'application/octet-stream', params.fileName);
    } else {
      throw new Error('Dados do arquivo não fornecidos');
    }
    
    const file = folder.createFile(fileBlob);
    
    // Tornar o arquivo público para leitura
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      data: {
        fileId: file.getId(),
        fileName: file.getName(),
        fileUrl: file.getUrl(),
        downloadUrl: 'https://drive.google.com/uc?id=' + file.getId()
      }
    };
  } catch (error) {
    console.error('Erro em uploadFile:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Função auxiliar para gerar token de acesso
 */
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}