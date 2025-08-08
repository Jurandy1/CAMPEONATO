// Sistema de Gestão de Campeonato - Aplicação Principal
class ChampionshipManager {
    constructor() {
        this.data = [];
        this.isOnline = false;
        this.currentMode = CONFIG.ENVIRONMENT.current;
        this.init();
    }

    init() {
        debugLog('Inicializando Sistema de Gestão de Campeonato');
        this.setupEventListeners();
        this.updateUI();
        this.testConnection();
    }

    setupEventListeners() {
        // Botão de atualizar dados
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.loadChampionshipData();
        });

        // Botão de alternar modo
        document.getElementById('toggle-mode').addEventListener('click', () => {
            this.toggleMode();
        });

        // Botão de testar conexão
        document.getElementById('test-connection').addEventListener('click', () => {
            this.testConnection();
        });

        // Formulário de dados
        document.getElementById('championship-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveChampionshipData();
        });
    }

    // Função para fazer requisições com JSONP como fallback
    async makeRequest(action, data = {}) {
        const url = CONFIG.GOOGLE_APPS_SCRIPT.URL;
        const params = {
            action: action,
            sheetId: CONFIG.GOOGLE_APPS_SCRIPT.SHEET_ID,
            folderId: CONFIG.GOOGLE_APPS_SCRIPT.DRIVE_FOLDER_ID,
            ...data
        };

        debugLog(`Fazendo requisição: ${action}`, params);

        // Em modo de desenvolvimento, usar dados mock
        if (isDevelopment() && !this.isOnline) {
            debugLog('Usando dados mock (modo desenvolvimento offline)');
            return this.getMockData(action, params);
        }

        try {
            // Primeiro, tentar com fetch (pode dar erro CORS)
            const response = await this.fetchWithTimeout(url, params);
            debugLog('Resposta recebida via fetch', response);
            return response;
        } catch (error) {
            debugLog('Erro no fetch, tentando JSONP', error);
            
            // Se falhou, tentar JSONP
            try {
                const response = await this.jsonpRequest(url, params);
                debugLog('Resposta recebida via JSONP', response);
                return response;
            } catch (jsonpError) {
                debugLog('Erro no JSONP também', jsonpError);
                
                // Se ambos falharam, usar dados mock se disponível
                if (isDevelopment()) {
                    debugLog('Usando dados mock como fallback');
                    this.showMessage('Erro de conexão. Usando dados de exemplo.', 'warning');
                    return this.getMockData(action, params);
                }
                
                throw jsonpError;
            }
        }
    }

    // Fetch com timeout
    async fetchWithTimeout(url, params) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST.TIMEOUT);

        try {
            // Usar GET com parâmetros para evitar preflight requests
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${url}?${queryString}`;

            const response = await fetch(fullUrl, {
                method: 'GET',
                signal: controller.signal,
                mode: 'cors', // Explicitamente usar CORS
                headers: {
                    'Accept': 'application/json',
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // Requisição JSONP
    jsonpRequest(url, params) {
        return new Promise((resolve, reject) => {
            const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const script = document.createElement('script');
            
            // Timeout para JSONP
            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error('JSONP timeout'));
            }, CONFIG.REQUEST.TIMEOUT);

            // Função de callback global
            window[callbackName] = function(data) {
                cleanup();
                resolve(data);
            };

            function cleanup() {
                clearTimeout(timeoutId);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                delete window[callbackName];
            }

            // Adicionar callback aos parâmetros
            params[CONFIG.REQUEST.CALLBACK_PARAM] = callbackName;
            
            // Construir URL com parâmetros
            const queryString = new URLSearchParams(params).toString();
            script.src = `${url}?${queryString}`;
            
            script.onerror = function() {
                cleanup();
                reject(new Error('JSONP script error'));
            };

            document.head.appendChild(script);
        });
    }

    // Obter dados mock
    getMockData(action, params) {
        return new Promise((resolve) => {
            setTimeout(() => {
                switch (action) {
                    case 'getCampeonatoData':
                    case 'getData': // Compatibilidade
                        resolve({
                            success: true,
                            data: CONFIG.MOCK_DATA.championship
                        });
                        break;
                    case 'addTime':
                    case 'saveData': // Compatibilidade
                        resolve({
                            success: true,
                            message: 'Time adicionado com sucesso (simulação)',
                            data: {
                                ID_Time: Math.floor(Math.random() * 1000),
                                Nome: params.nome || params.teamName,
                                TokenAcesso: 'MOCK' + Date.now()
                            }
                        });
                        break;
                    case 'addJogador':
                        resolve({
                            success: true,
                            message: 'Jogador adicionado com sucesso (simulação)'
                        });
                        break;
                    case 'addJogo':
                        resolve({
                            success: true,
                            message: 'Jogo adicionado com sucesso (simulação)'
                        });
                        break;
                    case 'updatePlacar':
                        resolve({
                            success: true,
                            message: 'Placar atualizado com sucesso (simulação)'
                        });
                        break;
                    case 'addEvento':
                        resolve({
                            success: true,
                            message: 'Evento adicionado com sucesso (simulação)'
                        });
                        break;
                    case 'addSolicitacao':
                        resolve({
                            success: true,
                            message: 'Solicitação adicionada com sucesso (simulação)'
                        });
                        break;
                    case 'updateStatus':
                        resolve({
                            success: true,
                            message: 'Status atualizado com sucesso (simulação)'
                        });
                        break;
                    case 'authenticate':
                        resolve({
                            success: true,
                            message: 'Autenticação bem-sucedida (simulação)',
                            data: { authenticated: true, Nome: 'Time Mock' }
                        });
                        break;
                    case 'test':
                        resolve({
                            success: true,
                            message: 'Conexão de teste bem-sucedida (mock)',
                            version: '2.0.0'
                        });
                        break;
                    default:
                        resolve({
                            success: false,
                            error: 'Ação não reconhecida'
                        });
                }
            }, 500); // Simular delay de rede
        });
    }

    // Carregar dados do campeonato
    async loadChampionshipData() {
        this.showLoading(true);
        this.hideMessages();

        try {
            const response = await this.makeRequest('getCampeonatoData');
            
            if (response.success) {
                // Suportar tanto estrutura nova quanto antiga
                if (response.data && typeof response.data === 'object') {
                    if (response.data.times) {
                        // Nova estrutura com múltiplas abas
                        this.data = this.convertNewDataToOldFormat(response.data);
                    } else if (Array.isArray(response.data)) {
                        // Estrutura antiga (array direto)
                        this.data = response.data;
                    } else {
                        // Outros formatos
                        this.data = [];
                    }
                } else {
                    this.data = [];
                }
                
                this.renderChampionshipData();
                this.showMessage(CONFIG.UI.MESSAGES.DATA_LOADED, 'success');
                debugLog('Dados carregados com sucesso', this.data);
            } else {
                throw new Error(response.error || 'Erro desconhecido');
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.showLoading(false);
        }
    }

    // Converter nova estrutura de dados para formato compatível com a interface atual
    convertNewDataToOldFormat(newData) {
        if (!newData.times || !Array.isArray(newData.times)) {
            return [];
        }

        // Converter times para formato da tabela de classificação
        return newData.times.map((time, index) => {
            // Calcular estatísticas baseadas nos jogos se disponível
            let points = 0;
            let matchesPlayed = 0;
            let wins = 0;
            let draws = 0;
            let losses = 0;

            if (newData.jogos && Array.isArray(newData.jogos)) {
                const timesGames = newData.jogos.filter(jogo => 
                    jogo.ID_TimeA === time.ID_Time || jogo.ID_TimeB === time.ID_Time
                );

                matchesPlayed = timesGames.filter(jogo => jogo.Status === 'Finalizado').length;

                timesGames.forEach(jogo => {
                    if (jogo.Status === 'Finalizado') {
                        const isTeamA = jogo.ID_TimeA === time.ID_Time;
                        const teamScore = isTeamA ? jogo.PlacarA : jogo.PlacarB;
                        const opponentScore = isTeamA ? jogo.PlacarB : jogo.PlacarA;

                        if (teamScore > opponentScore) {
                            wins++;
                            points += 3;
                        } else if (teamScore === opponentScore) {
                            draws++;
                            points += 1;
                        } else {
                            losses++;
                        }
                    }
                });
            }

            return {
                id: time.ID_Time,
                teamName: time.Nome,
                points: points,
                matchesPlayed: matchesPlayed,
                wins: wins,
                draws: draws,
                losses: losses
            };
        });
    }

    // Salvar dados do campeonato
    async saveChampionshipData() {
        const formData = new FormData(document.getElementById('championship-form'));
        const data = {
            nome: formData.get('teamName'),  // Usar campo 'nome' para nova API
            teamName: formData.get('teamName'), // Manter compatibilidade
            points: parseInt(formData.get('points')),
            matchesPlayed: parseInt(formData.get('matchesPlayed'))
        };

        if (!this.validateData(data)) {
            this.showMessage(CONFIG.UI.MESSAGES.INVALID_DATA, 'error');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const response = await this.makeRequest('addTime', data);
            
            if (response.success) {
                this.showMessage(CONFIG.UI.MESSAGES.DATA_SAVED, 'success');
                document.getElementById('championship-form').reset();
                await this.loadChampionshipData(); // Recarregar dados
                debugLog('Time adicionado com sucesso', data);
            } else {
                throw new Error(response.error || 'Erro ao salvar dados');
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.showLoading(false);
        }
    }

    // Testar conexão
    async testConnection() {
        debugLog('Testando conexão...');
        this.showLoading(true);

        try {
            const response = await this.makeRequest('test');
            
            if (response.success) {
                this.isOnline = true;
                this.showMessage(CONFIG.UI.MESSAGES.CONNECTION_SUCCESS, 'success');
                debugLog('Teste de conexão bem-sucedido');
            } else {
                throw new Error(response.error || 'Falha no teste de conexão');
            }
        } catch (error) {
            this.isOnline = false;
            this.showMessage(CONFIG.UI.MESSAGES.CONNECTION_ERROR, 'warning');
            debugLog('Teste de conexão falhou', error);
        } finally {
            this.updateConnectionStatus();
            this.showLoading(false);
        }
    }

    // Validar dados
    validateData(data) {
        return data.teamName && 
               data.teamName.trim().length > 0 && 
               !isNaN(data.points) && 
               data.points >= 0 && 
               !isNaN(data.matchesPlayed) && 
               data.matchesPlayed >= 0;
    }

    // Renderizar dados do campeonato
    renderChampionshipData() {
        const container = document.getElementById('championship-data');
        
        if (!this.data || this.data.length === 0) {
            container.innerHTML = '<p>Nenhum dado encontrado.</p>';
            return;
        }

        // Ordenar por pontos (decrescente)
        const sortedData = [...this.data].sort((a, b) => b.points - a.points);

        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Posição</th>
                    <th>Equipe</th>
                    <th>Pontos</th>
                    <th>Jogos</th>
                    <th>Vitórias</th>
                    <th>Empates</th>
                    <th>Derrotas</th>
                </tr>
            </thead>
            <tbody>
                ${sortedData.map((team, index) => `
                    <tr>
                        <td>${index + 1}º</td>
                        <td>${team.teamName}</td>
                        <td>${team.points}</td>
                        <td>${team.matchesPlayed}</td>
                        <td>${team.wins || 0}</td>
                        <td>${team.draws || 0}</td>
                        <td>${team.losses || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);
    }

    // Alternar modo de operação
    toggleMode() {
        if (this.currentMode === CONFIG.ENVIRONMENT.DEVELOPMENT) {
            this.currentMode = CONFIG.ENVIRONMENT.PRODUCTION;
            CONFIG.DEBUG.ENABLED = false;
        } else {
            this.currentMode = CONFIG.ENVIRONMENT.DEVELOPMENT;
            CONFIG.DEBUG.ENABLED = true;
        }
        
        this.updateUI();
        debugLog(`Modo alterado para: ${this.currentMode}`);
    }

    // Atualizar interface
    updateUI() {
        document.getElementById('current-mode').textContent = 
            this.currentMode === CONFIG.ENVIRONMENT.DEVELOPMENT ? 'Desenvolvimento' : 'Produção';
        this.updateConnectionStatus();
    }

    // Atualizar status de conexão
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (this.isOnline) {
            statusElement.textContent = 'Online';
            statusElement.className = 'status online';
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'status offline';
        }
    }

    // Mostrar mensagem
    showMessage(message, type = 'info') {
        const messageElement = document.getElementById(`${type === 'error' ? 'error' : 'success'}-message`);
        messageElement.textContent = message;
        messageElement.style.display = 'block';

        // Auto-hide depois de um tempo
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, CONFIG.UI.AUTO_HIDE_MESSAGES);
    }

    // Esconder mensagens
    hideMessages() {
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('success-message').style.display = 'none';
    }

    // Mostrar/esconder loading
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    // Tratar erros
    handleError(error) {
        debugLog('Erro capturado', error);
        
        let message = CONFIG.UI.MESSAGES.NETWORK_ERROR;
        
        if (error.message.includes('CORS')) {
            message = CONFIG.UI.MESSAGES.CORS_ERROR;
        } else if (error.message.includes('timeout')) {
            message = CONFIG.UI.MESSAGES.TIMEOUT_ERROR;
        } else if (error.message.includes('NetworkError')) {
            message = CONFIG.UI.MESSAGES.NETWORK_ERROR;
        }
        
        this.showMessage(message, 'error');
    }

    // Novas funções utilitárias para usar as APIs específicas

    // Adicionar jogador
    async addJogador(jogadorData) {
        try {
            const response = await this.makeRequest('addJogador', jogadorData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Adicionar jogo
    async addJogo(jogoData) {
        try {
            const response = await this.makeRequest('addJogo', jogoData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Atualizar placar
    async updatePlacar(idJogo, placarA, placarB, status = 'Finalizado') {
        try {
            const response = await this.makeRequest('updatePlacar', {
                idJogo: idJogo,
                placarA: placarA,
                placarB: placarB,
                status: status
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Adicionar evento
    async addEvento(eventoData) {
        try {
            const response = await this.makeRequest('addEvento', eventoData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Adicionar solicitação
    async addSolicitacao(solicitacaoData) {
        try {
            const response = await this.makeRequest('addSolicitacao', solicitacaoData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Atualizar status
    async updateStatus(tabela, id, status, statusColumn) {
        try {
            const response = await this.makeRequest('updateStatus', {
                tabela: tabela,
                id: id,
                status: status,
                statusColumn: statusColumn
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Autenticar
    async authenticate(token, idTime = null) {
        try {
            const params = { token: token };
            if (idTime) {
                params.idTime = idTime;
            }
            const response = await this.makeRequest('authenticate', params);
            return response;
        } catch (error) {
            throw error;
        }
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.championshipManager = new ChampionshipManager();
});