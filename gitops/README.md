# GitOps - App of Apps Pattern (Helm Only)

Este directorio implementa **App of Apps pattern** usando **SOLO Helm charts** para todo el deployment. Sin manifiestos duplicados.

## 📁 Estructura App of Apps Limpia

```
gitops/
├── app-of-apps.yaml                    # ROOT APP - Deploy todo
├── apps/
│   ├── infrastructure-app.yaml        # App que maneja infraestructura
│   ├── applications-app.yaml          # App que maneja aplicaciones
│   ├── infrastructure/                # Apps de infraestructura (Helm)
│   │   ├── namespaces.yaml            # Wave 0: Namespaces
│   │   ├── keycloak.yaml              # Wave 1: Identity (Helm)
│   │   ├── gitea.yaml                 # Wave 2: Git Server (Helm)
│   │   ├── bookstack.yaml             # Wave 3: Documentation (Helm)
│   │   └── openshift-pipelines.yaml   # Wave 4: CI/CD (Helm)
│   └── applications/                  # Apps de aplicaciones (Helm)
│       ├── backstage.yaml             # Wave 10: Developer Hub (Helm)
│       └── ai-assistant.yaml          # Wave 20: AI Service (Helm)
├── projects/
│   └── demojam-project.yaml           # ArgoCD project definition
└── README.md                          # This file
```

## 🎯 Todo via Helm Charts

### ✅ Sin Duplicación
- **NO manifiestos directos** en gitops/infrastructure/
- **SOLO Helm charts** en helm/charts/
- **ArgoCD apps** apuntan a Helm charts
- **Values files** para configuración por ambiente

### ✅ App of Apps + Helm
```
Root App → Infrastructure App → Helm Charts (keycloak, gitea, bookstack, pipelines)
         → Applications App  → Helm Charts (backstage, ai-assistant)
```

## 🚀 Deployment Único

### Un Solo Comando
```bash
# Deploy ROOT APP - maneja todo via Helm
oc apply -f gitops/app-of-apps.yaml

# ArgoCD desplegará automáticamente:
# 1. Infrastructure-app → Helm charts de infraestructura  
# 2. Applications-app → Helm charts de aplicaciones
```

### Flujo Automático
```
app-of-apps.yaml 
    ↓
infrastructure-app.yaml + applications-app.yaml
    ↓  
helm/charts/* con helm/values/*
    ↓
OpenShift deployment
```

## 🌊 Sync Waves en Helm

### Wave 0: Foundational
- **Namespaces** (manifiestos directos)

### Wave 1-4: Infrastructure (Helm Charts)
- **Wave 1**: keycloak (helm/charts/keycloak + values/keycloak-prod.yaml)
- **Wave 2**: gitea (helm/charts/gitea + values/gitea-prod.yaml)
- **Wave 3**: bookstack (helm/charts/bookstack + values/bookstack-prod.yaml)
- **Wave 4**: openshift-pipelines (helm/charts/openshift-pipelines + values)

### Wave 10-20: Applications (Helm Charts)  
- **Wave 10**: backstage (helm/charts/backstage + values/backstage-prod.yaml)
- **Wave 20**: ai-assistant (helm/charts/ai-assistant + values/ai-assistant-dev.yaml)

## 📋 Comandos Simplificados

### Deploy Todo
```bash
cd gitops/
oc apply -f projects/demojam-project.yaml
oc apply -f app-of-apps.yaml
```

### Verificar Deployment
```bash
# Ver todas las apps
oc get applications -n openshift-gitops

# Ver por tier
oc get applications -l tier=infrastructure -n openshift-gitops
oc get applications -l tier=application -n openshift-gitops

# Ver sync status
oc get applications -o wide -n openshift-gitops
```

### Desarrollo Local
```bash
# Solo para testing - usar docker-compose en:
# helm/charts/bookstack/docker-compose.yml
# helm/charts/gitea/docker-compose.yml
```

## ✅ Ventajas Helm Only

✅ **Una sola fuente** - Solo Helm charts, no duplicación
✅ **Configuración centralizada** - Values files por ambiente  
✅ **Templates reutilizables** - Helm templating power
✅ **Gestión enterprise** - Helm + ArgoCD best practices
✅ **Scaling fácil** - Values files para diferentes environments

**App of Apps + Helm** elimina duplicación y centraliza todo en Helm charts con GitOps automation.