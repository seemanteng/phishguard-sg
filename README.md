# PhishGuard SG 🛡️

A Chrome extension designed to protect Singaporeans from phishing websites and email impersonation attacks, with specialized detection for Singapore financial institutions and government services.

## Features

- **Real-time Email Detection**: Automatically scans emails on web pages and shows warnings for suspicious addresses
- **Singapore-focused Protection**: Specialized detection for impersonation of local banks (DBS, OCBC, UOB, POSB) and government services (SingPass, CPF, IRAS, HDB)
- **Advanced Threat Detection**: Identifies suspicious patterns, risky domains, and URL-based attacks
- **Multi-language Support**: Available in English, Chinese, and Malay
- **Non-intrusive Warnings**: Clean tooltip interface that doesn't disrupt the browsing experience

## Installation

### From Source
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project folder
5. The extension icon should appear in your browser toolbar

## How It Works

PhishGuard SG runs automatically in the background and:

1. **Scans web pages** for email addresses as you browse
2. **Analyzes emails** using multiple detection methods:
   - Singapore bank impersonation detection
   - Government service impersonation
   - Suspicious keyword patterns
   - Risky domain analysis
   - URL-based threat detection
3. **Shows warnings** via hover tooltips when suspicious emails are detected

## Feature Engineering Approach

PhishGuard SG uses sophisticated **feature engineering** to enhance phishing detection accuracy beyond simple pattern matching:

### Advanced URL Analysis Features
- **IP Address Detection**: Identifies emails using raw IP addresses instead of domain names (50 risk points)
- **Domain Length Analysis**: Flags unusually long domains commonly used in phishing (15-25 points based on length)
- **Subdomain Analysis**: Evaluates multiple subdomain levels as risk indicators (10-20 points)
- **Character Substitution Detection**: Advanced typosquatting detection using character replacements (25 points per substitution)

### Behavioral Pattern Features  
- **HTTPS Token Detection**: Identifies domains containing "https", "ssl", or "secure" keywords (30 points)
- **Suspicious Dash Patterns**: Detects phishing-style domain constructions like "paypal-secure.com" (20 points)
- **Mixed Script Detection**: Identifies domains mixing Latin and Cyrillic characters for visual deception
- **URL Shortener Detection**: Flags known URL shortening services (25 points)

### Contextual Scoring System
Rather than binary classification, the feature engineering approach uses **weighted scoring** where:
- Each suspicious feature contributes points to an overall risk score
- Multiple weak signals combine to identify sophisticated attacks
- Dynamic thresholds classify emails as safe (0-4), low (5-14), medium (15-49), or high risk (50+)

This approach enables detection of **advanced phishing techniques** that would bypass simple keyword filters, including character substitution attacks (like "db5.com" instead of "dbs.com") and complex multi-subdomain impersonation attempts.

## Detection Categories

### 🚨 High Risk (Red Alert)
- Singapore bank names on free email providers (gmail.com, yahoo.com, etc.)
- Government service impersonation
- Suspicious TLD domains (.tk, .ml, .ga, .cf, etc.)
- IP address-based emails
- Character substitution attacks (e.g., "db5.com" instead of "dbs.com")

### ⚠️ Medium Risk (Orange Warning)
- Suspicious keywords (verify, urgent, suspend, security-alert, etc.)
- URL-based suspicious patterns
- Banking-related terms in domains

### ✅ Low Risk (Green/Safe)
- Legitimate domains
- Whitelisted email addresses
- No suspicious patterns detected

## File Structure

```
phishguard-sg/
├── manifest.json              # Extension configuration
├── background.js              # Service worker for background processes
├── content.js                 # Main content script injected into pages
├── utils/
│   ├── email-scanner.js       # Core email detection logic
│   └── threat-detector.js     # Threat analysis algorithms
├── popup/
│   ├── popup.html            # Extension popup interface
│   └── popup.js              # Popup functionality
├── data/
│   ├── threat-patterns.json  # Threat detection patterns
│   └── whitelist.json        # Safe domain whitelist
├── assets/
│   ├── styles/warning.css    # Styling for warnings
│   └── icons/                # Extension icons
├── _locales/                 # Internationalization files
├── singapore_domains.json   # Singapore domain database
├── email-test-page.html     # Testing interface
└── test-emails.html         # Additional test cases
```

## Testing

The extension includes comprehensive testing tools:

- **email-test-page.html**: Interactive test page with various email scenarios
- **test-emails.html**: Additional test cases
- Open these files in your browser with the extension installed to verify functionality

## Development

### Core Components

- **content.js**: Main detection engine that scans pages and manages tooltips
- **utils/email-scanner.js**: Email extraction and analysis logic
- **utils/threat-detector.js**: Threat classification algorithms
- **background.js**: Handles extension lifecycle and storage

### Adding New Threat Patterns

1. Edit `data/threat-patterns.json` to add new detection rules
2. Update `utils/threat-detector.js` for new analysis logic
3. Test using the provided HTML test files

### Localization

Add new languages by creating files in the `_locales/` directory following the existing structure.

## Privacy

PhishGuard SG:
- ✅ Processes emails locally in your browser
- ✅ Does not send data to external servers
- ✅ Only accesses web page content to scan for emails
- ✅ Stores minimal settings locally

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the included test files
5. Submit a pull request

## License

This project is for educational and security research purposes.

## Disclaimer

PhishGuard SG is a security tool designed to help identify potential phishing attempts. While it uses advanced detection methods, no security tool is 100% effective. Users should always exercise caution and verify the authenticity of emails through official channels.