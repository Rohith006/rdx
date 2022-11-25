const _kc = new window.Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_AUTH_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT,
});

const initKeycloak = () => {
  return new Promise((resolve, reject) => {
    _kc
      .init({
        onLoad: "login-required",
        // checkLoginIframe: false,
        silentCheckSsoFallback: true,
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        if (authenticated) {
          window._kc = _kc;
          resolve({ keycloak: _kc, status: 0 });
        } else {
          window._kc = _kc;
          resolve({ status: 1 });
        }
      });
  });
};

const login = _kc.login;

const logout = _kc.logout;

const getToken = () => _kc.token;

const authenticated = () => _kc.authenticated;

const isAuthenticated = () => _kc.authenticated;

const userDetails = () => _kc.tokenParsed;

const AuthService = {
  login,
  logout,
  authenticated,
  initKeycloak,
  getToken,
  isAuthenticated,
  userDetails,
};

export default AuthService;
