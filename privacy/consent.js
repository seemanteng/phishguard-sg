// First-run consent dialog logic
class ConsentManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkConsentStatus();
    }

    bindEvents() {
        const privacyConsent = document.getElementById('privacy-consent');
        const notificationsConsent = document.getElementById('notifications-consent');
        const acceptBtn = document.getElementById('accept-btn');
        const declineBtn = document.getElementById('decline-btn');
        const languageSelect = document.getElementById('language-select');

        // Enable/disable accept button based on privacy consent
        privacyConsent.addEventListener('change', () => {
            acceptBtn.disabled = !privacyConsent.checked;
        });

        // Handle accept
        acceptBtn.addEventListener('click', () => {
            this.acceptConsent();
        });

        // Handle decline
        declineBtn.addEventListener('click', () => {
            this.declineConsent();
        });

        // Handle language change
        languageSelect.addEventListener('change', () => {
            this.updateLanguage(languageSelect.value);
        });
    }

    async checkConsentStatus() {
        try {
            const result = await chrome.storage.sync.get(['consentGiven', 'language']);
            
            // Load saved language
            if (result.language) {
                document.getElementById('language-select').value = result.language;
            }

            // If consent already given, close this tab
            if (result.consentGiven) {
                window.close();
            }
        } catch (error) {
            console.error('PhishGuard: Error checking consent status:', error);
        }
    }

    async acceptConsent() {
        const notificationsEnabled = document.getElementById('notifications-consent').checked;
        const selectedLanguage = document.getElementById('language-select').value;

        try {
            // Save consent and preferences
            await chrome.storage.sync.set({
                consentGiven: true,
                consentDate: new Date().toISOString(),
                notificationsEnabled: notificationsEnabled,
                language: selectedLanguage
            });

            // Show success message
            this.showSuccessMessage();

            // Close after delay
            setTimeout(() => {
                window.close();
            }, 2000);

        } catch (error) {
            console.error('PhishGuard: Error saving consent:', error);
            alert('Error saving preferences. Please try again.');
        }
    }

    async declineConsent() {
        if (confirm('Are you sure you want to decline? PhishGuard SG will be disabled.')) {
            try {
                // Save decline status
                await chrome.storage.sync.set({
                    consentGiven: false,
                    extensionDisabled: true,
                    declineDate: new Date().toISOString()
                });

                // Disable extension functionality
                await chrome.runtime.sendMessage({
                    action: 'disableExtension'
                });

                alert('PhishGuard SG has been disabled. You can re-enable it anytime from the Extensions menu.');
                window.close();

            } catch (error) {
                console.error('PhishGuard: Error declining consent:', error);
                alert('Error processing decline. Please try again.');
            }
        }
    }

    updateLanguage(language) {
        // Notify background script of language change
        chrome.runtime.sendMessage({
            action: 'languageChanged',
            language: language
        });
    }

    showSuccessMessage() {
        // Replace content with success message
        const container = document.querySelector('.consent-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                <h1 style="color: #27ae60; margin-bottom: 16px;">Setup Complete!</h1>
                <p style="color: #7f8c8d; font-size: 18px; margin-bottom: 20px;">
                    PhishGuard SG is now protecting you from phishing threats.
                </p>
                <p style="color: #6c757d; font-size: 14px;">
                    This window will close automatically...
                </p>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ConsentManager();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showConsent') {
        // This page is already showing, just focus the window
        window.focus();
    }
});