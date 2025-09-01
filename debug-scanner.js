// Debug the exact scanner logic to see what's happening

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

        console.log(`\n=== Analyzing: ${email} ===`);
        console.log(`LocalPart: "${localPart}", Domain: "${domain}"`);

        // Check for suspicious keywords in domain
        for (const keyword of this.patterns.suspicious_keywords) {
            if (domain.includes(keyword)) {
                score += 25;
                threats.push(`Suspicious keyword in domain: ${keyword}`);
                console.log(`✓ Found suspicious keyword in domain: ${keyword} (+25 points)`);
            }
        }
        
        // Check for suspicious keywords in local part
        for (const keyword of this.patterns.suspicious_keywords) {
            if (localPart.includes(keyword)) {
                score += 20;
                threats.push(`Suspicious keyword in email: ${keyword}`);
                console.log(`✓ Found suspicious keyword in email: ${keyword} (+20 points)`);
            }
        }

        // Check for Singapore brand impersonation in domain
        for (const brand of this.patterns.singapore_brands) {
            if (domain.includes(brand) && !this.isLegitimate(domain, brand)) {
                score += 50;
                threats.push(`Possible ${brand.toUpperCase()} impersonation in domain`);
                console.log(`✓ Found ${brand} brand in domain (+50 points)`);
            }
        }
        
        // Check for Singapore brand in local part on free providers (major red flag)
        for (const brand of this.patterns.singapore_brands) {
            if (localPart.includes(brand) && this.patterns.free_providers.includes(domain)) {
                score += 60;
                threats.push(`${brand.toUpperCase()} brand impersonation on free email`);
                console.log(`✓ Found ${brand} brand in email on free provider (+60 points)`);
            }
        }
        
        // Check for Singapore brand in local part on risky domains (also major red flag)
        for (const brand of this.patterns.singapore_brands) {
            if (localPart.includes(brand)) {
                for (const tld of this.patterns.risky_tlds) {
                    if (domain.endsWith(tld)) {
                        score += 40; // Additional score for brand + risky TLD combo
                        threats.push(`${brand.toUpperCase()} brand on suspicious domain`);
                        console.log(`✓ Found ${brand} brand on risky domain ${tld} (+40 points)`);
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
                console.log(`✓ Found risky TLD: ${tld} (+30 points)`);
            }
        }

        const result = {
            email: email,
            riskLevel: this.getRiskLevel(score),
            threatScore: score,
            threats: threats,
            reasoning: threats.length > 0 ? threats.join(', ') : 'No suspicious patterns detected'
        };

        console.log(`Final score: ${score}, Risk level: ${result.riskLevel}`);
        console.log(`Threats: ${threats.join(' | ')}`);
        
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
        if (score >= 60) return 'high';    // Red alert for impersonation/risky combos
        if (score >= 20) return 'medium';  // Orange warning for suspicious keywords/risky domains
        if (score >= 5) return 'low';      // Light warning for minor concerns
        return 'safe';                     // Green for clean emails
    }
}

const scanner = new EmailScanner();

console.log('=== DEBUG: Testing problematic emails ===');

// Test the emails that should be RED but showing YELLOW
const testEmails = [
    'verify-dbs@gmail.com',
    'ocbc-secure@hotmail.com', 
    'uob-alert@yahoo.com',
    'dbs-urgent@suspicious.tk',
    'admin@evil.tk',
    'support@company.com'
];

testEmails.forEach(email => {
    scanner.scanEmail(email);
});