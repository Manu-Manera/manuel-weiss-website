#!/usr/bin/env python3
import re

# Read admin.html
with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Read new applications section
with open('applications-section.html', 'r', encoding='utf-8') as f:
    new_section = f.read()

# Find the start and end of the applications section
start_pattern = r'(\s*)<!-- Applications Section -->'
end_pattern = r'</section>\s*\n\s*<!-- AI Twin Section -->'

# Find the match
start_match = re.search(start_pattern, content)
end_match = re.search(end_pattern, content)

if start_match and end_match:
    # Get the indentation from the original
    indent = start_match.group(1)
    
    # Replace the section
    before = content[:start_match.start()]
    after = content[end_match.start():]
    
    # Add proper indentation to new section
    indented_new_section = '\n'.join(indent + line if line.strip() else line 
                                     for line in new_section.splitlines())
    
    # Combine
    new_content = before + indented_new_section + '\n\n' + indent + after
    
    # Write back
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Applications section replaced successfully!")
else:
    print("Could not find the applications section boundaries")
    if not start_match:
        print("Start pattern not found")
    if not end_match:
        print("End pattern not found")
