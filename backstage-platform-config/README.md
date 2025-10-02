# Backstage Platform Configuration

This directory contains the Backstage platform configuration for the Red Hat Demo Jam organization.

## 🎯 Proper Separation of Concerns

✅ **MOVED**: This configuration is now properly separated from application source code and manages organization-level Backstage configuration.

## 📁 Directory Structure

```
backstage/
├── catalog/                    # Organization entities
│   ├── teams.yaml             # Team definitions
│   ├── domains.yaml           # Business domains
│   ├── users.yaml             # User accounts
│   └── locations.yaml         # Service discovery
├── config/                    # Instance configuration
│   └── app-config.yaml        # Backstage app config
├── templates/                 # Scaffolder templates
└── README.md                  # This file
```

## 🎯 What Belongs Here

### ✅ Organization-Level Configuration
- **Teams & Users**: Who owns what services
- **Business Domains**: High-level business organization
- **Service Discovery**: How Backstage finds services
- **Templates**: Code scaffolding templates
- **Policies**: RBAC and security policies

### ❌ What Does NOT Belong Here
- Service-specific metadata (`catalog-info.yaml`) → Stays with source code
- Service documentation (`mkdocs.yml`, `docs/`) → Stays with source code
- Deployment manifests → Goes in Helm charts
- Application code → Stays in service repos

## 🔄 Migration Strategy

When ready to create a separate repo:

1. Create `backstage-platform-config` repository
2. Move this entire `backstage/` directory content
3. Update service discovery URLs in `locations.yaml`
4. Configure Backstage instance to point to new repo
5. Remove this directory from source repo

## 🏗️ Repository Structure (Future)

```
backstage-platform-config/
├── catalog/
│   ├── teams.yaml
│   ├── domains.yaml
│   ├── users.yaml
│   └── locations.yaml
├── templates/
│   ├── microservice-template/
│   └── react-app-template/
├── policies/
│   └── rbac.yaml
├── config/
│   └── app-config.yaml
└── README.md
```

## 🔗 Service Discovery

The `locations.yaml` file tells Backstage where to find service catalogs:

- **Current**: Relative paths (temporary)
- **Future**: GitHub URLs to service repos

Example future location:
```yaml
targets:
  - https://github.com/redhat/app-ecommerce/blob/main/catalog-info.yaml
  - https://github.com/redhat/app-ecommerce/blob/main/services/*/catalog-info.yaml
```

## 🛠️ Usage

For development:
1. Point Backstage to this directory
2. Import `catalog/locations.yaml`
3. All services and teams will be discovered

For production:
1. Create separate `backstage-platform-config` repo
2. Move configuration there
3. Update discovery URLs
4. Deploy via Helm charts