# Helm Charts Validation Commands

## Prerequisites

```bash
# Login to OpenShift
oc login --token=sha256~vhykl0-uJM62FhOyCC_DXKYGwfjbK4BEEZXrpgczMVQ --server=https://api.cluster-7n8gb.dynamic.redhatworkshops.io:6443

# Verify connection
oc whoami
oc get nodes

# Check Helm installation
helm version
```

## Individual Chart Validation

### 1. AI Assistant Chart

```bash
cd /home/jeanlopez/Documents/redhat/demojam/helm/charts

# Lint the chart
helm lint ai-assistant/

# Generate templates
helm template ai-assistant ai-assistant/ --output-dir /tmp/ai-assistant-test

# Validate against cluster (dry-run)
helm install ai-assistant-test ai-assistant/ --dry-run --debug

# Test with custom values
helm template ai-assistant ai-assistant/ \
  --set replicaCount=2 \
  --set resources.limits.memory=2Gi \
  --dry-run
```

### 2. RHDH (Backstage) Chart

```bash
# Lint and validate
helm lint rhdh/
helm template rhdh rhdh/ --output-dir /tmp/rhdh-test

# Test installation
helm install rhdh-test rhdh/ --dry-run --debug

# Test with production values
helm template rhdh rhdh/ \
  --set image.tag=latest \
  --set postgresql.enabled=true \
  --dry-run
```

### 3. Bookstack Chart

```bash
# Validate documentation platform
helm lint bookstack/
helm template bookstack bookstack/ --output-dir /tmp/bookstack-test
helm install bookstack-test bookstack/ --dry-run --debug
```

### 4. Gitea Chart

```bash
# Validate Git server
helm lint gitea/
helm template gitea gitea/ --output-dir /tmp/gitea-test
helm install gitea-test gitea/ --dry-run --debug
```

### 5. RHBK (Keycloak) Chart

```bash
# Validate identity management
helm lint rhbk/
helm template rhbk rhbk/ --output-dir /tmp/rhbk-test
helm install rhbk-test rhbk/ --dry-run --debug
```

## Comprehensive Testing

### Test All Charts at Once

```bash
# Run validation script
cd /home/jeanlopez/Documents/redhat/demojam/helm
chmod +x validate-charts.sh
./validate-charts.sh
```

### Test in Isolated Namespace

```bash
# Create test namespace
oc create namespace helm-test

# Test individual chart
helm install ai-assistant-test ai-assistant/ -n helm-test

# Check deployment
oc get pods -n helm-test
oc logs deployment/ai-assistant-test -n helm-test

# Test functionality
oc port-forward svc/ai-assistant-test 8080:8080 -n helm-test
curl http://localhost:8080/health

# Cleanup
helm uninstall ai-assistant-test -n helm-test
oc delete namespace helm-test
```

## Security Validation

### Check Security Context
```bash
# Generate manifests and check security
helm template ai-assistant ai-assistant/ | grep -A 10 "securityContext"

# Check for non-root user
helm template ai-assistant ai-assistant/ | grep "runAsNonRoot"

# Check for read-only filesystem
helm template ai-assistant ai-assistant/ | grep "readOnlyRootFilesystem"
```

### Check Network Policies
```bash
# Check if charts include network policies
for chart in */; do
  echo "Checking $chart for NetworkPolicy..."
  grep -r "NetworkPolicy" "$chart/templates/" || echo "No NetworkPolicy found"
done
```

## Dependency Validation

### Update Dependencies
```bash
# Update chart dependencies
for chart in */; do
  echo "Updating dependencies for $chart..."
  helm dependency update "$chart"
done

# Check dependency status
for chart in */; do
  echo "Dependencies for $chart:"
  helm dependency list "$chart"
done
```

### Test with External Dependencies
```bash
# Test AI Assistant with external PostgreSQL
helm template ai-assistant ai-assistant/ \
  --set postgresql.enabled=false \
  --set externalDatabase.host=postgres.company.com \
  --set externalDatabase.database=aiassistant \
  --dry-run

# Test RHDH with external dependencies
helm template rhdh rhdh/ \
  --set postgresql.enabled=false \
  --set redis.enabled=false \
  --set externalDatabase.host=rhdh-postgres.company.com \
  --dry-run
```

## Performance Testing

### Resource Scaling Test
```bash
# Test with different resource configurations
helm template ai-assistant ai-assistant/ \
  --set resources.requests.cpu=100m \
  --set resources.requests.memory=256Mi \
  --set resources.limits.cpu=1000m \
  --set resources.limits.memory=2Gi \
  --set replicaCount=5 \
  --dry-run

# Test autoscaling configuration
helm template ai-assistant ai-assistant/ \
  --set autoscaling.enabled=true \
  --set autoscaling.minReplicas=2 \
  --set autoscaling.maxReplicas=10 \
  --dry-run
```

## Integration Testing

### Test Inter-chart Dependencies
```bash
# Deploy charts in order to test integration
oc create namespace integration-test

# 1. Deploy infrastructure first
helm install postgres-test bitnami/postgresql -n integration-test
helm install redis-test bitnami/redis -n integration-test

# Wait for databases
oc wait --for=condition=Ready pod -l app.kubernetes.io/name=postgresql -n integration-test --timeout=300s

# 2. Deploy application charts
helm install rhdh-test rhdh/ \
  --set postgresql.enabled=false \
  --set externalDatabase.host=postgres-test-postgresql \
  -n integration-test

# 3. Test connectivity
oc exec deployment/rhdh-test -n integration-test -- curl -f http://localhost:7007/health

# Cleanup
helm uninstall rhdh-test postgres-test redis-test -n integration-test
oc delete namespace integration-test
```

## Results Interpretation

### Success Indicators
- ✅ `helm lint` passes without errors
- ✅ `helm template` generates valid YAML
- ✅ `oc apply --dry-run` succeeds
- ✅ All required resources are created
- ✅ Security contexts are properly configured
- ✅ Resource limits are set appropriately

### Common Issues and Fixes
- **Template errors**: Check values.yaml syntax
- **Resource conflicts**: Ensure unique names and labels
- **Permission errors**: Check RBAC and ServiceAccount configuration
- **Image pull errors**: Verify image repository and tags exist
- **Dependency issues**: Run `helm dependency update`

## Final Validation Checklist

Before deploying to production:

- [ ] All charts pass `helm lint`
- [ ] Templates generate without errors
- [ ] Dry-run validation succeeds
- [ ] Security contexts are configured
- [ ] Resource limits are appropriate
- [ ] Dependencies are resolved
- [ ] Integration tests pass
- [ ] Network policies are configured
- [ ] Monitoring is enabled
- [ ] Backup/restore procedures tested