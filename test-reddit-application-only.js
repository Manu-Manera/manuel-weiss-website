/**
 * Reddit API Test - Application Only OAuth
 * Für "web app" Apps ohne User-Context
 * Basierend auf: https://github.com/reddit/reddit/wiki/OAuth2
 */

require('dotenv').config();

async function testRedditApplicationOnly() {
    console.log('🔴 Testing Reddit API (Application Only OAuth)...');
    
    try {
        // Application Only OAuth - Client Credentials Grant
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Reddit API Error: ${data.error} - ${data.message}`);
        }
        
        console.log('✅ Reddit OAuth2 Token erhalten!');
        console.log('🔑 Access Token:', data.access_token ? '***' + data.access_token.slice(-4) : 'NICHT GESETZT');
        console.log('⏰ Expires In:', data.expires_in, 'Sekunden');
        console.log('📋 Scope:', data.scope);
        
        // Test 1: Investment Subreddit mit OAuth2 Token
        console.log('\n📈 Test 1: Investment Subreddit (OAuth2)...');
        const subredditResponse = await fetch('https://oauth.reddit.com/r/investing/hot?limit=5', {
            headers: {
                'Authorization': 'bearer ' + data.access_token,
                'User-Agent': 'AI Investment System v1.0'
            }
        });
        
        const subredditData = await subredditResponse.json();
        
        if (!subredditResponse.ok) {
            throw new Error(`Reddit API Error: ${subredditData.error} - ${subredditData.message}`);
        }
        
        console.log('✅ Investment Posts gefunden:', subredditData.data.children.length);
        subredditData.data.children.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.data.title} (${post.data.score} upvotes)`);
        });
        
        // Test 2: Stock Market
        console.log('\n📊 Test 2: Stock Market (OAuth2)...');
        const stockResponse = await fetch('https://oauth.reddit.com/r/stocks/hot?limit=3', {
            headers: {
                'Authorization': 'bearer ' + data.access_token,
                'User-Agent': 'AI Investment System v1.0'
            }
        });
        
        const stockData = await stockResponse.json();
        
        if (!stockResponse.ok) {
            throw new Error(`Reddit API Error: ${stockData.error} - ${stockData.message}`);
        }
        
        console.log('✅ Stock Posts gefunden:', stockData.data.children.length);
        stockData.data.children.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.data.title} (${post.data.score} upvotes)`);
        });
        
        console.log('\n🎉 REDDIT API TEST ERFOLGREICH!');
        console.log('✅ Reddit OAuth2 funktioniert perfekt!');
        console.log('🚀 Bereit für echte Reddit Investment Analysis!');
        
    } catch (error) {
        console.error('❌ Reddit API Test fehlgeschlagen:', error.message);
        
        if (error.message.includes('401')) {
            console.error('🔑 Reddit API Keys sind ungültig');
        } else if (error.message.includes('403')) {
            console.error('🚫 Reddit API Zugang verweigert');
        } else if (error.message.includes('429')) {
            console.error('⏰ Rate Limit erreicht - warte einen Moment');
        }
        
        console.log('\n💡 Reddit OAuth2 Setup:');
        console.log('1. "web app" Apps brauchen OAuth2 (nicht Username/Password)');
        console.log('2. Application Only OAuth für "web app" Apps');
        console.log('3. Client Credentials Grant');
        console.log('4. Basierend auf: https://github.com/reddit/reddit/wiki/OAuth2');
        
        process.exit(1);
    }
}

// Test ausführen
testRedditApplicationOnly();
