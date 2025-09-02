// PhishGuard SG Content Script v2.2 - FIXED TOOLTIPS & COLORS  
console.log('PhishGuard: Content script v2.2 loading with SINGLE TOOLTIP behavior...');

class PhishGuardContent {
    constructor() {
        try {
            console.log('PhishGuard: PhishGuardContent constructor called');
            console.log('PhishGuard: Current URL:', window.location.href);
            
            this.emailScanner = new EmailScanner();
            this.evaluatingEmails = new Set(); // Track emails being analyzed
            this.currentHoveredEmail = null; // Track current hovered email
            this.hoverDebounceTimeout = null; // Debounce rapid hover events
            this.currentLanguage = 'en'; // Default language
            this.translations = null;
            
            this.loadLanguageSettings();
            this.setupEmailDetection();
            this.setupPageMonitoring();
            this.injectStyles();
            this.checkCurrentPage();
            this.setupMessageListener();
            
            console.log('PhishGuard: Content script fully initialized');
        } catch (error) {
            console.error('PhishGuard: Constructor failed, continuing with minimal functionality:', error);
            // Don't let initialization errors break the page
        }
        
        // Don't test detection automatically - wait for user hover
        // setTimeout(() => {
        //     console.log('PhishGuard: Testing email detection...');
        //     this.testEmailDetection();
        // }, 1000);
    }
    
    async loadLanguageSettings() {
        try {
            const settings = await chrome.storage.sync.get({ language: 'en' });
            this.currentLanguage = settings.language;
            this.loadTranslations();
            console.log('PhishGuard: Language loaded:', this.currentLanguage);
        } catch (error) {
            console.error('PhishGuard: Error loading language settings:', error);
            this.currentLanguage = 'en';
            this.loadTranslations();
        }
    }

    loadTranslations() {
        this.translations = {
            en: {
                emailVerified: 'Email Verified',
                emailScanned: 'Email Scanned',
                lowRiskEmail: 'Low Risk Email',
                suspiciousEmail: 'Suspicious Email',
                highRiskEmail: 'High Risk Email',
                analyzingEmail: 'Analyzing Email',
                noThreatsDetected: 'No immediate threats detected',
                checkingValidity: 'Checking email validity...',
                pleaseWait: 'Please wait...',
                domainWhitelisted: 'Domain is whitelisted (verified safe)',
                noSuspiciousPatterns: 'No suspicious patterns detected',
                suspiciousKeywordDomain: 'Suspicious keyword in domain',
                suspiciousKeywordEmail: 'Suspicious keyword in email',
                brandImpersonation: 'Possible brand impersonation in domain',
                brandOnFreeEmail: 'brand impersonation on free email',
                brandOnSuspiciousDomain: 'brand on suspicious domain',
                riskyDomainExtension: 'Risky domain extension',
                ipAddressDetected: 'Domain uses IP address instead of domain name',
                unusuallyLongDomain: 'Unusually long domain name',
                longDomainName: 'Long domain name',
                urlShortenerDetected: 'URL shortening service detected',
                multipleAtSymbols: 'Multiple @ symbols detected',
                suspiciousDashes: 'Suspicious dashes in domain name',
                multipleSubdomains: 'Multiple subdomains detected',
                manySubdomains: 'Many subdomains (high risk)',
                securityKeywordsInDomain: 'Security keywords in domain name (suspicious)',
                possibleTyposquatting: 'Possible typosquatting',
                mixedCharacterScripts: 'Mixed character scripts detected'
            },
            zh: {
                emailVerified: '邮件已验证',
                emailScanned: '邮件已扫描',
                lowRiskEmail: '低风险邮件',
                suspiciousEmail: '可疑邮件',
                highRiskEmail: '高风险邮件',
                analyzingEmail: '分析邮件',
                noThreatsDetected: '未检测到直接威胁',
                checkingValidity: '检查邮件有效性...',
                pleaseWait: '请稍候...',
                domainWhitelisted: '域名已被列入白名单（验证安全）',
                noSuspiciousPatterns: '未检测到可疑模式',
                suspiciousKeywordDomain: '域名中含有可疑关键词',
                suspiciousKeywordEmail: '邮件中含有可疑关键词',
                brandImpersonation: '域名可能冒充品牌',
                brandOnFreeEmail: '在免费邮箱上冒充品牌',
                brandOnSuspiciousDomain: '可疑域名上的品牌',
                riskyDomainExtension: '危险的域名扩展',
                ipAddressDetected: '域名使用IP地址而非域名',
                unusuallyLongDomain: '异常长的域名',
                longDomainName: '较长的域名',
                urlShortenerDetected: '检测到短链接服务',
                multipleAtSymbols: '检测到多个@符号',
                suspiciousDashes: '域名中含有可疑破折号',
                multipleSubdomains: '检测到多个子域名',
                manySubdomains: '许多子域名（高风险）',
                securityKeywordsInDomain: '域名中含有安全关键词（可疑）',
                possibleTyposquatting: '可能的域名抢注',
                mixedCharacterScripts: '检测到混合字符脚本'
            },
            ms: {
                emailVerified: 'E-mel Disahkan',
                emailScanned: 'E-mel Diimbas',
                lowRiskEmail: 'E-mel Risiko Rendah',
                suspiciousEmail: 'E-mel Mencurigakan',
                highRiskEmail: 'E-mel Berisiko Tinggi',
                analyzingEmail: 'Menganalisis E-mel',
                noThreatsDetected: 'Tiada ancaman langsung dikesan',
                checkingValidity: 'Memeriksa kesahihan e-mel...',
                pleaseWait: 'Sila tunggu...',
                domainWhitelisted: 'Domain disenaraikan putih (disahkan selamat)',
                noSuspiciousPatterns: 'Tiada corak mencurigakan dikesan',
                suspiciousKeywordDomain: 'Kata kunci mencurigakan dalam domain',
                suspiciousKeywordEmail: 'Kata kunci mencurigakan dalam e-mel',
                brandImpersonation: 'Kemungkinan penyamaran jenama dalam domain',
                brandOnFreeEmail: 'penyamaran jenama pada e-mel percuma',
                brandOnSuspiciousDomain: 'jenama pada domain mencurigakan',
                riskyDomainExtension: 'Sambungan domain berisiko',
                ipAddressDetected: 'Domain menggunakan alamat IP bukan nama domain',
                unusuallyLongDomain: 'Nama domain yang luar biasa panjang',
                longDomainName: 'Nama domain yang panjang',
                urlShortenerDetected: 'Perkhidmatan pemendek URL dikesan',
                multipleAtSymbols: 'Berbilang simbol @ dikesan',
                suspiciousDashes: 'Tanda sempang mencurigakan dalam nama domain',
                multipleSubdomains: 'Berbilang subdomain dikesan',
                manySubdomains: 'Banyak subdomain (risiko tinggi)',
                securityKeywordsInDomain: 'Kata kunci keselamatan dalam nama domain (mencurigakan)',
                possibleTyposquatting: 'Kemungkinan typosquatting',
                mixedCharacterScripts: 'Skrip aksara campuran dikesan'
            },
            ta: {
                emailVerified: 'மின்னஞ்சல் சரிபார்க்கப்பட்டது',
                emailScanned: 'மின்னஞ்சல் ஸ்கேன் செய்யப்பட்டது',
                lowRiskEmail: 'குறைந்த ஆபத்து மின்னஞ்சல்',
                suspiciousEmail: 'சந்தேகத்திற்குரிய மின்னஞ்சல்',
                highRiskEmail: 'அதிக ஆபத்து மின்னஞ்சல்',
                analyzingEmail: 'மின்னஞ்சலை பகுப்பாய்வு செய்கிறது',
                noThreatsDetected: 'உடனடி அச்சுறுத்தல்கள் கண்டறியப்படவில்லை',
                checkingValidity: 'மின்னஞ்சல் செல்லுபடியாகும் தன்மையை சரிபார்க்கிறது...',
                pleaseWait: 'தயவுசெய்து காத்திருக்கவும்...',
                domainWhitelisted: 'டொமைன் வெள்ளைப் பட்டியலிடப்பட்டது (சரிபார்க்கப்பட்ட பாதுகாப்பு)',
                noSuspiciousPatterns: 'சந்தேகத்திற்குரிய வடிவங்கள் கண்டறியப்படவில்லை',
                suspiciousKeywordDomain: 'டொமைனில் சந்தேகத்திற்குரிய முக்கிய வார்த்தை',
                suspiciousKeywordEmail: 'மின்னஞ்சலில் சந்தேகத்திற்குரிய முக்கிய வார்த்தை',
                brandImpersonation: 'டொமைனில் சாத்தியமான பிராண்ட் ஆள்மாறாட்டம்',
                brandOnFreeEmail: 'இலவச மின்னஞ்சலில் பிராண்ட் ஆள்மாறாட்டம்',
                brandOnSuspiciousDomain: 'சந்தேகத்திற்குரிய டொமைனில் பிராண்ட்',
                riskyDomainExtension: 'ஆபத்தான டொமைன் நீட்டிப்பு',
                ipAddressDetected: 'டொமைன் பெயருக்கு பதிலாக IP முகவரியைப் பயன்படுத்துகிறது',
                unusuallyLongDomain: 'அசாதாரணமாக நீண்ட டொமைன் பெயர்',
                longDomainName: 'நீண்ட டொமைன் பெயர்',
                urlShortenerDetected: 'URL சுருக்க சேவை கண்டறியப்பட்டது',
                multipleAtSymbols: 'பல @ குறியீடுகள் கண்டறியப்பட்டன',
                suspiciousDashes: 'டொமைன் பெயரில் சந்தேகத்திற்குரிய கோடுகள்',
                multipleSubdomains: 'பல துணைக் களங்கள் கண்டறியப்பட்டன',
                manySubdomains: 'பல துணைக் களங்கள் (அதிக ஆபத்து)',
                securityKeywordsInDomain: 'டொமைன் பெயரில் பாதுகாப்பு முக்கிய வார்த்தைகள் (சந்தேகத்திற்குரிய)',
                possibleTyposquatting: 'சாத்தியமான டைபோஸ்கிவாட்டிங்',
                mixedCharacterScripts: 'கலவையான எழுத்து ஸ்கிரிப்ட்கள் கண்டறியப்பட்டன'
            }
        };
    }

    setupMessageListener() {
        // Listen for language changes from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'settingChanged' && request.setting === 'language') {
                this.currentLanguage = request.value;
                this.loadTranslations();
                console.log('PhishGuard: Language changed to:', this.currentLanguage);
            }
        });
    }

    getTranslation(key, defaultValue = '') {
        const currentTranslations = this.translations[this.currentLanguage] || this.translations.en;
        return currentTranslations[key] || defaultValue;
    }

    translateAnalysisResults(analysis) {
        if (!analysis || !analysis.threats) {
            return analysis;
        }

        // Translate threats array
        const translatedThreats = analysis.threats.map(threat => {
            // Map common threat patterns to translation keys
            if (threat.includes('Domain is whitelisted')) {
                return this.getTranslation('domainWhitelisted', threat);
            } else if (threat.includes('Suspicious keyword in domain:')) {
                const keyword = threat.split(': ')[1];
                return `${this.getTranslation('suspiciousKeywordDomain', 'Suspicious keyword in domain')}: ${keyword}`;
            } else if (threat.includes('Suspicious keyword in email:')) {
                const keyword = threat.split(': ')[1];
                return `${this.getTranslation('suspiciousKeywordEmail', 'Suspicious keyword in email')}: ${keyword}`;
            } else if (threat.includes('Possible') && threat.includes('impersonation in domain')) {
                return this.getTranslation('brandImpersonation', threat);
            } else if (threat.includes('brand impersonation on free email')) {
                return this.getTranslation('brandOnFreeEmail', threat);
            } else if (threat.includes('brand on suspicious domain')) {
                return this.getTranslation('brandOnSuspiciousDomain', threat);
            } else if (threat.includes('Risky domain extension:')) {
                const extension = threat.split(': ')[1];
                return `${this.getTranslation('riskyDomainExtension', 'Risky domain extension')}: ${extension}`;
            } else if (threat.includes('Domain uses IP address')) {
                return this.getTranslation('ipAddressDetected', threat);
            } else if (threat.includes('Unusually long domain name')) {
                return this.getTranslation('unusuallyLongDomain', threat);
            } else if (threat.includes('Long domain name')) {
                return this.getTranslation('longDomainName', threat);
            } else if (threat.includes('URL shortening service detected')) {
                return this.getTranslation('urlShortenerDetected', threat);
            } else if (threat.includes('Multiple @ symbols detected')) {
                return this.getTranslation('multipleAtSymbols', threat);
            } else if (threat.includes('Suspicious dashes in domain name')) {
                return this.getTranslation('suspiciousDashes', threat);
            } else if (threat.includes('Multiple subdomains detected')) {
                return this.getTranslation('multipleSubdomains', threat);
            } else if (threat.includes('Many subdomains (high risk)')) {
                return this.getTranslation('manySubdomains', threat);
            } else if (threat.includes('Security keywords in domain name (suspicious)')) {
                return this.getTranslation('securityKeywordsInDomain', threat);
            } else if (threat.includes('typosquatting')) {
                return this.getTranslation('possibleTyposquatting', threat);
            } else if (threat.includes('Mixed character scripts detected')) {
                return this.getTranslation('mixedCharacterScripts', threat);
            }
            
            // Return original threat if no translation found
            return threat;
        });

        // Translate reasoning
        let translatedReasoning = analysis.reasoning;
        if (analysis.reasoning === 'Domain is whitelisted (verified safe)') {
            translatedReasoning = this.getTranslation('domainWhitelisted', analysis.reasoning);
        } else if (analysis.reasoning === 'No suspicious patterns detected') {
            translatedReasoning = this.getTranslation('noSuspiciousPatterns', analysis.reasoning);
        } else if (translatedThreats.length > 0) {
            translatedReasoning = translatedThreats.join(', ');
        }

        return {
            ...analysis,
            threats: translatedThreats,
            reasoning: translatedReasoning
        };
    }

    testEmailDetection() {
        // Look for any emails already on the page
        const allElements = document.querySelectorAll('*');
        let emailsFound = 0;
        
        allElements.forEach(element => {
            const email = this.extractEmail(element);
            if (email) {
                emailsFound++;
                console.log('PhishGuard: Test found email:', email, 'in element:', element);
            }
        });
        
        console.log('PhishGuard: Test complete. Found', emailsFound, 'emails on page');
        
        if (emailsFound === 0) {
            console.log('PhishGuard: No emails found. This might be normal for Gmail where emails are in specific elements.');
        }
    }

    checkCurrentPage() {
        // Check the current page immediately when loaded
        chrome.runtime.sendMessage({
            action: 'checkCurrentPage',
            url: window.location.href,
            domain: window.location.hostname
        });
    }

    setupEmailDetection() {
        try {
            console.log('PhishGuard: Setting up email detection...');
            console.log('PhishGuard: Current URL:', window.location.href);
            
            // Check if we're on Gmail
            const isGmail = window.location.hostname.includes('mail.google.com');
            if (isGmail) {
                console.log('PhishGuard: Gmail detected, setting up Gmail-specific detection');
                this.setupGmailDetection();
            }
            
            // Don't preemptively scan - only analyze on hover
            this.preAnalyzeVisibleEmails(); // This just logs that it's disabled now
            
            // Track current hover state
            this.currentHoveredElement = null;
            this.hoverTimeout = null;
            
            // Monitor for email addresses on hover with proximity detection
            document.addEventListener('mouseover', (event) => {
                try {
                    const email = this.extractEmail(event.target);
                    if (email) {
                        this.currentHoveredElement = event.target;
                        
                        // Clear any pending hide timeout
                        if (this.hoverTimeout) {
                            clearTimeout(this.hoverTimeout);
                            this.hoverTimeout = null;
                        }

                        // Debounce rapid hover events
                        if (this.hoverDebounceTimeout) {
                            clearTimeout(this.hoverDebounceTimeout);
                        }
                        
                        this.hoverDebounceTimeout = setTimeout(() => {
                            this.handleEmailHover(email, event.target);
                        }, 100); // 100ms debounce
                    }
                } catch (error) {
                    console.error('PhishGuard: Mouseover handler error:', error);
                    // Don't let email detection errors break the page
                }
            });

            // Remove tooltip when mouse leaves email area
            document.addEventListener('mouseout', (event) => {
                try {
                    const email = this.extractEmail(event.target);
                    if (email && event.target === this.currentHoveredElement) {
                        // Immediately clear any debounce timeout
                        if (this.hoverDebounceTimeout) {
                            clearTimeout(this.hoverDebounceTimeout);
                            this.hoverDebounceTimeout = null;
                        }
                        
                        // Set a short delay before hiding tooltip
                        this.hoverTimeout = setTimeout(() => {
                            this.removeExistingTooltip();
                            this.currentHoveredElement = null;
                            this.currentHoveredEmail = null;
                        }, 150); // Shorter delay for faster cleanup
                    }
                } catch (error) {
                    console.error('PhishGuard: Mouseout handler error:', error);
                }
            });

            // Clean up tooltips when mouse moves away from email areas
            document.addEventListener('mousemove', (event) => {
                try {
                    // If there's a tooltip but no hovered element, remove it
                    const tooltip = document.getElementById('phishguard-email-tooltip');
                    if (tooltip && !this.currentHoveredElement) {
                        this.removeExistingTooltip();
                    }
                    
                    // If mouse moves far from current hovered element, clean up
                    if (this.currentHoveredElement) {
                        const mouseNearEmail = this.isMouseNearElement(event, this.currentHoveredElement, 100); // Larger threshold for move
                        if (!mouseNearEmail) {
                            if (this.hoverTimeout) {
                                clearTimeout(this.hoverTimeout);
                                this.hoverTimeout = null;
                            }
                            this.removeExistingTooltip();
                            this.currentHoveredElement = null;
                            this.currentHoveredEmail = null;
                        }
                    }
                } catch (error) {
                    console.error('PhishGuard: Mousemove handler error:', error);
                }
            });
            
        } catch (error) {
            console.error('PhishGuard: Failed to setup email detection:', error);
        }
    }

    setupGmailDetection() {
        console.log('PhishGuard: Setting up Gmail-specific email detection for compose/reply');
        
        // Gmail-specific selectors for recipient/compose areas
        const gmailSelectors = [
            '[email]', // Gmail uses email attribute
            'span[dir="ltr"]', // Email addresses in Gmail often use this
            '.go\\:o', // Gmail specific classes  
            '.gb_d', // Gmail header email
            '[aria-label*="@"]', // Any element with @ in aria-label
            // Compose/Reply specific selectors
            '[data-hovercard-id*="@"]', // Gmail recipient hover cards
            '.aXjCH', // Gmail recipient chips in compose
            '.afn', // Gmail recipient names/emails
            '.g2', // Gmail recipient container
            '.ak4', // Gmail recipient area
            '.aYF', // Gmail compose recipient
            'span[email]', // Recipient email spans
            '.oL.aDm', // Gmail conversation header
            '.gD', // Gmail sender info
            '.go.gD', // Gmail sender in header
            '.qu', // Gmail recipient in compose
            '.vN' // Gmail recipient display
        ];
        
        // Add targeted listeners for Gmail elements
        gmailSelectors.forEach(selector => {
            document.addEventListener('mouseover', (event) => {
                try {
                    if (event.target.matches(selector) || event.target.closest(selector)) {
                        const email = this.extractGmailEmail(event.target);
                        if (email) {
                            console.log('PhishGuard: Gmail email detected:', email);
                            this.handleEmailHover(email, event.target);
                        }
                    }
                } catch (error) {
                    console.error('PhishGuard: Gmail detection error:', error);
                }
            });
        });
        
        // Also watch for Gmail's dynamic content loading
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanGmailElement(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Specifically watch for Gmail compose windows
        this.watchForGmailCompose();
    }
    
    watchForGmailCompose() {
        console.log('PhishGuard: Setting up Gmail compose detection');
        
        // Watch for compose/reply windows that appear
        const composeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if this is a compose window
                            if (node.matches && node.matches('.nH.if, .dw, .nH.aHU')) {
                                console.log('PhishGuard: Gmail compose window detected');
                                setTimeout(() => this.scanComposeWindow(node), 500);
                            } else if (node.querySelector) {
                                const composeWindow = node.querySelector('.nH.if, .dw, .nH.aHU');
                                if (composeWindow) {
                                    console.log('PhishGuard: Gmail compose window detected in new content');
                                    setTimeout(() => this.scanComposeWindow(composeWindow), 500);
                                }
                            }
                        }
                    });
                }
            });
        });
        
        composeObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also scan existing compose windows
        const existingComposeWindows = document.querySelectorAll('.nH.if, .dw, .nH.aHU');
        existingComposeWindows.forEach(window => {
            console.log('PhishGuard: Found existing compose window');
            this.scanComposeWindow(window);
        });
    }
    
    scanComposeWindow(composeWindow) {
        console.log('PhishGuard: Scanning compose window for recipients');
        
        // Look for recipient elements in the compose window
        const recipientSelectors = [
            '[email]',
            '.aXjCH', // recipient chips
            '.qu', // recipient area
            '.vN', // recipient display
            '[data-hovercard-id*="@"]',
            'span[dir="ltr"]'
        ];
        
        recipientSelectors.forEach(selector => {
            const recipients = composeWindow.querySelectorAll(selector);
            recipients.forEach(recipient => {
                // Only extract email on hover, don't scan automatically
                recipient.addEventListener('mouseenter', () => {
                    const email = this.extractGmailEmail(recipient);
                    if (email) {
                        console.log('PhishGuard: Hovering over recipient:', email);
                        this.handleEmailHover(email, recipient);
                    }
                });
            });
        });
    }

    extractGmailEmail(element) {
        // Gmail-specific email extraction for compose/reply (only called on hover)
        // console.log('PhishGuard: Checking Gmail element:', element.className, element.tagName);
        
        // Check various Gmail attributes and content
        const sources = [
            element.getAttribute('email'),
            element.getAttribute('data-hovercard-id'),
            element.getAttribute('data-tooltip'),
            element.getAttribute('title'),
            element.getAttribute('aria-label'),
            element.textContent,
            element.innerText
        ];
        
        // Also check parent elements for email info
        const parent = element.closest('[email], [data-hovercard-id*="@"], .aXjCH, .qu, .vN');
        if (parent) {
            sources.push(
                parent.getAttribute('email'),
                parent.getAttribute('data-hovercard-id'),
                parent.textContent
            );
        }
        
        for (const source of sources) {
            if (source && source.includes('@')) {
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                const matches = source.match(emailRegex);
                if (matches && matches[0]) {
                    // console.log('PhishGuard: Extracted Gmail email:', matches[0], 'from:', source.substring(0, 50));
                    return matches[0];
                }
            }
        }
        
        return null;
    }

    scanGmailElement(element) {
        // Don't automatically scan for emails - only detect on hover
        // Just add hover listeners to new elements
        const emailElements = element.querySelectorAll('[email], [data-hovercard-id*="@"], .aXjCH, .qu, .vN, span[dir="ltr"]');
        emailElements.forEach(emailElement => {
            if (!emailElement.hasAttribute('data-phishguard-listener')) {
                emailElement.setAttribute('data-phishguard-listener', 'true');
                emailElement.addEventListener('mouseenter', () => {
                    const email = this.extractGmailEmail(emailElement);
                    if (email) {
                        console.log('PhishGuard: Hover detected on:', email);
                        this.handleEmailHover(email, emailElement);
                    }
                });
            }
        });
    }

    isMouseNearElement(event, element, threshold = 50) {
        const rect = element.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // Check if mouse is within threshold pixels of the element
        return mouseX >= rect.left - threshold &&
               mouseX <= rect.right + threshold &&
               mouseY >= rect.top - threshold &&
               mouseY <= rect.bottom + threshold;
    }


    preAnalyzeVisibleEmails() {
        // DISABLED: No pre-analysis - wait for user hover only
        console.log('PhishGuard: Pre-analysis disabled - emails will only be analyzed on hover');
    }

    setupPageMonitoring() {
        try {
            // Monitor for dynamic content changes with passive, non-blocking approach
            const observer = new MutationObserver((mutations) => {
                // Use requestIdleCallback to avoid blocking the main thread
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(() => {
                        try {
                            this.processMutations(mutations);
                        } catch (error) {
                            console.error('PhishGuard: Mutation processing failed:', error);
                        }
                    });
                } else {
                    // Fallback for browsers without requestIdleCallback
                    setTimeout(() => {
                        try {
                            this.processMutations(mutations);
                        } catch (error) {
                            console.error('PhishGuard: Mutation processing failed:', error);
                        }
                    }, 10);
                }
            });

            // Use passive monitoring that won't interfere with page functionality
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } catch (error) {
            console.error('PhishGuard: Failed to setup page monitoring:', error);
        }
    }
    
    processMutations(mutations) {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Non-blocking email scan
                        this.scanForEmails(node);
                    }
                });
            }
        });
    }

    extractEmail(element) {
        // Check for email in various formats
        const text = element.textContent || element.value || element.href || '';
        // Only log when actually extracting email on hover
        // if (text && text.length > 0) {
        //     console.log('PhishGuard: Checking element text:', text.substring(0, 100));
        // }
        
        // First check for emails enclosed in angle brackets <email@domain.com>
        const bracketEmailRegex = /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g;
        const bracketMatches = text.match(bracketEmailRegex);
        
        if (bracketMatches) {
            // Extract the email from inside the brackets
            const email = bracketMatches[0].slice(1, -1); // Remove < and >
            // console.log('PhishGuard: Found email in angle brackets:', email, 'from text:', text.substring(0, 50));
            return email;
        }
        
        // Also check innerHTML for HTML entities like &lt; and &gt;
        const innerHTML = element.innerHTML || '';
        const htmlBracketRegex = /&lt;([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})&gt;/g;
        const htmlBracketMatches = innerHTML.match(htmlBracketRegex);
        
        if (htmlBracketMatches) {
            const email = htmlBracketMatches[0].replace('&lt;', '').replace('&gt;', '');
            // console.log('PhishGuard: Found email in HTML entity brackets:', email, 'from innerHTML:', innerHTML.substring(0, 50));
            return email;
        }
        
        // Fallback to regular email detection for backward compatibility
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);
        const email = matches ? matches[0] : null;
        
        if (email) {
            // console.log('PhishGuard: Found regular email:', email, 'from text:', text.substring(0, 50));
        }
        
        return email;
    }

    injectStyles() {
        const styles = `
            .phishguard-tooltip {
                position: fixed;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                padding: 16px;
                max-width: 300px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.5;
                z-index: 10000;
                border-left: 4px solid #4caf50;
                pointer-events: auto;
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            
            .phishguard-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .phishguard-tooltip.warning { 
                border-left-color: #ff9800; 
            }
            
            .phishguard-tooltip.danger { 
                border-left-color: #f44336; 
            }
            
            .phishguard-tooltip.typosquatting {
                border-left-color: #dc3545 !important;
                background: white;
                color: #333;
            }
            
            .phishguard-tooltip.evaluating { 
                border-left-color: #2196f3;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            
            .phishguard-tooltip strong {
                display: block;
                margin-bottom: 8px;
                font-size: 15px;
            }
            
            .phishguard-tooltip p {
                margin: 8px 0;
                color: #555;
            }
            
            .phishguard-tooltip small {
                color: #888;
                font-size: 12px;
            }
            
            .phishguard-recommendation {
                margin-top: 12px;
                padding-top: 8px;
                border-top: 1px solid #eee;
                font-weight: 500;
                color: #333;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    highlightEmailsOnPage() {
        // No visual highlighting needed - just detect emails for hover analysis
        // The detection happens on mouseover events
    }

    async handleEmailHover(email, element) {
        try {
            // Check if email scanning is enabled
            const settings = await chrome.storage.sync.get(['emailScanningEnabled']);
            if (!settings.emailScanningEnabled) {
                console.log('PhishGuard: Email scanning disabled, skipping analysis');
                return;
            }

            // Prevent multiple tooltips for same email
            if (this.currentHoveredEmail === email) {
                return;
            }

            // Always remove existing tooltip first
            this.removeExistingTooltip();
            this.currentHoveredEmail = email;


            // Skip if already analyzing this email
            if (this.evaluatingEmails.has(email)) {
                return;
            }

            this.evaluatingEmails.add(email);
            console.log(`PhishGuard: Analyzing ${email} for the first time`);
            
            // Use simple scanner only - clean and fast
            const analysis = await this.emailScanner.scanEmail(email);
            
            // Translate the analysis results
            const translatedAnalysis = this.translateAnalysisResults(analysis);
            
            // Only show tooltip if this is still the hovered email
            if (this.currentHoveredEmail === email) {
                this.showEmailTooltip(element, email, translatedAnalysis);
            }
            
            
            this.evaluatingEmails.delete(email);
            
        } catch (error) {
            console.error('PhishGuard: Email hover analysis failed:', error);
            this.evaluatingEmails.delete(email);
            if (this.currentHoveredEmail === email) {
                this.showFastSafeTooltip(element, email);
            }
        }
    }

    showFastSafeTooltip(element, email) {
        this.showTooltip(element, {
            title: `✅ ${this.getTranslation('emailScanned', 'Email Scanned')}`,
            content: `<div style="font-size: 12px; color: #666; margin: 8px 0; font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${email}</div>${this.getTranslation('noThreatsDetected', 'No immediate threats detected')}`,
            type: 'safe'
        });
    }

    getEmailContext(element) {
        // Extract surrounding context for better analysis
        const parent = element.closest('div, p, td, span');
        const content = parent ? parent.textContent.trim() : element.textContent.trim();
        
        return {
            content: content.length > 500 ? content.substring(0, 500) + '...' : content,
            domain: window.location.hostname,
            title: document.title,
            url: window.location.href
        };
    }

    combineAnalysisResults(basic, llm, email) {
        if (!basic && !llm) {
            return { email, riskLevel: 'unknown', threatScore: 0 };
        }
        
        // Prefer advanced results if available, fall back to basic
        const primary = llm || basic;
        const secondary = llm ? basic : null;
        
        // Combine threat scores if both available
        let finalThreatScore = primary.threatScore || 0;
        if (secondary && secondary.threatScore) {
            finalThreatScore = Math.max(finalThreatScore, secondary.threatScore);
        }
        
        return {
            email,
            threatScore: finalThreatScore,
            riskLevel: this.calculateCombinedRiskLevel(finalThreatScore),
            threats: [...(primary.threats || []), ...(secondary?.threats || [])],
            reasoning: primary.reasoning || 'Basic analysis performed',
            confidence: primary.confidence || 60,
            recommendations: primary.recommendations || 'Verify sender if suspicious',
            source: llm ? 'advanced' : 'basic',
            advancedAvailable: !!llm
        };
    }

    calculateCombinedRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high'; 
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'safe';
    }

    showLoadingTooltip(element, email) {
        this.removeExistingTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'phishguard-email-tooltip';
        tooltip.className = 'phishguard-tooltip evaluating';
        tooltip.innerHTML = `
            <strong>🔍 ${this.getTranslation('analyzingEmail', 'Analyzing Email')}</strong>
            <p>Evaluating: ${email}</p>
            <small>${this.getTranslation('pleaseWait', 'Please wait...')}</small>
        `;
        
        this.positionTooltip(tooltip, element);
        document.body.appendChild(tooltip);
    }

    showEvaluatingState(element, email) {
        this.showTooltip(element, {
            title: `🔍 ${this.getTranslation('analyzingEmail', 'Analyzing Email')}`,
            content: this.getTranslation('checkingValidity', 'Checking email validity...'),
            type: 'evaluating'
        });
    }

    updateEmailDisplay(element, email, analysis) {
        // No visual changes to email element - just update tooltip
        this.showEmailTooltip(element, email, analysis);
    }

    showEmailTooltip(element, email, analysis) {
        this.removeExistingTooltip();
        
        const tooltip = this.createEmailTooltip(analysis);
        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, element);
        
        // Trigger animation after positioning
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
        
        // Store reference
        this.currentTooltip = tooltip;
    }

    createEmailTooltip(analysis) {
        // Debug logging  
        console.log(`PhishGuard Tooltip: ${analysis.email} → riskLevel: "${analysis.riskLevel}", score: ${analysis.threatScore || 'undefined'}`);
        console.log(`Threats: ${JSON.stringify(analysis.threats || [])}`);
        
        // Check for typosquatting threats
        const hasTyposquatting = analysis.threats && analysis.threats.some(threat => 
            threat.includes('typosquatting') || threat.includes('Typosquatting') || 
            threat.includes('character substitution') || threat.includes('Character Substitution')
        );
        
        console.log(`Typosquatting detected: ${hasTyposquatting}`);
        console.log(`Color mapping: ${analysis.riskLevel} → typeClass will be:`, 
            hasTyposquatting ? 'typosquatting' :
            analysis.riskLevel === 'safe' ? 'safe' :
            analysis.riskLevel === 'low' ? 'warning' :
            analysis.riskLevel === 'medium' ? 'warning' : 
            analysis.riskLevel === 'high' ? 'danger' : 'safe');
        
        const tooltip = document.createElement('div');
        tooltip.id = 'phishguard-email-tooltip';
        
        // Prioritize typosquatting for red alert
        const typeClass = hasTyposquatting ? 'typosquatting' :
                         analysis.riskLevel === 'safe' ? 'safe' :
                         analysis.riskLevel === 'low' ? 'warning' :
                         analysis.riskLevel === 'medium' ? 'warning' : 
                         analysis.riskLevel === 'high' ? 'danger' : 'safe';
        
        tooltip.className = `phishguard-tooltip ${typeClass}`;
        
        const icon = hasTyposquatting ? '🚨' :
                    analysis.riskLevel === 'safe' ? '✅' :
                    analysis.riskLevel === 'low' ? '⚠️' :
                    analysis.riskLevel === 'medium' ? '⚠️' : 
                    analysis.riskLevel === 'high' ? '🚨' : '✅';
        
        const title = hasTyposquatting ? this.getTranslation('highRiskEmail', 'High Risk Email') :
                     analysis.riskLevel === 'safe' ? this.getTranslation('emailVerified', 'Email Verified') :
                     analysis.riskLevel === 'low' ? this.getTranslation('lowRiskEmail', 'Low Risk Email') :
                     analysis.riskLevel === 'medium' ? this.getTranslation('suspiciousEmail', 'Suspicious Email') : 
                     analysis.riskLevel === 'high' ? this.getTranslation('highRiskEmail', 'High Risk Email') : this.getTranslation('emailVerified', 'Email Verified');
        
        tooltip.innerHTML = `
            <strong>${icon} ${title}</strong>
            <div style="font-size: 12px; color: #666; margin: 8px 0; font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${analysis.email}</div>
            <p>${analysis.reasoning}</p>
            ${analysis.recommendations ? `<div class="phishguard-recommendation">💡 ${analysis.recommendations}</div>` : ''}
        `;
        
        return tooltip;
    }

    showTooltip(element, config) {
        this.removeExistingTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'phishguard-email-tooltip';
        tooltip.className = `phishguard-tooltip ${config.type}`;
        tooltip.innerHTML = `
            <strong>${config.title}</strong>
            <div>${config.content}</div>
        `;
        
        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }

    async checkEmailThreat(email, element) {
        // This method is kept for backward compatibility but now uses the new system
        await this.handleEmailHover(email, element);
    }

    showEmailWarning(element, email, threatLevel) {
        // Remove existing tooltip
        this.removeExistingTooltip();

        const tooltip = document.createElement('div');
        tooltip.id = 'phishguard-email-tooltip';
        tooltip.className = 'phishguard-tooltip warning';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>⚠️ Suspicious Email</strong>
                <p>This email may be from a fraudulent source</p>
                <small>Threat Level: ${threatLevel > 70 ? 'High' : 'Medium'}</small>
            </div>
        `;

        this.positionTooltip(tooltip, element);
        document.body.appendChild(tooltip);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 5000);
    }

    showEmailSafe(element, email) {
        this.removeExistingTooltip();

        const tooltip = document.createElement('div');
        tooltip.id = 'phishguard-email-tooltip';
        tooltip.className = 'phishguard-tooltip safe';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>✅ Verified Email</strong>
                <p>From a trusted Singapore organization</p>
            </div>
        `;

        this.positionTooltip(tooltip, element);
        document.body.appendChild(tooltip);

        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 3000);
    }

    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '10000';
        
        // Calculate preferred position (below the email)
        let top = rect.bottom + 8;
        let left = rect.left;
        
        // Adjust horizontal position if tooltip would go off-screen
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10; // 10px margin from edge
        }
        if (left < 10) {
            left = 10; // 10px margin from left edge
        }
        
        // Adjust vertical position if tooltip would go off-screen
        if (top + tooltipRect.height > viewportHeight) {
            // Show above the email instead
            top = rect.top - tooltipRect.height - 8;
            if (top < 10) {
                // If still doesn't fit, show alongside
                top = rect.top;
                left = rect.right + 8;
                
                // Check if fits alongside, otherwise back to below
                if (left + tooltipRect.width > viewportWidth) {
                    top = rect.bottom + 8;
                    left = rect.left;
                }
            }
        }
        
        tooltip.style.top = Math.max(10, top) + 'px';
        tooltip.style.left = Math.max(10, left) + 'px';
        
        // Add a small arrow pointing to the email
        this.addTooltipArrow(tooltip, rect, { top, left });
    }
    
    addTooltipArrow(tooltip, elementRect, tooltipPos) {
        // Remove existing arrow
        const existingArrow = tooltip.querySelector('.phishguard-arrow');
        if (existingArrow) {
            existingArrow.remove();
        }
        
        // Create arrow element
        const arrow = document.createElement('div');
        arrow.className = 'phishguard-arrow';
        
        // Position arrow based on tooltip position relative to email
        const tooltipRect = tooltip.getBoundingClientRect();
        const emailCenterX = elementRect.left + elementRect.width / 2;
        const emailCenterY = elementRect.top + elementRect.height / 2;
        const tooltipCenterX = tooltipRect.left + tooltipRect.width / 2;
        const tooltipCenterY = tooltipRect.top + tooltipRect.height / 2;
        
        // Arrow styles
        arrow.style.position = 'absolute';
        arrow.style.width = '0';
        arrow.style.height = '0';
        
        if (tooltipCenterY > emailCenterY + 20) {
            // Tooltip is below email - arrow points up
            arrow.style.top = '-6px';
            arrow.style.left = Math.min(Math.max(emailCenterX - tooltipRect.left - 6, 10), tooltipRect.width - 20) + 'px';
            arrow.style.borderLeft = '6px solid transparent';
            arrow.style.borderRight = '6px solid transparent';
            arrow.style.borderBottom = '6px solid white';
        } else if (tooltipCenterY < emailCenterY - 20) {
            // Tooltip is above email - arrow points down
            arrow.style.bottom = '-6px';
            arrow.style.left = Math.min(Math.max(emailCenterX - tooltipRect.left - 6, 10), tooltipRect.width - 20) + 'px';
            arrow.style.borderLeft = '6px solid transparent';
            arrow.style.borderRight = '6px solid transparent';
            arrow.style.borderTop = '6px solid white';
        }
        
        tooltip.appendChild(arrow);
    }

    removeExistingTooltip() {
        // Remove ALL possible tooltips to prevent duplicates
        const existingTooltips = document.querySelectorAll('.phishguard-tooltip');
        existingTooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        });
        
        // Also remove by ID as backup
        const existing = document.getElementById('phishguard-email-tooltip');
        if (existing && existing.parentNode) {
            existing.remove();
        }
        
        this.currentTooltip = null;
    }

    scanForEmails(element) {
        // DISABLED: Don't automatically scan emails - only add hover listeners
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            const parentElement = node.parentElement;
            if (parentElement && !parentElement.dataset.phishguardScanned) {
                parentElement.dataset.phishguardScanned = 'true';
                // Only add hover listener, don't analyze email yet
                parentElement.addEventListener('mouseenter', () => {
                    const email = this.extractEmail(parentElement);
                    if (email) {
                        this.handleEmailHover(email, parentElement);
                    }
                });
            }
        }
    }

}

// Initialize when DOM is ready - non-blocking approach
function initializePhishGuard() {
    try {
        new PhishGuardContent();
    } catch (error) {
        console.error('PhishGuard: Failed to initialize, extension will be disabled:', error);
        // Don't let initialization errors break the page
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Use setTimeout to make initialization non-blocking
        setTimeout(initializePhishGuard, 100);
    });
} else {
    // Use setTimeout to make initialization non-blocking
    setTimeout(initializePhishGuard, 100);
}