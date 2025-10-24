/**
 * Test AI Investment System Configuration
 * Überprüft alle Konfigurationen
 */

require('dotenv').config();

async function testConfiguration() {
    console.log('🔧 Testing AI Investment System Configuration...');
    
    try {
        // Test Application Configuration
        console.log('\n📱 Application Configuration:');
        console.log('✅ NODE_ENV:', process.env.NODE_ENV || 'development');
        console.log('✅ PORT:', process.env.PORT || 3001);
        console.log('✅ LOG_LEVEL:', process.env.LOG_LEVEL || 'info');
        
        // Test API Keys
        console.log('\n🔑 API Keys:');
        console.log('✅ OpenAI:', process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : '❌ MISSING');
        console.log('✅ Reddit Client ID:', process.env.REDDIT_CLIENT_ID ? '***' + process.env.REDDIT_CLIENT_ID.slice(-4) : '❌ MISSING');
        console.log('✅ Reddit Client Secret:', process.env.REDDIT_CLIENT_SECRET ? '***' + process.env.REDDIT_CLIENT_SECRET.slice(-4) : '❌ MISSING');
        console.log('✅ NewsAPI:', process.env.NEWS_API_KEY ? '***' + process.env.NEWS_API_KEY.slice(-4) : '❌ MISSING');
        
        // Test Security
        console.log('\n🔒 Security Configuration:');
        console.log('✅ JWT Secret:', process.env.JWT_SECRET ? '***' + process.env.JWT_SECRET.slice(-4) : '❌ MISSING');
        console.log('✅ Session Secret:', process.env.SESSION_SECRET ? '***' + process.env.SESSION_SECRET.slice(-4) : '❌ MISSING');
        console.log('✅ Allowed Origins:', process.env.ALLOWED_ORIGINS || '❌ MISSING');
        
        // Test Database
        console.log('\n🗄️ Database Configuration:');
        console.log('✅ Database URL:', process.env.DATABASE_URL || '❌ MISSING');
        console.log('✅ AWS Region:', process.env.AWS_REGION || '❌ MISSING');
        console.log('✅ DynamoDB Prefix:', process.env.DYNAMODB_TABLE_PREFIX || '❌ MISSING');
        console.log('✅ S3 Prefix:', process.env.S3_BUCKET_PREFIX || '❌ MISSING');
        
        // Test AWS Keys
        console.log('\n☁️ AWS Configuration:');
        console.log('✅ AWS Access Key:', process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.slice(-4) : '❌ MISSING');
        console.log('✅ AWS Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '***' + process.env.AWS_SECRET_ACCESS_KEY.slice(-4) : '❌ MISSING');
        
        // Validation
        const required = [
            'OPENAI_API_KEY',
            'REDDIT_CLIENT_ID',
            'REDDIT_CLIENT_SECRET',
            'NEWS_API_KEY',
            'JWT_SECRET',
            'SESSION_SECRET'
        ];
        
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            console.log('\n❌ Missing required configuration:');
            missing.forEach(key => console.log(`   - ${key}`));
            console.log('\n💡 Please check your .env file');
            return false;
        }
        
        console.log('\n🎉 CONFIGURATION TEST ERFOLGREICH!');
        console.log('✅ Alle erforderlichen Konfigurationen sind gesetzt');
        console.log('🚀 AI Investment System ist bereit!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Configuration test failed:', error.message);
        return false;
    }
}

// Test ausführen
testConfiguration();
