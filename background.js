// PhishGuard SG Background Script
console.log('PhishGuard: Background script loading...');

class PhishGuardBackground {
    constructor() {
        console.log('PhishGuard: Background script constructor called');
        this.currentLanguage = 'en'; // Default language
        this.setupListeners();
        this.loadThreatData();
        this.loadLanguageSettings();
        console.log('PhishGuard: Background script initialized');
    }

    async loadLanguageSettings() {
        try {
            const settings = await chrome.storage.sync.get({ language: 'en' });
            this.currentLanguage = settings.language;
            console.log('PhishGuard: Language loaded:', this.currentLanguage);
        } catch (error) {
            console.error('PhishGuard: Error loading language settings:', error);
            this.currentLanguage = 'en';
        }
    }

    getTranslations() {
        return {
            en: {
                securityAlert: '🚨 SECURITY ALERT 🚨',
                threatMessage: 'This website may be impersonating a trusted Singapore company.',
                moreInfo: 'More Info',
                dismiss: '✕ Dismiss',
                verifiedSafe: '✅ Verified Safe',
                officialWebsite: 'This is an official website of a trusted Singapore organization.\n\nYou can safely proceed with confidence.',
                verifiedBy: 'Verified by PhishGuard SG',
                gotIt: '👍 Got it',
                scanComplete: '\nPhishGuard SG - Scan Complete',
                websiteSafe: '✅ WEBSITE SAFE \n No suspicious patterns detected.',
                okay: '👍 Okay',
                threatAnalysis: 'PhishGuard SG - Threat Detected',
                areYouSure: 'Are you sure it\'s',
                clickLogo: 'Click the PhishGuard SG logo at the top if you require assistance.',
                testTitle: '🧪 PhishGuard Test',
                testMessage: 'Test notification successful! Your notifications are working.'
            },
            zh: {
                securityAlert: '🚨 安全警报 🚨',
                threatMessage: '此网站可能冒充受信任的新加坡公司。',
                moreInfo: '更多信息',
                dismiss: '✕ 忽略',
                verifiedSafe: '✅ 验证安全',
                officialWebsite: '这是受信任的新加坡组织的官方网站。\n\n您可以放心继续。',
                verifiedBy: '由 PhishGuard SG 验证',
                gotIt: '👍 知道了',
                scanComplete: '\nPhishGuard SG - 扫描完成',
                websiteSafe: '✅ 网站安全 \n 未检测到可疑模式。',
                okay: '👍 好的',
                threatAnalysis: 'PhishGuard SG - 检测到威胁',
                areYouSure: '您确定这是',
                clickLogo: '如需帮助，请点击顶部的 PhishGuard SG 标志。',
                testTitle: '🧪 PhishGuard 测试',
                testMessage: '测试通知成功！您的通知正在工作。'
            },
            ms: {
                securityAlert: '🚨 AMARAN KESELAMATAN 🚨',
                threatMessage: 'Laman web ini mungkin menyamar sebagai syarikat Singapura yang dipercayai.',
                moreInfo: 'Maklumat Lanjut',
                dismiss: '✕ Tutup',
                verifiedSafe: '✅ Disahkan Selamat',
                officialWebsite: 'Ini adalah laman web rasmi organisasi Singapura yang dipercayai.\n\nAnda boleh meneruskan dengan yakin.',
                verifiedBy: 'Disahkan oleh PhishGuard SG',
                gotIt: '👍 Faham',
                scanComplete: '\nPhishGuard SG - Imbasan Selesai',
                websiteSafe: '✅ LAMAN WEB SELAMAT \n Tiada corak mencurigakan dikesan.',
                okay: '👍 Baik',
                threatAnalysis: 'PhishGuard SG - Ancaman Dikesan',
                areYouSure: 'Adakah anda pasti ini',
                clickLogo: 'Klik logo PhishGuard SG di bahagian atas jika anda memerlukan bantuan.',
                testTitle: '🧪 Ujian PhishGuard',
                testMessage: 'Ujian pemberitahuan berjaya! Pemberitahuan anda berfungsi.'
            },
            ta: {
                securityAlert: '🚨 பாதுகாப்பு எச்சரிக்கை 🚨',
                threatMessage: 'இந்த வலைத்தளம் நம்பகமான சிங்கப்பூர் நிறுவனமாக ஆள்மாறாட்டம் செய்யக்கூடும்.',
                moreInfo: 'மேலும் தகவல்',
                dismiss: '✕ நிராகரிக்கவும்',
                verifiedSafe: '✅ சரிபார்க்கப்பட்ட பாதுகாப்பு',
                officialWebsite: 'இது நம்பகமான சிங்கப்பூர் அமைப்பின் அதிகாரப்பூர்வ வலைத்தளம்.\n\nநீங்கள் நம்பிக்கையுடன் தொடரலாம்.',
                verifiedBy: 'PhishGuard SG ஆல் சரிபார்க்கப்பட்டது',
                gotIt: '👍 புரிந்தது',
                scanComplete: '\nPhishGuard SG - ஸ்கேன் முடிந்தது',
                websiteSafe: '✅ வலைத்தளம் பாதுகாப்பானது \n சந்தேகத்திற்குரிய வடிவங்கள் கண்டறியப்படவில்லை.',
                okay: '👍 சரி',
                threatAnalysis: 'PhishGuard SG - அச்சுறுத்தல் கண்டறியப்பட்டது',
                areYouSure: 'இது உறுதியாக',
                clickLogo: 'உதவி தேவைப்பட்டால் மேலே உள்ள PhishGuard SG லோகோவைக் கிளிக் செய்யவும்.',
                testTitle: '🧪 PhishGuard சோதனை',
                testMessage: 'சோதனை அறிவிப்பு வெற்றிகரமாக உள்ளது! உங்கள் அறிவிப்புகள் வேலை செய்கின்றன.'
            }
        };
    }

    getTranslation(key, defaultValue = '') {
        const translations = this.getTranslations();
        const currentTranslations = translations[this.currentLanguage] || translations.en;
        return currentTranslations[key] || defaultValue;
    }

    setupListeners() {
        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            console.log('PhishGuard: Tab updated:', tabId, changeInfo, tab.url);
            if (changeInfo.status === 'complete' && tab.url) {
                console.log('PhishGuard: Tab loading complete, checking URL:', tab.url);
                this.checkURL(tab.url, tabId);
            }
        });

        // Also listen for tab activation (switching tabs)
        chrome.tabs.onActivated.addListener((activeInfo) => {
            console.log('PhishGuard: Tab activated:', activeInfo.tabId);
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                if (tab.url && tab.status === 'complete') {
                    console.log('PhishGuard: Checking activated tab URL:', tab.url);
                    this.checkURL(tab.url, activeInfo.tabId);
                }
            });
        });

        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'checkThreat') {
                this.handleThreatCheck(request, sendResponse);
                return true; // Keep message channel open for async response
            } else if (request.action === 'checkCurrentPage') {
                this.handlePageCheck(request, sender.tab.id);
            } else if (request.action === 'testNotification') {
                this.testNotification();
            } else if (request.action === 'testThreatNotification') {
                this.showThreatWarning(sender.tab.id, 75, 'test-suspicious-site.com');
            } else if (request.action === 'getPatterns') {
                console.log('PhishGuard: getPatterns request received, sending:', this.threatPatterns);
                sendResponse({ patterns: this.threatPatterns });
                return true;
            } else if (request.action === 'languageChanged') {
                this.currentLanguage = request.language;
                console.log('PhishGuard: Language changed to:', this.currentLanguage);
            }
        });

        // Listen for notification button clicks
        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            this.handleNotificationButtonClick(notificationId, buttonIndex);
        });

        // Listen for notification clicks
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.handleNotificationClick(notificationId);
        });
    }

    async loadThreatData() {
        try {
            console.log('PhishGuard: Loading threat patterns...');
            // Load local threat patterns
            const response = await fetch(chrome.runtime.getURL('data/threat-patterns.json'));
            this.threatPatterns = await response.json();
            console.log('PhishGuard: Threat patterns loaded:', this.threatPatterns);
            
            // Load whitelist
            console.log('PhishGuard: Loading whitelist...');
            const whitelistResponse = await fetch(chrome.runtime.getURL('data/whitelist.json'));
            this.whitelist = await whitelistResponse.json();
            console.log('PhishGuard: Whitelist loaded:', this.whitelist);
        } catch (error) {
            console.error('PhishGuard: Failed to load threat data:', error);
            // Set fallback data
            this.threatPatterns = {
                suspicious_keywords: ['secure', 'verify', 'urgent', 'update', 'suspend'],
                risky_tlds: ['.tk', '.ml', '.ga', '.cf', '.top', '.click']
            };
            this.whitelist = {
                trusted_domains: ['dbs.com', 'ocbc.com', 'uob.com.sg', 'gov.sg']
            };
            console.log('PhishGuard: Using fallback threat data');
        }
    }

    checkURL(url, tabId) {
        console.log('PhishGuard: Checking URL:', url);
        
        // Skip chrome:// URLs and extensions
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
            console.log('PhishGuard: Skipping browser internal URL');
            return;
        }
        
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();
            console.log('PhishGuard: Domain:', domain);
            console.log('PhishGuard: Threat patterns loaded:', !!this.threatPatterns);
            console.log('PhishGuard: Whitelist loaded:', !!this.whitelist);

            // Check against whitelist first
            if (this.isWhitelisted(domain)) {
                console.log('PhishGuard: Domain is whitelisted - no notification needed');
                return;
            }

            // Check for threats
            const threatLevel = this.assessThreat(domain, url);
            console.log('PhishGuard: Threat level:', threatLevel);
            
            // Show notification only for threats
            if (threatLevel > 0) {
                console.log('PhishGuard: Showing threat warning');
                this.showThreatWarning(tabId, threatLevel, domain);
            } else {
                console.log('PhishGuard: Site appears safe - no notification needed');
            }
        } catch (error) {
            console.error('PhishGuard: Error checking URL:', error);
        }
    }

    isWhitelisted(domain) {
        if (!this.whitelist) return false;
        return this.whitelist.trusted_domains.some(trusted => 
            domain === trusted || domain.endsWith('.' + trusted)
        );
    }

    assessThreat(domain, url) {
        let score = 0;
        
        // Check for typosquatting against Singapore brands
        score += this.checkTyposquatting(domain);
        
        // Check for suspicious keywords
        score += this.checkSuspiciousKeywords(domain);
        
        // Check for uncommon TLDs for trusted brands
        score += this.checkUncommonTLD(domain);
        
        // Check domain age (simplified - in production, would query WHOIS)
        score += this.checkDomainAge(domain);

        console.log('PhishGuard: Threat breakdown for', domain, '- Typosquatting:', this.checkTyposquatting(domain), 'Keywords:', this.checkSuspiciousKeywords(domain), 'TLD:', this.checkUncommonTLD(domain), 'Age:', this.checkDomainAge(domain), 'Total:', score);

        return score;
    }

    checkTyposquatting(domain) {
        const singaporeBrands = ['dbs', 'ocbc', 'uob', 'singpass', 'gov.sg'];
        let score = 0;

        for (const brand of singaporeBrands) {
            if (this.isSimilarDomain(domain, brand)) {
                score += 50;
            }
        }

        return score;
    }

    isSimilarDomain(domain, brand) {
        // Simple character substitution check
        const substitutions = {
            'o': '0',
            'i': '1',
            'l': '1',
            'a': '@'
        };

        // Check for common substitutions
        for (const [char, sub] of Object.entries(substitutions)) {
            if (domain.includes(brand.replace(char, sub))) {
                return true;
            }
        }

        // Check for added suspicious keywords
        const suspiciousAdditions = ['secure', 'login', 'verify', 'update'];
        return suspiciousAdditions.some(addition => 
            domain.includes(brand) && domain.includes(addition)
        );
    }

    checkSuspiciousKeywords(domain) {
        const suspiciousKeywords = ['secure', 'verify', 'support', 'login', 'update'];
        return suspiciousKeywords.filter(keyword => domain.includes(keyword)).length * 25;
    }

    checkUncommonTLD(domain) {
        const uncommonTLDs = ['.top', '.xyz', '.shop', '.click'];
        return uncommonTLDs.some(tld => domain.endsWith(tld)) ? 15 : 0;
    }

    checkDomainAge(domain) {
        // Simplified check - in production, would use WHOIS API
        // For now, return 30 for domains with suspicious patterns
        return domain.length > 20 ? 30 : 0;
    }

    showThreatWarning(tabId, threatLevel, domain) {
        console.log('PhishGuard: Creating threat notification for:', domain);
        
        // Show rich browser notification with action buttons
        const notificationId = `threat-${Date.now()}`;
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: this.getTranslation('securityAlert'),
            message: this.getTranslation('threatMessage'),
            priority: 2,
            requireInteraction: true,
            buttons: [
                { title: this.getTranslation('moreInfo') },
                { title: this.getTranslation('dismiss') }
            ]
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error('PhishGuard: Notification error:', chrome.runtime.lastError);
            } else {
                console.log('PhishGuard: Threat notification created:', notificationId);
            }
        });

        // Store notification context
        this.activeNotifications = this.activeNotifications || {};
        this.activeNotifications[notificationId] = {
            type: 'threat',
            domain: domain,
            threatLevel: threatLevel,
            tabId: tabId
        };

        // Also inject warning into page
        chrome.scripting.executeScript({
            target: { tabId },
            func: this.injectWarning,
            args: [threatLevel, domain]
        });
    }

    showSafeNotification(tabId) {
        // Show rich browser notification for trusted sites
        const notificationId = `safe-${Date.now()}`;
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: this.getTranslation('verifiedSafe'),
            message: this.getTranslation('officialWebsite'),
            contextMessage: this.getTranslation('verifiedBy'),
            priority: 1,
            buttons: [
                { title: this.getTranslation('gotIt') }
            ]
        });

        // Store notification context
        this.activeNotifications = this.activeNotifications || {};
        this.activeNotifications[notificationId] = {
            type: 'safe',
            tabId: tabId
        };

        // Also inject safe notification into page
        chrome.scripting.executeScript({
            target: { tabId },
            func: this.injectSafeNotification
        });
    }

    showGeneralSafeNotification(tabId, domain) {
        // Show notification for general websites (not specifically whitelisted)
        console.log('PhishGuard: Creating general safe notification for:', domain);
        
        const notificationId = `safe-general-${Date.now()}`;
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: this.getTranslation('scanComplete'),
            message: this.getTranslation('websiteSafe'),
            priority: 1,
            buttons: [
                { title: this.getTranslation('okay') }
            ]
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error('PhishGuard: General safe notification error:', chrome.runtime.lastError);
            } else {
                console.log('PhishGuard: General safe notification created:', notificationId);
            }
        });

        // Store notification context
        this.activeNotifications = this.activeNotifications || {};
        this.activeNotifications[notificationId] = {
            type: 'safe-general',
            domain: domain,
            tabId: tabId
        };
    }

    injectWarning(threatLevel, domain) {
        // This function runs in the page context
        const warning = document.createElement('div');
        warning.id = 'phishguard-warning';
        warning.className = 'phishguard-warning suspicious';
        warning.innerHTML = `
            <div class="phishguard-content">
                <div class="phishguard-icon">⚠️</div>
                <div class="phishguard-text">
                    <strong>Warning: Suspicious Website</strong>
                    <p>This website (${domain}) may be impersonating a trusted Singapore company.</p>
                    <button id="phishguard-details">More Info</button>
                    <button id="phishguard-close">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(warning);

        // Add event listeners
        document.getElementById('phishguard-close').addEventListener('click', () => {
            warning.remove();
        });

        document.getElementById('phishguard-details').addEventListener('click', () => {
            alert('This domain shows patterns commonly used in phishing attacks targeting Singapore residents. Verify the URL carefully before entering personal information.');
        });
    }

    injectSafeNotification() {
        const notification = document.createElement('div');
        notification.id = 'phishguard-safe';
        notification.className = 'phishguard-warning safe';
        notification.innerHTML = `
            <div class="phishguard-content">
                <div class="phishguard-icon">✅</div>
                <div class="phishguard-text">
                    <strong>Verified Safe</strong>
                    <p>This is an official website of a trusted Singapore organization.</p>
                    <button id="phishguard-safe-close">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        document.getElementById('phishguard-safe-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (document.getElementById('phishguard-safe')) {
                notification.remove();
            }
        }, 3000);
    }

    handleThreatCheck(request, sendResponse) {
        // Handle requests from content script
        const result = this.assessThreat(request.domain, request.url);
        sendResponse({ threatLevel: result, isWhitelisted: this.isWhitelisted(request.domain) });
    }

    handlePageCheck(request, tabId) {
        // Handle page check requests from content script
        const domain = request.domain.toLowerCase();

        // Check against whitelist first
        if (this.isWhitelisted(domain)) {
            console.log('PhishGuard: Domain is whitelisted - no notification needed');
            return;
        }

        // Check for threats
        const threatLevel = this.assessThreat(domain, request.url);
        if (threatLevel > 40) {
            this.showThreatWarning(tabId, threatLevel, domain);
        }
    }

    handleNotificationButtonClick(notificationId, buttonIndex) {
        const notification = this.activeNotifications?.[notificationId];
        if (!notification) return;

        if (notification.type === 'threat') {
            if (buttonIndex === 0) {
                // More Info button
                this.showThreatDetails(notification);
            } else if (buttonIndex === 1) {
                // Dismiss button
                chrome.notifications.clear(notificationId);
            }
        } else if (notification.type === 'safe') {
            if (buttonIndex === 0) {
                // Got it button
                chrome.notifications.clear(notificationId);
            }
        } else if (notification.type === 'safe-general') {
            if (buttonIndex === 0) {
                // Okay button
                chrome.notifications.clear(notificationId);
            }
        }

        // Clean up
        delete this.activeNotifications[notificationId];
    }

    handleNotificationClick(notificationId) {
        const notification = this.activeNotifications?.[notificationId];
        if (!notification) return;

        if (notification.type === 'threat') {
            this.showThreatDetails(notification);
        }

        chrome.notifications.clear(notificationId);
        delete this.activeNotifications[notificationId];
    }

    showThreatDetails(notification) {
        const message = `🚨 ${this.getTranslation('areYouSure')} ${notification.domain} ? \n${this.getTranslation('clickLogo')}`;

                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'assets/icons/icon128.png',
                title: this.getTranslation('threatAnalysis'),
                    message: message,
                    priority: 2,
                    requireInteraction: true
                });
    }

    testNotification() {
        console.log('PhishGuard: Testing notification...');
        
        chrome.notifications.create('test-notification', {
            type: 'basic',
            iconUrl: 'assets/icons/icon48.png',
            title: this.getTranslation('testTitle'),
            message: this.getTranslation('testMessage'),
            priority: 2
        }, (notificationId) => {
            if (chrome.runtime.lastError) {
                console.error('PhishGuard: Test notification error:', chrome.runtime.lastError);
            } else {
                console.log('PhishGuard: Test notification created:', notificationId);
            }
        });
    }
}

// Initialize background script
console.log('PhishGuard: Creating PhishGuardBackground instance...');
new PhishGuardBackground();
console.log('PhishGuard: Background script setup complete');