#!/bin/bash

# Helm Charts Validation Script
# Validates all charts for syntax, dependencies, and Kubernetes compatibility

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Helm Charts Validation${NC}"
echo -e "${BLUE}=========================${NC}"

CHARTS_DIR="/home/jeanlopez/Documents/redhat/demojam/helm/charts"
OUTPUT_DIR="/tmp/helm-validation-output"
FAILED_CHARTS=()
PASSED_CHARTS=()

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ Helm CLI not found. Installing...${NC}"
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

HELM_VERSION=$(helm version --short)
echo -e "${GREEN}✅ Using: $HELM_VERSION${NC}"
echo ""

# Function to validate a single chart
validate_chart() {
    local chart_name=$1
    local chart_path="$CHARTS_DIR/$chart_name"
    
    echo -e "${YELLOW}📦 Validating chart: $chart_name${NC}"
    
    # Check if Chart.yaml exists
    if [[ ! -f "$chart_path/Chart.yaml" ]]; then
        echo -e "${RED}❌ Chart.yaml not found in $chart_name${NC}"
        FAILED_CHARTS+=("$chart_name")
        return 1
    fi
    
    # 1. Lint the chart
    echo "  🔍 Running helm lint..."
    if helm lint "$chart_path" > "$OUTPUT_DIR/$chart_name-lint.log" 2>&1; then
        echo -e "  ${GREEN}✅ Lint passed${NC}"
    else
        echo -e "  ${RED}❌ Lint failed${NC}"
        cat "$OUTPUT_DIR/$chart_name-lint.log"
        FAILED_CHARTS+=("$chart_name")
        return 1
    fi
    
    # 2. Check dependencies
    echo "  📋 Checking dependencies..."
    if helm dependency list "$chart_path" > "$OUTPUT_DIR/$chart_name-deps.log" 2>&1; then
        if grep -q "missing" "$OUTPUT_DIR/$chart_name-deps.log"; then
            echo -e "  ${YELLOW}⚠️ Dependencies need update${NC}"
            helm dependency update "$chart_path"
        else
            echo -e "  ${GREEN}✅ Dependencies OK${NC}"
        fi
    else
        echo -e "  ${GREEN}✅ No dependencies${NC}"
    fi
    
    # 3. Template generation (dry-run)
    echo "  🎨 Generating templates..."
    if helm template "$chart_name" "$chart_path" \
        --output-dir "$OUTPUT_DIR/$chart_name-templates" > "$OUTPUT_DIR/$chart_name-template.log" 2>&1; then
        echo -e "  ${GREEN}✅ Templates generated${NC}"
    else
        echo -e "  ${RED}❌ Template generation failed${NC}"
        cat "$OUTPUT_DIR/$chart_name-template.log"
        FAILED_CHARTS+=("$chart_name")
        return 1
    fi
    
    # 4. Kubernetes validation
    echo "  ⚙️ Validating Kubernetes manifests..."
    local k8s_valid=true
    
    # Check generated manifests
    for manifest in "$OUTPUT_DIR/$chart_name-templates"/*/*.yaml; do
        if [[ -f "$manifest" ]]; then
            if ! kubectl apply --dry-run=client -f "$manifest" > /dev/null 2>&1; then
                echo -e "  ${RED}❌ Invalid Kubernetes manifest: $(basename "$manifest")${NC}"
                k8s_valid=false
            fi
        fi
    done
    
    if $k8s_valid; then
        echo -e "  ${GREEN}✅ Kubernetes manifests valid${NC}"
    else
        FAILED_CHARTS+=("$chart_name")
        return 1
    fi
    
    # 5. Security validation
    echo "  🔒 Security validation..."
    local security_issues=0
    
    # Check for security best practices
    for manifest in "$OUTPUT_DIR/$chart_name-templates"/*/*.yaml; do
        if [[ -f "$manifest" ]] && grep -q "kind: Deployment" "$manifest"; then
            # Check for runAsNonRoot
            if ! grep -q "runAsNonRoot.*true" "$manifest"; then
                echo -e "  ${YELLOW}⚠️ Missing runAsNonRoot in $(basename "$manifest")${NC}"
                ((security_issues++))
            fi
            
            # Check for readOnlyRootFilesystem
            if ! grep -q "readOnlyRootFilesystem.*true" "$manifest"; then
                echo -e "  ${YELLOW}⚠️ Missing readOnlyRootFilesystem in $(basename "$manifest")${NC}"
                ((security_issues++))
            fi
        fi
    done
    
    if [[ $security_issues -eq 0 ]]; then
        echo -e "  ${GREEN}✅ Security validation passed${NC}"
    else
        echo -e "  ${YELLOW}⚠️ $security_issues security recommendations${NC}"
    fi
    
    PASSED_CHARTS+=("$chart_name")
    echo -e "  ${GREEN}✅ Chart $chart_name validation completed${NC}"
    echo ""
}

# Validate all charts
cd "$CHARTS_DIR"
for chart in */; do
    chart_name=$(basename "$chart")
    validate_chart "$chart_name"
done

# Summary
echo -e "${BLUE}📊 Validation Summary${NC}"
echo -e "${BLUE}====================${NC}"
echo -e "${GREEN}✅ Passed charts (${#PASSED_CHARTS[@]}):${NC}"
for chart in "${PASSED_CHARTS[@]}"; do
    echo "  - $chart"
done

if [[ ${#FAILED_CHARTS[@]} -gt 0 ]]; then
    echo -e "${RED}❌ Failed charts (${#FAILED_CHARTS[@]}):${NC}"
    for chart in "${FAILED_CHARTS[@]}"; do
        echo "  - $chart"
    done
    echo ""
    echo -e "${RED}🚨 Fix failed charts before deployment!${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All charts passed validation!${NC}"
    echo -e "${GREEN}✅ Ready for deployment${NC}"
fi

# Cleanup
echo ""
echo -e "${BLUE}Validation outputs saved to: $OUTPUT_DIR${NC}"
echo "Review logs if needed:"
echo "  - Lint logs: $OUTPUT_DIR/*-lint.log"
echo "  - Template logs: $OUTPUT_DIR/*-template.log"
echo "  - Generated manifests: $OUTPUT_DIR/*-templates/"