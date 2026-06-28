import { useState, useEffect } from 'react';
import { apiClient, storeAuth, clearAuth } from '../shared/api-client.js';
import type { SaveProgressMessage, CheckUrlResultMessage } from '../shared/messages.js';
import './popup.css';

type SaveStage = 'idle' | 'checking' | 'saving' | 'saved' | 'duplicate' | 'error';
type AuthStage = 'loading' | 'unauthenticated' | 'authenticated';

interface PageInfo {
  url: string;
  title: string;
}

export function App() {
  const [authStage, setAuthStage] = useState<AuthStage>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [stage, setStage] = useState<SaveStage>('idle');
  const [checkResult, setCheckResult] = useState<CheckUrlResultMessage['payload'] | null>(null);

  // Check if already authenticated
  useEffect(() => {
    chrome.storage.session.get('auth', (result) => {
      const hasToken = !!result['auth']?.accessToken;
      setAuthStage(hasToken ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  // Load page info after authenticated
  useEffect(() => {
    if (authStage !== 'authenticated') return;

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.url || !tab.title) return;
      const info = { url: tab.url, title: tab.title };
      setPageInfo(info);
      setStage('checking');

      chrome.runtime.sendMessage(
        { type: 'CHECK_URL', payload: { url: info.url } },
        (result: CheckUrlResultMessage['payload']) => {
          setCheckResult(result);
          setStage('idle');
        },
      );
    });
  }, [authStage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { accessToken } = await apiClient.login(email, password);
      await storeAuth(accessToken);
      setAuthStage('authenticated');
    } catch {
      setLoginError('Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSave = () => {
    if (!pageInfo) return;
    setStage('saving');
    chrome.runtime.sendMessage(
      { type: 'SAVE_ARTICLE', payload: { url: pageInfo.url, title: pageInfo.title } },
      (result: SaveProgressMessage['payload']) => {
        if (result.stage === 'SAVED') setStage('saved');
        else if (result.stage === 'DUPLICATE') setStage('duplicate');
        else if (result.stage === 'ERROR') {
          if (result.errorCode === 'UNAUTHORIZED') {
            clearAuth();
            setAuthStage('unauthenticated');
          }
          setStage('error');
        }
      },
    );
  };

  // --- Render ---

  if (authStage === 'loading') {
    return (
      <div className="popup">
        <p className="status status-checking">Loading...</p>
      </div>
    );
  }

  if (authStage === 'unauthenticated') {
    return (
      <div className="popup">
        <p className="popup-header">KnowVault</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 13,
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 13,
            }}
          />
          {loginError && <p className="status status-error">{loginError}</p>}
          <button type="submit" className="btn btn-primary" disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="popup">
      <p className="popup-header">KnowVault</p>
      {!pageInfo || stage === 'checking' ? (
        <p className="status status-checking">Checking...</p>
      ) : checkResult?.exists ? (
        <p className="status status-saved">Already saved · {checkResult.status}</p>
      ) : stage === 'saving' ? (
        <button disabled className="btn btn-primary">
          Saving...
        </button>
      ) : stage === 'saved' ? (
        <p className="status status-saved">✓ Saved — AI processing started</p>
      ) : stage === 'duplicate' ? (
        <p className="status status-duplicate">Already in your library</p>
      ) : stage === 'error' ? (
        <p className="status status-error">Save failed. Try again.</p>
      ) : (
        <button onClick={handleSave} className="btn btn-primary">
          Save to KnowVault
        </button>
      )}
    </div>
  );
}
