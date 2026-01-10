#!/usr/bin/env python3
"""
Konvertiert Method-Cards zu Service-Card-Struktur
"""

import re
import sys

def extract_method_data(html_block):
    """Extrahiert Daten aus einer Method-Card"""
    data = {
        'onclick': '',
        'category': '',
        'icon_class': '',
        'icon': '',
        'title': '',
        'description': '',
        'tags': [],
        'stats': []
    }
    
    # Onclick und Category
    onclick_match = re.search(r'onclick="([^"]+)"', html_block)
    if onclick_match:
        data['onclick'] = onclick_match.group(1)
    
    category_match = re.search(r'data-category="([^"]+)"', html_block)
    if category_match:
        data['category'] = category_match.group(1)
    
    # Icon
    icon_match = re.search(r'class="method-icon\s+(\w+)"', html_block)
    if icon_match:
        data['icon_class'] = icon_match.group(1)
    
    icon_fa_match = re.search(r'<i class="([^"]+)"', html_block)
    if icon_fa_match:
        data['icon'] = icon_fa_match.group(1)
    
    # Title
    title_match = re.search(r'<h3[^>]*>([^<]+)</h3>', html_block)
    if title_match:
        data['title'] = title_match.group(1).strip()
    
    # Description
    desc_match = re.search(r'<p[^>]*>([^<]+)</p>', html_block)
    if desc_match:
        data['description'] = desc_match.group(1).strip()
    
    # Tags
    tags = re.findall(r'<span class="method-tag">([^<]+)</span>', html_block)
    data['tags'] = tags
    
    # Stats
    stat_numbers = re.findall(r'<div class="stat-number">([^<]+)</div>', html_block)
    stat_labels = re.findall(r'<div class="stat-label">([^<]+)</div>', html_block)
    for num, label in zip(stat_numbers, stat_labels):
        data['stats'].append((num.strip(), label.strip()))
    
    return data

def generate_service_card(data):
    """Generiert Service-Card HTML"""
    onclick_attr = f'onclick="{data["onclick"]}"' if data['onclick'] else ''
    category_attr = f'data-category="{data["category"]}"' if data['category'] else ''
    
    # Features aus Tags und Stats generieren
    features = []
    if data['stats']:
        for num, label in data['stats']:
            features.append(f"{num} {label}")
    if data['tags']:
        features.extend(data['tags'][:2])  # Max 2 Tags
    
    features_html = '\n                        '.join([f'<li>{f}</li>' for f in features[:4]])
    
    return f'''                <div class="method-card" {onclick_attr} {category_attr}>
                    <div class="service-icon">
                        <i class="{data['icon']}"></i>
                    </div>
                    <h3>{data['title']}</h3>
                    <p>{data['description']}</p>
                    <ul class="service-features">
                        {features_html}
                    </ul>
                    <div class="service-cta">
                        <span class="cta-text">Jetzt starten</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>'''

# Hauptlogik
if __name__ == '__main__':
    input_file = 'persoenlichkeitsentwicklung-uebersicht.html'
    output_file = 'persoenlichkeitsentwicklung-uebersicht.html.new'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Finde alle Method-Cards
    pattern = r'(<div class="method-card"[^>]*>.*?</div>\s*</div>)'
    matches = re.finditer(pattern, content, re.DOTALL)
    
    replacements = []
    for match in matches:
        old_html = match.group(1)
        data = extract_method_data(old_html)
        new_html = generate_service_card(data)
        replacements.append((old_html, new_html))
    
    # Ersetze rückwärts, um Positionen nicht zu verschieben
    for old, new in reversed(replacements):
        content = content.replace(old, new, 1)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {len(replacements)} Method-Cards konvertiert")
    print(f"📄 Neue Datei: {output_file}")
