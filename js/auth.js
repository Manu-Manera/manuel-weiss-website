// js/auth.js
export function parseHash() {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  if (!h.startsWith('#')) return {};
  return Object.fromEntries(h.substring(1).split('&').map(kv => kv.split('=').map(decodeURIComponent)));
}
let _user = null;
export function setUser(u){ _user = u; }
export function getUser(){ return _user; }
export function initAuth() {
  const params = parseHash();
  if (params.id_token) {
    const payload = JSON.parse(atob(params.id_token.split('.')[1]));
    setUser({ idToken: params.id_token, accessToken: params.access_token, userId: payload.sub, email: payload.email });
    history.replaceState(null, '', location.pathname + location.search);
  }
}
export function isLoggedIn(){ return !!(_user && _user.userId); }
