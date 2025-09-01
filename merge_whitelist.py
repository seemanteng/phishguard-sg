#!/usr/bin/env python3
import json

def merge_whitelist():
    """Merge Singapore companies domains into existing whitelist"""
    
    # Read existing whitelist
    with open('data/whitelist.json', 'r') as f:
        whitelist_data = json.load(f)
    
    # Read extracted Singapore domains
    with open('singapore_domains.json', 'r') as f:
        singapore_domains = json.load(f)
    
    # Get existing trusted domains
    existing_domains = set(whitelist_data['trusted_domains'])
    
    # Filter out invalid domains (those starting with dots, localhost, etc.)
    valid_singapore_domains = []
    for domain in singapore_domains:
        # Skip domains that start with dots or are invalid
        if (not domain.startswith('.') and 
            not domain.startswith('localhost') and
            domain != 'wixsite.com' and  # Generic hosting domain
            '.' in domain and 
            len(domain) > 3):
            valid_singapore_domains.append(domain)
    
    # Add new domains to existing ones
    new_domains = set(valid_singapore_domains) - existing_domains
    all_domains = sorted(list(existing_domains | set(valid_singapore_domains)))
    
    print(f"Existing domains: {len(existing_domains)}")
    print(f"Valid Singapore domains: {len(valid_singapore_domains)}")
    print(f"New domains to add: {len(new_domains)}")
    print(f"Total domains after merge: {len(all_domains)}")
    
    # Update whitelist data
    whitelist_data['trusted_domains'] = all_domains
    
    # Write back to whitelist.json
    with open('data/whitelist.json', 'w') as f:
        json.dump(whitelist_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSample new domains added:")
    for domain in sorted(list(new_domains))[:10]:
        print(f"  - {domain}")

if __name__ == "__main__":
    merge_whitelist()