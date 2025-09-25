# Artifact Hub Configuration

This directory contains the configuration files for publishing this Helm repository to [Artifact Hub](https://artifacthub.io/).

## Repository Registration

To register this repository with Artifact Hub:

1. Go to https://artifacthub.io/
2. Sign in with your GitHub account
3. Navigate to "Control Panel" > "Repositories"
4. Click "Add Repository"
5. Select "Helm Charts"
6. Fill in the details:
   - **Name**: `jeanlopezxyz`
   - **Display Name**: `Helm Charts Repository`
   - **URL**: `https://jeanlopezxyz.github.io/helm-charts`
   - **Description**: `Enterprise Helm charts repository for Red Hat DemoJam 2026`

## Repository Structure

```
helm-charts/
├── artifacthub-repo.yml           # Repository metadata
└── charts/
    ├── setup-rh-pipelines/
    │   └── artifacthub-pkg.yml     # Package metadata
    ├── setup-rh-console/
    │   └── artifacthub-pkg.yml
    └── setup-app-openshift-ai-asistant/
        └── artifacthub-pkg.yml
```

## Metadata Files

- **`artifacthub-repo.yml`**: Repository-level configuration
- **`artifacthub-pkg.yml`**: Package-level metadata for each chart

## Automatic Updates

The GitHub Actions workflow automatically:
1. Packages all charts
2. Updates the Helm repository index
3. Copies Artifact Hub metadata files
4. Publishes to GitHub Pages

Artifact Hub will automatically sync changes from the published repository.

## Chart Features on Artifact Hub

Each chart will display:
- Installation instructions
- Configuration documentation  
- Links to source repository
- Maintainer information
- Keywords and categories
- Version history
- Dependencies
- Security scanning results

## Links

- **Repository**: https://jeanlopezxyz.github.io/helm-charts
- **Artifact Hub**: https://artifacthub.io/packages/search?repo=jeanlopezxyz
- **GitHub**: https://github.com/jeanlopezxyz/helm-charts