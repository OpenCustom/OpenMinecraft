// OpenMinecraft Launcher - Main Script
class OpenMinecraftLauncher {
    constructor() {
        this.config = {
            memory: 8,
            version: '1.20.4',
            theme: 'monochrome',
            keepOpen: true
        };
        
        this.state = {
            gameRunning: false,
            playerName: 'Player',
            selectedVersion: '1.20.4'
        };
        
        this.versions = [
            { id: '1.20.4', name: 'Minecraft 1.20.4', type: 'release' },
            { id: '1.20.2', name: 'Minecraft 1.20.2', type: 'release' },
            { id: '1.20.1', name: 'Minecraft 1.20.1', type: 'release' },
            { id: '1.20', name: 'Minecraft 1.20', type: 'release' }
        ];
        
        this.installations = [
            { id: 1, name: 'Default', version: '1.20.4', type: 'vanilla', memory: 8 },
            { id: 2, name: 'Modded', version: '1.19.2', type: 'forge', memory: 6 }
        ];
        
        this.servers = [
            { name: 'Hypixel', players: 85421, status: 'online' },
            { name: 'Mineplex', players: 12543, status: 'online' }
        ];
        
        this.news = [
            { headline: 'Minecraft 1.21 Preview', excerpt: 'New features coming soon' },
            { headline: 'OpenMinecraft v2.5', excerpt: 'Performance improvements' }
        ];
        
        this.consoleLog = [];
        this.init();
    }
    
    async init() {
        await this.showPreloader();
        this.setupEvents();
        this.loadContent();
        this.startMonitoring();
        this.log('Launcher initialized');
    }
    
    async showPreloader() {
        const preloader = document.getElementById('preloader');
        const steps = [
            { text: 'Loading...', progress: 25 },
            { text: 'Initializing...', progress: 50 },
            { text: 'Loading versions...', progress: 75 },
            { text: 'Ready!', progress: 100 }
        ];
        
        for (const step of steps) {
            document.getElementById('loaderText').textContent = step.text;
            document.getElementById('progressBar').style.width = `${step.progress}%`;
            document.getElementById('percentage').textContent = `${step.progress}%`;
            await this.delay(500);
        }
        
        await this.delay(300);
        preloader.classList.add('hidden');
        
        setTimeout(() => {
            preloader.style.display = 'none';
            document.querySelector('.launcher-container').style.display = 'flex';
            setTimeout(() => {
                document.querySelector('.launcher-container').style.opacity = '1';
            }, 10);
        }, 500);
    }
    
    setupEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.nav-item').dataset.tab));
        });
        
        document.querySelectorAll('.settings-nav').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSetting(e.target.closest('.settings-nav').dataset.setting));
        });
        
        // Play tab
        document.getElementById('ramSlider').addEventListener('input', (e) => {
            this.config.memory = e.target.value;
            document.getElementById('ramValue').textContent = `${e.target.value} GB`;
        });
        
        document.getElementById('launchBtn').addEventListener('click', () => this.launchGame());
        document.getElementById('refreshVersions').addEventListener('click', () => this.refreshVersions());
        
        // Installations
        document.getElementById('createInstallation').addEventListener('click', () => this.showInstallationModal());
        
        // Settings
        document.getElementById('keepOpen').addEventListener('change', (e) => {
            this.config.keepOpen = e.target.checked;
        });
        
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTheme(e.target.dataset.theme));
        });
        
        // Console
        document.getElementById('clearConsole').addEventListener('click', () => this.clearConsole());
        document.getElementById('consoleSend').addEventListener('click', () => this.sendCommand());
        document.getElementById('consoleCommand').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand();
        });
        
        // Window controls
        document.getElementById('minimizeBtn').addEventListener('click', () => this.minimize());
        document.getElementById('maximizeBtn').addEventListener('click', () => this.maximize());
        document.getElementById('closeBtn').addEventListener('click', () => this.close());
        document.getElementById('aboutBtn').addEventListener('click', () => this.showAbout());
        
        // Modal close
        document.getElementById('modalOverlay').addEventListener('click', () => this.hideModal());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });
    }
    
    loadContent() {
        this.loadVersions();
        this.loadNews();
        this.loadInstallations();
        this.loadServers();
        this.updatePlayerInfo();
    }
    
    loadVersions() {
        const container = document.getElementById('versionList');
        container.innerHTML = this.versions.map(v => `
            <div class="version-item ${v.id === this.state.selectedVersion ? 'selected' : ''}" 
                 data-version="${v.id}">
                <div class="version-icon"><i class="fas fa-cube"></i></div>
                <div class="version-info">
                    <div class="version-name">${v.name}</div>
                    <div class="version-meta">
                        <span>${v.type}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.version-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectVersion(item.dataset.version);
            });
        });
    }
    
    loadNews() {
        document.getElementById('newsContent').innerHTML = this.news.map(n => `
            <div class="news-item">
                <div class="news-headline">${n.headline}</div>
                <div class="news-excerpt">${n.excerpt}</div>
            </div>
        `).join('');
    }
    
    loadInstallations() {
        document.getElementById('installationsGrid').innerHTML = this.installations.map(i => `
            <div class="installation-card" data-id="${i.id}">
                <div class="installation-header">
                    <div class="installation-icon">
                        <i class="fas fa-${i.type === 'forge' ? 'fire' : 'cube'}"></i>
                    </div>
                    <div class="installation-info">
                        <div class="installation-name">${i.name}</div>
                        <div class="installation-meta">
                            <span>${i.version}</span>
                            <span>•</span>
                            <span>${i.memory} GB RAM</span>
                        </div>
                    </div>
                    <div class="installation-actions">
                        <button class="action-btn" data-action="play"><i class="fas fa-play"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.installation-card [data-action="play"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.target.closest('.installation-card').dataset.id);
                this.playInstallation(id);
            });
        });
    }
    
    loadServers() {
        document.getElementById('serverList').innerHTML = this.servers.map(s => `
            <div class="server-item">
                <div class="server-icon"><i class="fas fa-server"></i></div>
                <div class="server-info">
                    <div class="server-name">${s.name}</div>
                    <div class="server-players">${s.players.toLocaleString()} players</div>
                </div>
                <div class="server-status ${s.status}">${s.status}</div>
            </div>
        `).join('');
    }
    
    updatePlayerInfo() {
        document.getElementById('playerName').textContent = this.state.playerName;
    }
    
    switchTab(tab) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tab);
        });
        
        // Update content
        document.querySelectorAll('.content-tab').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
    }
    
    switchSetting(setting) {
        document.querySelectorAll('.settings-nav').forEach(nav => {
            nav.classList.toggle('active', nav.dataset.setting === setting);
        });
        
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.toggle('active', section.id === `${setting}-settings`);
        });
    }
    
    selectVersion(version) {
        this.state.selectedVersion = version;
        document.querySelectorAll('.version-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.version === version);
        });
        this.log(`Selected version: ${version}`);
    }
    
    async launchGame() {
        if (this.state.gameRunning) {
            this.showNotification('Game already running', 'warning');
            return;
        }
        
        this.state.gameRunning = true;
        this.updateGameStatus();
        this.log(`Launching Minecraft ${this.state.selectedVersion}...`);
        
        // Simulate launch process
        this.showNotification('Launching Minecraft...', 'info');
        
        await this.delay(2000);
        
        this.showNotification('Minecraft launched!', 'success');
        this.log('Game started successfully');
        
        // Simulate game running
        setTimeout(() => {
            this.state.gameRunning = false;
            this.updateGameStatus();
            this.log('Game session ended');
        }, 30000);
    }
    
    playInstallation(id) {
        const install = this.installations.find(i => i.id === id);
        if (install) {
            this.state.selectedVersion = install.version;
            this.config.memory = install.memory;
            this.switchTab('play');
            this.selectVersion(install.version);
            document.getElementById('ramSlider').value = install.memory;
            document.getElementById('ramValue').textContent = `${install.memory} GB`;
            this.showNotification(`Launching ${install.name}...`, 'info');
        }
    }
    
    refreshVersions() {
        this.log('Refreshing version list...');
        setTimeout(() => {
            this.loadVersions();
            this.showNotification('Versions refreshed', 'success');
        }, 500);
    }
    
    showInstallationModal() {
        this.showNotification('Installation modal would open', 'info');
    }
    
    setTheme(theme) {
        this.config.theme = theme;
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        document.body.setAttribute('data-theme', theme);
        this.log(`Theme changed to ${theme}`);
    }
    
    updateGameStatus() {
        const indicator = document.getElementById('gameStatusIndicator');
        const text = document.getElementById('gameStatusText');
        
        if (this.state.gameRunning) {
            indicator.className = 'status-indicator online';
            text.textContent = 'Game running';
        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = 'Ready';
        }
    }
    
    log(message) {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = 'console-line info';
        line.innerHTML = `<span class="line-time">[${time}]</span> ${message}`;
        
        const output = document.getElementById('consoleOutput');
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
        
        this.consoleLog.push({ time, message });
        if (this.consoleLog.length > 100) this.consoleLog.shift();
    }
    
    clearConsole() {
        document.getElementById('consoleOutput').innerHTML = 
            '<div class="console-line info">Console cleared</div>';
        this.consoleLog = [];
    }
    
    sendCommand() {
        const input = document.getElementById('consoleCommand');
        const cmd = input.value.trim();
        
        if (cmd) {
            this.log(`> ${cmd}`);
            
            if (cmd === 'help') {
                this.log('Available commands: help, version, status, clear');
            } else if (cmd === 'version') {
                this.log('OpenMinecraft Launcher v2.5.1');
            } else if (cmd === 'status') {
                this.log(`Game running: ${this.state.gameRunning}`);
                this.log(`Selected version: ${this.state.selectedVersion}`);
            } else {
                this.log(`Unknown command: ${cmd}`);
            }
            
            input.value = '';
        }
    }
    
    startMonitoring() {
        setInterval(() => {
            // Simulate system monitoring
            const cpu = Math.floor(Math.random() * 30) + 10;
            const memory = Math.floor(Math.random() * 6) + 2;
            
            document.getElementById('cpuUsage').style.width = `${cpu}%`;
            document.getElementById('cpuValue').textContent = `${cpu}%`;
            
            document.getElementById('memoryUsage').style.width = `${(memory / 16) * 100}%`;
            document.getElementById('memoryValue').textContent = `${memory}/16 GB`;
        }, 2000);
    }
    
    showAbout() {
        document.getElementById('aboutModal').classList.add('show');
        document.getElementById('modalOverlay').classList.add('show');
    }
    
    hideModal() {
        document.getElementById('aboutModal').classList.remove('show');
        document.getElementById('modalOverlay').classList.remove('show');
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer') || this.createNotificationContainer();
        const notification = document.createElement('div');
        
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <div>${message}</div>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => notification.remove(), 5000);
    }
    
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }
    
    minimize() { this.showNotification('Minimized (simulated)', 'info'); }
    maximize() { this.showNotification('Maximized (simulated)', 'info'); }
    close() { 
        if (confirm('Close OpenMinecraft?')) {
            this.showNotification('Closing...', 'info');
            setTimeout(() => window.close(), 300);
        }
    }
    
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

// Initialize launcher
document.addEventListener('DOMContentLoaded', () => {
    window.launcher = new OpenMinecraftLauncher();
});