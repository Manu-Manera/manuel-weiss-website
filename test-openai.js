/**
 * OpenAI API Test
 */

require('dotenv').config();

async function testOpenAI() {
    console.log('🤖 Testing OpenAI API...');
    
    try {
        const { OpenAI } = require('openai');
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : 'NICHT GESETZT');
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: "Teste die OpenAI API - antworte nur mit 'OpenAI API funktioniert!'"
                }
            ],
            max_tokens: 50
        });
        
        console.log('✅ OpenAI Response:', response.choices[0].message.content);
        console.log('🎉 OPENAI API TEST ERFOLGREICH!');
        
    } catch (error) {
        console.error('❌ OpenAI API Test fehlgeschlagen:', error.message);
        process.exit(1);
    }
}

testOpenAI();
