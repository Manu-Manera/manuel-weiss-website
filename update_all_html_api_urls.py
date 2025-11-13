#!/usr/bin/env python3
"""
Comprehensive script to update API Gateway URL in ALL HTML files.
This script:
1. Finds all HTML files (excluding build directories)
2. Checks if they have AWS_CONFIG
3. Adds or updates apiBaseUrl consistently
4. Creates a backup before making changes
"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path

# Configuration
API_URL = "https://YOUR-API-ID.execute-api.eu-central-1.amazonaws.com/prod"
CREATE_BACKUP = True
BACKUP_DIR = f"./backup-html-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

# Directories to exclude
EXCLUDE_DIRS = {
    'build', 'node_modules', '.git', 'cdk.out', '.next', 'dist', 
    '.cache', '__pycache__', '.venv', 'venv', 'env'
}

# Standard AWS_CONFIG structure
AWS_CONFIG_TEMPLATE = """    <!-- AWS Configuration -->
    <script>
        window.AWS_CONFIG = {{
            region: 'eu-central-1',
            userPoolId: 'eu-central-1_8gP4gLK9r',
            clientId: '7kc5tt6a23fgh53d60vkefm812',
            apiBaseUrl: '{api_url}',
            dynamoDB: {{
                tableName: 'mawps-user-profiles',
                region: 'eu-central-1'
            }}
        }};
    </script>"""

def should_exclude_file(filepath):
    """Check if file should be excluded."""
    parts = Path(filepath).parts
    return any(part in EXCLUDE_DIRS for part in parts)

def find_html_files(root_dir='.'):
    """Find all HTML files, excluding build directories."""
    html_files = []
    for root, dirs, files in os.walk(root_dir):
        # Remove excluded directories from dirs list to prevent walking into them
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                if not should_exclude_file(filepath):
                    html_files.append(filepath)
    
    return sorted(html_files)

def analyze_file(filepath):
    """Analyze a file to determine its current state."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e), 'has_aws_config': False, 'has_api_base_url': False, 'uses_auth': False}
    
    has_aws_config = bool(re.search(r'window\.AWS_CONFIG|AWS_CONFIG\s*=', content))
    has_api_base_url = bool(re.search(r'apiBaseUrl', content))
    uses_auth = bool(re.search(r'real-user-auth-system|working-auth-system|auth\.js', content))
    
    return {
        'content': content,
        'has_aws_config': has_aws_config,
        'has_api_base_url': has_api_base_url,
        'uses_auth': uses_auth
    }

def update_api_base_url(content, api_url):
    """Update or add apiBaseUrl in AWS_CONFIG."""
    # Pattern to find AWS_CONFIG block
    aws_config_pattern = r'(window\.AWS_CONFIG\s*=\s*\{[^}]*?)(region:\s*[\'"]eu-central-1[\'"])'
    
    def replace_config(match):
        config_start = match.group(1)
        region_line = match.group(2)
        
        # Check if apiBaseUrl already exists
        if 'apiBaseUrl' in match.group(0):
            # Update existing apiBaseUrl
            updated = re.sub(
                r"apiBaseUrl:\s*['\"][^'\"]*['\"]",
                f"apiBaseUrl: '{api_url}'",
                match.group(0)
            )
            return updated
        else:
            # Add apiBaseUrl after region
            return f"{config_start}{region_line},\n            apiBaseUrl: '{api_url}',\n            dynamoDB: {{\n                tableName: 'mawps-user-profiles',\n                region: 'eu-central-1'\n            }}"
    
    # Try to update existing AWS_CONFIG
    if re.search(aws_config_pattern, content, re.DOTALL):
        content = re.sub(aws_config_pattern, replace_config, content, flags=re.DOTALL)
    
    # Also update any standalone apiBaseUrl lines
    content = re.sub(
        r"apiBaseUrl:\s*['\"][^'\"]*['\"]",
        f"apiBaseUrl: '{api_url}'",
        content
    )
    
    return content

def add_aws_config(content, api_url):
    """Add AWS_CONFIG before auth script."""
    # Find the script tag with auth system
    auth_pattern = r'(<script[^>]*src=["\'][^"\']*(?:real-user-auth-system|working-auth-system)[^"\']*["\'][^>]*>)'
    
    match = re.search(auth_pattern, content)
    if match:
        # Insert AWS_CONFIG before the auth script
        insert_pos = match.start()
        aws_config = AWS_CONFIG_TEMPLATE.format(api_url=api_url)
        content = content[:insert_pos] + aws_config + '\n    ' + content[insert_pos:]
        return content, True
    
    return content, False

def backup_file(filepath, backup_dir):
    """Create backup of a file."""
    try:
        backup_path = os.path.join(backup_dir, filepath)
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        shutil.copy2(filepath, backup_path)
        return True
    except Exception as e:
        print(f"  ⚠️  Warning: Could not backup {filepath}: {e}")
        return False

def main():
    """Main function."""
    print("=" * 60)
    print("  HTML API Gateway URL Update Script")
    print("=" * 60)
    print()
    print(f"📋 Configuration:")
    print(f"   API URL: {API_URL}")
    print(f"   Backup: {CREATE_BACKUP}")
    print()
    
    # Check if API URL is still placeholder
    if "YOUR-API-ID" in API_URL:
        print("⚠️  WARNING: API URL contains placeholder 'YOUR-API-ID'")
        print("   Please update API_URL in this script before running!")
        print()
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            return
    
    # Create backup directory
    if CREATE_BACKUP:
        print(f"📦 Creating backup directory: {BACKUP_DIR}")
        os.makedirs(BACKUP_DIR, exist_ok=True)
    
    # Find all HTML files
    print("🔍 Finding all HTML files...")
    html_files = find_html_files()
    total_files = len(html_files)
    print(f"✅ Found {total_files} HTML files")
    print()
    
    # Statistics
    stats = {
        'with_aws_config': 0,
        'updated': 0,
        'added_config': 0,
        'skipped': 0,
        'errors': 0
    }
    
    # Process each file
    print("🔄 Processing files...")
    print()
    
    for filepath in html_files:
        try:
            # Analyze file
            analysis = analyze_file(filepath)
            
            if 'error' in analysis:
                print(f"  ❌ Error analyzing {filepath}: {analysis['error']}")
                stats['errors'] += 1
                continue
            
            # Create backup
            if CREATE_BACKUP:
                backup_file(filepath, BACKUP_DIR)
            
            # Process based on state
            if analysis['has_aws_config']:
                stats['with_aws_config'] += 1
                
                # Read file content
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Update content
                updated_content = update_api_base_url(content, API_URL)
                
                # Write back if changed
                if updated_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"  ✅ Updated: {filepath}")
                    stats['updated'] += 1
                else:
                    print(f"  ℹ️  Already up to date: {filepath}")
            
            elif analysis['uses_auth']:
                # Read file content
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Add AWS_CONFIG
                updated_content, added = add_aws_config(content, API_URL)
                
                if added:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                    print(f"  ✅ Added AWS_CONFIG to: {filepath}")
                    stats['added_config'] += 1
                else:
                    print(f"  ⚠️  Could not add AWS_CONFIG to: {filepath}")
                    stats['skipped'] += 1
            else:
                stats['skipped'] += 1
        
        except Exception as e:
            print(f"  ❌ Error processing {filepath}: {e}")
            stats['errors'] += 1
    
    # Print summary
    print()
    print("=" * 60)
    print("  Summary")
    print("=" * 60)
    print(f"  Total files processed: {total_files}")
    print(f"  Files with AWS_CONFIG: {stats['with_aws_config']}")
    print(f"  ✅ Files updated: {stats['updated']}")
    print(f"  ✅ Files added config: {stats['added_config']}")
    print(f"  Files skipped: {stats['skipped']}")
    print(f"  Errors: {stats['errors']}")
    if CREATE_BACKUP:
        print(f"  📦 Backup location: {BACKUP_DIR}")
    print()
    
    if stats['updated'] > 0 or stats['added_config'] > 0:
        print("✅ Update completed successfully!")
    else:
        print("⚠️  No files were updated")
    
    print()
    print("⚠️  Remember: Replace YOUR-API-ID with your actual API Gateway ID")
    print("   Then run this script again to apply the real URL.")
    print()

if __name__ == '__main__':
    main()

