# Architecture Chatbot Plugin for Red Hat Developer Hub

Este plugin proporciona un chatbot inteligente para consultas sobre arquitectura, APIs y mejores prácticas técnicas directamente integrado en Red Hat Developer Hub.

## 🤖 Características

- **Chatbot conversacional** con interfaz intuitiva
- **Base de conocimiento** sobre arquitectura cloud-native
- **Consultas específicas** sobre APIs, microservicios, seguridad
- **Integración nativa** con Backstage/Developer Hub
- **API backend** para procesamiento de consultas
- **Respuestas contextuales** con ejemplos de código

## 🎯 Casos de Uso

### Para Desarrolladores:
- "¿Cómo implementar autenticación OAuth en mi API?"
- "¿Qué patrones usar para microservicios?"
- "¿Cómo configurar CI/CD con GitOps?"

### Para Arquitectos:
- "¿Cuáles son las mejores prácticas para APIs?"
- "¿Cómo diseñar una arquitectura cloud-native?"
- "¿Qué considerar para seguridad en microservicios?"

### Para DevOps:
- "¿Cómo implementar observabilidad?"
- "¿Qué herramientas usar para monitoreo?"
- "¿Cómo configurar pipelines de CI/CD?"

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Developer Hub  │ → │ Chatbot Plugin   │ → │ Architecture    │
│  (Backstage)    │    │ (React/TypeScript)│    │ API (Node.js)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ↓
                       ┌──────────────────┐
                       │ Knowledge Base   │
                       │ (Architecture    │
                       │  Documentation) │
                       └──────────────────┘
```

## 🚀 Despliegue

### 1. Plugin Frontend (integrado en Developer Hub)
```bash
# El plugin se despliega automáticamente con Developer Hub
oc apply -f gitops/projects/infrastructure/developer-hub/application.yaml
```

### 2. API Backend (independiente)
```bash
# Desplegar API backend
oc apply -f architecture-chatbot-api/k8s/deployment.yaml
```

### 3. Configuración
- El plugin se integra automáticamente en la navegación
- Disponible en `/architecture-chatbot`
- API accesible en `chatbot-api.apps.cluster-tzfv6.tzfv6.sandbox1862.opentlc.com`

## 📋 Tecnologías

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express
- **Integración**: Backstage Plugin API
- **Despliegue**: OpenShift + Helm
- **Routing**: OpenShift Routes con TLS

## 🔧 Configuración Avanzada

El plugin soporta configuración mediante `app-config.yaml`:

```yaml
architectureChatbot:
  apiUrl: https://chatbot-api.apps.your-cluster.com
  features:
    - apis
    - microservices
    - security
```

## 📈 Métricas y Monitoreo

- Health checks en `/health`
- Logging estructurado
- Rate limiting configurado
- Métricas de uso (próximamente)