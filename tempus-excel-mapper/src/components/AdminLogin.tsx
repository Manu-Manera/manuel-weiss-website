import { useState } from 'react';
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const COGNITO_REGION = 'eu-central-1';
const COGNITO_CLIENT_ID = '7kc5tt6a23fgh53d60vkefm812';
const COGNITO_ENDPOINT = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;
const SESSION_KEY = 'admin_auth_session';

function decodeJWT(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

async function cognitoLogin(email: string, password: string): Promise<void> {
  const res = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    },
    body: JSON.stringify({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code = data.__type || '';
    if (code.includes('NotAuthorized')) throw new Error('Falsche E-Mail-Adresse oder Passwort');
    if (code.includes('UserNotConfirmed')) throw new Error('Bitte bestätige zuerst deine E-Mail-Adresse');
    if (code.includes('UserNotFound')) throw new Error('Benutzer nicht gefunden');
    throw new Error(data.message || 'Anmeldung fehlgeschlagen');
  }

  const { IdToken, AccessToken, RefreshToken, ExpiresIn } = data.AuthenticationResult;
  const payload = decodeJWT(IdToken);
  const groups = (payload['cognito:groups'] as string[]) || [];

  if (!groups.includes('admin')) {
    throw new Error('Kein Zugriff – du bist nicht in der Admin-Gruppe');
  }

  const expiresAt = new Date(Date.now() + (ExpiresIn || 3600) * 1000).toISOString();
  const session = {
    user: { email, idToken: IdToken, accessToken: AccessToken, refreshToken: RefreshToken, expiresAt },
    expiresAt,
    isAdmin: true,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await cognitoLogin(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tempus Excel Mapper</h1>
            <p className="text-sm text-gray-500">Admin-Anmeldung erforderlich</p>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Dieses Tool ist nur für Valkeen-Administratoren zugänglich. Melde dich mit deinen Admin-Zugangsdaten an.
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@valkeen.ch"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400">
          Für Zugangsdaten wende dich an den Valkeen-Administrator.
        </p>
      </div>
    </div>
  );
}
