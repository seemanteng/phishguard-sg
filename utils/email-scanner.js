// Simple Email Scanner - Original Clean Logic
class EmailScanner {
    constructor() {
        this.patterns = {
            suspicious_keywords: ['secure', 'verify', 'urgent', 'update', 'suspend', 'alert', 'warning', 'expired'],
            risky_tlds: ['.tk', '.ml', '.ga', '.cf', '.top', '.click', '.pw', '.cc'],
            singapore_brands: ['dbs', 'ocbc', 'uob', 'posb', 'singpass', 'cpf', 'iras', 'hdb'],
            free_providers: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.com']
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
                threats.push(`Suspicious keyword: ${keyword}`);
            }
        }

        // Check for Singapore brand impersonation
        for (const brand of this.patterns.singapore_brands) {
            if (domain.includes(brand) && !this.isLegitimate(domain, brand)) {
                score += 50;
                threats.push(`Possible ${brand.toUpperCase()} impersonation`);
            }
        }

        // Check for risky TLDs
        for (const tld of this.patterns.risky_tlds) {
            if (domain.endsWith(tld)) {
                score += 30;
                threats.push(`Risky domain extension: ${tld}`);
            }
        }

        // Check for brand on free provider (red flag)
        const hasBrand = this.patterns.singapore_brands.some(brand => localPart.includes(brand));
        const isFreeProvider = this.patterns.free_providers.includes(domain);
        if (hasBrand && isFreeProvider) {
            score += 40;
            threats.push('Singapore brand on free email provider');
        }

        const result = {
            email: email,
            riskLevel: this.getRiskLevel(score),
            threats: threats,
            reasoning: threats.length > 0 ? threats.join(', ') : 'No suspicious patterns detected'
        };

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
        if (score >= 60) return 'high';
        if (score >= 30) return 'medium';
        if (score >= 10) return 'low';
        return 'safe';
    }
}

window.EmailScanner = EmailScanner;