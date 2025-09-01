// Email Scanner Utility
class EmailScanner {
    constructor() {
        this.loadPatterns();
    }

    async loadPatterns() {
        try {
            console.log('PhishGuard: EmailScanner requesting patterns from background...');
            
            // Get patterns from background script instead of direct fetch
            chrome.runtime.sendMessage({action: 'getPatterns'}, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('PhishGuard: Background script not available, using fallback patterns');
                    this.setFallbackPatterns();
                } else if (response && response.patterns) {
                    console.log('PhishGuard: Patterns loaded from background script');
                    this.patterns = response.patterns;
                } else {
                    console.log('PhishGuard: No patterns in response, using fallback');
                    this.setFallbackPatterns();
                }
            });
        } catch (error) {
            console.error('PhishGuard: Failed to load email patterns:', error);
            this.setFallbackPatterns();
        }
    }

    setFallbackPatterns() {
        console.log('PhishGuard: Setting fallback patterns');
        this.patterns = {
            suspicious_keywords: ['secure', 'verify', 'urgent', 'update', 'suspend'],
            risky_tlds: ['.tk', '.ml', '.ga', '.cf', '.top', '.click'],
            typosquatting_patterns: {
                'dbs': ['db5', 'd8s', 'dds'],
                'ocbc': ['0cbc', 'ocb0', 'ocdc'],
                'uob': ['u0b', 'u08', 'vob']
            }
        };
    }

    scanEmail(email) {
        const [localPart, domain] = email.toLowerCase().split('@');
        let score = 0;

        // Check domain reputation
        score += this.checkDomainReputation(domain);
        
        // Check for suspicious patterns
        score += this.checkSuspiciousPatterns(email, domain);
        
        // Check for brand impersonation
        score += this.checkBrandImpersonation(domain);

        return {
            email: email,
            domain: domain,
            threatScore: score,
            riskLevel: this.getRiskLevel(score)
        };
    }

    checkDomainReputation(domain) {
        const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const singaporeBrands = ['dbs', 'ocbc', 'uob', 'gov'];

        // High score if free provider used for brand impersonation
        for (const brand of singaporeBrands) {
            if (domain.includes(brand) && freeProviders.includes(domain)) {
                return 40; // e.g., dbsbank@gmail.com
            }
        }

        return 0;
    }

    checkSuspiciousPatterns(email, domain) {
        let score = 0;

        // Check for suspicious keywords in domain
        const suspiciousKeywords = this.patterns?.suspicious_keywords || [];
        for (const keyword of suspiciousKeywords) {
            if (domain.includes(keyword)) {
                score += 25;
            }
        }

        // Check for uncommon TLDs
        const riskyTlds = this.patterns?.risky_tlds || [];
        for (const tld of riskyTlds) {
            if (domain.endsWith(tld)) {
                score += 15;
            }
        }

        return score;
    }

    checkBrandImpersonation(domain) {
        if (!this.patterns?.typosquatting_patterns) return 0;

        let score = 0;
        for (const [brand, variants] of Object.entries(this.patterns.typosquatting_patterns)) {
            for (const variant of variants) {
                if (domain.includes(variant)) {
                    score += 50;
                }
            }
        }

        return score;
    }

    getRiskLevel(score) {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'safe';
    }
}