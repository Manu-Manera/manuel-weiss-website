/**
 * Twitter/X API Test
 */

require('dotenv').config();

async function testTwitter() {
    console.log('🐦 Testing Twitter/X API...');
    
    try {
        const { TwitterApi } = require('twitter-api-v2');
        
        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET
        });
        
        console.log('🔑 Twitter API Key:', process.env.TWITTER_API_KEY ? '***' + process.env.TWITTER_API_KEY.slice(-4) : 'NICHT GESETZT');
        
        // Test: Suche nach Investment-Tweets
        const tweets = await client.v2.search('Tesla stock', {
            max_results: 5,
            tweet: {
                fields: ['created_at', 'public_metrics', 'text']
            }
        });
        
        console.log('✅ Twitter Tweets gefunden:', tweets.data.length);
        tweets.data.forEach((tweet, index) => {
            console.log(`   ${index + 1}. ${tweet.text.substring(0, 100)}...`);
        });
        
        console.log('🎉 TWITTER API TEST ERFOLGREICH!');
        
    } catch (error) {
        console.error('❌ Twitter API Test fehlgeschlagen:', error.message);
        
        if (error.message.includes('401')) {
            console.error('🔑 Twitter API Keys sind ungültig');
        } else if (error.message.includes('403')) {
            console.error('🚫 Twitter API Zugang verweigert');
        }
        
        console.log('\n💡 Twitter API Setup:');
        console.log('1. Gehe zu: https://developer.twitter.com/');
        console.log('2. Erstelle eine App');
        console.log('3. Kopiere API Keys');
        console.log('4. Füge zu .env hinzu');
        
        process.exit(1);
    }
}

testTwitter();
