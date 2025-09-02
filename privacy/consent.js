// First-run consent dialog logic
class ConsentManager {
    constructor() {
        this.translations = {
            en: {
                mainTitle: 'PRIVACY POLICY',
                mainSubtitle: 'Your Privacy Matters',
                section1Title: 'Personal Statement',
                section1Content: 'We are committed to creating a secure and user-friendly experience for every user. To achieve this, we aim to be as clear as possible about all our policies, as is evident by our transparent terms and conditions.',
                section2Title: 'Data Collection',
                section2Content: 'PhishGuard SG operates with a zero data collection policy. We do not collect, store, or transmit any personal data to external servers. All threat detection and processing occurs locally on your device.',
                section3Title: 'Why do we use local storage?',
                section3Content: 'Local storage also helps keep track of your settings and maintain data, for example, your language preferences, notification settings, or general user preferences like theme. The information that is stored is used purely for functionality, allowing us to provide customized experiences for our users. We do not use any tracking mechanisms that will track or identify you.',
                section4Title: 'What information do we gather specifically?',
                section4Content: 'We gather minimal information necessary for the extension to function. This includes your language preferences, notification settings, and threat detection preferences. All information is stored locally on your device and never transmitted to external servers.',
                section5Title: 'What third-parties do we share your information with?',
                section5Content: 'We do not share any information with third parties. All processing happens locally on your device. We will not share your personal information with any external partners or services.',
                consentText: 'I have read and agree to the Privacy Policy',
                declineText: 'Decline and Disable',
                acceptText: 'Accept and Continue'
            },
            zh: {
                mainTitle: '隐私政策',
                mainSubtitle: '您的隐私很重要',
                section1Title: '个人声明',
                section1Content: '我们致力于为每位用户创造安全且用户友好的体验。为了实现这一目标，我们尽量对所有政策保持透明，这在我们透明的条款和条件中得到了体现。',
                section2Title: '数据收集',
                section2Content: 'PhishGuard SG 采用零数据收集政策。我们不会收集、存储或向外部服务器传输任何个人数据。所有威胁检测和处理都在您的设备本地进行。',
                section3Title: '为什么我们使用本地存储？',
                section3Content: '本地存储还有助于跟踪您的设置和维护数据，例如您的语言偏好、通知设置或主题等一般用户偏好。存储的信息纯粹用于功能性，让我们能够为用户提供定制化体验。我们不使用任何跟踪机制来跟踪或识别您。',
                section4Title: '我们具体收集什么信息？',
                section4Content: '我们收集扩展程序运行所需的最少信息。这包括您的语言偏好、通知设置和威胁检测偏好。所有信息都存储在您的设备本地，永远不会传输到外部服务器。',
                section5Title: '我们与哪些第三方共享您的信息？',
                section5Content: '我们不与任何第三方共享信息。所有处理都在您的设备本地进行。我们不会与任何外部合作伙伴或服务共享您的个人信息。',
                consentText: '我已阅读并同意隐私政策',
                declineText: '拒绝并禁用',
                acceptText: '接受并继续'
            },
            ms: {
                mainTitle: 'DASAR PRIVASI',
                mainSubtitle: 'Privasi Anda Penting',
                section1Title: 'Kenyataan Peribadi',
                section1Content: 'Kami komited untuk mewujudkan pengalaman yang selamat dan mesra pengguna untuk setiap pengguna. Untuk mencapai ini, kami bertujuan untuk menjadi sejelas mungkin tentang semua dasar kami, seperti yang terbukti dalam terma dan syarat kami yang telus.',
                section2Title: 'Pengumpulan Data',
                section2Content: 'PhishGuard SG beroperasi dengan dasar pengumpulan data sifar. Kami tidak mengumpul, menyimpan, atau menghantar sebarang data peribadi ke pelayan luaran. Semua pengesanan ancaman dan pemprosesan berlaku secara tempatan pada peranti anda.',
                section3Title: 'Mengapa kami menggunakan penyimpanan tempatan?',
                section3Content: 'Penyimpanan tempatan juga membantu menjejaki tetapan anda dan mengekalkan data, contohnya, keutamaan bahasa anda, tetapan pemberitahuan, atau keutamaan pengguna am seperti tema. Maklumat yang disimpan digunakan semata-mata untuk fungsi, membolehkan kami menyediakan pengalaman yang disesuaikan untuk pengguna kami. Kami tidak menggunakan sebarang mekanisme penjejakan yang akan menjejak atau mengenal pasti anda.',
                section4Title: 'Maklumat apa yang kami kumpulkan secara khusus?',
                section4Content: 'Kami mengumpulkan maklumat minimum yang diperlukan untuk sambungan berfungsi. Ini termasuk keutamaan bahasa anda, tetapan pemberitahuan, dan keutamaan pengesanan ancaman. Semua maklumat disimpan secara tempatan pada peranti anda dan tidak pernah dihantar ke pelayan luaran.',
                section5Title: 'Pihak ketiga manakah yang kami kongsi maklumat anda?',
                section5Content: 'Kami tidak berkongsi sebarang maklumat dengan pihak ketiga. Semua pemprosesan berlaku secara tempatan pada peranti anda. Kami tidak akan berkongsi maklumat peribadi anda dengan mana-mana rakan kongsi atau perkhidmatan luaran.',
                consentText: 'Saya telah membaca dan bersetuju dengan Dasar Privasi',
                declineText: 'Tolak dan Lumpuhkan',
                acceptText: 'Terima dan Teruskan'
            },
            ta: {
                mainTitle: 'தனியுரிமை கொள்கை',
                mainSubtitle: 'உங்கள் தனியுரிமை முக்கியம்',
                section1Title: 'தனிப்பட்ட அறிக்கை',
                section1Content: 'ஒவ்வொரு பயனருக்கும் பாதுகாப்பான மற்றும் பயனர் நட்பு அனுபவத்தை உருவாக்க நாங்கள் உறுதியளிக்கிறோம். இதை அடைய, எங்கள் வெளிப்படையான விதிமுறைகள் மற்றும் நிபந்தனைகளில் தெளிவாகத் தெரிவதுபோல, எங்கள் அனைத்துக் கொள்கைகளைப் பற்றியும் முடிந்தவரை தெளிவாக இருக்க நாங்கள் நோக்கமாகக் கொண்டுள்ளோம்.',
                section2Title: 'தரவு சேகரிப்பு',
                section2Content: 'PhishGuard SG பூஜ்ஜிய தரவு சேகரிப்புக் கொள்கையுடன் செயல்படுகிறது. நாங்கள் எந்த தனிப்பட்ட தரவையும் வெளிப்புற சேவையகங்களுக்கு சேகரிக்கவோ, சேமிக்கவோ அல்லது அனுப்பவோ மாட்டோம். அனைத்து அச்சுறுத்தல் கண்டறிதல் மற்றும் செயலாக்கம் உங்கள் சாதனத்தில் உள்ளூரில் நிகழ்கிறது.',
                section3Title: 'நாங்கள் ஏன் உள்ளூர் சேமிப்பகத்தைப் பயன்படுத்துகிறோம்?',
                section3Content: 'உள்ளூர் சேமிப்பகம் உங்கள் அமைப்புகளைக் கண்காணிக்கவும் தரவைப் பராமரிக்கவும் உதவுகிறது, உदாহரணமாக, உங்கள் மொழி விருப்பத்தேர்வுகள், அறிவிப்பு அமைப்புகள் அல்லது தீம் போன்ற பொதுவான பயனர் விருப்பத்தேர்வுகள். சேமிக்கப்படும் தகவல் முற்றிலும் செயல்பாட்டுக்காகப் பயன்படுத்தப்படுகிறது, இது எங்கள் பயனர்களுக்கு தனிப்பயனாக்கப்பட்ட அனுபவங்களை வழங்க அனுமதிக்கிறது. உங்களைக் கண்காணிக்கும் அல்லது அடையாளம் காணும் எந்த கண்காணிப்பு வழிமுறைகளையும் நாங்கள் பயன்படுத்துவதில்லை.',
                section4Title: 'நாங்கள் குறிப்பாக என்ன தகவலைச் சேகரிக்கிறோம்?',
                section4Content: 'நீட்டிப்பு செயல்பட தேவையான குறைந்தபட்ச தகவலைச் சேகரிக்கிறோம். இதில் உங்கள் மொழி விருப்பத்தேர்வுகள், அறிவிப்பு அமைப்புகள் மற்றும் அச்சுறுத்தல் கண்டறிதல் விருப்பத்தேர்வுகள் அடங்கும். அனைத்துத் தகவல்களும் உங்கள் சாதனத்தில் உள்ளூரில் சேமிக்கப்படுகின்றன, வெளிப்புற சேவையகங்களுக்கு ஒருபோதும் அனுப்பப்படுவதில்லை.',
                section5Title: 'உங்கள் தகவலை நாங்கள் எந்த மூன்றாம் தரப்பினருடன் பகிர்கிறோம்?',
                section5Content: 'நாங்கள் எந்த மூன்றாம் தரப்பினருடனும் எந்தத் தகவலையும் பகிர்வதில்லை. அனைத்து செயலாக்கமும் உங்கள் சாதனத்தில் உள்ளூரில் நடக்கிறது. நாங்கள் உங்கள் தனிப்பட்ட தகவலை எந்த வெளிப்புற கூட்டாளர்கள் அல்லது சேவைகளுடன் பகிர்ந்து கொள்ள மாட்டோம்.',
                consentText: 'தனியுரிமை கொள்கையை நான் படித்துவிட்டு ஒப்புக்கொள்கிறேன்',
                declineText: 'மறுத்து முடக்கு',
                acceptText: 'ஏற்று தொடரவும்'
            }
        };
        this.currentLanguage = 'en';
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkConsentStatus();
        this.loadLanguage();
    }

    bindEvents() {
        const privacyConsent = document.getElementById('privacy-consent');
        const acceptBtn = document.getElementById('accept-btn');
        const declineBtn = document.getElementById('decline-btn');
        const languageSelect = document.getElementById('language-select');

        // Enable/disable accept button based on privacy consent
        if (privacyConsent && acceptBtn) {
            privacyConsent.addEventListener('change', () => {
                acceptBtn.disabled = !privacyConsent.checked;
            });
        }

        // Handle accept
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.acceptConsent();
            });
        }

        // Handle decline
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                this.declineConsent();
            });
        }

        // Handle language change
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }

    async loadLanguage() {
        try {
            const result = await chrome.storage.sync.get(['language']);
            const savedLanguage = result.language || 'en';
            this.currentLanguage = savedLanguage;
            
            // Set language selector
            const languageSelect = document.getElementById('language-select');
            if (languageSelect) {
                languageSelect.value = savedLanguage;
            }
            
            // Update UI text
            this.updateLanguage(savedLanguage);
        } catch (error) {
            console.error('PhishGuard: Error loading language:', error);
        }
    }

    async changeLanguage(language) {
        try {
            // Save language preference
            await chrome.storage.sync.set({ language: language });
            this.currentLanguage = language;
            
            // Update UI text
            this.updateLanguage(language);
        } catch (error) {
            console.error('PhishGuard: Error saving language:', error);
        }
    }

    updateLanguage(language) {
        const t = this.translations[language] || this.translations.en;
        
        // Update all text elements
        const elements = {
            'main-title': t.mainTitle,
            'main-subtitle': t.mainSubtitle,
            'section1-title': t.section1Title,
            'section1-content': t.section1Content,
            'section2-title': t.section2Title,
            'section2-content': t.section2Content,
            'section3-title': t.section3Title,
            'section3-content': t.section3Content,
            'section4-title': t.section4Title,
            'section4-content': t.section4Content,
            'section5-title': t.section5Title,
            'section5-content': t.section5Content,
            'consent-text': t.consentText,
            'decline-text': t.declineText,
            'accept-text': t.acceptText
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    async checkConsentStatus() {
        try {
            const result = await chrome.storage.sync.get(['consentGiven']);

            // If consent already given, close this tab
            if (result.consentGiven) {
                window.close();
            }
        } catch (error) {
            console.error('PhishGuard: Error checking consent status:', error);
        }
    }

    async acceptConsent() {
        try {
            // Save consent and preferences
            await chrome.storage.sync.set({
                consentGiven: true,
                consentDate: new Date().toISOString()
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

    showSuccessMessage() {
        const t = this.translations[this.currentLanguage] || this.translations.en;
        
        const successMessages = {
            en: {
                title: 'Setup Complete!',
                message: 'PhishGuard SG is now protecting you from phishing threats.',
                closing: 'This window will close automatically...'
            },
            zh: {
                title: '设置完成！',
                message: 'PhishGuard SG 现在正在保护您免受网络钓鱼威胁。',
                closing: '此窗口将自动关闭...'
            },
            ms: {
                title: 'Persediaan Selesai!',
                message: 'PhishGuard SG kini melindungi anda daripada ancaman phishing.',
                closing: 'Tetingkap ini akan ditutup secara automatik...'
            },
            ta: {
                title: 'அமைப்பு முடிந்தது!',
                message: 'PhishGuard SG இப்போது உங்களை ஃபிஷிங் அச்சுறுத்தல்களிலிருந்து பாதுகாக்கிறது.',
                closing: 'இந்த சாளரம் தானாக மூடப்படும்...'
            }
        };
        
        const msg = successMessages[this.currentLanguage] || successMessages.en;
        
        // Replace content with success message
        const container = document.querySelector('.privacy-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                <h1 style="color: #4CAF50; margin-bottom: 16px;">${msg.title}</h1>
                <p style="color: rgba(255, 255, 255, 0.8); font-size: 18px; margin-bottom: 20px;">
                    ${msg.message}
                </p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                    ${msg.closing}
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
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'showConsent') {
        // This page is already showing, just focus the window
        window.focus();
    }
});