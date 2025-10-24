/**
 * Reddit API Test - Einfache Public API
 * Ohne OAuth2 - nur öffentliche Daten
 */

const snoowrap = require('snoowrap');
require('dotenv').config();

async function testRedditSimplePublic() {
    console.log('🔴 Testing Reddit API (Simple Public Version)...');
    
    try {
        // Einfacher Client ohne Auth (nur für öffentliche Daten)
        const r = new snoowrap({
            userAgent: 'AI Investment System v1.0'
        });
        
        console.log('🔑 Testing ohne API Keys (nur öffentliche Daten)...');
        
        // Test 1: Public Subreddit (ohne Auth)
        console.log('\n📈 Test 1: Public Investment Subreddit...');
        const investmentPosts = await r.getSubreddit('investing').getHot({ limit: 5 });
        
        console.log('✅ Investment Posts gefunden:', investmentPosts.length);
        investmentPosts.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.score} upvotes)`);
        });
        
        // Test 2: Stock Market
        console.log('\n📊 Test 2: Stock Market...');
        const stockPosts = await r.getSubreddit('stocks').getHot({ limit: 3 });
        
        console.log('✅ Stock Posts gefunden:', stockPosts.length);
        stockPosts.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.score} upvotes)`);
        });
        
        console.log('\n🎉 REDDIT PUBLIC API TEST ERFOLGREICH!');
        console.log('✅ Reddit API funktioniert für öffentliche Daten!');
        console.log('🚀 Bereit für Reddit Investment Analysis!');
        
    } catch (error) {
        console.error('❌ Reddit API Test fehlgeschlagen:', error.message);
        
        if (error.message.includes('429')) {
            console.error('⏰ Rate Limit erreicht - warte einen Moment');
        } else if (error.message.includes('403')) {
            console.error('🚫 Reddit API Zugang verweigert');
        }
        
        console.log('\n💡 Reddit API Setup:');
        console.log('1. Reddit hat die API-Zugriffe eingeschränkt');
        console.log('2. Für volle API-Zugriffe brauchst du OAuth2');
        console.log('3. Aber öffentliche Daten funktionieren ohne Keys');
        
        process.exit(1);
    }
}

// Test ausführen
testRedditSimplePublic();
