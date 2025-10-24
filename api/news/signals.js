/**
 * NewsAPI.org Signals - Echte Finanz-Nachrichten
 * Basierend auf: https://newsapi.org/
 */

require('dotenv').config();

async function fetchNewsSignals() {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        
        if (!apiKey) {
            throw new Error('NEWS_API_KEY nicht gesetzt');
        }
        
        // Investment-relevante Suchbegriffe
        const searchTerms = [
            'investment',
            'stock market',
            'tesla',
            'apple',
            'microsoft',
            'google',
            'amazon',
            'bitcoin',
            'cryptocurrency',
            'earnings',
            'dividend',
            'portfolio',
            'trading',
            'bull market',
            'bear market'
        ];
        
        const signals = [];
        
        // Für jeden Suchbegriff News sammeln
        for (const term of searchTerms.slice(0, 5)) { // Limit auf 5 Begriffe
            try {
                const response = await fetch(
                    `https://newsapi.org/v2/everything?q=${encodeURIComponent(term)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
                );
                
                const data = await response.json();
                
                if (response.ok && data.articles) {
                    data.articles.forEach(article => {
                        signals.push({
                            id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            source: 'newsapi',
                            search_term: term,
                            title: article.title,
                            content: article.description,
                            url: article.url,
                            source_name: article.source.name,
                            published_at: article.publishedAt,
                            author: article.author,
                            url_to_image: article.urlToImage,
                            timestamp: new Date().toISOString(),
                            sentiment: null, // Wird später von AI analysiert
                            relevance_score: calculateRelevanceScore(article.title, article.description, term),
                            keywords: extractKeywords(article.title + ' ' + article.description),
                            category: categorizeNews(article.title, article.description)
                        });
                    });
                }
                
                // Rate limiting - warte zwischen Requests
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error fetching news for term "${term}":`, error.message);
            }
        }
        
        // Nach Relevanz und Datum sortieren
        signals.sort((a, b) => {
            if (b.relevance_score !== a.relevance_score) {
                return b.relevance_score - a.relevance_score;
            }
            return new Date(b.published_at) - new Date(a.published_at);
        });
        
        return {
            success: true,
            signals: signals.slice(0, 50), // Top 50 Signale
            total: signals.length,
            timestamp: new Date().toISOString(),
            sources: [...new Set(signals.map(s => s.source_name))],
            search_terms: searchTerms.slice(0, 5)
        };
        
    } catch (error) {
        console.error('NewsAPI Error:', error.message);
        return {
            success: false,
            error: error.message,
            signals: [],
            total: 0,
            timestamp: new Date().toISOString()
        };
    }
}

function calculateRelevanceScore(title, description, searchTerm) {
    if (!title || !description) return 0;
    
    const text = (title + ' ' + description).toLowerCase();
    const term = searchTerm.toLowerCase();
    
    let score = 0;
    
    // Titel-Gewichtung (höher)
    if (title.toLowerCase().includes(term)) score += 3;
    
    // Beschreibung-Gewichtung
    if (description.toLowerCase().includes(term)) score += 1;
    
    // Investment-Keywords
    const investmentKeywords = [
        'stock', 'investment', 'earnings', 'revenue', 'profit', 'dividend',
        'portfolio', 'trading', 'market', 'bull', 'bear', 'crash', 'rally'
    ];
    
    investmentKeywords.forEach(keyword => {
        if (text.includes(keyword)) score += 0.5;
    });
    
    return Math.min(score, 10); // Max Score: 10
}

function extractKeywords(text) {
    if (!text) return [];
    
    const investmentKeywords = [
        'stock', 'stocks', 'investment', 'invest', 'portfolio', 'dividend', 'earnings',
        'revenue', 'profit', 'loss', 'market', 'trading', 'buy', 'sell', 'hold',
        'bull', 'bear', 'crash', 'rally', 'volatility', 'risk', 'return',
        'tesla', 'apple', 'microsoft', 'google', 'amazon', 'meta', 'nvidia',
        'bitcoin', 'crypto', 'cryptocurrency', 'etf', 'fund', 'bond', 'treasury',
        'earnings', 'quarterly', 'revenue', 'growth', 'decline', 'surge'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => investmentKeywords.includes(word));
}

function categorizeNews(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('earnings') || text.includes('quarterly') || text.includes('revenue')) {
        return 'earnings';
    } else if (text.includes('stock') || text.includes('shares') || text.includes('trading')) {
        return 'stocks';
    } else if (text.includes('crypto') || text.includes('bitcoin') || text.includes('blockchain')) {
        return 'crypto';
    } else if (text.includes('dividend') || text.includes('yield')) {
        return 'dividends';
    } else if (text.includes('merger') || text.includes('acquisition') || text.includes('deal')) {
        return 'mergers';
    } else {
        return 'general';
    }
}

module.exports = {
    fetchNewsSignals
};
