# Desplegar Plugin a Red Hat Developer Hub

## 🎯 **Opción 1: Dynamic Plugin (Recomendado)**

### Paso 1: Build y Push del Plugin
```bash
cd backstage-plugins/architecture-chatbot

# Build dynamic plugin
npm run build

# Create container
podman build -t quay.io/your-registry/architecture-chatbot-plugin:1.0.0 .
podman push quay.io/your-registry/architecture-chatbot-plugin:1.0.0
```

### Paso 2: Configurar RHDH
```yaml
# En app-config.yaml de Developer Hub
dynamicPlugins:
  frontend:
    architecture-chatbot:
      package: 'quay.io/your-registry/architecture-chatbot-plugin:1.0.0'
      mountPoints:
        - mountPoint: nav.page
          importName: ArchitectureChatbotPage
          config:
            path: /architecture-chatbot
            title: Architecture Assistant
            icon: smart_toy
```

### Paso 3: Restart Developer Hub
```bash
oc rollout restart deployment rhdh -n backstage
```

---

## 🎯 **Opción 2: ConfigMap Mount**

### Paso 1: Crear ConfigMap con Plugin
```bash
cd backstage-plugins/architecture-chatbot
npm run build

# Crear ConfigMap con plugin built
oc create configmap architecture-chatbot-plugin \
  --from-file=dist/ \
  -n backstage
```

### Paso 2: Mount en Developer Hub Deployment
```yaml
# Patch RHDH deployment
spec:
  template:
    spec:
      volumes:
      - name: architecture-chatbot-plugin
        configMap:
          name: architecture-chatbot-plugin
      containers:
      - name: rhdh
        volumeMounts:
        - name: architecture-chatbot-plugin
          mountPath: /opt/app-root/src/dynamic-plugins/architecture-chatbot
```

---

## 🎯 **Opción 3: Git Integration**

### Configurar en app-config.yaml:
```yaml
backend:
  reading:
    allow:
      - host: github.com
        paths: 
          - '/your-org/demojam-2026/tree/main/backstage-plugins/*'

dynamicPlugins:
  frontend:
    architecture-chatbot:
      package: 'file:./backstage-plugins/architecture-chatbot'
```

---

## ⚙️ **Configuración Completa de RHDH**

### app-config.yaml:
```yaml
app:
  title: Red Hat Developer Hub - DemoJam 2026
  
backend:
  baseUrl: https://backstage.apps.cluster-tzfv6.tzfv6.sandbox1862.opentlc.com

# Architecture Chatbot Integration
proxy:
  '/api/architecture-chatbot':
    target: https://chatbot-api.apps.cluster-tzfv6.tzfv6.sandbox1862.opentlc.com
    changeOrigin: true

# Plugin integration
dynamicPlugins:
  frontend:
    architecture-chatbot:
      mountPoints:
        - mountPoint: nav.page
          importName: ArchitectureChatbotPage
          config:
            path: /architecture-chatbot
            title: Architecture Assistant
            icon: smart_toy
```

---

## 🚀 **Deploy Steps (Recomendado)**

1. **Deploy API Backend:**
```bash
oc apply -f architecture-chatbot-api/k8s/deployment.yaml
```

2. **Build Plugin:**
```bash
cd backstage-plugins/architecture-chatbot
npm run build
```

3. **Create Plugin Image:**
```bash
podman build -t architecture-chatbot-plugin:1.0.0 .
```

4. **Update RHDH Configuration:**
```bash
# Agregar plugin config a values de Developer Hub
oc patch configmap rhdh-config -p '{"data":{"app-config.yaml":"$(cat app-config.yaml)"}}'
```

5. **Restart RHDH:**
```bash
oc rollout restart deployment rhdh -n backstage
```

## ✅ **Resultado:**
- Plugin disponible en `/architecture-chatbot`
- Integrado en navegación de RHDH
- API backend funcionando
- Chatbot listo para consultas arquitectónicas