/**
 * NewsAPI.org Test
 * Kostenlose News API für Investment Analysis
 */

require('dotenv').config();

async function testNewsAPI() {
    console.log('📰 Testing NewsAPI.org...');
    
    try {
        const apiKey = process.env.NEWS_API_KEY;
        
        if (!apiKey) {
            console.log('❌ NEWS_API_KEY nicht gesetzt!');
            console.log('\n💡 NewsAPI.org Setup:');
            console.log('1. Gehe zu: https://newsapi.org/');
            console.log('2. Registriere dich kostenlos');
            console.log('3. Kopiere deinen API Key');
            console.log('4. Füge zu .env hinzu: NEWS_API_KEY=dein_api_key');
            return;
        }
        
        console.log('🔑 API Key:', apiKey ? '***' + apiKey.slice(-4) : 'NICHT GESETZT');
        
        // Test 1: Investment News
        console.log('\n📈 Test 1: Investment News...');
        const investmentResponse = await fetch(
            `https://newsapi.org/v2/everything?q=investment&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
        );
        
        const investmentData = await investmentResponse.json();
        
        if (!investmentResponse.ok) {
            throw new Error(`NewsAPI Error: ${investmentData.message}`);
        }
        
        console.log('✅ Investment News gefunden:', investmentData.articles.length);
        investmentData.articles.forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title} (${article.source.name})`);
        });
        
        // Test 2: Stock Market News
        console.log('\n📊 Test 2: Stock Market News...');
        const stockResponse = await fetch(
            `https://newsapi.org/v2/everything?q=stock market&language=en&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`
        );
        
        const stockData = await stockResponse.json();
        
        if (!stockResponse.ok) {
            throw new Error(`NewsAPI Error: ${stockData.message}`);
        }
        
        console.log('✅ Stock News gefunden:', stockData.articles.length);
        stockData.articles.forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title} (${article.source.name})`);
        });
        
        // Test 3: Tesla News (spezifisches Beispiel)
        console.log('\n🚗 Test 3: Tesla News...');
        const teslaResponse = await fetch(
            `https://newsapi.org/v2/everything?q=Tesla&language=en&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`
        );
        
        const teslaData = await teslaResponse.json();
        
        if (!teslaResponse.ok) {
            throw new Error(`NewsAPI Error: ${teslaData.message}`);
        }
        
        console.log('✅ Tesla News gefunden:', teslaData.articles.length);
        teslaData.articles.forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title} (${article.source.name})`);
        });
        
        console.log('\n🎉 NEWSAPI.ORG TEST ERFOLGREICH!');
        console.log('✅ NewsAPI.org funktioniert perfekt!');
        console.log('🚀 Bereit für echte News Investment Analysis!');
        
    } catch (error) {
        console.error('❌ NewsAPI Test fehlgeschlagen:', error.message);
        
        if (error.message.includes('401')) {
            console.error('🔑 NewsAPI API Key ist ungültig');
        } else if (error.message.includes('429')) {
            console.error('⏰ Rate Limit erreicht - warte einen Moment');
        }
        
        console.log('\n💡 NewsAPI.org Setup:');
        console.log('1. Gehe zu: https://newsapi.org/');
        console.log('2. Registriere dich kostenlos');
        console.log('3. Kopiere deinen API Key');
        console.log('4. Füge zu .env hinzu: NEWS_API_KEY=dein_api_key');
        console.log('5. Kostenlos: 1000 Requests/Tag');
        
        process.exit(1);
    }
}

// Test ausführen
testNewsAPI();
