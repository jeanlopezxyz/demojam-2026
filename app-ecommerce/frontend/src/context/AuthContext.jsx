import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../config/keycloak';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        // Skip Keycloak initialization for development without external Keycloak
        if (import.meta.env.VITE_SKIP_KEYCLOAK === 'true') {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Check if already initialized
        if (keycloak.authenticated !== undefined) {
          setIsAuthenticated(keycloak.authenticated);
          setIsLoading(false);
          return;
        }

        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
          pkceMethod: 'S256'
        });

        if (authenticated) {
          setIsAuthenticated(true);
          setToken(keycloak.token);
          
          // Extract user info from token
          const userInfo = {
            id: keycloak.tokenParsed?.sub,
            email: keycloak.tokenParsed?.email,
            name: keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username,
            firstName: keycloak.tokenParsed?.given_name,
            lastName: keycloak.tokenParsed?.family_name,
            roles: keycloak.tokenParsed?.realm_access?.roles || []
          };
          
          setUser(userInfo);

          // Setup token refresh
          setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token);
                console.log('Token refreshed');
              }
            }).catch(() => {
              console.log('Failed to refresh token');
              logout();
            });
          }, 60000); // Check every minute
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    keycloak.logout({
      redirectUri: window.location.origin
    });
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const isAdmin = () => hasRole('admin');
  
  const getAuthHeader = () => {
    return token ? `Bearer ${token}` : null;
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    hasRole,
    isAdmin,
    getAuthHeader,
    keycloak
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};