/**
 * Reddit API Test - OAuth2 Web App Version
 * Funktioniert mit "web app" Type (nicht "script")
 */

const snoowrap = require('snoowrap');
require('dotenv').config();

async function testRedditOAuthWeb() {
    console.log('🔴 Testing Reddit API (OAuth2 Web App Version)...');
    
    try {
        // OAuth2 Web App Client (ohne Username/Password)
        const r = new snoowrap({
            userAgent: 'AI Investment System v1.0',
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET,
            refreshToken: process.env.REDDIT_REFRESH_TOKEN // Brauchen wir noch!
        });
        
        console.log('🔑 Client ID:', process.env.REDDIT_CLIENT_ID);
        console.log('🔑 Client Secret:', process.env.REDDIT_CLIENT_SECRET ? '***' + process.env.REDDIT_CLIENT_SECRET.slice(-4) : 'NICHT GESETZT');
        console.log('🔑 Refresh Token:', process.env.REDDIT_REFRESH_TOKEN ? '***' + process.env.REDDIT_REFRESH_TOKEN.slice(-4) : 'NICHT GESETZT');
        
        // Test 1: Public Subreddit (ohne Auth)
        console.log('\n📈 Test 1: Public Investment Subreddit...');
        const investmentPosts = await r.getSubreddit('investing').getHot({ limit: 5 });
        
        console.log('✅ Investment Posts gefunden:', investmentPosts.length);
        investmentPosts.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.score} upvotes)`);
        });
        
        console.log('\n🎉 REDDIT API TEST ERFOLGREICH!');
        console.log('✅ Reddit API funktioniert perfekt!');
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
        
        console.log('\n💡 Reddit API Setup für Web App:');
        console.log('1. Gehe zu: https://www.reddit.com/prefs/apps');
        console.log('2. Klicke: "create another app..."');
        console.log('3. App Type: "web app" (NICHT "script"!)');
        console.log('4. Name: "AI Investment System Web"');
        console.log('5. Redirect URI: https://mawps.netlify.app/callback');
        console.log('6. Kopiere Client ID und Secret');
        console.log('7. Für OAuth2 brauchst du einen Refresh Token');
        
        process.exit(1);
    }
}

// Test ausführen
testRedditOAuthWeb();
