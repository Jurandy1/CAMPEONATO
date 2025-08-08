// API Configuration
const API_CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwislttP0hq3zh1DP4hGxYGrltcPE3IFCisFPJH5WwDKygMy489PXM4DNc1C78f4hV3/exec',
    SHEET_ID: '1ichfN6EWPJ5F3Ypc9l31BXB657HEnn5PJCItiQA5oac',
    DRIVE_FOLDER_ID: '1KVRBiTK5kpBY2p6hsh43qqI8zAj67BfS'
};

// API Helper Functions
class CampeonatoAPI {
    constructor() {
        this.baseUrl = API_CONFIG.SCRIPT_URL;
    }

    // Generic API call method
    async makeRequest(action, data = {}) {
        try {
            showLoading(true);
            
            const payload = {
                action: action,
                ...data
            };

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erro na requisição');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            showToast('Erro de conexão: ' + error.message, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }

    // Teams API methods
    async getTeams() {
        return await this.makeRequest('getTeams');
    }

    async createTeam(teamData) {
        return await this.makeRequest('createTeam', { teamData });
    }

    async updateTeam(teamId, teamData) {
        return await this.makeRequest('updateTeam', { teamId, teamData });
    }

    async deleteTeam(teamId) {
        return await this.makeRequest('deleteTeam', { teamId });
    }

    async getTeamById(teamId) {
        return await this.makeRequest('getTeamById', { teamId });
    }

    // Players API methods
    async getPlayers(teamId = null) {
        return await this.makeRequest('getPlayers', { teamId });
    }

    async createPlayer(playerData) {
        return await this.makeRequest('createPlayer', { playerData });
    }

    async updatePlayer(playerId, playerData) {
        return await this.makeRequest('updatePlayer', { playerId, playerData });
    }

    async deletePlayer(playerId) {
        return await this.makeRequest('deletePlayer', { playerId });
    }

    async approvePlayer(playerId) {
        return await this.makeRequest('approvePlayer', { playerId });
    }

    async rejectPlayer(playerId, reason) {
        return await this.makeRequest('rejectPlayer', { playerId, reason });
    }

    // Matches API methods
    async getMatches(rodada = null, status = null) {
        return await this.makeRequest('getMatches', { rodada, status });
    }

    async createMatch(matchData) {
        return await this.makeRequest('createMatch', { matchData });
    }

    async updateMatch(matchId, matchData) {
        return await this.makeRequest('updateMatch', { matchId, matchData });
    }

    async updateMatchResult(matchId, placarA, placarB, eventos = []) {
        return await this.makeRequest('updateMatchResult', { 
            matchId, 
            placarA, 
            placarB, 
            eventos 
        });
    }

    async generateMatches(categoria = null) {
        return await this.makeRequest('generateMatches', { categoria });
    }

    // Rankings API methods
    async getRankings(categoria = null) {
        return await this.makeRequest('getRankings', { categoria });
    }

    async updateRankings() {
        return await this.makeRequest('updateRankings');
    }

    // Events API methods
    async getEvents(matchId = null) {
        return await this.makeRequest('getEvents', { matchId });
    }

    async createEvent(eventData) {
        return await this.makeRequest('createEvent', { eventData });
    }

    // Requests API methods
    async getRequests(status = 'Pendente') {
        return await this.makeRequest('getRequests', { status });
    }

    async approveRequest(requestId) {
        return await this.makeRequest('approveRequest', { requestId });
    }

    async rejectRequest(requestId, reason) {
        return await this.makeRequest('rejectRequest', { requestId, reason });
    }

    // Groups API methods
    async generateGroups(categoria = null) {
        return await this.makeRequest('generateGroups', { categoria });
    }

    async getGroups() {
        return await this.makeRequest('getGroups');
    }

    // Authentication API methods
    async authenticateTeam(token) {
        return await this.makeRequest('authenticateTeam', { token });
    }

    async authenticateAdmin(password) {
        return await this.makeRequest('authenticateAdmin', { password });
    }

    // Configuration API methods
    async getConfig(key = null) {
        return await this.makeRequest('getConfig', { key });
    }

    async setConfig(key, value) {
        return await this.makeRequest('setConfig', { key, value });
    }

    // Statistics API methods
    async getStatistics(teamId = null, playerId = null) {
        return await this.makeRequest('getStatistics', { teamId, playerId });
    }

    async getMatchStatistics(matchId) {
        return await this.makeRequest('getMatchStatistics', { matchId });
    }

    // File upload methods
    async uploadFile(file, type = 'image') {
        try {
            showLoading(true);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('folderId', API_CONFIG.DRIVE_FOLDER_ID);
            formData.append('action', 'uploadFile');

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erro no upload');
            }

            return result;
        } catch (error) {
            console.error('Upload Error:', error);
            showToast('Erro no upload: ' + error.message, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }

    // Batch operations
    async batchCreatePlayers(players) {
        return await this.makeRequest('batchCreatePlayers', { players });
    }

    async batchUpdateMatches(matches) {
        return await this.makeRequest('batchUpdateMatches', { matches });
    }

    // Validation methods
    async validateTeamName(name, excludeId = null) {
        return await this.makeRequest('validateTeamName', { name, excludeId });
    }

    async validatePlayerDocument(document, excludeId = null) {
        return await this.makeRequest('validatePlayerDocument', { document, excludeId });
    }

    // Reporting methods
    async generateReport(type, filters = {}) {
        return await this.makeRequest('generateReport', { type, filters });
    }

    async exportData(tables = []) {
        return await this.makeRequest('exportData', { tables });
    }

    async importData(data) {
        return await this.makeRequest('importData', { data });
    }

    // Notification methods
    async sendNotification(recipients, message, type = 'info') {
        return await this.makeRequest('sendNotification', { 
            recipients, 
            message, 
            type 
        });
    }

    // Tournament management
    async createTournament(tournamentData) {
        return await this.makeRequest('createTournament', { tournamentData });
    }

    async updateTournament(tournamentId, tournamentData) {
        return await this.makeRequest('updateTournament', { tournamentId, tournamentData });
    }

    async getTournaments() {
        return await this.makeRequest('getTournaments');
    }

    // Backup and restore
    async createBackup() {
        return await this.makeRequest('createBackup');
    }

    async restoreBackup(backupId) {
        return await this.makeRequest('restoreBackup', { backupId });
    }

    // System health
    async getSystemHealth() {
        return await this.makeRequest('getSystemHealth');
    }

    async clearCache() {
        return await this.makeRequest('clearCache');
    }
}

// Initialize API instance
const api = new CampeonatoAPI();

// Utility functions for API responses
function handleApiError(error, context = '') {
    console.error(`API Error${context ? ' in ' + context : ''}:`, error);
    
    let message = 'Erro desconhecido';
    
    if (error.message) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    showToast(message, 'error');
    return null;
}

function handleApiSuccess(data, message = null) {
    if (message) {
        showToast(message, 'success');
    }
    return data;
}

// Cache management
class APICache {
    constructor() {
        this.cache = new Map();
        this.expiry = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, value);
        this.expiry.set(key, Date.now() + ttl);
    }

    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        if (Date.now() > this.expiry.get(key)) {
            this.cache.delete(key);
            this.expiry.delete(key);
            return null;
        }

        return this.cache.get(key);
    }

    delete(key) {
        this.cache.delete(key);
        this.expiry.delete(key);
    }

    clear() {
        this.cache.clear();
        this.expiry.clear();
    }

    // Clean expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, expireTime] of this.expiry.entries()) {
            if (now > expireTime) {
                this.cache.delete(key);
                this.expiry.delete(key);
            }
        }
    }
}

// Initialize cache
const apiCache = new APICache();

// Clean cache every 10 minutes
setInterval(() => apiCache.cleanup(), 10 * 60 * 1000);

// Enhanced API methods with caching
const cachedAPI = {
    async getTeams(forceRefresh = false) {
        const cacheKey = 'teams';
        
        if (!forceRefresh) {
            const cached = apiCache.get(cacheKey);
            if (cached) return cached;
        }

        try {
            const data = await api.getTeams();
            apiCache.set(cacheKey, data);
            return data;
        } catch (error) {
            return handleApiError(error, 'getTeams');
        }
    },

    async getMatches(rodada = null, status = null, forceRefresh = false) {
        const cacheKey = `matches_${rodada || 'all'}_${status || 'all'}`;
        
        if (!forceRefresh) {
            const cached = apiCache.get(cacheKey);
            if (cached) return cached;
        }

        try {
            const data = await api.getMatches(rodada, status);
            apiCache.set(cacheKey, data, 2 * 60 * 1000); // 2 minutes for matches
            return data;
        } catch (error) {
            return handleApiError(error, 'getMatches');
        }
    },

    async getRankings(categoria = null, forceRefresh = false) {
        const cacheKey = `rankings_${categoria || 'all'}`;
        
        if (!forceRefresh) {
            const cached = apiCache.get(cacheKey);
            if (cached) return cached;
        }

        try {
            const data = await api.getRankings(categoria);
            apiCache.set(cacheKey, data, 3 * 60 * 1000); // 3 minutes for rankings
            return data;
        } catch (error) {
            return handleApiError(error, 'getRankings');
        }
    },

    // Invalidate cache when data changes
    invalidateTeamsCache() {
        apiCache.delete('teams');
    },

    invalidateMatchesCache() {
        // Remove all matches cache entries
        for (const key of apiCache.cache.keys()) {
            if (key.startsWith('matches_')) {
                apiCache.delete(key);
            }
        }
    },

    invalidateRankingsCache() {
        // Remove all rankings cache entries
        for (const key of apiCache.cache.keys()) {
            if (key.startsWith('rankings_')) {
                apiCache.delete(key);
            }
        }
    }
};

// Export for use in other files
window.api = api;
window.cachedAPI = cachedAPI;
window.apiCache = apiCache;