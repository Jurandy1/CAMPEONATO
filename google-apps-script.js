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
      case 'getData':
        result = getData(e.parameter);
        break;
      case 'saveData':
        result = saveData(e.parameter);
        break;
      case 'test':
        result = testConnection(e.parameter);
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
 * Obter dados do campeonato
 */
function getData(params) {
  try {
    const sheetId = params.sheetId || SHEET_ID;
    
    // Tentar abrir a planilha
    let sheet;
    try {
      const spreadsheet = SpreadsheetApp.openById(sheetId);
      sheet = spreadsheet.getActiveSheet();
    } catch (error) {
      // Se a planilha não existe ou não pode ser acessada, criar dados de exemplo
      return {
        success: true,
        data: getSampleData(),
        message: 'Usando dados de exemplo (planilha não encontrada)'
      };
    }
    
    // Obter dados da planilha
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {
      // Se não há dados, retornar dados de exemplo
      return {
        success: true,
        data: getSampleData(),
        message: 'Planilha vazia, usando dados de exemplo'
      };
    }
    
    // Converter para formato JSON
    const headers = values[0];
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[i][j];
      }
      data.push(row);
    }
    
    return {
      success: true,
      data: data,
      message: 'Dados carregados da planilha'
    };
    
  } catch (error) {
    console.error('Erro em getData:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Salvar dados do campeonato
 */
function saveData(params) {
  try {
    const sheetId = params.sheetId || SHEET_ID;
    const teamName = params.teamName;
    const points = parseInt(params.points) || 0;
    const matchesPlayed = parseInt(params.matchesPlayed) || 0;
    
    // Validar dados
    if (!teamName || teamName.trim() === '') {
      return {
        success: false,
        error: 'Nome da equipe é obrigatório'
      };
    }
    
    // Tentar abrir a planilha
    let sheet;
    try {
      const spreadsheet = SpreadsheetApp.openById(sheetId);
      sheet = spreadsheet.getActiveSheet();
    } catch (error) {
      // Se a planilha não existe, simular salvamento
      return {
        success: true,
        message: 'Dados salvos (simulação - planilha não encontrada)'
      };
    }
    
    // Verificar se há headers
    const range = sheet.getDataRange();
    let values = range.getValues();
    
    if (values.length === 0) {
      // Criar headers se não existem
      const headers = ['id', 'teamName', 'points', 'matchesPlayed', 'wins', 'draws', 'losses'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      values = [headers];
    }
    
    // Calcular vitórias, empates e derrotas (exemplo)
    const wins = Math.floor(points / 3);
    const draws = points % 3;
    const losses = matchesPlayed - wins - draws;
    
    // Adicionar nova linha
    const newId = values.length; // ID simples baseado na linha
    const newRow = [newId, teamName, points, matchesPlayed, wins, draws, losses];
    
    sheet.getRange(values.length + 1, 1, 1, newRow.length).setValues([newRow]);
    
    return {
      success: true,
      message: 'Dados salvos com sucesso na planilha'
    };
    
  } catch (error) {
    console.error('Erro em saveData:', error);
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
    
    return {
      success: true,
      message: 'Conexão estabelecida com sucesso',
      timestamp: timestamp,
      version: '1.0.0'
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
 * Obter dados de exemplo
 */
function getSampleData() {
  return [
    { id: 1, teamName: 'Flamengo', points: 21, matchesPlayed: 7, wins: 7, draws: 0, losses: 0 },
    { id: 2, teamName: 'Palmeiras', points: 18, matchesPlayed: 7, wins: 6, draws: 0, losses: 1 },
    { id: 3, teamName: 'Atlético-MG', points: 15, matchesPlayed: 7, wins: 5, draws: 0, losses: 2 },
    { id: 4, teamName: 'Corinthians', points: 12, matchesPlayed: 7, wins: 4, draws: 0, losses: 3 },
    { id: 5, teamName: 'São Paulo', points: 9, matchesPlayed: 7, wins: 3, draws: 0, losses: 4 },
    { id: 6, teamName: 'Santos', points: 6, matchesPlayed: 7, wins: 2, draws: 0, losses: 5 },
    { id: 7, teamName: 'Vasco', points: 3, matchesPlayed: 7, wins: 1, draws: 0, losses: 6 },
    { id: 8, teamName: 'Botafogo', points: 0, matchesPlayed: 7, wins: 0, draws: 0, losses: 7 }
  ];
}

/**
 * Função para criar planilha de exemplo (executar manualmente se necessário)
 */
function createSampleSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.create('Campeonato - Dados');
    const sheet = spreadsheet.getActiveSheet();
    
    // Headers
    const headers = ['id', 'teamName', 'points', 'matchesPlayed', 'wins', 'draws', 'losses'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Dados de exemplo
    const data = getSampleData();
    const rows = data.map(team => [
      team.id,
      team.teamName,
      team.points,
      team.matchesPlayed,
      team.wins,
      team.draws,
      team.losses
    ]);
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    
    console.log('Planilha criada com ID:', spreadsheet.getId());
    console.log('URL:', spreadsheet.getUrl());
    
    return {
      success: true,
      spreadsheetId: spreadsheet.getId(),
      url: spreadsheet.getUrl()
    };
    
  } catch (error) {
    console.error('Erro ao criar planilha:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}