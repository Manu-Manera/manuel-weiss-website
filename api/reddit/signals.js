/**
 * Reddit API Signals - OAuth2 Application Only
 * Basierend auf: https://github.com/reddit/reddit/wiki/OAuth2
 */

require('dotenv').config();

async function fetchRedditSignals() {
    try {
        // Reddit OAuth2 Application Only Auth
        const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(
                    process.env.REDDIT_CLIENT_ID + ':' + process.env.REDDIT_CLIENT_SECRET
                ).toString('base64'),
                'User-Agent': 'AI Investment System v1.0'
            },
            body: 'grant_type=client_credentials'
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
            throw new Error(`Reddit OAuth2 Error: ${tokenData.error} - ${tokenData.message}`);
        }
        
        const accessToken = tokenData.access_token;
        
        // Investment Subreddits sammeln
        const subreddits = ['investing', 'stocks', 'SecurityAnalysis', 'ValueInvesting', 'dividends'];
        const signals = [];
        
        for (const subreddit of subreddits) {
            try {
                const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=10`, {
                    headers: {
                        'Authorization': 'bearer ' + accessToken,
                        'User-Agent': 'AI Investment System v1.0'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok && data.data && data.data.children) {
                    data.data.children.forEach(post => {
                        signals.push({
                            id: post.data.id,
                            source: 'reddit',
                            subreddit: subreddit,
                            title: post.data.title,
                            content: post.data.selftext,
                            score: post.data.score,
                            upvote_ratio: post.data.upvote_ratio,
                            num_comments: post.data.num_comments,
                            created_utc: post.data.created_utc,
                            url: `https://reddit.com${post.data.permalink}`,
                            author: post.data.author,
                            timestamp: new Date().toISOString(),
                            sentiment: null, // Wird später von AI analysiert
                            relevance_score: null, // Wird später berechnet
                            keywords: extractKeywords(post.data.title + ' ' + post.data.selftext)
                        });
                    });
                }
            } catch (error) {
                console.error(`Error fetching from r/${subreddit}:`, error.message);
            }
        }
        
        // Nach Relevanz sortieren
        signals.sort((a, b) => b.score - a.score);
        
        return {
            success: true,
            signals: signals.slice(0, 50), // Top 50 Signale
            total: signals.length,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Reddit API Error:', error.message);
        return {
            success: false,
            error: error.message,
            signals: [],
            total: 0,
            timestamp: new Date().toISOString()
        };
    }
}

function extractKeywords(text) {
    if (!text) return [];
    
    // Investment-relevante Keywords
    const investmentKeywords = [
        'stock', 'stocks', 'investment', 'invest', 'portfolio', 'dividend', 'earnings',
        'revenue', 'profit', 'loss', 'market', 'trading', 'buy', 'sell', 'hold',
        'bull', 'bear', 'crash', 'rally', 'volatility', 'risk', 'return',
        'tesla', 'apple', 'microsoft', 'google', 'amazon', 'meta', 'nvidia',
        'bitcoin', 'crypto', 'cryptocurrency', 'etf', 'fund', 'bond', 'treasury'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => investmentKeywords.includes(word));
}

module.exports = {
    fetchRedditSignals
};
