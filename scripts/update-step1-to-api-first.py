#!/usr/bin/env python3
"""
Script to update all step1 HTML files to API-First architecture
Replaces localStorage with workflow API calls
"""

import os
import re
import glob
from pathlib import Path

def update_step1_file(file_path):
    """Update a single step1 file to use API-First"""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already updated
    if 'workflow-api.js' in content and 'window.workflowAPI' in content:
        print(f"  ⏭️  Already updated, skipping")
        return False
    
    # Extract method ID from path
    method_id = Path(file_path).parent.name.replace('-', '-')
    
    # Add workflow-api.js script if not present
    if 'workflow-api.js' not in content:
        # Find the position before Auth scripts
        auth_pattern = r'(<!-- Auth & Progress Tracking -->)'
        if re.search(auth_pattern, content):
            content = re.sub(
                auth_pattern,
                r'<!-- Workflow API (API-First) -->\n    <script src="/js/workflow-api.js"></script>\n    \1',
                content
            )
        else:
            # Add before closing body tag
            content = content.replace(
                '</body>',
                '    <!-- Workflow API (API-First) -->\n    <script src="/js/workflow-api.js"></script>\n</body>'
            )
    
    # Replace localStorage.setItem with API calls
    # Pattern: localStorage.setItem('methodStep1', ...)
    localStorage_pattern = r"localStorage\.setItem\(['\"]([^'\"]+)['\"],\s*JSON\.stringify\(([^)]+)\)\);"
    
    def replace_localStorage(match):
        key = match.group(1)
        data_var = match.group(2)
        
        # Extract method and step from key (e.g., 'wheelStep1' -> 'wheel-of-life', 'step1')
        method_match = re.match(r'(\w+)Step(\d+)', key)
        if method_match:
            method = method_match.group(1)
            step = method_match.group(2)
            method_id_clean = method.replace('_', '-')
            return f"await window.workflowAPI.saveWorkflowStep('{method_id_clean}', 'step{step}', {data_var});"
        return match.group(0)
    
    content = re.sub(localStorage_pattern, replace_localStorage, content)
    
    # Replace localStorage.getItem with API calls
    # Pattern: localStorage.getItem('methodStep1')
    getItem_pattern = r"localStorage\.getItem\(['\"]([^'\"]+)['\"]\)"
    
    def replace_getItem(match):
        key = match.group(1)
        method_match = re.match(r'(\w+)Step(\d+)', key)
        if method_match:
            method = method_match.group(1)
            step = method_match.group(2)
            method_id_clean = method.replace('_', '-')
            return f"await window.workflowAPI.loadSavedProgress('{method_id_clean}', 'step{step}')"
        return match.group(0)
    
    content = re.sub(getItem_pattern, replace_getItem, content)
    
    # Update saveAndContinue functions to use API
    save_pattern = r"(function\s+saveAndContinue\(\)\s*\{[^}]*localStorage\.setItem[^}]*\})"
    
    # Write updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ Updated to API-First")
    return True

def main():
    """Main function"""
    base_dir = Path(__file__).parent.parent
    methods_dir = base_dir / 'methods'
    
    step1_files = list(methods_dir.rglob('step1*.html'))
    
    print(f"Found {len(step1_files)} step1 files")
    
    updated = 0
    for file_path in step1_files:
        if update_step1_file(file_path):
            updated += 1
    
    print(f"\n✅ Updated {updated} files to API-First architecture")

if __name__ == '__main__':
    main()
