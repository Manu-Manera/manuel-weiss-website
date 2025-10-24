/**
 * AI Investment System - Live Data Test
 * Testet alle APIs mit echten Live-Daten
 */

require('dotenv').config();

async function testLiveSystem() {
    console.log('🚀 Testing AI Investment System with Live Data...');
    
    try {
        // Test 1: Reddit Live Data
        console.log('\n🔴 Test 1: Reddit Live Data...');
        const { testRedditApplicationOnly } = require('./test-reddit-application-only.js');
        await testRedditApplicationOnly();
        
        // Test 2: NewsAPI Live Data
        console.log('\n📰 Test 2: NewsAPI Live Data...');
        const { testNewsAPI } = require('./test-newsapi.js');
        await testNewsAPI();
        
        // Test 3: OpenAI Live Analysis
        console.log('\n🤖 Test 3: OpenAI Live Analysis...');
        const { testOpenAI } = require('./test-openai.js');
        await testOpenAI();
        
        console.log('\n🎉 LIVE DATA TEST ERFOLGREICH!');
        console.log('✅ Alle APIs funktionieren mit echten Live-Daten!');
        console.log('🚀 AI Investment System ist bereit für Trading!');
        
    } catch (error) {
        console.error('❌ Live Data Test fehlgeschlagen:', error.message);
        process.exit(1);
    }
}

// Test ausführen
testLiveSystem();