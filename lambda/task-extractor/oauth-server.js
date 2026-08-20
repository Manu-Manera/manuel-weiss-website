/**
 * OAuth 2.0 Flow Server für Microsoft Graph API
 * 
 * Einmaliger lokaler Server um den Refresh Token zu erhalten.
 * Nach erfolgreicher Autorisierung wird der Token in AWS Secrets Manager gespeichert.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 3000;

// Diese Werte aus Azure AD App Registration
const CONFIG = {
  clientId: process.env.GRAPH_CLIENT_ID || 'SETZE_CLIENT_ID',
  clientSecret: process.env.GRAPH_CLIENT_SECRET || 'SETZE_CLIENT_SECRET',
  tenantId: process.env.GRAPH_TENANT_ID || 'SETZE_TENANT_ID',
  redirectUri: `http://localhost:${PORT}/callback`,
  scopes: [
    'offline_access',
    'Mail.Read',
    'User.Read'
  ]
};

function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    response_type: 'code',
    redirect_uri: CONFIG.redirectUri,
    scope: CONFIG.scopes.join(' '),
    response_mode: 'query'
  });
  return `https://login.microsoftonline.com/${CONFIG.tenantId}/oauth2/v2.0/authorize?${params}`;
}

async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    client_secret: CONFIG.clientSecret,
    code: code,
    redirect_uri: CONFIG.redirectUri,
    grant_type: 'authorization_code'
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'login.microsoftonline.com',
      path: `/${CONFIG.tenantId}/oauth2/v2.0/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse token response'));
        }
      });
    });
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

async function saveToSecretsManager(refreshToken) {
  const { exec } = require('child_process');
  
  const secretValue = JSON.stringify({
    clientId: CONFIG.clientId,
    tenantId: CONFIG.tenantId,
    clientSecret: CONFIG.clientSecret,
    refreshToken: refreshToken
  });

  return new Promise((resolve, reject) => {
    const cmd = `aws secretsmanager put-secret-value \
      --secret-id task-extractor/graph-credentials \
      --secret-string '${secretValue.replace(/'/g, "'\\''")}' \
      --region eu-central-1 2>&1 || \
      aws secretsmanager create-secret \
      --name task-extractor/graph-credentials \
      --secret-string '${secretValue.replace(/'/g, "'\\''")}' \
      --region eu-central-1`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error && !stdout.includes('ResourceExistsException')) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/auth' || url.pathname === '/') {
    const authUrl = getAuthUrl();
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }
  
  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Fehler bei der Autorisierung</h1>
        <p>${error}: ${url.searchParams.get('error_description')}</p>
      `);
      return;
    }
    
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Kein Autorisierungscode erhalten</h1>');
      return;
    }
    
    try {
      console.log('Tausche Code gegen Tokens...');
      const tokens = await exchangeCodeForTokens(code);
      
      if (tokens.error) {
        throw new Error(`${tokens.error}: ${tokens.error_description}`);
      }
      
      console.log('Tokens erhalten. Speichere in AWS Secrets Manager...');
      await saveToSecretsManager(tokens.refresh_token);
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Autorisierung erfolgreich</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { color: #059669; background: #d1fae5; padding: 20px; border-radius: 8px; }
            code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>Autorisierung erfolgreich!</h1>
            <p>Der Refresh Token wurde in AWS Secrets Manager gespeichert.</p>
            <p>Secret Name: <code>task-extractor/graph-credentials</code></p>
          </div>
          <p style="margin-top: 20px;">Du kannst dieses Fenster jetzt schließen und den Server mit <code>Ctrl+C</code> beenden.</p>
        </body>
        </html>
      `);
      
      console.log('\n✅ Autorisierung erfolgreich!');
      console.log('   Refresh Token in AWS Secrets Manager gespeichert.');
      console.log('   Du kannst den Server jetzt beenden (Ctrl+C).\n');
      
    } catch (error) {
      console.error('Fehler:', error);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Fehler beim Token-Austausch</h1>
        <pre>${error.message}</pre>
      `);
    }
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log('\n============================================');
  console.log('  Microsoft Graph OAuth Server');
  console.log('============================================\n');
  
  if (CONFIG.clientId === 'SETZE_CLIENT_ID') {
    console.log('⚠️  Setze zuerst die Umgebungsvariablen:');
    console.log('');
    console.log('   export GRAPH_CLIENT_ID="deine-app-id"');
    console.log('   export GRAPH_CLIENT_SECRET="dein-secret"');
    console.log('   export GRAPH_TENANT_ID="dein-tenant-id"');
    console.log('');
    console.log('   Dann starte den Server neu.');
    console.log('');
  } else {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    console.log('');
    console.log('Öffne im Browser:');
    console.log(`   http://localhost:${PORT}/auth`);
    console.log('');
  }
});
