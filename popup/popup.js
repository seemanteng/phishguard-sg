// PhishGuard SG Popup Script
class PhishGuardPopup {
    constructor() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateStatus();
        this.loadStats();
    }

    async loadSettings() {
        const settings = await chrome.storage.sync.get({
            protectionEnabled: true,
            emailScanningEnabled: true,
            notificationsEnabled: true,
            language: 'en'
        });

        this.updateToggle('protection-toggle', settings.protectionEnabled);
        this.updateToggle('email-toggle', settings.emailScanningEnabled);
        this.updateToggle('notification-toggle', settings.notificationsEnabled);
        document.getElementById('language-dropdown').value = settings.language;
        
        // Apply language to UI when popup loads
        this.updateLanguage(settings.language);
    }

    setupEventListeners() {
        // Toggle switches
        document.getElementById('protection-toggle').addEventListener('click', () => {
            this.toggleSetting('protection-toggle', 'protectionEnabled');
        });

        document.getElementById('email-toggle').addEventListener('click', () => {
            this.toggleSetting('email-toggle', 'emailScanningEnabled');
        });

        document.getElementById('notification-toggle').addEventListener('click', () => {
            this.toggleSetting('notification-toggle', 'notificationsEnabled');
        });

        // Language dropdown
        document.getElementById('language-dropdown').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Links
        document.getElementById('report-link').addEventListener('click', () => {
            chrome.tabs.create({ 
                url: 'https://www.scamshield.gov.sg/i-ve-been-scammed/' 
            });
        });

    }

    async toggleSetting(toggleId, settingKey) {
        const toggle = document.getElementById(toggleId);
        const isActive = toggle.classList.contains('active');
        
        this.updateToggle(toggleId, !isActive);
        
        await chrome.storage.sync.set({
            [settingKey]: !isActive
        });

        // Notify content script of setting change
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'settingChanged',
                setting: settingKey,
                value: !isActive
            });
        });
    }

    updateToggle(toggleId, isActive) {
        const toggle = document.getElementById(toggleId);
        if (isActive) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }

    async updateStatus() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (!currentTab.url || currentTab.url.startsWith('chrome://')) {
                this.setStatus('safe', '✅ Protection Active', 'PhishGuard is monitoring');
                return;
            }

            const url = new URL(currentTab.url);
            const domain = url.hostname;

            // Check if domain is whitelisted
            chrome.runtime.sendMessage({
                action: 'checkThreat',
                domain: domain,
                url: currentTab.url
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('PhishGuard Popup: Message error:', chrome.runtime.lastError);
                    this.setStatus('safe', '✅ Protection Active', 'PhishGuard is monitoring');
                    return;
                }
                
                if (!response) {
                    console.error('PhishGuard Popup: No response from background script');
                    this.setStatus('safe', '✅ Protection Active', 'PhishGuard is monitoring');
                    return;
                }

                if (response.isWhitelisted) {
                    this.setStatus('safe', this.getCurrentTranslation('verifiedSafe'), this.getCurrentTranslation('trustedSite'));
                } else if (response.threatLevel > 0) {
                    this.setStatus('danger', this.getCurrentTranslation('warning'), this.getCurrentTranslation('siteSuspicious'), this.getSafetyRecommendations());
                } else {
                    this.setStatus('safe', this.getCurrentTranslation('noThreats'), this.getCurrentTranslation('siteAppearsSafe'));
                }
            });

        } catch (error) {
            this.setStatus('safe', '✅ Protection Active', 'PhishGuard is monitoring');
        }
    }


    setStatus(type, text, detail, recommendations = null) {
        const statusDiv = document.getElementById('status');
        const statusText = document.getElementById('status-text');
        const statusDetail = document.getElementById('status-detail');

        statusDiv.className = `status ${type}`;
        statusText.textContent = text;
        statusDetail.textContent = detail;

        // Add safety recommendations for dangerous sites
        if (recommendations && type === 'danger') {
            const recommendationsDiv = document.createElement('div');
            recommendationsDiv.className = 'safety-recommendations';
            recommendationsDiv.innerHTML = recommendations;
            
            // Remove any existing recommendations
            const existingRecommendations = statusDiv.querySelector('.safety-recommendations');
            if (existingRecommendations) {
                existingRecommendations.remove();
            }
            
            statusDiv.appendChild(recommendationsDiv);
        } else {
            // Remove recommendations if status is not dangerous
            const existingRecommendations = statusDiv.querySelector('.safety-recommendations');
            if (existingRecommendations) {
                existingRecommendations.remove();
            }
        }
    }

    getSafetyRecommendations() {
        return `
<div class="safety-header">
<strong>${this.getCurrentTranslation('safetyRecommendations', '🚨 SAFETY RECOMMENDATIONS:')}</strong>
</div>
<div class="safety-list">
<div class="safety-item">${this.getCurrentTranslation('doNotEnterPersonal', '• Do NOT enter personal information')}</div>
<div class="safety-item">${this.getCurrentTranslation('doNotEnterBanking', '• Do NOT enter banking credentials')}</div>
<div class="safety-item">${this.getCurrentTranslation('closeWebsite', '• Close this website immediately')}</div>
</div>
<div class="safety-footer">
<div class="helpline">${this.getCurrentTranslation('csaHelpline', '📞 CSA Helpline: 1800-323-4567')}</div>
</div>
        `;
    }

    async changeLanguage(language) {
        // Save language preference
        await chrome.storage.sync.set({ language: language });
        
        // Update UI text based on selected language
        this.updateLanguage(language);
        
        // Notify background script of language change
        chrome.runtime.sendMessage({
            action: 'languageChanged',
            language: language
        });
    }

    updateLanguage(language) {
        const translations = {
            en: {
                title: 'PhishGuard SG',
                subtitle: 'Keeping Singapore Safe from Phishing',
                protection: 'Real-time Protection',
                email: 'Email Scanning',
                notifications: 'Notifications',
                language: 'Language',
                report: 'Report a phishing site',
                protectionActive: '✅ Protection Active',
                verifiedSafe: '✅ Verified Safe',
                warning: '⚠️ Warning ⚠️',
                noThreats: '✅ No Threats Detected',
                trustedSite: 'This is a trusted Singapore site',
                siteSuspicious: 'This site may be suspicious',
                siteAppearsSafe: 'Site appears safe',
                safetyRecommendations: '🚨 SAFETY RECOMMENDATIONS:',
                doNotEnterPersonal: '• Do NOT enter personal information',
                doNotEnterBanking: '• Do NOT enter banking credentials',
                closeWebsite: '• Close this website immediately',
                csaHelpline: '📞 CSA Helpline: 1800-323-4567'
            },
            zh: {
                title: '🛡️ PhishGuard SG',
                subtitle: '保护新加坡免受网络钓鱼攻击',
                protection: '实时保护',
                email: '邮件扫描',
                notifications: '通知',
                language: '语言',
                report: '举报钓鱼网站',
                protectionActive: '✅ 保护已激活',
                verifiedSafe: '✅ 验证安全',
                warning: '⚠️ 警告 ⚠️',
                noThreats: '✅ 未检测到威胁',
                trustedSite: '这是受信任的新加坡网站',
                siteSuspicious: '此网站可能可疑',
                siteAppearsSafe: '网站看起来安全',
                safetyRecommendations: '🚨 安全建议：',
                doNotEnterPersonal: '• 请勿输入个人信息',
                doNotEnterBanking: '• 请勿输入银行凭据',
                closeWebsite: '• 立即关闭此网站',
                csaHelpline: '📞 CSA热线: 1800-323-4567'
            },
            ms: {
                title: '🛡️ PhishGuard SG',
                subtitle: 'Melindungi Singapura dari Phishing',
                protection: 'Perlindungan Masa Nyata',
                email: 'Pengimbasan E-mel',
                notifications: 'Pemberitahuan',
                language: 'Bahasa',
                report: 'Laporkan laman phishing',
                protectionActive: '✅ Perlindungan Aktif',
                verifiedSafe: '✅ Disahkan Selamat',
                warning: '⚠️ Amaran ⚠️',
                noThreats: '✅ Tiada Ancaman Dikesan',
                trustedSite: 'Ini adalah laman Singapore yang dipercayai',
                siteSuspicious: 'Laman ini mungkin mencurigakan',
                siteAppearsSafe: 'Laman kelihatan selamat',
                safetyRecommendations: '🚨 CADANGAN KESELAMATAN:',
                doNotEnterPersonal: '• JANGAN masukkan maklumat peribadi',
                doNotEnterBanking: '• JANGAN masukkan kelayakan perbankan',
                closeWebsite: '• Tutup laman web ini dengan segera',
                csaHelpline: '📞 Talian CSA: 1800-323-4567'
            },
            ta: {
                title: '🛡️ PhishGuard SG',
                subtitle: 'சிங்கப்பூரை ஃபிஷிங்கிலிருந்து பாதுகாத்தல்',
                protection: 'நேரடி பாதுகாப்பு',
                email: 'மின்னஞ்சல் ஸ்கேனிங்',
                notifications: 'அறிவிப்புகள்',
                language: 'மொழி',
                report: 'ஃபிஷிங் தளத்தைப் புகாரளிக்கவும்',
                protectionActive: '✅ பாதுகாப்பு செயலில்',
                verifiedSafe: '✅ சரிபார்க்கப்பட்ட பாதுகாப்பு',
                warning: '⚠️ எச்சரிக்கை ⚠️',
                noThreats: '✅ அச்சுறுத்தல்கள் கண்டறியப்படவில்லை',
                trustedSite: 'இது நம்பகமான சிங்கப்பூர் தளம்',
                siteSuspicious: 'இந்த தளம் சந்தேகத்திற்குரியதாக இருக்கலாம்',
                siteAppearsSafe: 'தளம் பாதுகாப்பானதாக தெரிகிறது',
                safetyRecommendations: '🚨 பாதுகாப்பு பரிந்துரைகள்:',
                doNotEnterPersonal: '• தனிப்பட்ட தகவல்களை வழங்காதீர்கள்',
                doNotEnterBanking: '• வங்கி விவரங்களை வழங்காதீர்கள்',
                closeWebsite: '• இந்த வலைத்தளத்தை உடனே மூடுங்கள்',
                csaHelpline: '📞 CSA உதவிக்கோடு: 1800-323-4567'
            }
        };

        const t = translations[language] || translations.en;

        // Store current language and translations for use in other methods
        this.currentLanguage = language;
        this.currentTranslations = t;

        // Update all text elements
        document.querySelector('.logo').textContent = t.title;
        document.querySelector('.header div:nth-child(2)').textContent = t.subtitle;
        document.querySelectorAll('.switch span')[0].textContent = t.protection;
        document.querySelectorAll('.switch span')[1].textContent = t.email;
        document.querySelectorAll('.switch span')[2].textContent = t.notifications;
        document.querySelectorAll('.language-selector span')[0].textContent = t.language;
        document.getElementById('report-link').textContent = t.report;
    }

    getCurrentTranslation(key, defaultValue = '') {
        if (this.currentTranslations && this.currentTranslations[key]) {
            return this.currentTranslations[key];
        }
        return defaultValue;
    }

    async loadStats() {
        // Stats display removed from UI
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    new PhishGuardPopup();
});