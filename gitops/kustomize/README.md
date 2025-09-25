# Kustomize Integration with GitOps

Esta carpeta contiene **customizaciones** de los Helm charts sin modificar los charts base del repositorio helm-charts.

## 📁 Estructura

```
gitops/kustomize/
├── base/
│   └── kustomization.yaml         # Helm charts base sin modificaciones
├── overlays/
│   ├── dev/
│   │   └── kustomization.yaml     # Customizaciones desarrollo
│   ├── staging/
│   │   └── kustomization.yaml     # Customizaciones staging
│   └── prod/
│       ├── kustomization.yaml     # Customizaciones producción
│       ├── values-prod.yaml       # Values específicos producción
│       ├── network-policies.yaml  # Políticas de red adicionales
│       └── resource-quotas.yaml   # Quotas de recursos
└── README.md                      # This file
```

## 🎯 Principios de Customización

### ✅ Helm Charts (Inmutables)
- **No modificar** charts en helm-charts repo
- **Usar como base** sin cambios
- **Versionado independiente**

### ✅ Kustomize (Customizaciones)
- **Patches** para modificaciones específicas
- **Overlays** por ambiente (dev/staging/prod)
- **Recursos adicionales** (network policies, quotas)

## 🔧 Uso en ArgoCD Apps

### Opción 1: Helm + Kustomize
```yaml
# gitops/apps/infrastructure/gitea.yaml
source:
  repoURL: https://github.com/jeanlopezxyz/demojam-2026
  path: gitops/kustomize/overlays/prod
  kustomize:
    images:
    - name: gitea/gitea
      newTag: "1.21.0"
```

### Opción 2: Solo Helm (Actual)
```yaml
# gitops/apps/infrastructure/gitea.yaml
source:
  repoURL: https://github.com/jeanlopezxyz/helm-charts
  path: charts/setup-platform-gitea
  helm:
    valueFiles:
    - values.yaml
```

## 🚀 Comandos de Testing

### Local Testing
```bash
# Test kustomize build
cd gitops/kustomize/overlays/prod/
kustomize build .

# Test con diferentes ambientes
kustomize build overlays/dev/
kustomize build overlays/staging/
kustomize build overlays/prod/
```

### ArgoCD Integration
```bash
# Preview con ArgoCD
argocd app diff gitea --local gitops/kustomize/overlays/prod/

# Deploy con kustomize
argocd app set gitea --path gitops/kustomize/overlays/prod
```

## 💡 Casos de Uso Kustomize

### Customizaciones Comunes
- **Environment variables** específicas por ambiente
- **Replicas** diferentes (dev=1, prod=3)
- **Resource limits** por ambiente
- **Network policies** adicionales
- **ConfigMaps** específicos
- **Secrets** por ambiente

### Ejemplo: Customizar AI Assistant para Prod
```yaml
# En overlays/prod/kustomization.yaml
patches:
- target:
    kind: Deployment
    name: ai-assistant
  patch: |
    - op: replace
      path: /spec/replicas
      value: 3
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OPENSHIFT_AI_MODEL
        value: "granite-13b-code"  # Modelo más grande para prod
```

**Kustomize integrado en GitOps** permite **customizaciones flexibles** sin modificar los Helm charts base.