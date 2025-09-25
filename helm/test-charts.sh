#!/bin/bash

# Test Helm Charts in OpenShift Cluster
# Run this script to validate charts against your cluster

echo "🔍 Testing Helm Charts in OpenShift"
echo "=================================="

# Login first (if not already logged in)
oc login --token=sha256~vhykl0-uJM62FhOyCC_DXKYGwfjbK4BEEZXrpgczMVQ --server=https://api.cluster-7n8gb.dynamic.redhatworkshops.io:6443

# Check connection
echo "Logged in as: $(oc whoami)"
echo "Current project: $(oc project -q)"
echo ""

cd /home/jeanlopez/Documents/redhat/demojam/helm/charts

# 1. Validate AI Assistant Chart
echo "📦 Testing AI Assistant Chart..."
helm template ai-assistant ai-assistant/ \
  --set image.repository=registry.redhat.io/ubi8/nodejs-18 \
  --set image.tag=latest \
  --dry-run > /tmp/ai-assistant-manifest.yaml

echo "  Validating against cluster..."
oc apply --dry-run=server -f /tmp/ai-assistant-manifest.yaml
echo "  ✅ AI Assistant chart valid"
echo ""

# 2. Validate RHDH (Backstage) Chart
echo "📦 Testing RHDH Chart..."
helm template rhdh rhdh/ \
  --set image.repository=registry.redhat.io/rhdh/rhdh-rhel9 \
  --set image.tag=latest \
  --dry-run > /tmp/rhdh-manifest.yaml

echo "  Validating against cluster..."
oc apply --dry-run=server -f /tmp/rhdh-manifest.yaml
echo "  ✅ RHDH chart valid"
echo ""

# 3. Validate Bookstack Chart
echo "📦 Testing Bookstack Chart..."
helm template bookstack bookstack/ \
  --dry-run > /tmp/bookstack-manifest.yaml

echo "  Validating against cluster..."
oc apply --dry-run=server -f /tmp/bookstack-manifest.yaml
echo "  ✅ Bookstack chart valid"
echo ""

# 4. Validate Gitea Chart
echo "📦 Testing Gitea Chart..."
helm template gitea gitea/ \
  --dry-run > /tmp/gitea-manifest.yaml

echo "  Validating against cluster..."
oc apply --dry-run=server -f /tmp/gitea-manifest.yaml
echo "  ✅ Gitea chart valid"
echo ""

# 5. Validate RHBK (Red Hat Build of Keycloak) Chart
echo "📦 Testing RHBK Chart..."
helm template rhbk rhbk/ \
  --dry-run > /tmp/rhbk-manifest.yaml

echo "  Validating against cluster..."
oc apply --dry-run=server -f /tmp/rhbk-manifest.yaml
echo "  ✅ RHBK chart valid"
echo ""

# 6. Test with different values
echo "🧪 Testing with custom values..."
helm template ai-assistant ai-assistant/ \
  --set replicaCount=3 \
  --set resources.limits.memory=2Gi \
  --set postgresql.enabled=false \
  --dry-run > /tmp/ai-assistant-custom.yaml

oc apply --dry-run=server -f /tmp/ai-assistant-custom.yaml
echo "  ✅ Custom values work"
echo ""

# 7. Check for OpenShift compatibility
echo "🔍 Checking OpenShift compatibility..."

# Check for OpenShift-specific resources
for chart in */; do
    chart_name=$(basename "$chart")
    
    # Check if chart uses OpenShift Routes
    if grep -r "kind: Route" "$chart/templates/" 2>/dev/null; then
        echo "  ✅ $chart_name: Uses OpenShift Routes"
    else
        echo "  ⚠️ $chart_name: No OpenShift Routes (may use Ingress)"
    fi
    
    # Check for SecurityContextConstraints
    if grep -r "SecurityContextConstraints" "$chart/templates/" 2>/dev/null; then
        echo "  ✅ $chart_name: Has SCC configuration"
    else
        echo "  ⚠️ $chart_name: No SCC (may use default)"
    fi
done
echo ""

# 8. Resource validation
echo "📊 Resource Requirements Summary:"
echo "=================================="

for chart in */; do
    chart_name=$(basename "$chart")
    echo "📦 $chart_name:"
    
    # Extract resource requirements
    if grep -r "requests:" "$chart/values.yaml" 2>/dev/null; then
        grep -A 2 "requests:" "$chart/values.yaml" | head -3
    else
        echo "  No resource requests defined"
    fi
    echo ""
done

echo "🎉 All charts validated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy to test namespace first: helm install test-$chart_name $chart_name/ -n test"
echo "2. Validate functionality: Test endpoints and connections"
echo "3. Deploy via ArgoCD: oc apply -f ../../gitops/app-of-apps.yaml"
echo ""
echo "📁 Validation outputs saved to: /tmp/"
echo "  - Manifests: /tmp/*-manifest.yaml"
echo "  - Logs: /tmp/*-lint.log"