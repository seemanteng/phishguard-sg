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
            
            this.setupEmailDetection();
            this.setupPageMonitoring();
            this.injectStyles();
            this.checkCurrentPage();
            
            console.log('PhishGuard: Content script fully initialized');
        } catch (error) {
            console.error('PhishGuard: Constructor failed, continuing with minimal functionality:', error);
            // Don't let initialization errors break the page
        }
        
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
        try {
            console.log('PhishGuard: Setting up email detection...');
            
            // Preemptively scan visible emails for faster hover response
            this.preAnalyzeVisibleEmails();
            
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
        // Pre-analyze emails that are currently visible for instant hover response
        if (window.requestIdleCallback) {
            window.requestIdleCallback(async () => {
                try {
                    const allElements = document.querySelectorAll('*');
                    let analyzedCount = 0;
                    
                    for (let element of allElements) {
                        const email = this.extractEmail(element);
                        if (email && analyzedCount < 10) { // Limit to 10 total
                            const analysis = this.emailScanner.scanEmail(email);
                            analyzedCount++;
                        }
                    }
                    console.log(`PhishGuard: Pre-analysis complete - ${analyzedCount} emails analyzed`);
                } catch (error) {
                    console.error('PhishGuard: Pre-analysis failed:', error);
                }
            });
        }
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
                background: #f5c6cb;
                color: #721c24;
                animation: pulse-red 2s infinite;
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
            
            @keyframes pulse-red {
                0% { background: #f5c6cb; }
                50% { background: #f8d7da; }
                100% { background: #f5c6cb; }
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
            const analysis = this.emailScanner.scanEmail(email);
            
            // Only show tooltip if this is still the hovered email
            if (this.currentHoveredEmail === email) {
                this.showEmailTooltip(element, email, analysis);
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
            title: '✅ Email Scanned',
            content: `<div style="font-size: 12px; color: #666; margin: 8px 0; font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${email}</div>No immediate threats detected`,
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
        
        const title = hasTyposquatting ? 'High Risk Email' :
                     analysis.riskLevel === 'safe' ? 'Email Verified' :
                     analysis.riskLevel === 'low' ? 'Low Risk Email' :
                     analysis.riskLevel === 'medium' ? 'Suspicious Email' : 
                     analysis.riskLevel === 'high' ? 'High Risk Email' : 'Email Verified';
        
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