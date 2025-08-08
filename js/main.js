// Main JavaScript for Campeonato Manager
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing Campeonato Manager...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up forms
    setupForms();
    
    // Load initial data
    loadInitialData();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Application initialized successfully');
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section data
        loadSectionData(sectionId);
    }
}

// Load data for specific section
async function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'teams':
            await loadTeams();
            break;
        case 'matches':
            await loadMatches();
            break;
        case 'rankings':
            await loadRankings();
            break;
        default:
            break;
    }
}

// Setup Forms
function setupForms() {
    // Team registration form
    const teamForm = document.getElementById('teamRegisterForm');
    if (teamForm) {
        teamForm.addEventListener('submit', handleTeamRegistration);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal close buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
            const modal = e.target.classList.contains('modal') ? e.target : e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load teams for home section
        await loadTeams();
        
        // Load recent matches
        await loadRecentMatches();
        
        // Update navigation based on auth
        auth.updateNavigationPermissions();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Erro ao carregar dados iniciais', 'error');
    }
}

// Teams Management
async function loadTeams() {
    try {
        const teamsGrid = document.getElementById('teamsGrid');
        if (!teamsGrid) return;
        
        teamsGrid.innerHTML = '<div class="loading">Carregando times...</div>';
        
        const teams = await cachedAPI.getTeams();
        
        if (!teams || teams.length === 0) {
            teamsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nenhum time cadastrado</h3>
                    <p>Seja o primeiro a cadastrar um time!</p>
                    <button class="btn btn-primary" onclick="showTeamRegisterModal()">
                        <i class="fas fa-plus"></i> Cadastrar Time
                    </button>
                </div>
            `;
            return;
        }
        
        const teamsHTML = teams.map(team => createTeamCard(team)).join('');
        teamsGrid.innerHTML = teamsHTML;
        
    } catch (error) {
        console.error('Error loading teams:', error);
        document.getElementById('teamsGrid').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar times</h3>
                <p>Tente novamente em alguns instantes</p>
                <button class="btn btn-primary" onclick="loadTeams()">
                    <i class="fas fa-refresh"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Create team card HTML
function createTeamCard(team) {
    const logoUrl = team.LogoURL || '';
    const logoHTML = logoUrl ? 
        `<img src="${logoUrl}" alt="${team.Nome}" class="team-logo">` :
        `<div class="team-logo default"><i class="fas fa-shield-alt"></i></div>`;
    
    return `
        <div class="team-card" data-team-id="${team.ID_Time}">
            <div class="team-header">
                ${logoHTML}
                <div class="team-info">
                    <h3>${team.Nome}</h3>
                    <p><i class="fas fa-user"></i> ${team.Responsavel}</p>
                </div>
            </div>
            <div class="team-stats">
                <div class="stat">
                    <div class="stat-value">${team.totalJogadores || 0}</div>
                    <div class="stat-label">Jogadores</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${team.vitorias || 0}</div>
                    <div class="stat-label">Vitórias</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${team.pontos || 0}</div>
                    <div class="stat-label">Pontos</div>
                </div>
            </div>
            <div class="team-actions mt-3">
                <button class="btn btn-secondary btn-sm" onclick="viewTeamDetails('${team.ID_Time}')">
                    <i class="fas fa-eye"></i> Ver Detalhes
                </button>
                ${auth.isAdmin() ? `
                    <button class="btn btn-primary btn-sm" onclick="editTeam('${team.ID_Time}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Matches Management
async function loadMatches() {
    try {
        const matchesList = document.getElementById('matchesList');
        if (!matchesList) return;
        
        matchesList.innerHTML = '<div class="loading">Carregando partidas...</div>';
        
        // Load filter options
        await loadMatchFilters();
        
        const matches = await cachedAPI.getMatches();
        
        if (!matches || matches.length === 0) {
            matchesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-futbol"></i>
                    <h3>Nenhuma partida agendada</h3>
                    <p>As partidas serão geradas automaticamente</p>
                    ${auth.isAdmin() ? `
                        <button class="btn btn-primary" onclick="generateMatches()">
                            <i class="fas fa-magic"></i> Gerar Partidas
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }
        
        const matchesHTML = matches.map(match => createMatchCard(match)).join('');
        matchesList.innerHTML = matchesHTML;
        
    } catch (error) {
        console.error('Error loading matches:', error);
        document.getElementById('matchesList').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar partidas</h3>
                <p>Tente novamente em alguns instantes</p>
                <button class="btn btn-primary" onclick="loadMatches()">
                    <i class="fas fa-refresh"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Create match card HTML
function createMatchCard(match) {
    const statusClass = `status-${match.Status.toLowerCase().replace(' ', '')}`;
    const hasResult = match.PlacarA !== null && match.PlacarB !== null;
    
    return `
        <div class="match-card" data-match-id="${match.ID_Jogo}">
            <div class="match-header">
                <div class="match-info">
                    <span class="match-round">Rodada ${match.Rodada}</span>
                    <span class="match-date">${formatDateTime(match.DataHora)}</span>
                    <span class="match-location"><i class="fas fa-map-marker-alt"></i> ${match.Local}</span>
                </div>
                <span class="match-status ${statusClass}">${match.Status}</span>
            </div>
            <div class="match-teams">
                <div class="team-match home">
                    <span class="team-name">${match.TimeA?.Nome || 'TBD'}</span>
                    <div class="team-logo-small">
                        ${match.TimeA?.LogoURL ? 
                            `<img src="${match.TimeA.LogoURL}" alt="${match.TimeA.Nome}">` :
                            `<i class="fas fa-shield-alt"></i>`
                        }
                    </div>
                </div>
                <div class="match-score">
                    ${hasResult ? 
                        `${match.PlacarA} <span class="vs">×</span> ${match.PlacarB}` :
                        `<span class="vs">×</span>`
                    }
                </div>
                <div class="team-match away">
                    <div class="team-logo-small">
                        ${match.TimeB?.LogoURL ? 
                            `<img src="${match.TimeB.LogoURL}" alt="${match.TimeB.Nome}">` :
                            `<i class="fas fa-shield-alt"></i>`
                        }
                    </div>
                    <span class="team-name">${match.TimeB?.Nome || 'TBD'}</span>
                </div>
            </div>
            ${auth.isAdmin() ? `
                <div class="match-actions mt-3">
                    <button class="btn btn-primary btn-sm" onclick="editMatchResult('${match.ID_Jogo}')">
                        <i class="fas fa-edit"></i> ${hasResult ? 'Editar Resultado' : 'Inserir Resultado'}
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="viewMatchDetails('${match.ID_Jogo}')">
                        <i class="fas fa-chart-bar"></i> Estatísticas
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Rankings Management
async function loadRankings() {
    try {
        const rankingsTable = document.getElementById('rankingsTable');
        if (!rankingsTable) return;
        
        rankingsTable.innerHTML = '<div class="loading">Carregando classificação...</div>';
        
        const rankings = await cachedAPI.getRankings();
        
        if (!rankings || rankings.length === 0) {
            rankingsTable.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>Classificação não disponível</h3>
                    <p>A classificação será gerada após as primeiras partidas</p>
                </div>
            `;
            return;
        }
        
        const tableHTML = createRankingsTable(rankings);
        rankingsTable.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Error loading rankings:', error);
        document.getElementById('rankingsTable').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar classificação</h3>
                <p>Tente novamente em alguns instantes</p>
                <button class="btn btn-primary" onclick="loadRankings()">
                    <i class="fas fa-refresh"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Create rankings table HTML
function createRankingsTable(rankings) {
    const headerHTML = `
        <table>
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
                </tr>
            </thead>
            <tbody>
    `;
    
    const rowsHTML = rankings.map((team, index) => `
        <tr>
            <td class="position">${index + 1}°</td>
            <td>
                <div class="team-ranking">
                    ${team.LogoURL ? 
                        `<img src="${team.LogoURL}" alt="${team.Nome}" class="team-logo-tiny">` :
                        `<i class="fas fa-shield-alt"></i>`
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
            <td class="points"><strong>${team.pontos || 0}</strong></td>
        </tr>
    `).join('');
    
    const footerHTML = `
            </tbody>
        </table>
    `;
    
    return headerHTML + rowsHTML + footerHTML;
}

// Team Registration
async function handleTeamRegistration(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const teamData = {
            nome: formData.get('nome'),
            responsavel: formData.get('responsavel'),
            email: formData.get('email')
        };
        
        // Validate data
        if (!teamData.nome || !teamData.responsavel || !teamData.email) {
            showToast('Todos os campos obrigatórios devem ser preenchidos', 'warning');
            return;
        }
        
        // Upload logo if provided
        const logoFile = formData.get('logo');
        if (logoFile && logoFile.size > 0) {
            showLoading(true, 'Fazendo upload da logo...');
            const uploadResult = await api.uploadFile(logoFile, 'image');
            if (uploadResult.success) {
                teamData.logoURL = uploadResult.url;
            }
        }
        
        // Create team
        showLoading(true, 'Cadastrando time...');
        const result = await api.createTeam(teamData);
        
        if (result.success) {
            showToast(`Time cadastrado com sucesso! Token: ${result.token}`, 'success');
            closeModal('teamRegisterModal');
            
            // Show token modal
            showTokenModal(result.token);
            
            // Refresh teams list
            cachedAPI.invalidateTeamsCache();
            await loadTeams();
            
            // Reset form
            event.target.reset();
        } else {
            throw new Error(result.message || 'Erro ao cadastrar time');
        }
        
    } catch (error) {
        handleApiError(error, 'cadastro de time');
    } finally {
        showLoading(false);
    }
}

// Show team token modal
function showTokenModal(token) {
    const tokenModal = `
        <div id="tokenModal" class="modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Time Cadastrado com Sucesso!</h3>
                </div>
                <div class="modal-body" style="padding: 30px; text-align: center;">
                    <p>Seu time foi cadastrado com sucesso! Guarde bem o token abaixo para fazer login:</p>
                    <div class="token-display">
                        <input type="text" value="${token}" readonly id="teamTokenValue" style="
                            width: 100%; 
                            padding: 15px; 
                            font-size: 1.2rem; 
                            text-align: center; 
                            background: #f8f9fa; 
                            border: 2px solid #667eea; 
                            border-radius: 8px; 
                            margin: 20px 0;
                            font-weight: bold;
                        ">
                        <button class="btn btn-secondary" onclick="copyToken()">
                            <i class="fas fa-copy"></i> Copiar Token
                        </button>
                    </div>
                    <p><strong>Importante:</strong> Este token é necessário para acessar o painel do seu time. Não o compartilhe com terceiros.</p>
                    <button class="btn btn-primary" onclick="closeModal('tokenModal')">
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', tokenModal);
}

// Copy token to clipboard
function copyToken() {
    const tokenInput = document.getElementById('teamTokenValue');
    tokenInput.select();
    document.execCommand('copy');
    showToast('Token copiado para a área de transferência!', 'success');
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Remove token modal if it exists
        if (modalId === 'tokenModal') {
            modal.remove();
        }
    }
}

function showTeamRegisterModal() {
    showModal('teamRegisterModal');
}

function showLoginModal() {
    showModal('loginModal');
}

// Loading Functions
function showLoading(show, message = 'Carregando...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
        
        const loadingText = overlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Utility Functions
function formatDateTime(dateString) {
    if (!dateString) return 'Data não definida';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Data não definida';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatTime(dateString) {
    if (!dateString) return 'Hora não definida';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Filter Functions
async function loadMatchFilters() {
    try {
        const rodadaFilter = document.getElementById('rodadaFilter');
        if (!rodadaFilter) return;
        
        // Get unique rounds from matches
        const matches = await cachedAPI.getMatches();
        const rounds = [...new Set(matches.map(m => m.Rodada))].sort((a, b) => a - b);
        
        rodadaFilter.innerHTML = '<option value="">Todas as Rodadas</option>';
        rounds.forEach(round => {
            rodadaFilter.innerHTML += `<option value="${round}">Rodada ${round}</option>`;
        });
        
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

function filterMatches() {
    const rodada = document.getElementById('rodadaFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    // Reload matches with filters
    loadMatchesWithFilter(rodada, status);
}

async function loadMatchesWithFilter(rodada, status) {
    try {
        const matchesList = document.getElementById('matchesList');
        if (!matchesList) return;
        
        matchesList.innerHTML = '<div class="loading">Filtrando partidas...</div>';
        
        const matches = await cachedAPI.getMatches(rodada, status, true);
        
        if (!matches || matches.length === 0) {
            matchesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <h3>Nenhuma partida encontrada</h3>
                    <p>Tente ajustar os filtros de busca</p>
                </div>
            `;
            return;
        }
        
        const matchesHTML = matches.map(match => createMatchCard(match)).join('');
        matchesList.innerHTML = matchesHTML;
        
    } catch (error) {
        console.error('Error filtering matches:', error);
        showToast('Erro ao filtrar partidas', 'error');
    }
}

// Load recent matches for home section
async function loadRecentMatches() {
    try {
        // This would show recent matches on the home page
        // Implementation depends on UI design
        console.log('Loading recent matches...');
    } catch (error) {
        console.error('Error loading recent matches:', error);
    }
}

// View functions (placeholders for detailed views)
function viewTeamDetails(teamId) {
    console.log('View team details:', teamId);
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function viewMatchDetails(matchId) {
    console.log('View match details:', matchId);
    showToast('Funcionalidade em desenvolvimento', 'info');
}

// Admin functions (placeholders)
function editTeam(teamId) {
    if (!auth.isAdmin()) {
        showToast('Acesso negado', 'error');
        return;
    }
    console.log('Edit team:', teamId);
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function editMatchResult(matchId) {
    if (!auth.isAdmin()) {
        showToast('Acesso negado', 'error');
        return;
    }
    console.log('Edit match result:', matchId);
    showToast('Funcionalidade em desenvolvimento', 'info');
}

function generateMatches() {
    if (!auth.isAdmin()) {
        showToast('Acesso negado', 'error');
        return;
    }
    console.log('Generate matches');
    showToast('Funcionalidade em desenvolvimento', 'info');
}

// Make functions globally available
window.showSection = showSection;
window.showTeamRegisterModal = showTeamRegisterModal;
window.showLoginModal = showLoginModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.showLoading = showLoading;
window.viewTeamDetails = viewTeamDetails;
window.viewMatchDetails = viewMatchDetails;
window.editTeam = editTeam;
window.editMatchResult = editMatchResult;
window.generateMatches = generateMatches;
window.filterMatches = filterMatches;
window.copyToken = copyToken;
window.toggleLoginFields = toggleLoginFields;