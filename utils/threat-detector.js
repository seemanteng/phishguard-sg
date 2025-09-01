// Threat Detection Utility
class ThreatDetector {
    constructor() {
        this.threatPatterns = null;
        this.whitelist = null;
        this.loadData();
    }

    async loadData() {
        try {
            const [patternsResponse, whitelistResponse] = await Promise.all([
                fetch(chrome.runtime.getURL('data/threat-patterns.json')),
                fetch(chrome.runtime.getURL('data/whitelist.json'))
            ]);
            
            this.threatPatterns = await patternsResponse.json();
            this.whitelist = await whitelistResponse.json();
        } catch (error) {
            console.error('Failed to load threat detection data:', error);
        }
    }

    assessURL(url) {
        if (!this.threatPatterns || !this.whitelist) {
            return { score: 0, details: [], isWhitelisted: false };
        }

        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        const path = urlObj.pathname.toLowerCase();
        
        let score = 0;
        const details = [];

        // Check whitelist first
        const isWhitelisted = this.isWhitelisted(domain);
        if (isWhitelisted) {
            return { score: -70, details: ['Domain is verified safe'], isWhitelisted: true };
        }

        // Check for typosquatting
        const typoScore = this.checkTyposquatting(domain);
        if (typoScore > 0) {
            score += typoScore;
            details.push(`Potential typosquatting detected (Score: +${typoScore})`);
        }

        // Check for suspicious keywords
        const keywordScore = this.checkSuspiciousKeywords(domain + path);
        if (keywordScore > 0) {
            score += keywordScore;
            details.push(`Suspicious keywords found (Score: +${keywordScore})`);
        }

        // Check for risky TLDs
        const tldScore = this.checkRiskyTLD(domain);
        if (tldScore > 0) {
            score += tldScore;
            details.push(`Uncommon TLD for Singapore brands (Score: +${tldScore})`);
        }

        // Check HTTPS
        if (urlObj.protocol !== 'https:' && this.containsSensitiveKeywords(path)) {
            score += 25;
            details.push('Sensitive content on unsecured HTTP connection (Score: +25)');
        }

        // Check for URL shorteners (potential redirect threats)
        const shortenerScore = this.checkURLShorteners(domain);
        if (shortenerScore > 0) {
            score += shortenerScore;
            details.push(`URL shortener detected (Score: +${shortenerScore})`);
        }

        return { score, details, isWhitelisted: false };
    }

    isWhitelisted(domain) {
        return this.whitelist.trusted_domains.some(trusted => 
            domain === trusted || domain.endsWith('.' + trusted)
        );
    }

    checkTyposquatting(domain) {
        let score = 0;
        
        if (this.threatPatterns.typosquatting_patterns) {
            for (const [brand, variants] of Object.entries(this.threatPatterns.typosquatting_patterns)) {
                for (const variant of variants) {
                    if (domain.includes(variant)) {
                        score += 50;
                        break;
                    }
                }
                if (score > 0) break;
            }
        }

        // Check for character substitutions
        const brands = this.threatPatterns.singapore_brands || [];
        for (const brand of brands) {
            if (this.hasCharacterSubstitution(domain, brand)) {
                score += 40;
                break;
            }
        }

        return score;
    }

    hasCharacterSubstitution(domain, brand) {
        const substitutions = {
            'o': ['0', 'ø'],
            'i': ['1', 'l', '!'],
            'l': ['1', 'i'],
            'a': ['@', '4'],
            'e': ['3'],
            's': ['5', '$']
        };

        for (const [original, replacements] of Object.entries(substitutions)) {
            for (const replacement of replacements) {
                const modifiedBrand = brand.replace(new RegExp(original, 'g'), replacement);
                if (domain.includes(modifiedBrand)) {
                    return true;
                }
            }
        }

        return false;
    }

    checkSuspiciousKeywords(text) {
        const keywords = this.threatPatterns.suspicious_keywords || [];
        let score = 0;
        let foundKeywords = 0;

        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                foundKeywords++;
            }
        }

        // Progressive scoring - more keywords = higher threat
        if (foundKeywords >= 3) score = 60;
        else if (foundKeywords >= 2) score = 40;
        else if (foundKeywords === 1) score = 20;

        return score;
    }

    checkRiskyTLD(domain) {
        const riskyTLDs = this.threatPatterns.risky_tlds || [];
        
        for (const tld of riskyTLDs) {
            if (domain.endsWith(tld)) {
                return 30;
            }
        }

        // Additional check for brand + uncommon TLD combination
        const brands = this.threatPatterns.singapore_brands || [];
        for (const brand of brands) {
            if (domain.includes(brand) && !domain.endsWith('.sg') && !domain.endsWith('.com')) {
                return 20;
            }
        }

        return 0;
    }

    containsSensitiveKeywords(path) {
        const sensitiveKeywords = ['login', 'password', 'signin', 'account', 'banking', 'payment'];
        return sensitiveKeywords.some(keyword => path.includes(keyword));
    }

    checkURLShorteners(domain) {
        const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'short.link', 'ow.ly', 'is.gd'];
        return shorteners.includes(domain) ? 25 : 0;
    }

    getRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'safe';
    }
}

// Make available globally
window.ThreatDetector = ThreatDetector;