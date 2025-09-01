#!/usr/bin/env python3
import json
import re
from urllib.parse import urlparse

def extract_domains_from_companies_file(input_file, output_file):
    """Extract unique domains from Singapore companies JSON file"""
    domains = set()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            try:
                # Parse each JSON object (one per line)
                company_data = json.loads(line.strip())
                
                # Extract website URL
                website = company_data.get('website')
                if website:
                    # Parse URL to get domain
                    parsed_url = urlparse(website)
                    domain = parsed_url.netloc.lower()
                    
                    # Clean up domain (remove www. prefix)
                    domain = re.sub(r'^www\.', '', domain)
                    
                    # Only add valid domains (must contain at least one dot)
                    if domain and '.' in domain and domain not in ['', 'null']:
                        domains.add(domain)
                        
            except (json.JSONDecodeError, AttributeError, KeyError) as e:
                print(f"Skipping line {line_num}: {e}")
                continue
    
    # Sort domains alphabetically
    sorted_domains = sorted(list(domains))
    
    # Write to output file as JSON array
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(sorted_domains, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(sorted_domains)} unique domains")
    print(f"Sample domains: {sorted_domains[:10]}")
    
    return sorted_domains

if __name__ == "__main__":
    input_file = "/Users/seemanteng/Desktop/singapore_companies.txt"
    output_file = "/Users/seemanteng/Desktop/phishguard-sg/singapore_domains.json"
    
    domains = extract_domains_from_companies_file(input_file, output_file)