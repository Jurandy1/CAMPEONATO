// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userType = null; // 'admin' or 'team'
        this.token = null;
        this.sessionKey = 'campeonato_session';
        
        // Load session on initialization
        this.loadSession();
    }

    // Save session to localStorage
    saveSession() {
        const sessionData = {
            user: this.currentUser,
            userType: this.userType,
            token: this.token,
            timestamp: Date.now()
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }

    // Load session from localStorage
    loadSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            if (!sessionData) return false;

            const session = JSON.parse(sessionData);
            
            // Check if session is not older than 24 hours
            const sessionAge = Date.now() - session.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge > maxAge) {
                this.clearSession();
                return false;
            }

            this.currentUser = session.user;
            this.userType = session.userType;
            this.token = session.token;
            
            this.updateUIForLoggedUser();
            return true;
        } catch (error) {
            console.error('Error loading session:', error);
            this.clearSession();
            return false;
        }
    }

    // Clear session
    clearSession() {
        this.currentUser = null;
        this.userType = null;
        this.token = null;
        localStorage.removeItem(this.sessionKey);
        this.updateUIForGuest();
    }

    // Login as team
    async loginTeam(token) {
        try {
            showLoading(true);
            
            const response = await api.authenticateTeam(token);
            
            if (response.success) {
                this.currentUser = response.team;
                this.userType = 'team';
                this.token = token;
                
                this.saveSession();
                this.updateUIForLoggedUser();
                
                showToast('Login realizado com sucesso!', 'success');
                closeModal('loginModal');
                
                // Redirect to team dashboard
                this.showTeamDashboard();
                
                return true;
            } else {
                throw new Error(response.message || 'Token inválido');
            }
        } catch (error) {
            handleApiError(error, 'login de time');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Login as admin
    async loginAdmin(password) {
        try {
            showLoading(true);
            
            const response = await api.authenticateAdmin(password);
            
            if (response.success) {
                this.currentUser = response.admin;
                this.userType = 'admin';
                this.token = password; // For simplicity, using password as token
                
                this.saveSession();
                this.updateUIForLoggedUser();
                
                showToast('Login de administrador realizado!', 'success');
                closeModal('loginModal');
                
                // Show admin panel
                this.showAdminPanel();
                
                return true;
            } else {
                throw new Error(response.message || 'Senha de administrador inválida');
            }
        } catch (error) {
            handleApiError(error, 'login de administrador');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Logout
    logout() {
        this.clearSession();
        showToast('Logout realizado com sucesso!', 'info');
        
        // Redirect to home
        showSection('home');
        
        // Hide admin/team specific sections
        this.hideAdminElements();
        this.hideTeamElements();
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null && this.token !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.userType === 'admin';
    }

    // Check if user is team
    isTeam() {
        return this.userType === 'team';
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get current token
    getToken() {
        return this.token;
    }

    // Update UI for logged user
    updateUIForLoggedUser() {
        const loginBtn = document.querySelector('.btn-login');
        const adminLink = document.getElementById('admin-link');
        
        if (loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i> 
                ${this.currentUser?.nome || this.currentUser?.responsavel || 'Usuário'}
                <i class="fas fa-chevron-down"></i>
            `;
            
            // Add dropdown menu
            this.addUserDropdown(loginBtn);
        }

        // Show admin link for admins
        if (this.isAdmin() && adminLink) {
            adminLink.style.display = 'block';
        }

        // Update navigation permissions
        this.updateNavigationPermissions();
    }

    // Update UI for guest
    updateUIForGuest() {
        const loginBtn = document.querySelector('.btn-login');
        const adminLink = document.getElementById('admin-link');
        
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            this.removeUserDropdown();
        }

        if (adminLink) {
            adminLink.style.display = 'none';
        }

        this.hideAdminElements();
        this.hideTeamElements();
    }

    // Add user dropdown menu
    addUserDropdown(loginBtn) {
        // Remove existing dropdown
        this.removeUserDropdown();
        
        // Create dropdown container
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-content">
                ${this.isTeam() ? `
                    <a href="#" onclick="auth.showTeamDashboard()" class="dropdown-item">
                        <i class="fas fa-tachometer-alt"></i> Painel do Time
                    </a>
                    <a href="#" onclick="auth.showTeamPlayers()" class="dropdown-item">
                        <i class="fas fa-users"></i> Meus Jogadores
                    </a>
                ` : ''}
                ${this.isAdmin() ? `
                    <a href="#" onclick="auth.showAdminPanel()" class="dropdown-item">
                        <i class="fas fa-cog"></i> Painel Admin
                    </a>
                    <a href="#" onclick="auth.showAdminRequests()" class="dropdown-item">
                        <i class="fas fa-clipboard-list"></i> Solicitações
                    </a>
                ` : ''}
                <div class="dropdown-divider"></div>
                <a href="#" onclick="auth.logout()" class="dropdown-item">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            </div>
        `;
        
        loginBtn.parentNode.appendChild(dropdown);
        
        // Add click event to toggle dropdown
        loginBtn.addEventListener('click', this.toggleUserDropdown);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', this.closeUserDropdownOutside);
    }

    // Remove user dropdown
    removeUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.remove();
        }
        
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.removeEventListener('click', this.toggleUserDropdown);
        }
        
        document.removeEventListener('click', this.closeUserDropdownOutside);
    }

    // Toggle user dropdown
    toggleUserDropdown(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    // Close dropdown when clicking outside
    closeUserDropdownOutside(event) {
        const dropdown = document.querySelector('.user-dropdown');
        const loginBtn = document.querySelector('.btn-login');
        
        if (dropdown && !dropdown.contains(event.target) && !loginBtn.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    }

    // Update navigation permissions
    updateNavigationPermissions() {
        // Show/hide elements based on user type
        const adminElements = document.querySelectorAll('.admin-only');
        const teamElements = document.querySelectorAll('.team-only');
        const guestElements = document.querySelectorAll('.guest-only');
        
        adminElements.forEach(el => {
            el.style.display = this.isAdmin() ? 'block' : 'none';
        });
        
        teamElements.forEach(el => {
            el.style.display = this.isTeam() ? 'block' : 'none';
        });
        
        guestElements.forEach(el => {
            el.style.display = !this.isLoggedIn() ? 'block' : 'none';
        });
    }

    // Show team dashboard
    showTeamDashboard() {
        if (!this.isTeam()) {
            showToast('Acesso negado', 'error');
            return;
        }
        
        // Load team dashboard
        window.location.href = 'painel-time.html';
    }

    // Show team players
    showTeamPlayers() {
        if (!this.isTeam()) {
            showToast('Acesso negado', 'error');
            return;
        }
        
        // Implementation for team players view
        console.log('Show team players');
    }

    // Show admin panel
    showAdminPanel() {
        if (!this.isAdmin()) {
            showToast('Acesso negado', 'error');
            return;
        }
        
        // Load admin panel
        window.location.href = 'admin.html';
    }

    // Show admin requests
    showAdminRequests() {
        if (!this.isAdmin()) {
            showToast('Acesso negado', 'error');
            return;
        }
        
        // Implementation for admin requests view
        console.log('Show admin requests');
    }

    // Hide admin elements
    hideAdminElements() {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Hide team elements
    hideTeamElements() {
        const teamElements = document.querySelectorAll('.team-only');
        teamElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Check permissions for action
    hasPermission(action) {
        switch (action) {
            case 'manage_teams':
            case 'manage_players':
            case 'manage_matches':
            case 'manage_results':
            case 'view_admin':
                return this.isAdmin();
                
            case 'register_players':
            case 'view_team_dashboard':
                return this.isTeam();
                
            case 'view_public':
                return true;
                
            default:
                return false;
        }
    }

    // Validate session periodically
    startSessionValidation() {
        // Check session every 5 minutes
        setInterval(() => {
            if (this.isLoggedIn()) {
                const sessionData = localStorage.getItem(this.sessionKey);
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    const sessionAge = Date.now() - session.timestamp;
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                    
                    if (sessionAge > maxAge) {
                        this.logout();
                        showToast('Sessão expirada. Faça login novamente.', 'warning');
                    }
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Generate team token (for admin use)
    generateTeamToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Validate token format
    isValidToken(token) {
        return token && token.length >= 10 && /^[a-zA-Z0-9]+$/.test(token);
    }

    // Security functions
    hashPassword(password) {
        // Simple hash function (in real app, use proper hashing)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Rate limiting for login attempts
    checkRateLimit() {
        const attemptsKey = 'login_attempts';
        const timestampKey = 'login_timestamp';
        
        const attempts = parseInt(localStorage.getItem(attemptsKey) || '0');
        const timestamp = parseInt(localStorage.getItem(timestampKey) || '0');
        
        const now = Date.now();
        const cooldownPeriod = 15 * 60 * 1000; // 15 minutes
        
        // Reset attempts if cooldown period has passed
        if (now - timestamp > cooldownPeriod) {
            localStorage.setItem(attemptsKey, '0');
            localStorage.setItem(timestampKey, now.toString());
            return true;
        }
        
        // Check if too many attempts
        if (attempts >= 5) {
            const remainingTime = Math.ceil((cooldownPeriod - (now - timestamp)) / 60000);
            showToast(`Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`, 'error');
            return false;
        }
        
        return true;
    }

    // Record failed login attempt
    recordFailedAttempt() {
        const attemptsKey = 'login_attempts';
        const timestampKey = 'login_timestamp';
        
        const attempts = parseInt(localStorage.getItem(attemptsKey) || '0');
        localStorage.setItem(attemptsKey, (attempts + 1).toString());
        localStorage.setItem(timestampKey, Date.now().toString());
    }

    // Clear failed attempts on successful login
    clearFailedAttempts() {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_timestamp');
    }
}

// Initialize authentication manager
const auth = new AuthManager();

// Start session validation
auth.startSessionValidation();

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    
    if (!auth.checkRateLimit()) {
        return;
    }
    
    const loginType = document.getElementById('loginType').value;
    
    if (loginType === 'team') {
        const token = document.getElementById('teamToken').value.trim();
        
        if (!token) {
            showToast('Por favor, informe o token do time', 'warning');
            return;
        }
        
        if (!auth.isValidToken(token)) {
            showToast('Token inválido', 'error');
            auth.recordFailedAttempt();
            return;
        }
        
        auth.loginTeam(token).then(success => {
            if (success) {
                auth.clearFailedAttempts();
            } else {
                auth.recordFailedAttempt();
            }
        });
        
    } else if (loginType === 'admin') {
        const password = document.getElementById('adminPassword').value.trim();
        
        if (!password) {
            showToast('Por favor, informe a senha de administrador', 'warning');
            return;
        }
        
        auth.loginAdmin(password).then(success => {
            if (success) {
                auth.clearFailedAttempts();
            } else {
                auth.recordFailedAttempt();
            }
        });
    }
}

// Toggle login fields based on type
function toggleLoginFields() {
    const loginType = document.getElementById('loginType').value;
    const teamTokenGroup = document.getElementById('teamTokenGroup');
    const adminPasswordGroup = document.getElementById('adminPasswordGroup');
    
    if (loginType === 'team') {
        teamTokenGroup.style.display = 'block';
        adminPasswordGroup.style.display = 'none';
        document.getElementById('teamToken').required = true;
        document.getElementById('adminPassword').required = false;
    } else {
        teamTokenGroup.style.display = 'none';
        adminPasswordGroup.style.display = 'block';
        document.getElementById('teamToken').required = false;
        document.getElementById('adminPassword').required = true;
    }
}

// Export for global use
window.auth = auth;