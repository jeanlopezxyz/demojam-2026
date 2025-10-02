class ArchitectureService {
  static async processQuestion(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Architecture knowledge base
    const knowledgeBase = {
      apis: {
        keywords: ['api', 'rest', 'graphql', 'endpoint', 'authentication', 'oauth'],
        responses: {
          'api design': {
            answer: `🔌 **Diseño de APIs - Mejores Prácticas**

**1. RESTful Design:**
\`\`\`
GET    /api/v1/users          # Listar usuarios
POST   /api/v1/users          # Crear usuario
GET    /api/v1/users/{id}     # Obtener usuario específico
PUT    /api/v1/users/{id}     # Actualizar usuario
DELETE /api/v1/users/{id}     # Eliminar usuario
\`\`\`

**2. Autenticación:**
\`\`\`yaml
# OAuth 2.0 + JWT
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**3. Versionado:**
- Headers: \`API-Version: v1\`
- URL: \`/api/v1/\`
- Accept: \`application/vnd.myapi.v1+json\`

**4. Documentación:**
- OpenAPI 3.0 + Swagger UI
- Ejemplos de request/response
- Rate limiting documentation

**5. Códigos de respuesta:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error`,
            sources: ['OpenAPI Specification', 'REST API Design Guidelines', 'OAuth 2.0 RFC']
          },
          'microservices': {
            answer: `🏗️ **Patrones de Microservicios**

**1. API Gateway Pattern:**
\`\`\`
Client → API Gateway → [Service1, Service2, Service3]
\`\`\`
- Punto único de entrada
- Rate limiting centralizado
- Autenticación/autorización
- Load balancing

**2. Circuit Breaker:**
\`\`\`javascript
if (failureCount > threshold) {
  return fallbackResponse();
}
\`\`\`

**3. CQRS (Command Query Responsibility Segregation):**
- Commands: Modifican estado
- Queries: Solo lectura
- Bases de datos separadas

**4. Event Sourcing:**
- Estado como secuencia de eventos
- Replay capabilities
- Audit trail completo

**5. Service Mesh:**
- Istio/Linkerd
- Comunicación segura
- Observabilidad automática`,
            sources: ['Microservices Patterns', 'Service Mesh Architecture', 'CQRS Documentation']
          }
        }
      },
      security: {
        keywords: ['security', 'auth', 'oauth', 'jwt', 'rbac', 'encryption'],
        responses: {
          'api security': {
            answer: `🔒 **Seguridad en APIs**

**1. Autenticación:**
\`\`\`yaml
# OAuth 2.0 Flow
Authorization Code → Access Token → API Call
\`\`\`

**2. Autorización RBAC:**
\`\`\`yaml
roles:
  - admin: [read, write, delete]
  - user: [read, write]
  - viewer: [read]
\`\`\`

**3. JWT Token:**
\`\`\`javascript
{
  "sub": "user123",
  "roles": ["user"],
  "exp": 1234567890
}
\`\`\`

**4. Rate Limiting:**
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
\`\`\`

**5. Input Validation:**
- Schema validation
- SQL injection protection
- XSS prevention
- CORS configuration`,
            sources: ['OAuth 2.0 Security', 'JWT Best Practices', 'API Security Guidelines']
          }
        }
      },
      devops: {
        keywords: ['ci/cd', 'gitops', 'pipeline', 'kubernetes', 'docker', 'deployment'],
        responses: {
          'gitops': {
            answer: `🚀 **GitOps - Infraestructura como Código**

**1. Principios:**
- Git es la fuente de verdad
- Declarative configuration
- Automated deployment
- Continuous reconciliation

**2. Herramientas:**
\`\`\`yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
spec:
  source:
    repoURL: https://github.com/my-org/my-app
    path: k8s/
  destination:
    namespace: my-app
\`\`\`

**3. Estructura:**
\`\`\`
gitops-repo/
├── apps/           # Application definitions
├── infrastructure/ # Infrastructure as code
└── clusters/       # Cluster configurations
\`\`\`

**4. Workflow:**
1. Developer → Commit → Git
2. ArgoCD → Detect → Deploy
3. Monitor → Drift → Reconcile`,
            sources: ['GitOps Principles', 'ArgoCD Documentation', 'Kubernetes GitOps']
          }
        }
      }
    };

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const [topic, data] of Object.entries(knowledgeBase)) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword)) {
          const score = keyword.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = { topic, data };
          }
        }
      }
    }

    if (bestMatch) {
      // Find specific response or use general topic response
      for (const [key, response] of Object.entries(bestMatch.data.responses)) {
        if (lowerMessage.includes(key.split(' ')[0])) {
          return response;
        }
      }
      
      // Return first response from topic
      const firstResponse = Object.values(bestMatch.data.responses)[0];
      if (firstResponse) return firstResponse;
    }

    // Default responses for common patterns
    if (lowerMessage.includes('cómo') || lowerMessage.includes('how')) {
      return {
        answer: `🤔 **Guía de Implementación**

Para ayudarte mejor, ¿podrías especificar sobre qué tema?

**Temas disponibles:**
• 🔌 **APIs**: REST, GraphQL, autenticación
• 🏗️ **Microservicios**: Patrones, comunicación
• ☁️ **Cloud Native**: Containers, Kubernetes
• 🔒 **Seguridad**: OAuth, RBAC, encryption
• 🚀 **DevOps**: CI/CD, GitOps, monitoring
• 💾 **Datos**: Bases de datos, persistencia

**Ejemplos de preguntas:**
- "Cómo implementar autenticación OAuth en una API"
- "Qué patrones usar para microservicios"
- "Cómo configurar CI/CD con GitOps"`,
        sources: ['Architecture Guidelines', 'Best Practices Documentation']
      };
    }

    return {
      answer: `👋 **¡Hola!**

Soy tu asistente de arquitectura. Puedo ayudarte con:

**📚 Documentación técnica:**
• Patrones arquitectónicos
• Diseño de APIs
• Seguridad y compliance
• DevOps y automatización

**🔍 Ejemplos de consultas:**
• "Cómo diseñar una API REST"
• "Patrones para microservicios"
• "Mejores prácticas de seguridad"
• "Configurar GitOps con ArgoCD"

¿Sobre qué tema específico te gustaría consultar?`,
      sources: ['DemoJam Architecture Documentation', 'Red Hat Best Practices']
    };
  }

  static async getDocumentationSources() {
    return [
      'Red Hat OpenShift Documentation',
      'Kubernetes Architecture Guide',
      'API Design Best Practices',
      'Cloud Native Security Patterns',
      'GitOps Implementation Guide',
      'Microservices Design Patterns'
    ];
  }
}

module.exports = ArchitectureService;