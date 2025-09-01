// PhishGuard SG Content Script
console.log('PhishGuard: Content script loading...');

class PhishGuardContent {
    constructor() {
        console.log('PhishGuard: PhishGuardContent constructor called');
        console.log('PhishGuard: Current URL:', window.location.href);
        
        this.emailScanner = new EmailScanner();
        this.llmAnalyzer = new LLMEmailAnalyzer();
        this.emailCache = new Map(); // Cache analysis results
        this.evaluatingEmails = new Set(); // Track emails being analyzed
        
        this.setupEmailDetection();
        this.setupPageMonitoring();
        this.injectStyles();
        this.checkCurrentPage();
        
        console.log('PhishGuard: Content script fully initialized');
        
        // Test detection immediately
        setTimeout(() => {
            console.log('PhishGuard: Testing email detection...');
            this.testEmailDetection();
        }, 1000);
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
        console.log('PhishGuard: Setting up email detection...');
        
        // Monitor for email addresses on hover
        document.addEventListener('mouseover', (event) => {
            console.log('PhishGuard: Mouse over event triggered on:', event.target);
            const email = this.extractEmail(event.target);
            if (email) {
                console.log('PhishGuard: Email found, handling hover:', email);
                this.handleEmailHover(email, event.target);
            }
        });

        // Remove tooltip on mouse leave
        document.addEventListener('mouseout', (event) => {
            const email = this.extractEmail(event.target);
            if (email) {
                // Add small delay to allow moving to tooltip
                setTimeout(() => {
                    const tooltip = document.getElementById('phishguard-email-tooltip');
                    if (tooltip && !tooltip.matches(':hover') && !event.target.matches(':hover')) {
                        this.removeExistingTooltip();
                    }
                }, 200);
            }
        });
    }

    setupPageMonitoring() {
        // Monitor for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanForEmails(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    extractEmail(element) {
        // Check for email in various formats
        const text = element.textContent || element.value || element.href || '';
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);
        const email = matches ? matches[0] : null;
        
        if (email) {
            console.log('PhishGuard: Found email in element:', email, 'from text:', text.substring(0, 50));
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
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 16px;
                max-width: 320px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.5;
                z-index: 10000;
                border-left: 4px solid #4caf50;
            }
            
            .phishguard-tooltip.warning { 
                border-left-color: #ff9800; 
            }
            
            .phishguard-tooltip.danger { 
                border-left-color: #f44336; 
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
        // Always show immediate loading state first
        this.showLoadingTooltip(element, email);
        
        // Check cache first
        if (this.emailCache.has(email)) {
            const cached = this.emailCache.get(email);
            // Small delay to show loading state briefly
            setTimeout(() => {
                this.showEmailTooltip(element, email, cached);
            }, 300);
            return;
        }

        // Show evaluating state
        if (!this.evaluatingEmails.has(email)) {
            this.evaluatingEmails.add(email);
            
            // Perform comprehensive analysis
            const analysis = await this.performComprehensiveAnalysis(email, element);
            
            // Cache result
            this.emailCache.set(email, analysis);
            this.evaluatingEmails.delete(email);
            
            // Update display with final results
            this.showEmailTooltip(element, email, analysis);
        }
    }

    async performComprehensiveAnalysis(email, element) {
        try {
            // Get email content context
            const context = this.getEmailContext(element);
            
            // Run both basic and LLM analysis
            const [basicAnalysis, llmAnalysis] = await Promise.allSettled([
                this.emailScanner.scanEmail(email),
                this.llmAnalyzer.analyzeEmailContent(email, context.content, context)
            ]);

            // Combine results
            const basic = basicAnalysis.status === 'fulfilled' ? basicAnalysis.value : null;
            const llm = llmAnalysis.status === 'fulfilled' ? llmAnalysis.value : null;
            
            return this.combineAnalysisResults(basic, llm, email);
            
        } catch (error) {
            console.error('PhishGuard: Email analysis failed:', error);
            return this.emailScanner.scanEmail(email); // Fallback to basic analysis
        }
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
        
        // Prefer LLM results if available, fall back to basic
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
            source: llm ? 'llm' : 'basic',
            llmAvailable: !!llm
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
            <strong>🔍 Analyzing Email</strong>
            <p>Evaluating: ${email}</p>
            <small>Please wait...</small>
        `;
        
        this.positionTooltip(tooltip, element);
        document.body.appendChild(tooltip);
    }

    showEvaluatingState(element, email) {
        this.showTooltip(element, {
            title: '🔍 Analyzing Email',
            content: 'Checking email validity...',
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
        this.positionTooltip(tooltip, element);
        document.body.appendChild(tooltip);

        // Auto-remove based on risk level
        const timeout = analysis.riskLevel === 'safe' ? 3000 : 
                       analysis.riskLevel === 'low' ? 5000 : 8000;
        
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, timeout);
    }

    createEmailTooltip(analysis) {
        const tooltip = document.createElement('div');
        tooltip.id = 'phishguard-email-tooltip';
        
        const typeClass = analysis.riskLevel === 'safe' ? 'safe' :
                         analysis.riskLevel === 'low' ? 'warning' :
                         analysis.riskLevel === 'medium' ? 'warning' : 'danger';
        
        tooltip.className = `phishguard-tooltip ${typeClass}`;
        
        const icon = analysis.riskLevel === 'safe' ? '✅' :
                    analysis.riskLevel === 'low' ? '⚠️' :
                    analysis.riskLevel === 'medium' ? '⚠️' : '🚨';
        
        const title = analysis.riskLevel === 'safe' ? 'Email Verified' :
                     analysis.riskLevel === 'low' ? 'Low Risk Email' :
                     analysis.riskLevel === 'medium' ? 'Suspicious Email' : 'High Risk Email';
        
        tooltip.innerHTML = `
            <strong>${icon} ${title}</strong>
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
            <p>${config.content}</p>
        `;
        
        this.positionTooltip(tooltip, element);
        document.body.appendChild(tooltip);
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
        tooltip.style.position = 'fixed';
        tooltip.style.top = (rect.bottom + 10) + 'px';
        tooltip.style.left = rect.left + 'px';
        tooltip.style.zIndex = '10000';
    }

    removeExistingTooltip() {
        const existing = document.getElementById('phishguard-email-tooltip');
        if (existing) {
            existing.remove();
        }
    }

    scanForEmails(element) {
        // Scan new elements for email addresses
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            const email = this.extractEmail(node.parentElement);
            if (email && !node.parentElement.dataset.phishguardScanned) {
                node.parentElement.dataset.phishguardScanned = 'true';
                // Pre-emptively check this email
                this.checkEmailThreat(email, node.parentElement);
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PhishGuardContent();
    });
} else {
    new PhishGuardContent();
}