/**
 * Konfiguration für Chrome Testloop - API-Key Integration Anschreibengenerator
 */

module.exports = {
    // URLs
    baseUrl: 'https://manuel-weiss.ch',
    localUrl: 'http://localhost:8080',
    useLocal: process.env.USE_LOCAL === 'true' || false,
    
    // Puppeteer Einstellungen
    headless: process.env.HEADLESS !== 'false', // true für CI, false für Debugging
    slowMo: parseInt(process.env.SLOW_MO) || 100, // Verlangsamung für besseres Debugging
    timeout: 30000,
    viewport: {
        width: 1920,
        height: 1080
    },
    
    // Test-Loop Einstellungen
    maxIterations: parseInt(process.env.MAX_ITERATIONS) || 10,
    cloudFrontWaitTime: parseInt(process.env.CLOUDFRONT_WAIT) || 30000, // 30 Sekunden
    
    // Debugging
    screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
    videoOnFailure: process.env.VIDEO_ON_FAILURE === 'true' || false,
    saveConsoleLogs: true,
    
    // Test-API-Key (nur für Tests, nicht für echte API-Calls)
    testApiKey: 'sk-test123456789012345678901234567890123456789012345678901234567890',
    
    // Test-Daten
    testData: {
        company: 'Test Company GmbH',
        position: 'Senior Software Engineer',
        jobDescription: 'Wir suchen einen erfahrenen Software Engineer mit Kenntnissen in JavaScript, Node.js und AWS.',
        contactPerson: 'Max Mustermann',
        firstName: 'Manuel',
        lastName: 'Weiss',
        location: 'Zürich'
    },
    
    // Wartezeiten (in ms)
    waitTimes: {
        pageLoad: 5000,
        editorInit: 3000,
        apiKeyCheck: 2000,
        generation: 15000,
        toastMessage: 2000
    }
};
