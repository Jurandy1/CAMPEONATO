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

    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) {

    return {
      success: false,
      error: error.toString()
    };
  }
}

/**

    return {
      success: false,
      error: error.toString()
    };
  }
}

/**

    console.error('Erro em testConnection:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**

    return {
      success: false,
      error: error.toString()
    };
  }
}