import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8090',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'ecommerce',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'ecommerce-frontend'
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;