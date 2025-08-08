// Team Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTeamDashboard();
});

function initializeTeamDashboard() {
    // Check if user is a team
    if (!auth.isTeam()) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Initializing Team Dashboard...');
    
    // Set up navigation
    setupTeamNavigation();
    
    // Load team data
    loadTeamData();
    
    // Set up forms
    setupTeamForms();
    
    console.log('Team Dashboard initialized successfully');
}

// Team Navigation Setup
function setupTeamNavigation() {
    const navLinks = document.querySelectorAll('.team-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showTeamSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific team section
function showTeamSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.team-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`team-${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section data
        loadTeamSectionData(sectionId);
    }
}

// Load data for specific team section
async function loadTeamSectionData(sectionId) {
    switch (sectionId) {
        case 'overview':
            await loadTeamOverview();
            break;
        case 'players':
            await loadTeamPlayers();
            break;
        case 'matches':
            await loadTeamMatches();
            break;
        case 'statistics':
            await loadTeamStatistics();
            break;
        case 'profile':
            await loadTeamProfile();
            break;
        default:
            break;
    }
}

// Load Team Data
async function loadTeamData() {
    try {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) return;
        
        // Update sidebar with team info
        document.getElementById('teamName').textContent = currentUser.Nome;
        document.getElementById('teamResponsavel').textContent = currentUser.Responsavel;
        
        // Update team logo
        const logoElement = document.getElementById('teamLogoLarge');
        if (currentUser.LogoURL) {
            logoElement.innerHTML = `<img src="${currentUser.LogoURL}" alt="${currentUser.Nome}">`;
        }
        
        // Load overview by default
        await loadTeamOverview();
        
    } catch (error) {
        console.error('Error loading team data:', error);
        showToast('Erro ao carregar dados do time', 'error');
    }
}

// Overview Functions
async function loadTeamOverview() {
    try {
        showLoading(true, 'Carregando visão geral...');
        
        await Promise.all([
            loadTeamStats(),
            loadNextMatches(),
            loadTeamRanking()
        ]);
        
    } catch (error) {
        console.error('Error loading team overview:', error);
        showToast('Erro ao carregar visão geral', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadTeamStats() {
    try {
        const currentUser = auth.getCurrentUser();
        const teamId = currentUser.ID_Time;
        
        // Load basic stats
        const [players, matches, statistics] = await Promise.all([
            api.getPlayers(teamId),
            api.getMatches(),
            api.getStatistics(teamId)
        ]);
        
        // Filter team matches
        const teamMatches = matches?.filter(match => 
            match.ID_TimeA === teamId || match.ID_TimeB === teamId
        ) || [];
        
        // Update stats
        document.getElementById('totalTeamPlayers').textContent = players?.length || 0;
        document.getElementById('totalTeamMatches').textContent = teamMatches.length;
        document.getElementById('teamWins').textContent = statistics?.vitorias || 0;
        document.getElementById('teamPoints').textContent = statistics?.pontos || 0;
        
    } catch (error) {
        console.error('Error loading team stats:', error);
    }
}

async function loadNextMatches() {
    try {
        const currentUser = auth.getCurrentUser();
        const teamId = currentUser.ID_Time;
        
        const matches = await api.getMatches(null, 'Agendado');
        const teamMatches = matches?.filter(match => 
            match.ID_TimeA === teamId || match.ID_TimeB === teamId
        ).slice(0, 3) || [];
        
        const nextMatchesContainer = document.getElementById('nextMatches');
        
        if (teamMatches.length === 0) {
            nextMatchesContainer.innerHTML = '<p>Nenhuma partida agendada</p>';
            return;
        }
        
        const matchesHTML = teamMatches.map(match => {
            const opponent = match.ID_TimeA === teamId ? match.TimeB : match.TimeA;
            const isHome = match.ID_TimeA === teamId;
            
            return `
                <div class="next-match">
                    <div class="next-match-info">
                        <h4>${isHome ? 'vs' : '@'} ${opponent?.Nome || 'TBD'}</h4>
                        <p>Rodada ${match.Rodada} - ${match.Local}</p>
                    </div>
                    <div class="next-match-time">
                        ${formatDateTime(match.DataHora)}
                    </div>
                </div>
            `;
        }).join('');
        
        nextMatchesContainer.innerHTML = matchesHTML;
        
    } catch (error) {
        console.error('Error loading next matches:', error);
        document.getElementById('nextMatches').innerHTML = '<p>Erro ao carregar partidas</p>';
    }
}

async function loadTeamRanking() {
    try {
        const currentUser = auth.getCurrentUser();
        const teamId = currentUser.ID_Time;
        
        const rankings = await api.getRankings();
        const teamPosition = rankings?.findIndex(team => team.ID_Time === teamId) + 1;
        const teamStats = rankings?.find(team => team.ID_Time === teamId);
        
        const rankingContainer = document.getElementById('teamRanking');
        
        if (!teamPosition || !teamStats) {
            rankingContainer.innerHTML = '<p>Classificação não disponível</p>';
            return;
        }
        
        rankingContainer.innerHTML = `
            <div class="ranking-position">${teamPosition}°</div>
            <p>de ${rankings.length} times</p>
            <div class="ranking-details">
                <div class="ranking-detail">
                    <div class="value">${teamStats.jogos || 0}</div>
                    <div class="label">Jogos</div>
                </div>
                <div class="ranking-detail">
                    <div class="value">${teamStats.vitorias || 0}</div>
                    <div class="label">Vitórias</div>
                </div>
                <div class="ranking-detail">
                    <div class="value">${teamStats.pontos || 0}</div>
                    <div class="label">Pontos</div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading team ranking:', error);
        document.getElementById('teamRanking').innerHTML = '<p>Erro ao carregar classificação</p>';
    }
}

// Players Functions
async function loadTeamPlayers() {
    try {
        const currentUser = auth.getCurrentUser();
        const teamId = currentUser.ID_Time;
        
        const playersGrid = document.getElementById('teamPlayersGrid');
        playersGrid.innerHTML = '<div class="loading">Carregando jogadores...</div>';
        
        const players = await api.getPlayers(teamId);
        
        if (!players || players.length === 0) {
            playersGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nenhum jogador cadastrado</h3>
                    <p>Cadastre jogadores para o seu time!</p>
                    <button class="btn btn-primary" onclick="showAddPlayerModal()">
                        <i class="fas fa-plus"></i> Cadastrar Jogador
                    </button>
                </div>
            `;
            return;
        }
        
        const playersHTML = players.map(player => createPlayerCard(player)).join('');
        playersGrid.innerHTML = playersHTML;
        
    } catch (error) {
        console.error('Error loading team players:', error);
        document.getElementById('teamPlayersGrid').innerHTML = 
            '<div class="error-state"><p>Erro ao carregar jogadores</p></div>';
    }
}

function createPlayerCard(player) {
    const statusClass = player.Status?.toLowerCase() || 'pendente';
    const photoUrl = player.FotoURL || '';
    const photoHTML = photoUrl ? 
        `<img src="${photoUrl}" alt="${player.Nome}" class="player-photo">` :
        `<div class="player-photo default"><i class="fas fa-user"></i></div>`;
    
    return `
        <div class="player-card">
            <div class="player-status ${statusClass}">${player.Status || 'Pendente'}</div>
            <div class="player-header">
                ${photoHTML}
                <div class="player-info">
                    <h4>${player.Nome}</h4>
                    <p>${player.Apelido || 'Sem apelido'}</p>
                </div>
            </div>
            <div class="player-details">
                <div class="player-detail">
                    <div class="label">Posição</div>
                    <div class="value">${player.Posicao}</div>
                </div>
                <div class="player-detail">
                    <div class="label">Tipo</div>
                    <div class="value">${player.Tipo}</div>
                </div>
            </div>
            ${player.Status === 'Rejeitado' ? `
                <div class="player-rejection">
                    <small><strong>Motivo:</strong> ${player.MotivoRejeicao || 'Não informado'}</small>
                </div>
            ` : ''}
        </div>
    `;
}

// Matches Functions
async function loadTeamMatches() {
    try {
        const currentUser = auth.getCurrentUser();
        const teamId = currentUser.ID_Time;
        
        const matchesList = document.getElementById('teamMatchesList');
        matchesList.innerHTML = '<div class="loading">Carregando partidas...</div>';
        
        const allMatches = await api.getMatches();
        const teamMatches = allMatches?.filter(match => 
            match.ID_TimeA === teamId || match.ID_TimeB === teamId
        ) || [];
        
        if (teamMatches.length === 0) {
            matchesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-futbol"></i>
                    <h3>Nenhuma partida agendada</h3>
                    <p>As partidas serão geradas pelo administrador</p>
                </div>
            `;
            return;
        }
        
        // Sort matches by date
        teamMatches.sort((a, b) => new Date(a.DataHora) - new Date(b.DataHora));
        
        const matchesHTML = teamMatches.map(match => createTeamMatchCard(match, teamId)).join('');
        matchesList.innerHTML = matchesHTML;
        
    } catch (error) {
        console.error('Error loading team matches:', error);
        document.getElementById('teamMatchesList').innerHTML = 
            '<div class="error-state"><p>Erro ao carregar partidas</p></div>';
    }
}

function createTeamMatchCard(match, teamId) {
    const isHome = match.ID_TimeA === teamId;
    const opponent = isHome ? match.TimeB : match.TimeA;
    const teamScore = isHome ? match.PlacarA : match.PlacarB;
    const opponentScore = isHome ? match.PlacarB : match.PlacarA;
    const hasResult = match.PlacarA !== null && match.PlacarB !== null;
    
    const statusClass = `status-${match.Status.toLowerCase().replace(' ', '')}`;
    
    let resultClass = '';
    if (hasResult) {
        if (teamScore > opponentScore) resultClass = 'victory';
        else if (teamScore < opponentScore) resultClass = 'defeat';
        else resultClass = 'draw';
    }
    
    return `
        <div class="team-match-card ${resultClass}">
            <div class="match-header">
                <div class="match-info">
                    <span>Rodada ${match.Rodada}</span>
                    <span>${formatDate(match.DataHora)}</span>
                    <span>${match.Local}</span>
                </div>
                <span class="match-status ${statusClass}">${match.Status}</span>
            </div>
            <div class="match-teams">
                <div class="team-match-display home">
                    <span class="team-name">${isHome ? auth.getCurrentUser().Nome : opponent?.Nome || 'TBD'}</span>
                </div>
                <div class="match-score">
                    ${hasResult ? 
                        `${isHome ? teamScore : opponentScore} <span class="match-vs">×</span> ${isHome ? opponentScore : teamScore}` :
                        `<span class="match-vs">×</span>`
                    }
                </div>
                <div class="team-match-display away">
                    <span class="team-name">${isHome ? opponent?.Nome || 'TBD' : auth.getCurrentUser().Nome}</span>
                </div>
            </div>
            ${match.Status === 'Finalizado' && hasResult ? `
                <div class="match-result">
                    <strong>
                        ${teamScore > opponentScore ? 'VITÓRIA' : 
                          teamScore < opponentScore ? 'DERROTA' : 'EMPATE'}
                    </strong>
                </div>
            ` : ''}
        </div>
    `;
}

// Statistics Functions
async function loadTeamStatistics() {
    try {
        const currentUser = auth.getCurrentUser();
        const teamId = currentUser.ID_Time;
        
        const statistics = await api.getStatistics(teamId);
        
        // Update general stats
        document.getElementById('statsGames').textContent = statistics?.jogos || 0;
        document.getElementById('statsWins').textContent = statistics?.vitorias || 0;
        document.getElementById('statsDraws').textContent = statistics?.empates || 0;
        document.getElementById('statsLosses').textContent = statistics?.derrotas || 0;
        document.getElementById('statsGoalsFor').textContent = statistics?.golsPro || 0;
        document.getElementById('statsGoalsAgainst').textContent = statistics?.golsContra || 0;
        document.getElementById('statsGoalDiff').textContent = 
            (statistics?.golsPro || 0) - (statistics?.golsContra || 0);
        
        // Load top scorers
        await loadTopScorers(teamId);
        
    } catch (error) {
        console.error('Error loading team statistics:', error);
        showToast('Erro ao carregar estatísticas', 'error');
    }
}

async function loadTopScorers(teamId) {
    try {
        const topScorersContainer = document.getElementById('topScorers');
        
        // Mock data for top scorers (in real app, this would come from API)
        const topScorers = [
            { nome: 'João Silva', posicao: 'Atacante', gols: 5 },
            { nome: 'Pedro Santos', posicao: 'Meio-campo', gols: 3 },
            { nome: 'Carlos Lima', posicao: 'Atacante', gols: 2 }
        ];
        
        if (topScorers.length === 0) {
            topScorersContainer.innerHTML = '<p>Nenhum gol marcado ainda</p>';
            return;
        }
        
        const scorersHTML = topScorers.map((scorer, index) => `
            <div class="scorer-item">
                <div class="scorer-position">${index + 1}</div>
                <div class="scorer-info">
                    <h4>${scorer.nome}</h4>
                    <p>${scorer.posicao}</p>
                </div>
                <div class="scorer-goals">${scorer.gols}</div>
            </div>
        `).join('');
        
        topScorersContainer.innerHTML = scorersHTML;
        
    } catch (error) {
        console.error('Error loading top scorers:', error);
        document.getElementById('topScorers').innerHTML = '<p>Erro ao carregar artilheiros</p>';
    }
}

// Profile Functions
async function loadTeamProfile() {
    try {
        const currentUser = auth.getCurrentUser();
        
        // Fill form with current team data
        document.getElementById('profileTeamName').value = currentUser.Nome;
        document.getElementById('profileResponsavel').value = currentUser.Responsavel;
        document.getElementById('profileEmail').value = currentUser.EmailResponsavel;
        
    } catch (error) {
        console.error('Error loading team profile:', error);
        showToast('Erro ao carregar perfil', 'error');
    }
}

// Form Setup
function setupTeamForms() {
    // Add player form
    const addPlayerForm = document.getElementById('addPlayerForm');
    if (addPlayerForm) {
        addPlayerForm.addEventListener('submit', handleAddPlayer);
    }
    
    // Team profile form
    const profileForm = document.getElementById('teamProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

// Add Player
async function handleAddPlayer(event) {
    event.preventDefault();
    
    try {
        const currentUser = auth.getCurrentUser();
        const formData = new FormData(event.target);
        
        const playerData = {
            ID_Time: currentUser.ID_Time,
            nome: formData.get('nome'),
            apelido: formData.get('apelido'),
            posicao: formData.get('posicao'),
            tipo: formData.get('tipo')
        };
        
        // Validate data
        if (!playerData.nome || !playerData.posicao || !playerData.tipo) {
            showToast('Todos os campos obrigatórios devem ser preenchidos', 'warning');
            return;
        }
        
        // Upload photo if provided
        const photoFile = formData.get('foto');
        if (photoFile && photoFile.size > 0) {
            showLoading(true, 'Fazendo upload da foto...');
            const uploadResult = await api.uploadFile(photoFile, 'image');
            if (uploadResult.success) {
                playerData.fotoURL = uploadResult.url;
            }
        }
        
        // Upload document if provided
        const docFile = formData.get('documento');
        if (docFile && docFile.size > 0) {
            showLoading(true, 'Fazendo upload do documento...');
            const uploadResult = await api.uploadFile(docFile, 'document');
            if (uploadResult.success) {
                playerData.docURL = uploadResult.url;
            }
        }
        
        // Create player
        showLoading(true, 'Cadastrando jogador...');
        const result = await api.createPlayer(playerData);
        
        if (result.success) {
            showToast('Jogador cadastrado! Aguardando aprovação do administrador.', 'success');
            closeModal('addPlayerModal');
            
            // Refresh players list
            await loadTeamPlayers();
            
            // Reset form
            event.target.reset();
        } else {
            throw new Error(result.message || 'Erro ao cadastrar jogador');
        }
        
    } catch (error) {
        handleApiError(error, 'cadastro de jogador');
    } finally {
        showLoading(false);
    }
}

// Save Team Profile
async function saveTeamProfile() {
    try {
        const currentUser = auth.getCurrentUser();
        
        const profileData = {
            responsavel: document.getElementById('profileResponsavel').value,
            email: document.getElementById('profileEmail').value
        };
        
        // Validate data
        if (!profileData.responsavel || !profileData.email) {
            showToast('Todos os campos devem ser preenchidos', 'warning');
            return;
        }
        
        // Upload new logo if provided
        const logoFile = document.getElementById('profileLogo').files[0];
        if (logoFile) {
            showLoading(true, 'Fazendo upload da logo...');
            const uploadResult = await api.uploadFile(logoFile, 'image');
            if (uploadResult.success) {
                profileData.logoURL = uploadResult.url;
            }
        }
        
        // Update team
        showLoading(true, 'Salvando alterações...');
        const result = await api.updateTeam(currentUser.ID_Time, profileData);
        
        if (result.success) {
            showToast('Perfil atualizado com sucesso!', 'success');
            
            // Update current user data
            Object.assign(currentUser, profileData);
            auth.saveSession();
            
            // Refresh team data
            await loadTeamData();
        } else {
            throw new Error(result.message || 'Erro ao atualizar perfil');
        }
        
    } catch (error) {
        handleApiError(error, 'atualização do perfil');
    } finally {
        showLoading(false);
    }
}

// Utility Functions
async function refreshTeamData() {
    await loadTeamData();
    showToast('Dados atualizados!', 'success');
}

function showAddPlayerModal() {
    showModal('addPlayerModal');
}

// Filter Functions
function filterTeamPlayers() {
    const positionFilter = document.getElementById('positionFilter').value;
    const statusFilter = document.getElementById('playerStatusFilter').value;
    
    // In a real implementation, this would filter the players grid
    console.log('Filtering players:', { positionFilter, statusFilter });
    loadTeamPlayers(); // Reload with filters
}

function filterTeamMatches() {
    const statusFilter = document.getElementById('matchStatusFilter').value;
    
    // In a real implementation, this would filter the matches list
    console.log('Filtering matches:', { statusFilter });
    loadTeamMatches(); // Reload with filters
}

// Make functions globally available
window.showTeamSection = showTeamSection;
window.refreshTeamData = refreshTeamData;
window.showAddPlayerModal = showAddPlayerModal;
window.saveTeamProfile = saveTeamProfile;
window.filterTeamPlayers = filterTeamPlayers;
window.filterTeamMatches = filterTeamMatches;