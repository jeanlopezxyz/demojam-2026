#!/bin/bash

echo "=== Limpiando aplicaciones ArgoCD existentes ==="

# Eliminar TODAS las aplicaciones, incluso las que pueden tener referencias obsoletas
oc delete applications --all -n openshift-gitops
oc delete appprojects demojam -n openshift-gitops --ignore-not-found=true

echo "=== Esperando 15 segundos para limpieza completa ==="
sleep 15

echo "=== Aplicando proyecto ArgoCD ==="
oc apply -f gitops/projects/demojam-project.yaml

echo "=== Esperando 5 segundos ==="
sleep 5

echo "=== Aplicando App of Apps principal ==="
oc apply -f gitops/demojam-app-of-apps.yaml

echo "=== Verificando aplicaciones creadas ==="
sleep 10
oc get applications -n openshift-gitops

echo "=== Proceso completado ==="
echo ""
echo "Las aplicaciones deberían aparecer en ArgoCD UI en unos minutos"
echo "Estructura: gitops/projects/[proyecto]/application.yaml + values-production.yaml"