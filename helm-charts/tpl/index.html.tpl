<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Helm Charts Repository | Red Hat DemoJam 2026</title>
    <meta name="description" content="Production-ready Helm charts for enterprise Kubernetes and OpenShift deployments featuring AI Assistant, Developer Hub, and infrastructure automation">
    <meta name="keywords" content="helm, charts, kubernetes, openshift, red-hat, enterprise, ai, developer-hub, infrastructure, production">
    <meta name="author" content="Jean Paul Lopez, Red Hat">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Enterprise Helm Charts Repository | Red Hat DemoJam 2026">
    <meta property="og:description" content="Production-ready Helm charts for enterprise Kubernetes deployments with AI Assistant and Developer Hub">
    <meta property="og:url" content="https://jeanlopezxyz.github.io/helm-charts">
    <meta property="og:site_name" content="Red Hat DemoJam Helm Charts">
    <meta property="og:image" content="https://jeanlopezxyz.github.io/helm-charts/assets/social-preview.png">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Enterprise Helm Charts Repository">
    <meta name="twitter:description" content="Production-ready Helm charts for enterprise deployments">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚙️</text></svg>">
    <link rel="apple-touch-icon" href="assets/icon-192.png">
    
    <!-- External Resources -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700;800&family=Red+Hat+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <!-- Styles -->
    <link rel="stylesheet" href="assets/styles.css">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      "name": "Red Hat DemoJam Helm Charts",
      "description": "Enterprise Helm charts repository for Kubernetes and OpenShift",
      "url": "https://jeanlopezxyz.github.io/helm-charts",
      "codeRepository": "https://github.com/jeanlopezxyz/helm-charts",
      "programmingLanguage": "YAML",
      "author": {
        "@type": "Person",
        "name": "Jean Paul Lopez",
        "email": "jealopez@redhat.com",
        "affiliation": "Red Hat"
      },
      "license": "MIT"
    }
    </script>
</head>
<body>
    <!-- Navigation Header -->
    <header class="header" role="banner">
        <div class="header-content">
            <div class="brand">
                <div class="brand-logo">
                    <i class="fas fa-cubes" aria-hidden="true"></i>
                    <span class="brand-text">Enterprise Helm Charts</span>
                </div>
                <div class="brand-subtitle">Red Hat DemoJam 2026</div>
            </div>
            
            <nav class="header-nav" role="navigation">
                <a href="#quick-start" class="nav-link">Quick Start</a>
                <a href="#charts" class="nav-link">Charts</a>
                <a href="#documentation" class="nav-link">Documentation</a>
                <a href="https://github.com/jeanlopezxyz/helm-charts" class="btn btn-outline" target="_blank" rel="noopener">
                    <i class="fab fa-github" aria-hidden="true"></i> 
                    <span>View Source</span>
                </a>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" role="main">
        <div class="hero-background" aria-hidden="true"></div>
        <div class="hero-content">
            <h1 class="hero-title">
                Enterprise Helm Charts Repository
            </h1>
            <p class="hero-description">
                Production-ready Helm charts for enterprise Kubernetes and OpenShift deployments.
                Featuring AI Assistant, Developer Hub, and complete infrastructure automation with helper utilities.
            </p>
            
            <div class="hero-features">
                <div class="feature">
                    <i class="fas fa-shield-alt" aria-hidden="true"></i>
                    <span>Enterprise Security</span>
                </div>
                <div class="feature">
                    <i class="fas fa-cogs" aria-hidden="true"></i>
                    <span>Helper Integration</span>
                </div>
                <div class="feature">
                    <i class="fas fa-sync-alt" aria-hidden="true"></i>
                    <span>Automated CI/CD</span>
                </div>
                <div class="feature">
                    <i class="fas fa-cube" aria-hidden="true"></i>
                    <span>OpenShift Native</span>
                </div>
            </div>
            
            <div class="hero-stats" role="region" aria-label="Repository Statistics">
                <div class="stat-card">
                    <div class="stat-number">{{ .TotalCharts }}</div>
                    <div class="stat-label">Charts Available</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ .HelperCharts }}</div>
                    <div class="stat-label">Helper Utilities</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ .SetupCharts }}</div>
                    <div class="stat-label">Setup Components</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Production Ready</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <main class="container">
        <!-- Quick Start Section -->
        <section id="quick-start" class="quick-start" role="region" aria-labelledby="quick-start-title">
            <h2 id="quick-start-title">
                <i class="fas fa-rocket" aria-hidden="true"></i> 
                Quick Start Guide
            </h2>
            <p class="section-description">
                Add this enterprise repository to your Helm installation and start deploying production-ready charts:
            </p>
            
            <div class="command-grid">
                <div class="command-card">
                    <h3>Add Repository</h3>
                    <div class="command-box">
                        <button class="copy-btn" onclick="copyToClipboard(this)" aria-label="Copy command">
                            <i class="fas fa-copy" aria-hidden="true"></i> Copy
                        </button>
                        <code class="command-text">helm repo add demojam https://jeanlopezxyz.github.io/helm-charts</code>
                    </div>
                </div>
                
                <div class="command-card">
                    <h3>Deploy Complete Platform</h3>
                    <div class="command-box">
                        <button class="copy-btn" onclick="copyToClipboard(this)" aria-label="Copy command">
                            <i class="fas fa-copy" aria-hidden="true"></i> Copy
                        </button>
                        <code class="command-text">helm install demojam-platform demojam/demojam-platform</code>
                    </div>
                </div>
                
                <div class="command-card">
                    <h3>Search Available Charts</h3>
                    <div class="command-box">
                        <button class="copy-btn" onclick="copyToClipboard(this)" aria-label="Copy command">
                            <i class="fas fa-copy" aria-hidden="true"></i> Copy
                        </button>
                        <code class="command-text">helm search repo demojam</code>
                    </div>
                </div>
            </div>
        </section>

        <!-- Search Section -->
        <section class="search-section" role="search" aria-labelledby="search-title">
            <h2 id="search-title" class="sr-only">Search Charts</h2>
            <div class="search-container">
                <input type="text" 
                       id="search" 
                       class="search-box" 
                       placeholder="Search charts by name, category, or functionality..."
                       aria-label="Search charts">
                <div class="search-results">
                    <span class="chart-count">
                        Showing <span id="visible-count">0</span> of <span id="total-count">{{ .TotalCharts }}</span> enterprise charts
                    </span>
                </div>
            </div>
        </section>

        <!-- Charts Section -->
        <section id="charts" class="charts-section" role="region" aria-labelledby="charts-title">
            <h2 id="charts-title" class="section-title">
                <i class="fas fa-cubes" aria-hidden="true"></i> 
                Available Charts
            </h2>
            
            <div class="category-filters" role="tablist">
                <button class="filter-btn active" data-category="all" role="tab" aria-selected="true">
                    All Charts
                </button>
                <button class="filter-btn" data-category="helper" role="tab">
                    <i class="fas fa-tools" aria-hidden="true"></i> Helpers
                </button>
                <button class="filter-btn" data-category="setup" role="tab">
                    <i class="fas fa-cogs" aria-hidden="true"></i> Setup
                </button>
                <button class="filter-btn" data-category="platform" role="tab">
                    <i class="fas fa-layer-group" aria-hidden="true"></i> Platform
                </button>
            </div>
            
            <div class="charts-grid" id="charts-grid" role="tabpanel">
                <!-- Charts populated by JavaScript -->
            </div>
        </section>

        <!-- Documentation Section -->
        <section id="documentation" class="documentation" role="region" aria-labelledby="docs-title">
            <h2 id="docs-title" class="section-title">
                <i class="fas fa-book" aria-hidden="true"></i> 
                Documentation & Support
            </h2>
            
            <div class="docs-grid">
                <div class="doc-card">
                    <i class="fas fa-file-code" aria-hidden="true"></i>
                    <h3>Repository Index</h3>
                    <p>Raw Helm repository index file</p>
                    <a href="index.yaml" class="doc-link">View index.yaml</a>
                </div>
                
                <div class="doc-card">
                    <i class="fab fa-github" aria-hidden="true"></i>
                    <h3>Source Code</h3>
                    <p>Chart source code and development</p>
                    <a href="https://github.com/jeanlopezxyz/helm-charts" class="doc-link" target="_blank" rel="noopener">
                        View on GitHub
                    </a>
                </div>
                
                <div class="doc-card">
                    <i class="fas fa-bug" aria-hidden="true"></i>
                    <h3>Issues & Support</h3>
                    <p>Report issues and get support</p>
                    <a href="https://github.com/jeanlopezxyz/helm-charts/issues" class="doc-link" target="_blank" rel="noopener">
                        Report Issue
                    </a>
                </div>
                
                <div class="doc-card">
                    <i class="fas fa-envelope" aria-hidden="true"></i>
                    <h3>Contact</h3>
                    <p>Direct contact for enterprise support</p>
                    <a href="mailto:jealopez@redhat.com" class="doc-link">
                        Contact Maintainer
                    </a>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer" role="contentinfo">
        <div class="footer-content">
            <div class="footer-brand">
                <h3>
                    <i class="fas fa-building" aria-hidden="true"></i> 
                    Red Hat DemoJam 2026
                </h3>
                <p>Enterprise Helm charts repository maintained by Jean Paul Lopez</p>
            </div>
            
            <div class="footer-links">
                <div class="link-group">
                    <h4>Repository</h4>
                    <a href="https://github.com/jeanlopezxyz/helm-charts" target="_blank" rel="noopener">
                        <i class="fab fa-github" aria-hidden="true"></i> Source Code
                    </a>
                    <a href="index.yaml">
                        <i class="fas fa-file-code" aria-hidden="true"></i> Helm Index
                    </a>
                </div>
                
                <div class="link-group">
                    <h4>Support</h4>
                    <a href="https://github.com/jeanlopezxyz/helm-charts/issues" target="_blank" rel="noopener">
                        <i class="fas fa-bug" aria-hidden="true"></i> Report Issues
                    </a>
                    <a href="mailto:jealopez@redhat.com">
                        <i class="fas fa-envelope" aria-hidden="true"></i> Contact
                    </a>
                </div>
                
                <div class="link-group">
                    <h4>Red Hat</h4>
                    <a href="https://redhat.com" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt" aria-hidden="true"></i> Red Hat
                    </a>
                    <a href="https://openshift.com" target="_blank" rel="noopener">
                        <i class="fas fa-cube" aria-hidden="true"></i> OpenShift
                    </a>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="footer-legal">
                <span>
                    <i class="fas fa-balance-scale" aria-hidden="true"></i> MIT License
                </span>
                <span>
                    <i class="fas fa-sync-alt" aria-hidden="true"></i> Auto-updated via GitHub Actions
                </span>
                <span>
                    <i class="fas fa-shield-alt" aria-hidden="true"></i> Enterprise Security Ready
                </span>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="assets/scripts.js"></script>
    
    <!-- Analytics placeholder -->
    <script>
        // Analytics code would go here for production
        console.log('DemoJam Helm Charts Repository loaded');
    </script>
</body>
</html>