// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Check if user is admin
    if (!auth.isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Initializing Admin Panel...');
    
    // Set up navigation
    setupAdminNavigation();
    
    // Load initial data
    loadDashboard();
    
    console.log('Admin Panel initialized successfully');
}

// Admin Navigation Setup
function setupAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showAdminSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific admin section
function showAdminSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`admin-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section data
        loadAdminSectionData(sectionId);
    }
}

// Load data for specific admin section
async function loadAdminSectionData(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'teams':
            await loadAdminTeams();
            break;
        case 'players':
            await loadAdminPlayers();
            break;
        case 'matches':
            await loadAdminMatches();
            break;
        case 'requests':
            await loadAdminRequests();
            break;
        case 'rankings':
            await loadAdminRankings();
            break;
        case 'reports':
            // Reports section is static
            break;
        case 'settings':
            await loadSettings();
            break;
        default:
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        showLoading(true, 'Carregando dashboard...');
        
        // Load stats
        await Promise.all([
            loadDashboardStats(),
            loadRecentActivities(),
            loadUpcomingMatches()
        ]);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Erro ao carregar dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadDashboardStats() {
    try {
        const [teams, players, matches, requests] = await Promise.all([
            api.getTeams(),
            api.getPlayers(),
            api.getMatches(),
            api.getRequests('Pendente')
        ]);
        
        document.getElementById('totalTeams').textContent = teams?.length || 0;
        document.getElementById('totalPlayers').textContent = players?.length || 0;
        document.getElementById('totalMatches').textContent = matches?.length || 0;
        document.getElementById('pendingRequests').textContent = requests?.length || 0;
        
        // Update requests badge
        const badge = document.getElementById('requestsBadge');
        if (badge) {
            badge.textContent = requests?.length || 0;
            badge.style.display = (requests?.length || 0) > 0 ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentActivities() {
    try {
        const activitiesContainer = document.getElementById('recentActivities');
        
        // Mock recent activities (in real app, this would come from API)
        const activities = [
            {
                type: 'team_registered',
                title: 'Novo time cadastrado',
                description: 'Time "Flamingo FC" foi cadastrado',
                time: '2 horas atrás',
                icon: 'fas fa-users'
            },
            {
                type: 'player_approved',
                title: 'Jogador aprovado',
                description: 'João Silva foi aprovado para o time ABC',
                time: '4 horas atrás',
                icon: 'fas fa-check'
            },
            {
                type: 'match_completed',
                title: 'Partida finalizada',
                description: 'ABC 2 x 1 DEF - Rodada 3',
                time: '1 dia atrás',
                icon: 'fas fa-futbol'
            }
        ];
        
        const activitiesHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
        
        activitiesContainer.innerHTML = activitiesHTML || '<p>Nenhuma atividade recente</p>';
        
    } catch (error) {
        console.error('Error loading activities:', error);
        document.getElementById('recentActivities').innerHTML = '<p>Erro ao carregar atividades</p>';
    }
}

async function loadUpcomingMatches() {
    try {
        const matchesContainer = document.getElementById('upcomingMatches');
        
        const matches = await api.getMatches(null, 'Agendado');
        const upcomingMatches = matches?.slice(0, 5) || [];
        
        if (upcomingMatches.length === 0) {
            matchesContainer.innerHTML = '<p>Nenhuma partida agendada</p>';
            return;
        }
        
        const matchesHTML = upcomingMatches.map(match => `
            <div class="match-preview">
                <div class="match-teams-preview">
                    <h4>${match.TimeA?.Nome || 'TBD'} × ${match.TimeB?.Nome || 'TBD'}</h4>
                    <p>Rodada ${match.Rodada} - ${match.Local}</p>
                </div>
                <div class="match-time-preview">
                    ${formatDateTime(match.DataHora)}
                </div>
            </div>
        `).join('');
        
        matchesContainer.innerHTML = matchesHTML;
        
    } catch (error) {
        console.error('Error loading upcoming matches:', error);
        document.getElementById('upcomingMatches').innerHTML = '<p>Erro ao carregar partidas</p>';
    }
}

// Teams Management
async function loadAdminTeams() {
    try {
        const tbody = document.querySelector('#teamsTable tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Carregando times...</td></tr>';
        
        const teams = await api.getTeams();
        
        if (!teams || teams.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum time cadastrado</td></tr>';
            return;
        }
        
        const teamsHTML = teams.map(team => `
            <tr>
                <td>${team.ID_Time}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${team.LogoURL ? 
                            `<img src="${team.LogoURL}" alt="${team.Nome}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">` :
                            `<div style="width: 30px; height: 30px; border-radius: 50%; background: #667eea; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;"><i class="fas fa-shield-alt"></i></div>`
                        }
                        <span>${team.Nome}</span>
                    </div>
                </td>
                <td>${team.Responsavel}</td>
                <td>${team.EmailResponsavel}</td>
                <td>${team.totalJogadores || 0}</td>
                <td><span class="status-badge status-active">Ativo</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewTeamDetails('${team.ID_Time}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editTeam('${team.ID_Time}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteTeam('${team.ID_Time}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = teamsHTML;
        
    } catch (error) {
        console.error('Error loading admin teams:', error);
        document.querySelector('#teamsTable tbody').innerHTML = 
            '<tr><td colspan="7" class="text-center">Erro ao carregar times</td></tr>';
    }
}

// Players Management
async function loadAdminPlayers() {
    try {
        const tbody = document.querySelector('#playersTable tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Carregando jogadores...</td></tr>';
        
        // Load teams for filter
        await loadPlayerFilters();
        
        const players = await api.getPlayers();
        
        if (!players || players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum jogador cadastrado</td></tr>';
            return;
        }
        
        const playersHTML = players.map(player => {
            const statusClass = getStatusClass(player.Status);
            return `
                <tr>
                    <td>${player.ID_Jogador}</td>
                    <td>${player.Nome}</td>
                    <td>${player.Time?.Nome || 'N/A'}</td>
                    <td>${player.Posicao}</td>
                    <td>${player.Tipo}</td>
                    <td><span class="status-badge ${statusClass}">${player.Status}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${player.Status === 'Pendente' ? `
                                <button class="btn-action btn-approve" onclick="approvePlayer('${player.ID_Jogador}')">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn-action btn-reject" onclick="rejectPlayer('${player.ID_Jogador}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="btn-action btn-view" onclick="viewPlayerDetails('${player.ID_Jogador}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-edit" onclick="editPlayer('${player.ID_Jogador}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = playersHTML;
        
    } catch (error) {
        console.error('Error loading admin players:', error);
        document.querySelector('#playersTable tbody').innerHTML = 
            '<tr><td colspan="7" class="text-center">Erro ao carregar jogadores</td></tr>';
    }
}

async function loadPlayerFilters() {
    try {
        const teamFilter = document.getElementById('playerTeamFilter');
        const teams = await api.getTeams();
        
        teamFilter.innerHTML = '<option value="">Todos os Times</option>';
        teams?.forEach(team => {
            teamFilter.innerHTML += `<option value="${team.ID_Time}">${team.Nome}</option>`;
        });
        
    } catch (error) {
        console.error('Error loading player filters:', error);
    }
}

// Matches Management
async function loadAdminMatches() {
    try {
        const tbody = document.querySelector('#matchesTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Carregando partidas...</td></tr>';
        
        const matches = await api.getMatches();
        
        if (!matches || matches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhuma partida cadastrada</td></tr>';
            return;
        }
        
        const matchesHTML = matches.map(match => {
            const statusClass = getStatusClass(match.Status);
            const hasResult = match.PlacarA !== null && match.PlacarB !== null;
            
            return `
                <tr>
                    <td>${match.ID_Jogo}</td>
                    <td>${match.Rodada}</td>
                    <td>${formatDateTime(match.DataHora)}</td>
                    <td>${match.TimeA?.Nome || 'TBD'}</td>
                    <td>${match.TimeB?.Nome || 'TBD'}</td>
                    <td>
                        ${hasResult ? `${match.PlacarA} × ${match.PlacarB}` : '-'}
                    </td>
                    <td><span class="status-badge ${statusClass}">${match.Status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="editMatchResult('${match.ID_Jogo}')">
                                <i class="fas fa-edit"></i> ${hasResult ? 'Editar' : 'Inserir'}
                            </button>
                            <button class="btn-action btn-view" onclick="viewMatchDetails('${match.ID_Jogo}')">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = matchesHTML;
        
    } catch (error) {
        console.error('Error loading admin matches:', error);
        document.querySelector('#matchesTable tbody').innerHTML = 
            '<tr><td colspan="8" class="text-center">Erro ao carregar partidas</td></tr>';
    }
}

// Requests Management
async function loadAdminRequests() {
    try {
        const requestsList = document.getElementById('requestsList');
        requestsList.innerHTML = '<div class="loading">Carregando solicitações...</div>';
        
        const requests = await api.getRequests('Pendente');
        
        if (!requests || requests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Nenhuma solicitação pendente</h3>
                    <p>Todas as solicitações foram processadas</p>
                </div>
            `;
            return;
        }
        
        const requestsHTML = requests.map(request => `
            <div class="request-card">
                <div class="request-header">
                    <span class="request-type">${request.TipoSolicitacao}</span>
                    <span class="request-time">${formatDateTime(request.DataHora)}</span>
                </div>
                <div class="request-content">
                    <h4>${getRequestTitle(request)}</h4>
                    <p><strong>Origem:</strong> ${request.Origem}</p>
                    <p><strong>Dados:</strong> ${formatRequestData(request.Dados)}</p>
                </div>
                <div class="request-actions">
                    <button class="btn btn-success" onclick="approveRequest('${request.ID_Solicitacao}')">
                        <i class="fas fa-check"></i> Aprovar
                    </button>
                    <button class="btn btn-danger" onclick="rejectRequest('${request.ID_Solicitacao}')">
                        <i class="fas fa-times"></i> Rejeitar
                    </button>
                    <button class="btn btn-secondary" onclick="viewRequestDetails('${request.ID_Solicitacao}')">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </div>
            </div>
        `).join('');
        
        requestsList.innerHTML = requestsHTML;
        
    } catch (error) {
        console.error('Error loading admin requests:', error);
        document.getElementById('requestsList').innerHTML = 
            '<div class="error-state"><p>Erro ao carregar solicitações</p></div>';
    }
}

// Rankings Management
async function loadAdminRankings() {
    try {
        const rankingsContainer = document.getElementById('adminRankingsTable');
        rankingsContainer.innerHTML = '<div class="loading">Carregando classificação...</div>';
        
        const rankings = await api.getRankings();
        
        if (!rankings || rankings.length === 0) {
            rankingsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>Classificação não disponível</h3>
                    <p>Execute o cálculo da classificação</p>
                    <button class="btn btn-primary" onclick="updateRankings()">
                        <i class="fas fa-calculator"></i> Calcular Classificação
                    </button>
                </div>
            `;
            return;
        }
        
        const tableHTML = createAdminRankingsTable(rankings);
        rankingsContainer.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error loading admin rankings:', error);
        document.getElementById('adminRankingsTable').innerHTML = 
            '<div class="error-state"><p>Erro ao carregar classificação</p></div>';
    }
}

// Settings Management
async function loadSettings() {
    try {
        const configs = await api.getConfig();
        
        // Load configuration values
        if (configs) {
            document.getElementById('championshipName').value = configs.championshipName || '';
            document.getElementById('playerLimit').value = configs.playerLimit || 20;
            document.getElementById('proPlayerLimit').value = configs.proPlayerLimit || 5;
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Erro ao carregar configurações', 'error');
    }
}

// Action Functions
async function refreshDashboard() {
    await loadDashboard();
    showToast('Dashboard atualizado!', 'success');
}

async function updateRankings() {
    try {
        showLoading(true, 'Recalculando classificação...');
        
        await api.updateRankings();
        await loadAdminRankings();
        
        showToast('Classificação atualizada com sucesso!', 'success');
    } catch (error) {
        handleApiError(error, 'atualização da classificação');
    } finally {
        showLoading(false);
    }
}

async function saveSettings() {
    try {
        showLoading(true, 'Salvando configurações...');
        
        const settings = {
            championshipName: document.getElementById('championshipName').value,
            playerLimit: parseInt(document.getElementById('playerLimit').value),
            proPlayerLimit: parseInt(document.getElementById('proPlayerLimit').value)
        };
        
        for (const [key, value] of Object.entries(settings)) {
            await api.setConfig(key, value);
        }
        
        showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
        handleApiError(error, 'salvamento das configurações');
    } finally {
        showLoading(false);
    }
}

async function approvePlayer(playerId) {
    try {
        await api.approvePlayer(playerId);
        showToast('Jogador aprovado com sucesso!', 'success');
        await loadAdminPlayers();
        await loadDashboardStats();
    } catch (error) {
        handleApiError(error, 'aprovação do jogador');
    }
}

async function rejectPlayer(playerId) {
    const reason = prompt('Motivo da rejeição (opcional):');
    try {
        await api.rejectPlayer(playerId, reason);
        showToast('Jogador rejeitado!', 'info');
        await loadAdminPlayers();
        await loadDashboardStats();
    } catch (error) {
        handleApiError(error, 'rejeição do jogador');
    }
}

async function approveRequest(requestId) {
    try {
        await api.approveRequest(requestId);
        showToast('Solicitação aprovada!', 'success');
        await loadAdminRequests();
        await loadDashboardStats();
    } catch (error) {
        handleApiError(error, 'aprovação da solicitação');
    }
}

async function rejectRequest(requestId) {
    const reason = prompt('Motivo da rejeição (opcional):');
    try {
        await api.rejectRequest(requestId, reason);
        showToast('Solicitação rejeitada!', 'info');
        await loadAdminRequests();
        await loadDashboardStats();
    } catch (error) {
        handleApiError(error, 'rejeição da solicitação');
    }
}

async function generateMatchesDialog() {
    if (confirm('Deseja gerar as partidas automaticamente? Esta ação irá criar todas as partidas do campeonato.')) {
        try {
            showLoading(true, 'Gerando partidas...');
            await api.generateMatches();
            showToast('Partidas geradas com sucesso!', 'success');
            await loadAdminMatches();
        } catch (error) {
            handleApiError(error, 'geração de partidas');
        } finally {
            showLoading(false);
        }
    }
}

// Filter Functions
function filterPlayers() {
    const teamFilter = document.getElementById('playerTeamFilter').value;
    const statusFilter = document.getElementById('playerStatusFilter').value;
    
    // In a real implementation, this would filter the table
    console.log('Filtering players:', { teamFilter, statusFilter });
    loadAdminPlayers(); // Reload with filters
}

// Export Functions
function exportTeams() {
    showToast('Função de exportação em desenvolvimento', 'info');
}

function generateReport(type) {
    showToast(`Gerando relatório de ${type}...`, 'info');
    // Implementation would generate and download report
}

// Utility Functions
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'ativo':
        case 'aprovado':
        case 'finalizado':
            return 'status-approved';
        case 'pendente':
        case 'agendado':
            return 'status-pending';
        case 'rejeitado':
        case 'cancelado':
            return 'status-rejected';
        case 'em andamento':
            return 'status-active';
        default:
            return 'status-pending';
    }
}

function getRequestTitle(request) {
    switch (request.TipoSolicitacao) {
        case 'cadastro_jogador':
            return 'Solicitação de Cadastro de Jogador';
        case 'alteracao_time':
            return 'Solicitação de Alteração de Time';
        case 'transferencia_jogador':
            return 'Solicitação de Transferência';
        default:
            return request.TipoSolicitacao;
    }
}

function formatRequestData(data) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return data;
        }
    }
    
    if (typeof data === 'object') {
        return Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }
    
    return data?.toString() || 'N/A';
}

function createAdminRankingsTable(rankings) {
    return `
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Time</th>
                        <th>J</th>
                        <th>V</th>
                        <th>E</th>
                        <th>D</th>
                        <th>GP</th>
                        <th>GC</th>
                        <th>SG</th>
                        <th>Pts</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${rankings.map((team, index) => `
                        <tr>
                            <td><strong>${index + 1}°</strong></td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    ${team.LogoURL ? 
                                        `<img src="${team.LogoURL}" alt="${team.Nome}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">` :
                                        `<i class="fas fa-shield-alt" style="color: #667eea;"></i>`
                                    }
                                    <span>${team.Nome}</span>
                                </div>
                            </td>
                            <td>${team.jogos || 0}</td>
                            <td>${team.vitorias || 0}</td>
                            <td>${team.empates || 0}</td>
                            <td>${team.derrotas || 0}</td>
                            <td>${team.golsPro || 0}</td>
                            <td>${team.golsContra || 0}</td>
                            <td>${(team.golsPro || 0) - (team.golsContra || 0)}</td>
                            <td><strong style="color: #667eea;">${team.pontos || 0}</strong></td>
                            <td>
                                <button class="btn-action btn-view" onclick="viewTeamDetails('${team.ID_Time}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Placeholder functions for features to be implemented
function showCreateTeamModal() {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function showCreateMatchModal() {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function deleteTeam(teamId) {
    if (confirm('Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.')) {
        showToast('Funcionalidade em desenvolvimento', 'info');
    }
}

function viewPlayerDetails(playerId) {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function editPlayer(playerId) {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function viewRequestDetails(requestId) {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function approveAllRequests() {
    if (confirm('Deseja aprovar todas as solicitações pendentes?')) {
        showToast('Funcionalidade em desenvolvimento', 'info');
    }
}

// Make functions globally available
window.showAdminSection = showAdminSection;
window.refreshDashboard = refreshDashboard;
window.updateRankings = updateRankings;
window.saveSettings = saveSettings;
window.approvePlayer = approvePlayer;
window.rejectPlayer = rejectPlayer;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.generateMatchesDialog = generateMatchesDialog;
window.filterPlayers = filterPlayers;
window.exportTeams = exportTeams;
window.generateReport = generateReport;
window.showCreateTeamModal = showCreateTeamModal;
window.showCreateMatchModal = showCreateMatchModal;
window.deleteTeam = deleteTeam;
window.viewPlayerDetails = viewPlayerDetails;
window.editPlayer = editPlayer;
window.viewRequestDetails = viewRequestDetails;
window.approveAllRequests = approveAllRequests;