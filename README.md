# <img width="128" height="128" alt="PHISHGUARD SG" src="https://github.com/user-attachments/assets/f0bcda65-8a42-4553-892b-c7d035ca18a4" /> PhishGuard SG

## Overview

**PhishGuard SG** is a Chrome extension that provides real-time protection against phishing attacks targeting Singaporeans. As cybercriminals increasingly impersonate trusted Singapore financial institutions (DBS, OCBC, UOB, POSB) and government services (SingPass, CPF, IRAS, HDB), this extension offers specialized, locally-focused defense.

### The Problem
- **Rising Phishing Attacks**: Singapore faces increasing email-based phishing targeting local banks and government services
- **Language Barriers**: Existing solutions lack multi-language support for Singapore's diverse population
- **Generic Detection**: Most tools miss sophisticated attacks specifically designed for Singapore users
- **Privacy Concerns**: Many security extensions collect user data and browsing habits

### Our Solution
PhishGuard SG stands out by offering:
- **Singapore-Specific Intelligence**: Specialized detection patterns for local institutions
- **Advanced Feature Engineering**: Sophisticated scoring system that catches subtle attacks
- **Complete Privacy**: Zero data collection - all processing happens locally on your device  
- **Multilingual Support**: Available in Singapore's four official languages
- **Non-Intrusive Design**: Clean tooltip warnings that don't disrupt browsing

## Features

- **Real-time Email Detection**: Automatically scans emails on web pages and shows warnings for suspicious addresses
- **Singapore-focused Protection**: Specialized detection for impersonation of local banks (DBS, OCBC, UOB, POSB) and government services (SingPass, CPF, IRAS, HDB)
- **Advanced Threat Detection**: Identifies suspicious patterns, risky domains, and URL-based attacks
- **Multi-language Support**: Available in English, Chinese, Malay, and Tamil
- **Non-intrusive Warnings**: Clean tooltip interface that doesn't disrupt the browsing experience

## Installation & Setup

### Prerequisites
- **Google Chrome** (version 88 or higher)
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **Permissions**: Ability to install Chrome extensions in Developer Mode

### Quick Installation

#### Option 1: From Chrome Web Store (Recommended)
*Coming soon - extension pending Chrome Web Store review*

#### Option 2: Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/phishguard-sg.git
   cd phishguard-sg
   ```

2. **Load in Chrome**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Toggle **"Developer mode"** ON (top-right corner)
   - Click **"Load unpacked"**
   - Select the `phishguard-sg` folder you downloaded
   
3. **Verify Installation**
   - Look for the PhishGuard SG icon in your browser toolbar
   - You should see a privacy consent dialog on first run
   - Accept the privacy policy to activate protection

4. **Test the Extension**
   - Open the included `email-test-page.html` file in your browser
   - Hover over the test email addresses to verify detection is working
   - You should see colored tooltips indicating threat levels

### Configuration
- **Language Settings**: Extension automatically detects your browser language (English, Chinese, Malay, Tamil)
- **Privacy Controls**: Access settings via the extension icon popup menu
- **Whitelist Management**: Add trusted domains through the settings panel

### Troubleshooting
- **Extension not loading**: Ensure Developer mode is enabled in Chrome
- **No tooltips appearing**: Check that you've accepted the privacy consent
- **Wrong language**: Clear browser data and reinstall to reset language detection

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

PhishGuard SG uses feature engineering to enhance phishing detection accuracy beyond simple pattern matching to come up with a "security score" (the lower the better):

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

This approach enables detection of **advanced phishing techniques** that would bypass simple keyword filters, including character substitution attacks (like typosquatting "db5.com" instead of "dbs.com") and complex multi-subdomain impersonation attempts.

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
├── manifest.json              
├── background.js              
├── content.js               
├── utils/
│   ├── email-scanner.js     
│   └── threat-detector.js     
├── popup/
│   ├── popup.html            
│   └── popup.js             
├── data/
│   ├── threat-patterns.json   
│   └── whitelist.json         
├── privacy/                   
│   ├── consent.html         
│   ├── consent.css           
│   └── consent.js          
├── assets/                    
│   ├── styles/               
│   └── icons/                
├── _locales/                 
├── singapore_domains.json     
├── email-test-page.html       
├── PRIVACY_POLICY.md          
└── TERMS_OF_SERVICE.md       
```

## Development

### Core Components

- **content.js**: Main detection engine that scans pages and manages tooltips
- **utils/email-scanner.js**: Email extraction and analysis logic
- **utils/threat-detector.js**: Threat classification algorithms
- **background.js**: Handles extension lifecycle and storage

### Testing

Use the included test page to verify detection functionality:
- Open `email-test-page.html` in your browser with the extension loaded
- Hover over different email addresses to see threat detection in action
- Verify that legitimate emails show as safe and suspicious ones trigger warnings

### Adding New Threat Patterns

1. Edit `data/threat-patterns.json` to add new detection rules
2. Update `utils/threat-detector.js` for new analysis logic
3. Test using `email-test-page.html`

### Localization

PhishGuard SG supports Singapore's four official languages:

- **English** (en) - Default
- **Chinese Simplified** (zh) - 中文
- **Malay** (ms) - Bahasa Melayu  
- **Tamil** (ta) - தமிழ்

#### Implementation
- Main extension interface: Multi-language popup and settings
- Privacy policy: Fully translated consent interface with language selector
- Automatic language detection: Uses browser/system language preferences
- Language persistence: User selection saved across sessions

Add new languages by creating files in the `_locales/` directory following the existing structure.

## Privacy & Security

### Privacy-First Design

PhishGuard SG is built with **privacy by design** principles:

- **Zero Data Collection**: No personal information, emails, or browsing data is collected
- **Local Processing Only**: All threat detection happens on your device
- **No External Servers**: No data transmitted to third parties or analytics services  
- **Open Source Transparency**: Full code available for security audits
- **Minimal Permissions**: Only requests necessary Chrome permissions

### Comprehensive Privacy Documentation

#### Privacy Policy & Legal Compliance
- **[Privacy Policy](PRIVACY_POLICY.md)**: GDPR and Singapore PDPA compliant policy
- **[Terms of Service](TERMS_OF_SERVICE.md)**: Legal framework and user rights
- **Regulatory Compliance**: Meets Chrome Web Store privacy requirements

#### User Consent & Control System
- **First-Run Consent Dialog**: Professional multilingual onboarding with clear privacy explanation
- **Multilingual Privacy Policy**: Available in English, Chinese, Malay, and Tamil
- **Granular Controls**: Users can disable notifications, scanning, or entire extension
- **Consent Enforcement**: Extension functionality disabled if user declines
- **Language Preferences**: Privacy interface adapts to user's preferred language
- **Privacy Settings**: Easy access to privacy controls via popup menu

#### Technical Security Measures
```
privacy/
├── consent.html          
├── consent.css            
├── consent.js            
├── PRIVACY_POLICY.md     
└── TERMS_OF_SERVICE.md   
```

### Security Implementation

#### Background Script Security
- **Consent Checking**: All threat detection gated by user consent
- **Extension Disable**: Complete functionality shutdown on user decline
- **Secure Storage**: User preferences stored locally using Chrome's secure APIs
- **First-Run Detection**: Automatic privacy dialog on installation

#### Content Script Protection  
- **Whitelist Integration**: Email scanner checks trusted domains before analysis
- **Local Whitelisting**: Verified Singapore institutions bypass suspicious keyword detection
- **Async Processing**: Non-blocking email analysis with proper error handling
- **Safe Defaults**: Extension fails safely if data loading fails

#### Manifest Security
- **Minimal Permissions**: Only essential permissions requested
- **Web Accessible Resources**: Privacy documents accessible via secure Chrome APIs
- **Content Security Policy**: Implicit CSP protection via Manifest V3

### Privacy Features

| Feature | Implementation | User Benefit |
|---------|---------------|--------------|
| **No Tracking** | No analytics, metrics, or usage collection | Complete privacy |
| **Local Storage** | Settings stored in browser only | Data never leaves device |
| **Consent Management** | Full opt-out with extension disable | User control |
| **Multilingual Support** | Privacy policy in 4 languages | Accessible to all Singapore residents |
| **Open Source** | Public code repository | Transparent security |
| **Regular Updates** | Security patches via Chrome Web Store | Maintained protection |

### Compliance Status

- ✅ **Singapore PDPA**: Compliant (no personal data processed)
- ✅ **EU GDPR**: Compliant with comprehensive privacy policy  
- ✅ **Chrome Web Store**: Meets all privacy and security requirements
- ✅ **Security Audit**: Open source code available for review
- ✅ **User Rights**: Complete control and opt-out mechanisms

## Data Sources

This extension leverages several data sources for threat detection:

- **Phishing Patterns**: Based on research from phishing URL analysis and modeling techniques
- **Singapore Business Directory**: Curated list of legitimate Singapore company domains for whitelist validation
- **Threat Intelligence**: Community-sourced patterns for identifying suspicious email characteristics

## Disclaimer

PhishGuard SG is a security tool designed to help identify potential phishing attempts. While it uses advanced detection methods, no security tool is 100% effective. Users should always exercise caution and verify the authenticity of emails through official channels.
