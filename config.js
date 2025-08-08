// Configuração do Sistema de Gestão de Campeonato
const CONFIG = {
    // URLs e IDs do Google Apps Script
    GOOGLE_APPS_SCRIPT: {
        URL: 'https://script.google.com/macros/s/AKfycbwislttP0hq3zh1DP4hGxYGrltcPE3IFCisFPJH5WwDKygMy489PXM4DNc1C78f4hV3/exec',
        SHEET_ID: '1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac',
        DRIVE_FOLDER_ID: '1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS'
    },

    // Configurações de ambiente
    ENVIRONMENT: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        current: 'development' // Será detectado automaticamente
    },

    // Configurações de requisição
    REQUEST: {
        TIMEOUT: 10000, // 10 segundos
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000, // 1 segundo
        USE_JSONP: true,
        CALLBACK_PARAM: 'callback'
    },

    // Dados mock para desenvolvimento
    MOCK_DATA: {
        championship: [
            { id: 1, teamName: 'Equipe A', points: 15, matchesPlayed: 5, wins: 5, draws: 0, losses: 0 },
            { id: 2, teamName: 'Equipe B', points: 12, matchesPlayed: 5, wins: 4, draws: 0, losses: 1 },
            { id: 3, teamName: 'Equipe C', points: 9, matchesPlayed: 5, wins: 3, draws: 0, losses: 2 },
            { id: 4, teamName: 'Equipe D', points: 6, matchesPlayed: 5, wins: 2, draws: 0, losses: 3 },
            { id: 5, teamName: 'Equipe E', points: 3, matchesPlayed: 5, wins: 1, draws: 0, losses: 4 },
            { id: 6, teamName: 'Equipe F', points: 0, matchesPlayed: 5, wins: 0, draws: 0, losses: 5 }
        ],
        // Nova estrutura completa para compatibilidade
        campeonato: {
            times: [
                { ID_Time: 1, Nome: 'Equipe A', LogoURL: '', Responsavel: 'João Silva', EmailResponsavel: 'joao@equipea.com', TokenAcesso: 'EQUIPEA12345678' },
                { ID_Time: 2, Nome: 'Equipe B', LogoURL: '', Responsavel: 'Maria Santos', EmailResponsavel: 'maria@equipeb.com', TokenAcesso: 'EQUIPEB12345678' },
                { ID_Time: 3, Nome: 'Equipe C', LogoURL: '', Responsavel: 'Pedro Costa', EmailResponsavel: 'pedro@equipec.com', TokenAcesso: 'EQUIPEC12345678' }
            ],
            jogadores: [
                { ID_Jogador: 1, ID_Time: 1, Nome: 'Jogador A1', Apelido: 'A1', Posicao: 'Atacante', Tipo: 'Titular', FotoURL: '', DocURL: '', Status: 'Aprovado' },
                { ID_Jogador: 2, ID_Time: 1, Nome: 'Jogador A2', Apelido: 'A2', Posicao: 'Meio', Tipo: 'Titular', FotoURL: '', DocURL: '', Status: 'Aprovado' },
                { ID_Jogador: 3, ID_Time: 2, Nome: 'Jogador B1', Apelido: 'B1', Posicao: 'Defesa', Tipo: 'Titular', FotoURL: '', DocURL: '', Status: 'Aprovado' }
            ],
            jogos: [
                { ID_Jogo: 1, Rodada: 1, DataHora: '2024-01-15 16:00:00', Local: 'Campo A', ID_TimeA: 1, ID_TimeB: 2, PlacarA: 2, PlacarB: 1, Status: 'Finalizado' },
                { ID_Jogo: 2, Rodada: 1, DataHora: '2024-01-16 18:00:00', Local: 'Campo B', ID_TimeA: 3, ID_TimeB: 1, PlacarA: 0, PlacarB: 0, Status: 'Agendado' }
            ],
            eventos: [
                { ID_Evento: 1, ID_Jogo: 1, ID_Jogador: 1, TipoEvento: 'Gol', Minuto: 25 },
                { ID_Evento: 2, ID_Jogo: 1, ID_Jogador: 2, TipoEvento: 'Assistência', Minuto: 25 }
            ],
            solicitacoes: [
                { ID_Solicitacao: 1, DataHora: '2024-01-10 10:00:00', Origem: 'App Web', TipoSolicitacao: 'Cadastro Jogador', Dados: '{"jogador":"Novo Jogador"}', Status: 'Pendente' }
            ],
            configuracoes: [
                { Chave: 'temporada_atual', Valor: '2024' },
                { Chave: 'max_jogadores_por_time', Valor: '25' },
                { Chave: 'tempo_jogo_minutos', Valor: '90' }
            ]
        }
    },

    // Configurações de UI
    UI: {
        MESSAGES: {
            CONNECTION_SUCCESS: 'Conexão estabelecida com sucesso!',
            CONNECTION_ERROR: 'Erro de conexão. Usando modo offline.',
            DATA_LOADED: 'Dados carregados com sucesso!',
            DATA_SAVED: 'Dados salvos com sucesso!',
            INVALID_DATA: 'Dados inválidos. Verifique os campos.',
            CORS_ERROR: 'Erro CORS detectado. Tentando JSONP...',
            NETWORK_ERROR: 'Erro de rede. Verifique sua conexão.',
            TIMEOUT_ERROR: 'Timeout na requisição. Tente novamente.'
        },
        AUTO_HIDE_MESSAGES: 5000 // 5 segundos
    },

    // Configurações de debug
    DEBUG: {
        ENABLED: true,
        LOG_REQUESTS: true,
        LOG_RESPONSES: true,
        LOG_ERRORS: true,
        VERBOSE: true
    }
};

// Detecção automática de ambiente
(function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || protocol === 'file:') {
        CONFIG.ENVIRONMENT.current = CONFIG.ENVIRONMENT.DEVELOPMENT;
    } else {
        CONFIG.ENVIRONMENT.current = CONFIG.ENVIRONMENT.PRODUCTION;
        CONFIG.DEBUG.ENABLED = false; // Desabilitar debug em produção
    }
})();

// Função para obter configuração específica
function getConfig(path) {
    return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
}

// Função para verificar se está em desenvolvimento
function isDevelopment() {
    return CONFIG.ENVIRONMENT.current === CONFIG.ENVIRONMENT.DEVELOPMENT;
}

// Função para verificar se está em produção
function isProduction() {
    return CONFIG.ENVIRONMENT.current === CONFIG.ENVIRONMENT.PRODUCTION;
}

// Função para log de debug
function debugLog(message, data = null) {
    if (CONFIG.DEBUG.ENABLED) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DEBUG:`, message, data);
        
        // Adicionar ao log visual
        const logContainer = document.getElementById('debug-logs');
        if (logContainer) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <span class="timestamp">[${timestamp}]</span>
                <span class="message">${message}</span>
                ${data ? `<pre class="data">${JSON.stringify(data, null, 2)}</pre>` : ''}
            `;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }
}

// Exportar para uso global
window.CONFIG = CONFIG;
window.getConfig = getConfig;
window.isDevelopment = isDevelopment;
window.isProduction = isProduction;
window.debugLog = debugLog;