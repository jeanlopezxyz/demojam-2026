# ArgoCD Applications - App of Apps Structure

Esta carpeta contiene todas las aplicaciones ArgoCD organizadas por categorías para el patrón App of Apps.

## 📁 Estructura Organizada

```
gitops/apps/
├── infrastructure-app.yaml        # Meta-app que gestiona infraestructura
├── applications-app.yaml          # Meta-app que gestiona aplicaciones
├── infrastructure/                # Apps de infraestructura
│   ├── namespaces.yaml            # Wave 0: Namespaces
│   ├── rhbk.yaml                  # Wave 1: Red Hat build of Keycloak
│   ├── gitea.yaml                 # Wave 2: Gitea Git Server
│   ├── bookstack.yaml             # Wave 3: BookStack Documentation
│   └── rhocp-pipelines.yaml       # Wave 4: Red Hat OpenShift Pipelines
├── applications/                  # Apps de aplicaciones
│   ├── rhdh.yaml                  # Wave 10: Red Hat Developer Hub
│   └── ai-assistant.yaml          # Wave 20: AI Assistant Quarkus
└── README.md                      # This file
```

## 🌊 Sync Waves Configuradas

### Wave 0: Foundational
- **namespaces.yaml** - Crear todos los namespaces primero

### Wave 1-4: Infrastructure (Dependencies)
- **Wave 1**: RHBK (Red Hat build of Keycloak) - Identity first
- **Wave 2**: Gitea - Git repositories
- **Wave 3**: BookStack - Corporate documentation  
- **Wave 4**: RHOCP Pipelines - CI/CD platform

### Wave 10-20: Applications (Require Infrastructure)
- **Wave 10**: RHDH (Red Hat Developer Hub) - Requires RHBK + Gitea
- **Wave 20**: AI Assistant - Requires all infrastructure

## 🎯 App Categories

### 🏗️ Infrastructure Apps
**Purpose**: Base infrastructure components that applications depend on
- **Identity Management**: RHBK for SSO
- **Source Control**: Gitea for corporate repositories
- **Documentation**: BookStack for corporate guidelines
- **CI/CD**: RHOCP Pipelines for automation

### 💻 Application Apps  
**Purpose**: Business applications that provide value to users
- **Developer Portal**: RHDH with AI Assistant plugin
- **AI Service**: Quarkus-based AI Assistant with agents

## 🔄 Dependencies Flow

```
namespaces → rhbk → gitea → bookstack → rhocp-pipelines
                                              ↓
                                            rhdh → ai-assistant
```

## 📋 Management Commands

### Deploy All Apps
```bash
cd gitops/
oc apply -f app-of-apps.yaml
```

### Deploy by Category
```bash
# Infrastructure only
oc apply -f apps/infrastructure-app.yaml

# Applications only (after infrastructure)
oc apply -f apps/applications-app.yaml
```

### Monitor Deployment
```bash
# View all applications
oc get applications -n openshift-gitops

# View by category
oc get applications -l tier=infrastructure -n openshift-gitops
oc get applications -l tier=application -n openshift-gitops

# View sync status
oc get applications -o wide -n openshift-gitops
```

Esta estructura proporciona **organización clara** y **dependencies management** para el deployment completo del proyecto DemoJam.