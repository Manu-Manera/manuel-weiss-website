/**
 * Reddit API Test - Complete Version
 * Mit Client ID, Secret, Username und Password
 */

const snoowrap = require('snoowrap');
require('dotenv').config();

async function testRedditComplete() {
    console.log('🔴 Testing Reddit API (Complete Version)...');
    
    try {
        // Reddit Client mit allen Credentials
        const r = new snoowrap({
            userAgent: 'AI Investment System v1.0',
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET,
            username: process.env.REDDIT_USERNAME,
            password: process.env.REDDIT_PASSWORD
        });
        
        console.log('🔑 Client ID:', process.env.REDDIT_CLIENT_ID);
        console.log('🔑 Username:', process.env.REDDIT_USERNAME);
        console.log('🔑 Password:', process.env.REDDIT_PASSWORD ? '***' + process.env.REDDIT_PASSWORD.slice(-2) : 'NICHT GESETZT');
        
        // Test 1: Investment Subreddit
        console.log('\n📈 Test 1: Investment Subreddit...');
        const investmentPosts = await r.getSubreddit('investing').getHot({ limit: 5 });
        
        console.log('✅ Investment Posts gefunden:', investmentPosts.length);
        investmentPosts.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.score} upvotes)`);
        });
        
        // Test 2: Stock Market Subreddit
        console.log('\n📊 Test 2: Stock Market...');
        const stockPosts = await r.getSubreddit('stocks').getHot({ limit: 5 });
        
        console.log('✅ Stock Posts gefunden:', stockPosts.length);
        stockPosts.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.score} upvotes)`);
        });
        
        // Test 3: Search nach Investment-Keywords
        console.log('\n🔍 Test 3: Investment Search...');
        const searchResults = await r.search({
            query: 'Tesla stock',
            subreddit: 'investing',
            sort: 'relevance',
            time: 'week',
            limit: 3
        });
        
        console.log('✅ Search Results gefunden:', searchResults.length);
        searchResults.forEach((post, index) => {
            console.log(`   ${index + 1}. ${post.title} (${post.score} upvotes)`);
        });
        
        // Test 4: WallStreetBets (vorsichtig!)
        console.log('\n🚀 Test 4: WallStreetBets...');
        try {
            const wsbPosts = await r.getSubreddit('wallstreetbets').getHot({ limit: 3 });
            console.log('✅ WSB Posts gefunden:', wsbPosts.length);
        } catch (error) {
            console.log('⚠️ WSB nicht verfügbar (möglicherweise privat)');
        }
        
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
        
        console.log('\n💡 Reddit API Setup:');
        console.log('1. Gehe zu: https://www.reddit.com/prefs/apps');
        console.log('2. Klicke: "Create App"');
        console.log('3. App Type: "script"');
        console.log('4. Kopiere Client ID und Secret');
        console.log('5. Füge zu .env hinzu:');
        console.log('   REDDIT_CLIENT_ID=dein_client_id');
        console.log('   REDDIT_CLIENT_SECRET=dein_client_secret');
        console.log('   REDDIT_USERNAME=dein_reddit_username');
        console.log('   REDDIT_PASSWORD=dein_reddit_password');
        
        process.exit(1);
    }
}

// Test ausführen
testRedditComplete();
