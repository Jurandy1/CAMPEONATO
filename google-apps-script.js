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
 * 
 * Estrutura da Planilha:
 * - Times: ID_Time, Nome, LogoURL, Responsavel, EmailResponsavel, TokenAcesso
 * - Jogadores: ID_Jogador, ID_Time, Nome, Apelido, Posicao, Tipo, FotoURL, DocURL, Status
 * - Jogos: ID_Jogo, Rodada, DataHora, Local, ID_TimeA, ID_TimeB, PlacarA, PlacarB, Status
 * - Solicitacoes: ID_Solicitacao, DataHora, Origem, TipoSolicitacao, Dados, Status
 * - Eventos: ID_Evento, ID_Jogo, ID_Jogador, TipoEvento, Minuto
 * - Configuracoes: Chave, Valor
 */

// IDs de configuração - ATUALIZE ESTES VALORES
const SHEET_ID = '1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac';
const DRIVE_FOLDER_ID = '1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS';

// Nomes das abas/sheets
const SHEET_NAMES = {
  TIMES: 'Times',
  JOGADORES: 'Jogadores', 
  JOGOS: 'Jogos',
  SOLICITACOES: 'Solicitacoes',
  EVENTOS: 'Eventos',
  CONFIGURACOES: 'Configuracoes'
};

// Headers para cada aba
const SHEET_HEADERS = {
  [SHEET_NAMES.TIMES]: ['ID_Time', 'Nome', 'LogoURL', 'Responsavel', 'EmailResponsavel', 'TokenAcesso'],
  [SHEET_NAMES.JOGADORES]: ['ID_Jogador', 'ID_Time', 'Nome', 'Apelido', 'Posicao', 'Tipo', 'FotoURL', 'DocURL', 'Status'],
  [SHEET_NAMES.JOGOS]: ['ID_Jogo', 'Rodada', 'DataHora', 'Local', 'ID_TimeA', 'ID_TimeB', 'PlacarA', 'PlacarB', 'Status'],
  [SHEET_NAMES.SOLICITACOES]: ['ID_Solicitacao', 'DataHora', 'Origem', 'TipoSolicitacao', 'Dados', 'Status'],
  [SHEET_NAMES.EVENTOS]: ['ID_Evento', 'ID_Jogo', 'ID_Jogador', 'TipoEvento', 'Minuto'],
  [SHEET_NAMES.CONFIGURACOES]: ['Chave', 'Valor']
};

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
      case 'getCampeonatoData':
        result = getCampeonatoData(e.parameter);
        break;
      case 'addTime':
        result = addTime(e.parameter);
        break;
      case 'addJogador':
        result = addJogador(e.parameter);
        break;
      case 'addJogo':
        result = addJogo(e.parameter);
        break;
      case 'updatePlacar':
        result = updatePlacar(e.parameter);
        break;
      case 'addEvento':
        result = addEvento(e.parameter);
        break;
      case 'addSolicitacao':
        result = addSolicitacao(e.parameter);
        break;
      case 'updateStatus':
        result = updateStatus(e.parameter);
        break;
      case 'authenticate':
        result = authenticate(e.parameter);
        break;
      case 'uploadFile':
        result = uploadFile(e.parameter);
        break;
      case 'test':
        result = testConnection(e.parameter);
        break;
      // Manter compatibilidade com sistema antigo
      case 'getData':
        result = getCampeonatoData(e.parameter);
        break;
      case 'saveData':
        result = addTime(e.parameter);
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
 * Utilitários para acessar a planilha
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SHEET_ID);
  } catch (error) {
    throw new Error('Não foi possível acessar a planilha. Verifique o ID: ' + SHEET_ID);
  }
}

function getOrCreateSheet(sheetName) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    // Adicionar headers
    const headers = SHEET_HEADERS[sheetName];
    if (headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  
  return sheet;
}

function getSheetData(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) {
    return [];
  }
  
  const headers = values[0];
  const data = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    data.push(row);
  }
  
  return data;
}

function getNextId(sheetName, idColumn = 0) {
  const sheet = getOrCreateSheet(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) {
    return 1;
  }
  
  let maxId = 0;
  for (let i = 1; i < values.length; i++) {
    const id = parseInt(values[i][idColumn]);
    if (!isNaN(id) && id > maxId) {
      maxId = id;
    }
  }
  
  return maxId + 1;
}

function generateToken() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 16).toUpperCase();
}

/**
 * Buscar dados completos do campeonato
 */
function getCampeonatoData(params) {
  try {
    const data = {
      times: getSheetData(SHEET_NAMES.TIMES),
      jogadores: getSheetData(SHEET_NAMES.JOGADORES),
      jogos: getSheetData(SHEET_NAMES.JOGOS),
      solicitacoes: getSheetData(SHEET_NAMES.SOLICITACOES),
      eventos: getSheetData(SHEET_NAMES.EVENTOS),
      configuracoes: getSheetData(SHEET_NAMES.CONFIGURACOES)
    };
    
    return {
      success: true,
      data: data,
      message: 'Dados do campeonato carregados com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em getCampeonatoData:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Adicionar time
 */
function addTime(params) {
  try {
    const nome = params.nome || params.teamName;
    const logoURL = params.logoURL || '';
    const responsavel = params.responsavel || '';
    const emailResponsavel = params.emailResponsavel || '';
    
    // Validar dados obrigatórios
    if (!nome || nome.trim() === '') {
      return {
        success: false,
        error: 'Nome do time é obrigatório'
      };
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.TIMES);
    const id = getNextId(SHEET_NAMES.TIMES);
    const token = generateToken();
    
    // Verificar se o time já existe
    const existingTeams = getSheetData(SHEET_NAMES.TIMES);
    const teamExists = existingTeams.some(team => team.Nome === nome);
    
    if (teamExists) {
      return {
        success: false,
        error: 'Já existe um time com este nome'
      };
    }
    
    const newRow = [id, nome, logoURL, responsavel, emailResponsavel, token];
    
    // Adicionar nova linha
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    return {
      success: true,
      data: {
        ID_Time: id,
        Nome: nome,
        LogoURL: logoURL,
        Responsavel: responsavel,
        EmailResponsavel: emailResponsavel,
        TokenAcesso: token
      },
      message: 'Time adicionado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em addTime:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Adicionar jogador
 */
function addJogador(params) {
  try {
    const idTime = parseInt(params.idTime);
    const nome = params.nome;
    const apelido = params.apelido || '';
    const posicao = params.posicao || '';
    const tipo = params.tipo || '';
    const fotoURL = params.fotoURL || '';
    const docURL = params.docURL || '';
    const status = params.status || 'Pendente';
    
    // Validar dados obrigatórios
    if (!nome || nome.trim() === '') {
      return {
        success: false,
        error: 'Nome do jogador é obrigatório'
      };
    }
    
    if (!idTime || isNaN(idTime)) {
      return {
        success: false,
        error: 'ID do time é obrigatório e deve ser um número'
      };
    }
    
    // Verificar se o time existe
    const times = getSheetData(SHEET_NAMES.TIMES);
    const timeExists = times.some(time => time.ID_Time === idTime);
    
    if (!timeExists) {
      return {
        success: false,
        error: 'Time não encontrado'
      };
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.JOGADORES);
    const id = getNextId(SHEET_NAMES.JOGADORES);
    
    const newRow = [id, idTime, nome, apelido, posicao, tipo, fotoURL, docURL, status];
    
    // Adicionar nova linha
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    return {
      success: true,
      data: {
        ID_Jogador: id,
        ID_Time: idTime,
        Nome: nome,
        Apelido: apelido,
        Posicao: posicao,
        Tipo: tipo,
        FotoURL: fotoURL,
        DocURL: docURL,
        Status: status
      },
      message: 'Jogador adicionado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em addJogador:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Adicionar jogo
 */
function addJogo(params) {
  try {
    const rodada = parseInt(params.rodada);
    const dataHora = params.dataHora;
    const local = params.local || '';
    const idTimeA = parseInt(params.idTimeA);
    const idTimeB = parseInt(params.idTimeB);
    const placarA = parseInt(params.placarA) || 0;
    const placarB = parseInt(params.placarB) || 0;
    const status = params.status || 'Agendado';
    
    // Validar dados obrigatórios
    if (!rodada || isNaN(rodada)) {
      return {
        success: false,
        error: 'Rodada é obrigatória e deve ser um número'
      };
    }
    
    if (!dataHora) {
      return {
        success: false,
        error: 'Data e hora são obrigatórias'
      };
    }
    
    if (!idTimeA || isNaN(idTimeA) || !idTimeB || isNaN(idTimeB)) {
      return {
        success: false,
        error: 'IDs dos times são obrigatórios e devem ser números'
      };
    }
    
    if (idTimeA === idTimeB) {
      return {
        success: false,
        error: 'Um time não pode jogar contra si mesmo'
      };
    }
    
    // Verificar se os times existem
    const times = getSheetData(SHEET_NAMES.TIMES);
    const timeAExists = times.some(time => time.ID_Time === idTimeA);
    const timeBExists = times.some(time => time.ID_Time === idTimeB);
    
    if (!timeAExists || !timeBExists) {
      return {
        success: false,
        error: 'Um ou ambos os times não foram encontrados'
      };
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.JOGOS);
    const id = getNextId(SHEET_NAMES.JOGOS);
    
    const newRow = [id, rodada, dataHora, local, idTimeA, idTimeB, placarA, placarB, status];
    
    // Adicionar nova linha
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    return {
      success: true,
      data: {
        ID_Jogo: id,
        Rodada: rodada,
        DataHora: dataHora,
        Local: local,
        ID_TimeA: idTimeA,
        ID_TimeB: idTimeB,
        PlacarA: placarA,
        PlacarB: placarB,
        Status: status
      },
      message: 'Jogo adicionado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em addJogo:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Atualizar placar de um jogo
 */
function updatePlacar(params) {
  try {
    const idJogo = parseInt(params.idJogo);
    const placarA = parseInt(params.placarA) || 0;
    const placarB = parseInt(params.placarB) || 0;
    const status = params.status || 'Finalizado';
    
    if (!idJogo || isNaN(idJogo)) {
      return {
        success: false,
        error: 'ID do jogo é obrigatório e deve ser um número'
      };
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.JOGOS);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return {
        success: false,
        error: 'Nenhum jogo encontrado'
      };
    }
    
    // Encontrar o jogo
    let jogoRow = -1;
    for (let i = 1; i < values.length; i++) {
      if (parseInt(values[i][0]) === idJogo) {
        jogoRow = i + 1; // +1 porque getRange é 1-indexed
        break;
      }
    }
    
    if (jogoRow === -1) {
      return {
        success: false,
        error: 'Jogo não encontrado'
      };
    }
    
    // Atualizar placar e status
    sheet.getRange(jogoRow, 7).setValue(placarA); // PlacarA
    sheet.getRange(jogoRow, 8).setValue(placarB); // PlacarB
    sheet.getRange(jogoRow, 9).setValue(status);  // Status
    
    return {
      success: true,
      data: {
        ID_Jogo: idJogo,
        PlacarA: placarA,
        PlacarB: placarB,
        Status: status
      },
      message: 'Placar atualizado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em updatePlacar:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Adicionar evento do jogo
 */
function addEvento(params) {
  try {
    const idJogo = parseInt(params.idJogo);
    const idJogador = parseInt(params.idJogador);
    const tipoEvento = params.tipoEvento;
    const minuto = parseInt(params.minuto);
    
    // Validar dados obrigatórios
    if (!idJogo || isNaN(idJogo)) {
      return {
        success: false,
        error: 'ID do jogo é obrigatório e deve ser um número'
      };
    }
    
    if (!idJogador || isNaN(idJogador)) {
      return {
        success: false,
        error: 'ID do jogador é obrigatório e deve ser um número'
      };
    }
    
    if (!tipoEvento || tipoEvento.trim() === '') {
      return {
        success: false,
        error: 'Tipo de evento é obrigatório'
      };
    }
    
    if (!minuto || isNaN(minuto)) {
      return {
        success: false,
        error: 'Minuto é obrigatório e deve ser um número'
      };
    }
    
    // Verificar se o jogo existe
    const jogos = getSheetData(SHEET_NAMES.JOGOS);
    const jogoExists = jogos.some(jogo => jogo.ID_Jogo === idJogo);
    
    if (!jogoExists) {
      return {
        success: false,
        error: 'Jogo não encontrado'
      };
    }
    
    // Verificar se o jogador existe
    const jogadores = getSheetData(SHEET_NAMES.JOGADORES);
    const jogadorExists = jogadores.some(jogador => jogador.ID_Jogador === idJogador);
    
    if (!jogadorExists) {
      return {
        success: false,
        error: 'Jogador não encontrado'
      };
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.EVENTOS);
    const id = getNextId(SHEET_NAMES.EVENTOS);
    
    const newRow = [id, idJogo, idJogador, tipoEvento, minuto];
    
    // Adicionar nova linha
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    return {
      success: true,
      data: {
        ID_Evento: id,
        ID_Jogo: idJogo,
        ID_Jogador: idJogador,
        TipoEvento: tipoEvento,
        Minuto: minuto
      },
      message: 'Evento adicionado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em addEvento:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Adicionar solicitação
 */
function addSolicitacao(params) {
  try {
    const origem = params.origem || '';
    const tipoSolicitacao = params.tipoSolicitacao;
    const dados = params.dados || '{}';
    const status = params.status || 'Pendente';
    
    // Validar dados obrigatórios
    if (!tipoSolicitacao || tipoSolicitacao.trim() === '') {
      return {
        success: false,
        error: 'Tipo de solicitação é obrigatório'
      };
    }
    
    const sheet = getOrCreateSheet(SHEET_NAMES.SOLICITACOES);
    const id = getNextId(SHEET_NAMES.SOLICITACOES);
    const dataHora = new Date().toISOString();
    
    const newRow = [id, dataHora, origem, tipoSolicitacao, dados, status];
    
    // Adicionar nova linha
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
    
    return {
      success: true,
      data: {
        ID_Solicitacao: id,
        DataHora: dataHora,
        Origem: origem,
        TipoSolicitacao: tipoSolicitacao,
        Dados: dados,
        Status: status
      },
      message: 'Solicitação adicionada com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em addSolicitacao:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Atualizar status (genérico)
 */
function updateStatus(params) {
  try {
    const tabela = params.tabela;
    const id = parseInt(params.id);
    const status = params.status;
    const idColumn = params.idColumn || 0; // Coluna do ID (default: primeira coluna)
    const statusColumn = params.statusColumn; // Coluna do status (obrigatório)
    
    // Validar dados obrigatórios
    if (!tabela || !SHEET_NAMES[tabela.toUpperCase()]) {
      return {
        success: false,
        error: 'Tabela inválida ou não especificada'
      };
    }
    
    if (!id || isNaN(id)) {
      return {
        success: false,
        error: 'ID é obrigatório e deve ser um número'
      };
    }
    
    if (!status || status.trim() === '') {
      return {
        success: false,
        error: 'Status é obrigatório'
      };
    }
    
    if (statusColumn === undefined || statusColumn === null) {
      return {
        success: false,
        error: 'Coluna do status deve ser especificada'
      };
    }
    
    const sheetName = SHEET_NAMES[tabela.toUpperCase()];
    const sheet = getOrCreateSheet(sheetName);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      return {
        success: false,
        error: 'Nenhum registro encontrado na tabela'
      };
    }
    
    // Encontrar o registro
    let recordRow = -1;
    for (let i = 1; i < values.length; i++) {
      if (parseInt(values[i][idColumn]) === id) {
        recordRow = i + 1; // +1 porque getRange é 1-indexed
        break;
      }
    }
    
    if (recordRow === -1) {
      return {
        success: false,
        error: 'Registro não encontrado'
      };
    }
    
    // Atualizar status
    sheet.getRange(recordRow, statusColumn + 1).setValue(status); // +1 porque getRange é 1-indexed
    
    return {
      success: true,
      data: {
        tabela: tabela,
        id: id,
        status: status
      },
      message: 'Status atualizado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em updateStatus:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Autenticação usando TokenAcesso
 */
function authenticate(params) {
  try {
    const token = params.token;
    const idTime = parseInt(params.idTime);
    
    if (!token || token.trim() === '') {
      return {
        success: false,
        error: 'Token de acesso é obrigatório'
      };
    }
    
    const times = getSheetData(SHEET_NAMES.TIMES);
    let team = null;
    
    if (idTime && !isNaN(idTime)) {
      team = times.find(time => time.ID_Time === idTime && time.TokenAcesso === token);
    } else {
      team = times.find(time => time.TokenAcesso === token);
    }
    
    if (!team) {
      return {
        success: false,
        error: 'Token de acesso inválido'
      };
    }
    
    return {
      success: true,
      data: {
        ID_Time: team.ID_Time,
        Nome: team.Nome,
        Responsavel: team.Responsavel,
        EmailResponsavel: team.EmailResponsavel,
        authenticated: true
      },
      message: 'Autenticação realizada com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em authenticate:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Upload de arquivo (placeholder - necessita implementação específica)
 */
function uploadFile(params) {
  try {
    // Esta função é um placeholder para upload de arquivos
    // A implementação real dependeria do método de upload escolhido
    
    const filename = params.filename;
    const fileType = params.fileType;
    const base64Data = params.base64Data;
    
    if (!filename || !fileType || !base64Data) {
      return {
        success: false,
        error: 'Dados do arquivo incompletos (filename, fileType, base64Data são obrigatórios)'
      };
    }
    
    // Simular upload - na implementação real, salvaria no Drive
    const fileUrl = `https://drive.google.com/file/d/exemplo_${Date.now()}/view`;
    
    return {
      success: true,
      data: {
        filename: filename,
        fileType: fileType,
        url: fileUrl
      },
      message: 'Arquivo enviado com sucesso (simulação)'
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
 * Testar conexão
 */
function testConnection(params) {
  try {
    const timestamp = new Date().toISOString();
    
    // Testar acesso à planilha
    try {
      const spreadsheet = getSpreadsheet();
      const sheetsInfo = [];
      
      // Verificar/criar todas as abas necessárias
      Object.values(SHEET_NAMES).forEach(sheetName => {
        const sheet = getOrCreateSheet(sheetName);
        sheetsInfo.push({
          name: sheetName,
          rows: sheet.getLastRow(),
          cols: sheet.getLastColumn()
        });
      });
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        timestamp: timestamp,
        version: '2.0.0',
        spreadsheetId: SHEET_ID,
        sheets: sheetsInfo
      };
      
    } catch (spreadsheetError) {
      return {
        success: false,
        error: 'Erro ao acessar planilha: ' + spreadsheetError.toString(),
        timestamp: timestamp,
        version: '2.0.0'
      };
    }
    
  } catch (error) {
    console.error('Erro em testConnection:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Obter dados de exemplo (mantido para compatibilidade)
 */
function getSampleData() {
  return {
    times: [
      { ID_Time: 1, Nome: 'Flamengo', LogoURL: '', Responsavel: 'João Silva', EmailResponsavel: 'joao@flamengo.com', TokenAcesso: 'FLAMENGO12345678' },
      { ID_Time: 2, Nome: 'Palmeiras', LogoURL: '', Responsavel: 'Maria Santos', EmailResponsavel: 'maria@palmeiras.com', TokenAcesso: 'PALMEIRAS12345678' },
      { ID_Time: 3, Nome: 'Corinthians', LogoURL: '', Responsavel: 'Pedro Costa', EmailResponsavel: 'pedro@corinthians.com', TokenAcesso: 'CORINTHIANS123456' }
    ],
    jogadores: [
      { ID_Jogador: 1, ID_Time: 1, Nome: 'Gabriel Barbosa', Apelido: 'Gabigol', Posicao: 'Atacante', Tipo: 'Titular', FotoURL: '', DocURL: '', Status: 'Aprovado' },
      { ID_Jogador: 2, ID_Time: 1, Nome: 'Bruno Henrique', Apelido: 'BH', Posicao: 'Atacante', Tipo: 'Titular', FotoURL: '', DocURL: '', Status: 'Aprovado' },
      { ID_Jogador: 3, ID_Time: 2, Nome: 'Dudu', Apelido: 'Dudu', Posicao: 'Meia', Tipo: 'Titular', FotoURL: '', DocURL: '', Status: 'Aprovado' }
    ],
    jogos: [
      { ID_Jogo: 1, Rodada: 1, DataHora: '2024-01-15 16:00:00', Local: 'Maracanã', ID_TimeA: 1, ID_TimeB: 2, PlacarA: 2, PlacarB: 1, Status: 'Finalizado' },
      { ID_Jogo: 2, Rodada: 1, DataHora: '2024-01-16 18:00:00', Local: 'Arena Corinthians', ID_TimeA: 3, ID_TimeB: 1, PlacarA: 0, PlacarB: 0, Status: 'Agendado' }
    ],
    eventos: [
      { ID_Evento: 1, ID_Jogo: 1, ID_Jogador: 1, TipoEvento: 'Gol', Minuto: 25 },
      { ID_Evento: 2, ID_Jogo: 1, ID_Jogador: 2, TipoEvento: 'Gol', Minuto: 78 }
    ],
    solicitacoes: [
      { ID_Solicitacao: 1, DataHora: '2024-01-10 10:00:00', Origem: 'App Mobile', TipoSolicitacao: 'Cadastro Jogador', Dados: '{"jogador":"Novo Jogador"}', Status: 'Pendente' }
    ],
    configuracoes: [
      { Chave: 'temporada_atual', Valor: '2024' },
      { Chave: 'max_jogadores_por_time', Valor: '25' },
      { Chave: 'tempo_jogo_minutos', Valor: '90' }
    ]
  };
}

/**
 * Função para criar estrutura inicial da planilha (executar manualmente se necessário)
 */
function createInitialStructure() {
  try {
    const spreadsheet = getSpreadsheet();
    const results = [];
    
    // Criar todas as abas necessárias
    Object.values(SHEET_NAMES).forEach(sheetName => {
      try {
        const sheet = getOrCreateSheet(sheetName);
        results.push({
          sheet: sheetName,
          status: 'criada/verificada',
          headers: SHEET_HEADERS[sheetName]
        });
      } catch (error) {
        results.push({
          sheet: sheetName,
          status: 'erro',
          error: error.toString()
        });
      }
    });
    
    // Adicionar algumas configurações padrão
    try {
      const configSheet = spreadsheet.getSheetByName(SHEET_NAMES.CONFIGURACOES);
      const existingData = getSheetData(SHEET_NAMES.CONFIGURACOES);
      
      if (existingData.length === 0) {
        const defaultConfigs = [
          ['temporada_atual', '2024'],
          ['max_jogadores_por_time', '25'],
          ['tempo_jogo_minutos', '90'],
          ['pontos_vitoria', '3'],
          ['pontos_empate', '1'],
          ['pontos_derrota', '0']
        ];
        
        configSheet.getRange(2, 1, defaultConfigs.length, 2).setValues(defaultConfigs);
        results.push({
          sheet: SHEET_NAMES.CONFIGURACOES,
          status: 'configurações padrão adicionadas'
        });
      }
    } catch (error) {
      results.push({
        sheet: SHEET_NAMES.CONFIGURACOES,
        status: 'erro ao adicionar configurações',
        error: error.toString()
      });
    }
    
    console.log('Estrutura inicial criada:', results);
    
    return {
      success: true,
      results: results,
      message: 'Estrutura inicial criada/verificada com sucesso'
    };
    
  } catch (error) {
    console.error('Erro ao criar estrutura inicial:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Função utilitária para obter estatísticas do campeonato
 */
function getEstatisticas() {
  try {
    const times = getSheetData(SHEET_NAMES.TIMES);
    const jogadores = getSheetData(SHEET_NAMES.JOGADORES);
    const jogos = getSheetData(SHEET_NAMES.JOGOS);
    const eventos = getSheetData(SHEET_NAMES.EVENTOS);
    
    // Calcular estatísticas básicas
    const estatisticas = {
      totalTimes: times.length,
      totalJogadores: jogadores.length,
      totalJogos: jogos.length,
      jogosFinalizados: jogos.filter(jogo => jogo.Status === 'Finalizado').length,
      jogosAgendados: jogos.filter(jogo => jogo.Status === 'Agendado').length,
      totalEventos: eventos.length,
      jogadoresAprovados: jogadores.filter(jogador => jogador.Status === 'Aprovado').length,
      jogadoresPendentes: jogadores.filter(jogador => jogador.Status === 'Pendente').length
    };
    
    return {
      success: true,
      data: estatisticas,
      message: 'Estatísticas calculadas com sucesso'
    };
    
  } catch (error) {
    console.error('Erro em getEstatisticas:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}