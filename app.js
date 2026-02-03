const { useState, useEffect } = React;

// Simple icon components using Unicode
const Icons = {
    Bell: () => '🔔',
    BellOff: () => '🔕',
    Mail: () => '📧',
    Smartphone: () => '📱',
    History: () => '📜',
    Settings: () => '⚙️',
    LogOut: () => '🚪',
    Check: () => '✓',
    X: () => '✕',
    Clock: () => '⏰',
    User: () => '👤',
    Download: () => '⬇️',
    Github: () => '⚡'
};

// Simulated storage using localStorage
const storage = {
    get: async (key) => {
        try {
            const value = localStorage.getItem(key);
            return value ? { key, value, shared: false } : null;
        } catch {
            return null;
        }
    },
    set: async (key, value) => {
        try {
            localStorage.setItem(key, value);
            return { key, value, shared: false };
        } catch {
            return null;
        }
    },
    delete: async (key) => {
        try {
            localStorage.removeItem(key);
            return { key, deleted: true, shared: false };
        } catch {
            return null;
        }
    }
};

function HCPSSAlertMonitor() {
    // State
    const [user, setUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [lastChecked, setLastChecked] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [settings, setSettings] = useState({
        emailNotifications: true,
        desktopNotifications: true,
        smsNotifications: false,
        checkInterval: 60,
        email: '',
        phone: '',
    });
    const [notificationPermission, setNotificationPermission] = useState('default');

    // Load user data on mount
    useEffect(() => {
        loadUserData();
        checkNotificationPermission();
    }, []);

    // Monitor for status updates
    useEffect(() => {
        let interval;
        if (isMonitoring && user) {
            checkForUpdates();
            interval = setInterval(checkForUpdates, settings.checkInterval * 1000);
        }
        return () => clearInterval(interval);
    }, [isMonitoring, settings.checkInterval, user]);

    const checkNotificationPermission = () => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        }
    };

    const loadUserData = async () => {
        try {
            const userData = await storage.get('current_user');
            if (userData) {
                const parsedUser = JSON.parse(userData.value);
                setUser(parsedUser);
                loadUserSettings(parsedUser.id);
                loadUserAlerts(parsedUser.id);
            }
        } catch (error) {
            console.log('No user logged in');
        }
    };

    const loadUserSettings = async (userId) => {
        try {
            const settingsData = await storage.get(`settings_${userId}`);
            if (settingsData) {
                setSettings(JSON.parse(settingsData.value));
            }
        } catch (error) {
            console.log('Using default settings');
        }
    };

    const loadUserAlerts = async (userId) => {
        try {
            const alertsData = await storage.get(`alerts_${userId}`);
            if (alertsData) {
                setAlerts(JSON.parse(alertsData.value));
            }
        } catch (error) {
            console.log('No alerts found');
        }
    };

    const saveUserSettings = async () => {
        if (user) {
            await storage.set(`settings_${user.id}`, JSON.stringify(settings));
        }
    };

    const saveUserAlerts = async (newAlerts) => {
        if (user) {
            await storage.set(`alerts_${user.id}`, JSON.stringify(newAlerts));
        }
    };

    const checkForUpdates = async () => {
        setLastChecked(new Date());
        
        // Simulate checking for updates - in production, this would call the actual API
        // For demo, we'll create a random alert occasionally
        const shouldCreateDemoAlert = Math.random() < 0.1; // 10% chance
        
        if (shouldCreateDemoAlert) {
            const demoAlerts = [
                {
                    title: "School Delay - 2 Hours",
                    message: "Due to inclement weather, all HCPSS schools will open 2 hours late today.",
                    type: "delay"
                },
                {
                    title: "Early Dismissal",
                    message: "Schools will dismiss 3 hours early today for professional development.",
                    type: "info"
                },
                {
                    title: "School Closing",
                    message: "All HCPSS schools are closed today due to severe weather conditions.",
                    type: "closing"
                }
            ];
            
            const randomAlert = demoAlerts[Math.floor(Math.random() * demoAlerts.length)];
            
            // Check if this alert already exists
            const alertExists = alerts.some(a => a.title === randomAlert.title);
            
            if (!alertExists) {
                const newAlert = {
                    id: Date.now(),
                    title: randomAlert.title,
                    message: randomAlert.message,
                    type: randomAlert.type,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                
                const updatedAlerts = [newAlert, ...alerts];
                setAlerts(updatedAlerts);
                saveUserAlerts(updatedAlerts);
                sendNotifications(newAlert);
            }
        }
    };

    const sendNotifications = (alert) => {
        // Desktop notification
        if (settings.desktopNotifications && notificationPermission === 'granted') {
            new Notification('HCPSS Alert', {
                body: alert.title,
                icon: '🔔',
                tag: `alert-${alert.id}`
            });
        }
        
        // Email notification (simulated)
        if (settings.emailNotifications && settings.email) {
            console.log(`📧 Email sent to ${settings.email}:`, alert.title);
        }
        
        // SMS notification (simulated)
        if (settings.smsNotifications && settings.phone) {
            console.log(`📱 SMS sent to ${settings.phone}:`, alert.title);
        }
    };

    const handleGoogleLogin = async () => {
        const mockUser = {
            id: `user_${Date.now()}`,
            name: 'HCPSS Parent',
            email: 'parent@example.com',
            avatar: '👤',
            loginMethod: 'google'
        };
        
        await storage.set('current_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthModalOpen(false);
    };

    const handleLogout = async () => {
        await storage.delete('current_user');
        setUser(null);
        setAlerts([]);
        setIsMonitoring(false);
    };

    const toggleMonitoring = () => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        
        if (!isMonitoring && settings.desktopNotifications && notificationPermission === 'default') {
            requestNotificationPermission();
        }
        
        setIsMonitoring(!isMonitoring);
    };

    const markAlertAsRead = (alertId) => {
        const updatedAlerts = alerts.map(a => 
            a.id === alertId ? { ...a, read: true } : a
        );
        setAlerts(updatedAlerts);
        saveUserAlerts(updatedAlerts);
    };

    const deleteAlert = (alertId) => {
        const updatedAlerts = alerts.filter(a => a.id !== alertId);
        setAlerts(updatedAlerts);
        saveUserAlerts(updatedAlerts);
    };

    const exportAlerts = () => {
        const dataStr = JSON.stringify(alerts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `hcpss-alerts-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Components
    const AuthModal = () => (
        <div className="modal-overlay">
            <div className="modal">
                <button onClick={() => setIsAuthModalOpen(false)} className="modal-close">
                    {Icons.X()}
                </button>
                
                <h2 className="modal-title">Sign In</h2>
                <p className="modal-subtitle">Monitor HCPSS status updates in real-time</p>
                
                <button onClick={handleGoogleLogin} className="btn btn-primary" style={{width: '100%', marginBottom: '1rem'}}>
                    <span>🔐</span>
                    Continue with Google
                </button>
                
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(74, 222, 128, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    fontSize: '0.85rem',
                    color: '#86efac',
                    lineHeight: '1.5'
                }}>
                    {Icons.Github()} This is a demo app. Click the button above to try it out with simulated alerts!
                </div>
            </div>
        </div>
    );

    const Dashboard = () => (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon">{Icons.Bell()}</div>
                        <h3 className="stat-title">Active Alerts</h3>
                    </div>
                    <div className="stat-value">{alerts.filter(a => !a.read).length}</div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon">{Icons.History()}</div>
                        <h3 className="stat-title">Total Alerts</h3>
                    </div>
                    <div className="stat-value">{alerts.length}</div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon">{Icons.Clock()}</div>
                        <h3 className="stat-title">Monitoring</h3>
                    </div>
                    <div className="stat-value" style={{fontSize: '1.5rem', color: isMonitoring ? '#4ade80' : '#86efac'}}>
                        {isMonitoring ? 'ACTIVE' : 'PAUSED'}
                    </div>
                    {lastChecked && (
                        <div className="stat-subtitle">
                            Last checked: {lastChecked.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="alerts-section">
                <h3 className="section-title">Recent Alerts</h3>
                
                {alerts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">{Icons.Bell()}</div>
                        <p style={{fontSize: '1.1rem'}}>No alerts yet</p>
                        <p style={{fontSize: '0.9rem', opacity: 0.7}}>
                            {isMonitoring ? 'Monitoring for updates...' : 'Start monitoring to receive alerts'}
                        </p>
                    </div>
                ) : (
                    <div className="alerts-list">
                        {alerts.slice(0, 5).map(alert => (
                            <div key={alert.id} className={`alert-card ${alert.read ? 'read' : ''}`}>
                                <div className="alert-content">
                                    <div className="alert-meta">
                                        <span className={`alert-badge ${alert.type}`}>{alert.type || 'info'}</span>
                                        <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
                                    </div>
                                    <h4 className="alert-title">{alert.title}</h4>
                                    <p className="alert-message">{alert.message}</p>
                                </div>
                                <div className="alert-actions">
                                    {!alert.read && (
                                        <button 
                                            onClick={() => markAlertAsRead(alert.id)}
                                            className="btn btn-icon btn-secondary"
                                            title="Mark as read"
                                        >
                                            {Icons.Check()}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteAlert(alert.id)}
                                        className="btn btn-icon"
                                        style={{background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626', color: '#dc2626'}}
                                        title="Delete"
                                    >
                                        {Icons.X()}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const HistoryView = () => (
        <div style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 className="section-title">Alert History</h2>
                <button onClick={exportAlerts} className="btn btn-primary">
                    <span>{Icons.Download()}</span> Export
                </button>
            </div>
            
            {alerts.length === 0 ? (
                <div className="empty-state" style={{background: 'linear-gradient(135deg, rgba(10, 61, 44, 0.6) 0%, rgba(22, 77, 58, 0.6) 100%)', borderRadius: '16px', border: '2px solid rgba(74, 222, 128, 0.3)'}}>
                    <div className="empty-icon">{Icons.History()}</div>
                    <p style={{fontSize: '1.2rem'}}>No alert history</p>
                </div>
            ) : (
                <div className="alerts-list">
                    {alerts.map(alert => (
                        <div key={alert.id} className="alert-card">
                            <div className="alert-content">
                                <div className="alert-meta">
                                    <span className={`alert-badge ${alert.type}`}>{alert.type || 'info'}</span>
                                    <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
                                    {alert.read && <span style={{color: '#4ade80', fontSize: '0.85rem'}}>{Icons.Check()} Read</span>}
                                </div>
                                <h3 className="alert-title">{alert.title}</h3>
                                <p className="alert-message">{alert.message}</p>
                            </div>
                            <button
                                onClick={() => deleteAlert(alert.id)}
                                className="btn btn-icon"
                                style={{background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626', color: '#dc2626'}}
                                title="Delete"
                            >
                                {Icons.X()}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const SettingsView = () => (
        <div style={{padding: '2rem'}}>
            <h2 className="section-title">Settings</h2>
            
            <div className="alerts-section" style={{marginBottom: '1.5rem'}}>
                <h3 className="section-title" style={{fontSize: '1.2rem'}}>Notification Preferences</h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => {
                                const newSettings = { ...settings, emailNotifications: e.target.checked };
                                setSettings(newSettings);
                                saveUserSettings();
                            }}
                        />
                        <span>{Icons.Mail()}</span>
                        <span style={{color: '#86efac', fontSize: '1rem', flex: 1}}>Email Notifications</span>
                    </label>
                    
                    {settings.emailNotifications && (
                        <input
                            type="email"
                            className="input"
                            placeholder="your.email@example.com"
                            value={settings.email}
                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                            onBlur={saveUserSettings}
                            style={{marginLeft: '3rem'}}
                        />
                    )}
                    
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.desktopNotifications}
                            onChange={(e) => {
                                const newSettings = { ...settings, desktopNotifications: e.target.checked };
                                setSettings(newSettings);
                                saveUserSettings();
                                if (e.target.checked && notificationPermission === 'default') {
                                    requestNotificationPermission();
                                }
                            }}
                        />
                        <span>{Icons.Bell()}</span>
                        <span style={{color: '#86efac', fontSize: '1rem', flex: 1}}>Desktop Notifications</span>
                    </label>
                    
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={settings.smsNotifications}
                            onChange={(e) => {
                                const newSettings = { ...settings, smsNotifications: e.target.checked };
                                setSettings(newSettings);
                                saveUserSettings();
                            }}
                        />
                        <span>{Icons.Smartphone()}</span>
                        <span style={{color: '#86efac', fontSize: '1rem', flex: 1}}>SMS Notifications</span>
                    </label>
                    
                    {settings.smsNotifications && (
                        <input
                            type="tel"
                            className="input"
                            placeholder="+1 (555) 123-4567"
                            value={settings.phone}
                            onChange={(e) => setSettings({...settings, phone: e.target.value})}
                            onBlur={saveUserSettings}
                            style={{marginLeft: '3rem'}}
                        />
                    )}
                </div>
            </div>
            
            <div className="alerts-section">
                <h3 className="section-title" style={{fontSize: '1.2rem'}}>Monitoring Settings</h3>
                
                <label style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    <span style={{color: '#86efac', fontSize: '1rem'}}>
                        Check interval: {settings.checkInterval} seconds
                    </span>
                    <input
                        type="range"
                        min="30"
                        max="300"
                        step="30"
                        value={settings.checkInterval}
                        onChange={(e) => {
                            const newSettings = { ...settings, checkInterval: parseInt(e.target.value) };
                            setSettings(newSettings);
                            saveUserSettings();
                        }}
                        style={{width: '100%', accentColor: '#4ade80'}}
                    />
                    <div style={{display: 'flex', justifyContent: 'space-between', color: '#86efac', fontSize: '0.85rem'}}>
                        <span>30s</span>
                        <span>5m</span>
                    </div>
                </label>
            </div>
        </div>
    );

    return (
        <div className="app">
            <div className="background-effect"></div>
            
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <div className="logo">{Icons.Bell()}</div>
                    <div>
                        <h1 className="header-title">HCPSS Monitor</h1>
                        <p className="header-subtitle">Real-time Status Alerts</p>
                    </div>
                </div>
                
                <div className="header-right">
                    <button
                        onClick={toggleMonitoring}
                        className={`btn ${isMonitoring ? 'btn-danger' : 'btn-primary'}`}
                    >
                        <span>{isMonitoring ? Icons.BellOff() : Icons.Bell()}</span>
                        {isMonitoring ? 'Stop' : 'Start'} Monitoring
                    </button>
                    
                    {user ? (
                        <>
                            <div className="user-badge">
                                <div className="user-avatar">{user.avatar}</div>
                                <span className="user-name">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-icon"
                                style={{background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626', color: '#dc2626'}}
                                title="Logout"
                            >
                                {Icons.LogOut()}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary">
                            Sign In
                        </button>
                    )}
                </div>
            </header>
            
            {/* Navigation */}
            <nav className="nav">
                <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                >
                    <span>{Icons.Bell()}</span> Dashboard
                </button>
                <button
                    onClick={() => setCurrentView('history')}
                    className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
                >
                    <span>{Icons.History()}</span> History
                </button>
                <button
                    onClick={() => setCurrentView('settings')}
                    className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
                >
                    <span>{Icons.Settings()}</span> Settings
                </button>
            </nav>
            
            {/* Main Content */}
            <main className="main">
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'history' && <HistoryView />}
                {currentView === 'settings' && <SettingsView />}
            </main>
            
            {/* Footer */}
            <footer className="footer">
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                    <span className="footer-icon">{Icons.Github()}</span>
                    <span className="footer-text">Open source on GitHub</span>
                </div>
                <p className="footer-text">
                    Built with React • Powered by Claude AI • Real-time monitoring for HCPSS
                </p>
                <p className="footer-status">
                    Status: {isMonitoring ? '🟢 ACTIVE' : '⚫ STANDBY'}
                </p>
            </footer>
            
            {/* Auth Modal */}
            {isAuthModalOpen && <AuthModal />}
        </div>
    );
}

// Render the app
ReactDOM.render(<HCPSSAlertMonitor />, document.getElementById('root'));
