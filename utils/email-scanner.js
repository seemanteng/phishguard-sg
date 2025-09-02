// Enhanced Email Scanner v3.3 - URL-BASED PHISHING DETECTION + DEBUG TYPOSQUATTING  
console.log('PhishGuard: EmailScanner v3.3 loaded with advanced URL-based phishing detection + debug typosquatting');
class EmailScanner {
    constructor() {
        this.patterns = {
            suspicious_keywords: ['secure', 'security', 'verify', 'urgent', 'update', 'suspend', 'alert', 'warning', 'expired', 'confirm', 'activate', 'restore', 'locked', 'blocked'],
            risky_tlds: ['.tk', '.ml', '.ga', '.cf', '.top', '.click', '.pw', '.cc', '.gq', '.onion'],
            singapore_brands: ['dbs', 'ocbc', 'uob', 'posb', 'singpass', 'cpf', 'iras', 'hdb'],
            free_providers: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.com'],
            url_shorteners: ['bit.ly', 'tinyurl.com', 't.co', 'short.link', 'ow.ly', 'is.gd', 'goo.gl', 'tiny.cc']
        };
    }

    scanEmail(email) {
        const [localPart, domain] = email.toLowerCase().split('@');
        let score = 0;
        const threats = [];

        // Check for suspicious keywords in domain
        for (const keyword of this.patterns.suspicious_keywords) {
            if (domain.includes(keyword)) {
                score += 25;
                threats.push(`Suspicious keyword in domain: ${keyword}`);
            }
        }
        
        // Check for suspicious keywords in local part
        for (const keyword of this.patterns.suspicious_keywords) {
            if (localPart.includes(keyword)) {
                score += 20;
                threats.push(`Suspicious keyword in email: ${keyword}`);
            }
        }

        // Check for Singapore brand impersonation in domain
        for (const brand of this.patterns.singapore_brands) {
            if (domain.includes(brand) && !this.isLegitimate(domain, brand)) {
                score += 50;
                threats.push(`Possible ${brand.toUpperCase()} impersonation in domain`);
            }
        }
        
        // Check for Singapore brand in local part on free providers (major red flag)
        for (const brand of this.patterns.singapore_brands) {
            if (localPart.includes(brand) && this.patterns.free_providers.includes(domain)) {
                score += 60;
                threats.push(`${brand.toUpperCase()} brand impersonation on free email`);
            }
        }
        
        // Check for Singapore brand in local part on risky domains (also major red flag)
        for (const brand of this.patterns.singapore_brands) {
            if (localPart.includes(brand)) {
                for (const tld of this.patterns.risky_tlds) {
                    if (domain.endsWith(tld)) {
                        score += 40; // Additional score for brand + risky TLD combo
                        threats.push(`${brand.toUpperCase()} brand on suspicious domain`);
                        break; // Don't double-count multiple TLD matches
                    }
                }
            }
        }

        // Check for risky TLDs
        for (const tld of this.patterns.risky_tlds) {
            if (domain.endsWith(tld)) {
                score += 30;
                threats.push(`Risky domain extension: ${tld}`);
            }
        }

        // ===== NEW URL-BASED PHISHING DETECTION FEATURES =====
        
        // 1. IP Address Detection (High Risk - 50 points)
        if (this.hasIPAddress(domain)) {
            score += 50;
            threats.push('Domain uses IP address instead of domain name');
        }
        
        // 2. Long Domain Detection (Phishing domains often use long names)
        if (domain.length >= 54) {
            score += 25;
            threats.push('Unusually long domain name');
        } else if (domain.length >= 40) {
            score += 15;
            threats.push('Long domain name');
        }
        
        // 3. URL Shortener Detection (Medium Risk)
        if (this.patterns.url_shorteners.includes(domain)) {
            score += 25;
            threats.push('URL shortening service detected');
        }
        
        // 4. @ Symbol Detection (High Risk)
        if (email.includes('@') && email.lastIndexOf('@') !== email.indexOf('@')) {
            score += 40;
            threats.push('Multiple @ symbols detected');
        }
        
        // 5. Prefix/Suffix with Dash Detection
        if (this.hasSuspiciousDashes(domain)) {
            score += 20;
            threats.push('Suspicious dashes in domain name');
        }
        
        // 6. Subdomain Analysis (Multiple subdomains = higher risk)
        const subdomainRisk = this.analyzeSubdomains(domain);
        score += subdomainRisk.score;
        if (subdomainRisk.threat) threats.push(subdomainRisk.threat);
        
        // 7. HTTPS Token in Domain (Phishers add "https" to domain to look secure)
        if (domain.includes('https') || domain.includes('ssl') || domain.includes('secure')) {
            score += 30;
            threats.push('Security keywords in domain name (suspicious)');
        }
        
        // 8. Character Substitution Detection (Advanced typosquatting)
        const typoRisk = this.checkCharacterSubstitution(domain);
        console.log(`PhishGuard: Typo check for ${domain} → score: ${typoRisk.score}, threat: ${typoRisk.threat}`);
        score += typoRisk.score;
        if (typoRisk.threat) threats.push(typoRisk.threat);

        const result = {
            email: email,
            riskLevel: this.getRiskLevel(score),
            threatScore: score, // Add score for debugging
            threats: threats,
            reasoning: threats.length > 0 ? threats.join(', ') : 'No suspicious patterns detected'
        };

        // Debug logging
        if (score > 0) {
            console.log(`PhishGuard Scanner: ${email} → score: ${score}, risk: ${result.riskLevel}, threats: [${threats.join(', ')}]`);
        }

        return result;
    }

    isLegitimate(domain, brand) {
        const legitimate = {
            'dbs': ['dbs.com', 'dbs.com.sg'],
            'ocbc': ['ocbc.com', 'ocbc.com.sg'],  
            'uob': ['uob.com.sg', 'uob.com'],
            'posb': ['posb.com.sg'],
            'singpass': ['singpass.gov.sg'],
            'cpf': ['cpf.gov.sg'],
            'iras': ['iras.gov.sg'],
            'hdb': ['hdb.gov.sg']
        };
        
        return legitimate[brand] && legitimate[brand].includes(domain);
    }

    getRiskLevel(score) {
        if (score >= 50) return 'high';    // Red alert for impersonation/risky combos
        if (score >= 15) return 'medium';  // Orange warning for suspicious keywords/risky domains
        if (score >= 5) return 'low';      // Light warning for minor concerns
        return 'safe';                     // Green for clean emails
    }

    // ===== NEW URL-BASED HELPER METHODS =====
    
    hasIPAddress(domain) {
        // Check for IPv4 addresses (e.g., 192.168.1.1)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        // Check for hexadecimal IP (e.g., 0x7f.0x0.0x0.0x1)
        const hexIpRegex = /^(0x[0-9a-f]{1,2}\.){3}0x[0-9a-f]{1,2}$/i;
        
        return ipv4Regex.test(domain) || hexIpRegex.test(domain);
    }
    
    hasSuspiciousDashes(domain) {
        // Check for suspicious dash patterns commonly used by phishers
        // e.g., paypal-secure.com, dbs-verify.com
        const suspiciousPatterns = [
            /-secure-?/i, /-verify-?/i, /-update-?/i, /-login-?/i,
            /-account-?/i, /-banking-?/i, /-official-?/i, /-support-?/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(domain));
    }
    
    analyzeSubdomains(domain) {
        // Remove common prefixes
        let cleanDomain = domain.replace(/^www\./, '');
        
        // Count dots to determine subdomain levels
        const dots = (cleanDomain.match(/\./g) || []).length;
        
        if (dots === 1) {
            return { score: 0, threat: null }; // Normal domain (e.g., example.com)
        } else if (dots === 2) {
            // Could be legitimate (e.g., example.co.uk) or suspicious
            if (this.hasLegitimateCountryCode(cleanDomain)) {
                return { score: 0, threat: null };
            } else {
                return { score: 10, threat: 'Multiple subdomains detected' };
            }
        } else if (dots >= 3) {
            return { score: 20, threat: 'Many subdomains (high risk)' };
        }
        
        return { score: 0, threat: null };
    }
    
    hasLegitimateCountryCode(domain) {
        // Common legitimate country code combinations
        const legitCodes = ['.co.uk', '.co.sg', '.com.sg', '.gov.sg', '.edu.sg', '.com.au', '.co.jp'];
        return legitCodes.some(code => domain.endsWith(code));
    }
    
    checkCharacterSubstitution(domain) {
        // Advanced typosquatting detection using character substitutions
        const substitutionPatterns = {
            // Common character substitutions used in phishing
            'o': ['0', 'ø', 'ο'], // Latin o -> digit 0, Greek omicron
            'i': ['1', 'l', '!', 'í', 'ì'], 
            'l': ['1', 'i', '!', 'ĺ'],
            'a': ['@', '4', 'á', 'à', 'â'],
            'e': ['3', 'é', 'è', 'ê'],
            's': ['5', '$', 'ś', 'ş'],
            'g': ['9', 'ğ'],
            'u': ['ü', 'ú', 'ù'],
            'm': ['rn'] // 'rn' can look like 'm'
        };
        
        let suspiciousCount = 0;
        const threats = [];
        
        // Check against Singapore brands for typosquatting
        for (const brand of this.patterns.singapore_brands) {
            if (this.hasSubstitutionPattern(domain, brand, substitutionPatterns)) {
                suspiciousCount++;
                threats.push(`Possible ${brand.toUpperCase()} typosquatting`);
            }
        }
        
        // Check for common mixed scripts (Latin + Cyrillic)
        if (this.hasMixedScripts(domain)) {
            suspiciousCount++;
            threats.push('Mixed character scripts detected');
        }
        
        const score = suspiciousCount * 25; // 25 points per suspicious substitution
        const threat = threats.length > 0 ? threats.join(', ') : null;
        
        return { score, threat };
    }
    
    hasSubstitutionPattern(domain, brand, substitutionPatterns) {
        // Check if domain contains brand name with character substitutions
        console.log(`PhishGuard: Checking substitutions for domain="${domain}" brand="${brand}"`);
        for (const [original, replacements] of Object.entries(substitutionPatterns)) {
            for (const replacement of replacements) {
                const modifiedBrand = brand.replace(new RegExp(original, 'g'), replacement);
                console.log(`PhishGuard: Testing ${original}→${replacement}: "${brand}" → "${modifiedBrand}"`);
                if (domain.includes(modifiedBrand) && modifiedBrand !== brand) {
                    console.log(`PhishGuard: MATCH FOUND! ${domain} contains ${modifiedBrand}`);
                    return true;
                }
            }
        }
        return false;
    }
    
    hasMixedScripts(domain) {
        // Detect mixed Latin/Cyrillic characters (common in advanced phishing)
        const latinRegex = /[a-zA-Z]/;
        const cyrillicRegex = /[а-яё]/i; // Common Cyrillic lookalikes
        
        return latinRegex.test(domain) && cyrillicRegex.test(domain);
    }
}

window.EmailScanner = EmailScanner;