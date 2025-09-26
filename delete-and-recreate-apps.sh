#!/bin/bash

# Script para eliminar y recrear aplicaciones ArgoCD en OpenShift
# Ejecuta este script después de hacer login en OpenShift

echo "=== Eliminando aplicaciones ArgoCD existentes ==="

# Eliminar aplicaciones existentes
oc delete application demojam-app-of-apps -n openshift-gitops --ignore-not-found=true
oc delete application infrastructure-app -n openshift-gitops --ignore-not-found=true
oc delete application applications-app -n openshift-gitops --ignore-not-found=true
oc delete application platform-bookstack -n openshift-gitops --ignore-not-found=true
oc delete application platform-gitea -n openshift-gitops --ignore-not-found=true
oc delete application rh-developer-hub -n openshift-gitops --ignore-not-found=true
oc delete application rh-keycloak -n openshift-gitops --ignore-not-found=true
oc delete application rhocp-pipelines -n openshift-gitops --ignore-not-found=true
oc delete application app-openshift-ai-assistant -n openshift-gitops --ignore-not-found=true

echo "=== Esperando 10 segundos para asegurar limpieza completa ==="
sleep 10

echo "=== Recreando aplicaciones ArgoCD ==="

# Aplicar el proyecto primero
echo "Creando proyecto demojam..."
oc apply -f gitops/projects/demojam-project.yaml

# Esperar un poco para que el proyecto se cree
sleep 5

# Crear la aplicación principal (App of Apps)
echo "Creando aplicación principal demojam-app-of-apps..."
oc apply -f gitops/demojam-app-of-apps.yaml

# Esperar para que se cree
sleep 5

# Crear las meta-aplicaciones
echo "Creando meta-aplicaciones..."
oc apply -f gitops/apps/infrastructure-app.yaml
oc apply -f gitops/apps/applications-app.yaml

# Esperar un poco
sleep 5

# Crear todas las aplicaciones individuales
echo "Creando aplicaciones de infraestructura..."
oc apply -f gitops/apps/infrastructure/platform-bookstack.yaml
oc apply -f gitops/apps/infrastructure/platform-gitea.yaml
oc apply -f gitops/apps/infrastructure/rh-developer-hub.yaml
oc apply -f gitops/apps/infrastructure/rh-keycloak.yaml
oc apply -f gitops/apps/infrastructure/rh-pipelines.yaml

echo "Creando aplicaciones..."
oc apply -f gitops/apps/applications/app-openshift-ai-assistant.yaml

echo "=== Verificando aplicaciones creadas ==="
oc get applications -n openshift-gitops

echo "=== Proceso completado ==="
echo ""
echo "Ahora puedes sincronizar las aplicaciones con:"
echo "  argocd app sync demojam-app-of-apps --server-side"
echo "  argocd app sync infrastructure-app --server-side"
echo "  argocd app sync applications-app --server-side"
echo ""
echo "O desde la UI de ArgoCD"