// Professional Helm Repository JavaScript

// Chart data configuration
const chartConfig = {
    'helper-operator': {
        icon: 'fas fa-cogs',
        category: 'helper',
        description: 'Meta-chart for installing operators with standardized configuration',
        tags: ['helper', 'operator', 'automation'],
        version: '1.0.28'
    },
    'helper-status-checker': {
        icon: 'fas fa-heartbeat',
        category: 'helper',
        description: 'Automated health checking and status validation for deployments',
        tags: ['helper', 'monitoring', 'health'],
        version: '4.0.13'
    },
    'helper-objectstore': {
        icon: 'fas fa-database',
        category: 'helper',
        description: 'Backup utilities and object storage automation',
        tags: ['helper', 'backup', 'storage'],
        version: '1.0.0'
    },
    'etcd-backup': {
        icon: 'fas fa-save',
        category: 'helper',
        description: 'Automated etcd cluster backup with scheduling',
        tags: ['helper', 'etcd', 'backup'],
        version: '1.0.0'
    },
    'setup-rh-operator-keycloak': {
        icon: 'fas fa-key',
        category: 'setup',
        description: 'Red Hat Build of Keycloak operator installation',
        tags: ['setup', 'red-hat', 'keycloak', 'operator'],
        version: '1.0.0'
    },
    'setup-rh-operator-developer-hub': {
        icon: 'fas fa-tools',
        category: 'setup',
        description: 'Red Hat Developer Hub (Backstage) with AI Assistant integration',
        tags: ['setup', 'red-hat', 'backstage', 'ai'],
        version: '1.0.0'
    },
    'setup-app-openshift-ai-asistant': {
        icon: 'fas fa-robot',
        category: 'setup',
        description: 'AI-powered assistant with OpenShift AI and RAG architecture',
        tags: ['setup', 'openshift', 'ai', 'assistant'],
        version: '2.0.0'
    },
    'setup-rh-operator-pipelines': {
        icon: 'fas fa-project-diagram',
        category: 'setup',
        description: 'Red Hat Pipelines (Tekton) for CI/CD automation',
        tags: ['setup', 'red-hat', 'pipelines', 'tekton', 'ci-cd'],
        version: '1.0.0'
    },
    'setup-rh-operator-console': {
        icon: 'fas fa-desktop',
        category: 'setup',
        description: 'Enhanced OpenShift Console operator with customizations',
        tags: ['setup', 'red-hat', 'console', 'ui', 'web-console'],
        version: '1.0.0'
    },
    'setup-platform-bookstack': {
        icon: 'fas fa-book',
        category: 'setup',
        description: 'Corporate documentation platform with backup integration',
        tags: ['setup', 'platform', 'documentation'],
        version: '1.0.0'
    },
    'setup-platform-gitea': {
        icon: 'fab fa-git-alt',
        category: 'setup',
        description: 'Git server with CI/CD and Keycloak integration',
        tags: ['setup', 'platform', 'git', 'ci-cd'],
        version: '1.1.0'
    }
};

// Create chart card HTML
function createChartCard(name, data) {
    console.log(`Creating card for: ${name}`);
    const installName = name.replace(/^(setup-|helper-)/, '');
    const repoUrl = `https://github.com/jeanlopezxyz/helm-charts/tree/main/charts/${name}`;
    const downloadUrl = `https://jeanlopezxyz.github.io/helm-charts/${name}-${data.version}.tgz`;
    
    return `
        <div class="chart-card category-${data.category}" style="background: white; border: 1px solid #ccc; padding: 20px; margin: 10px; border-radius: 8px;">
            <div class="chart-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div class="chart-info">
                    <h3 class="chart-title" style="margin: 0; color: #333; font-size: 1.2rem;">${name}</h3>
                    <span class="chart-version" style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">v${data.version}</span>
                </div>
                <div class="chart-actions" style="display: flex; gap: 8px;">
                    <a href="${repoUrl}" target="_blank" class="action-btn repo-btn" title="View Source" style="padding: 8px; background: #f0f0f0; border-radius: 4px; text-decoration: none; color: #333;">
                        GitHub
                    </a>
                    <a href="${downloadUrl}" class="action-btn download-btn" title="Download Chart" style="padding: 8px; background: #059669; color: white; border-radius: 4px; text-decoration: none;">
                        Download
                    </a>
                </div>
            </div>
            <div class="chart-description" style="color: #666; margin-bottom: 15px; line-height: 1.4;">${data.description}</div>
            <div class="chart-tags" style="margin-bottom: 15px;">
                ${data.tags.map(tag => `<span class="tag" style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-right: 4px; display: inline-block;">${tag}</span>`).join('')}
            </div>
            <div class="chart-install" style="background: #f8fafc; padding: 10px; border-radius: 4px;">
                <code style="font-family: monospace; color: #333;">helm install ${installName} jeanlopezxyz/${name}</code>
            </div>
        </div>
    `;
}

// Load charts from index.yaml and render them
async function loadCharts() {
    const container = document.getElementById('charts-container');
    
    if (!container) {
        console.error('Charts container not found');
        return;
    }

    console.log('Loading charts...');
    
    try {
        // Try to load from index.yaml
        console.log('Fetching index.yaml...');
        const response = await fetch('./index.yaml');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const yamlText = await response.text();
        console.log('YAML loaded, parsing...');
        
        // Parse YAML (simple parsing for entries)
        const charts = parseHelmIndex(yamlText);
        console.log('Parsed charts:', charts);
        
        if (Object.keys(charts).length > 0) {
            renderChartsFromIndex(charts);
        } else {
            console.log('No charts found in index.yaml, using fallback');
            renderChartsFromConfig();
        }
    } catch (error) {
        console.log('Error loading from index.yaml:', error);
        console.log('Loading charts from static config');
        // Fallback to static config
        renderChartsFromConfig();
    }
}

// Simple YAML parser for Helm index
function parseHelmIndex(yamlText) {
    const charts = {};
    const lines = yamlText.split('\n');
    let currentChart = null;
    let inEntries = false;
    
    for (const line of lines) {
        if (line.includes('entries:')) {
            inEntries = true;
            continue;
        }
        
        if (inEntries && line.match(/^\s*\S+:/)) {
            currentChart = line.trim().replace(':', '');
            charts[currentChart] = {
                name: currentChart,
                version: '1.0.0',
                description: chartConfig[currentChart]?.description || 'Helm chart'
            };
        }
        
        if (currentChart && line.includes('version:')) {
            const version = line.split(':')[1]?.trim().replace(/['"]/g, '');
            if (version) charts[currentChart].version = version;
        }
        
        if (currentChart && line.includes('description:')) {
            const desc = line.split(':')[1]?.trim().replace(/['"]/g, '');
            if (desc) charts[currentChart].description = desc;
        }
    }
    
    return charts;
}

// Render charts from index.yaml data
function renderChartsFromIndex(indexCharts) {
    const container = document.getElementById('charts-container');
    let html = '';
    
    Object.entries(indexCharts).forEach(([name, data]) => {
        const config = chartConfig[name] || {
            icon: 'fas fa-box',
            category: 'other',
            description: data.description,
            tags: ['helm', 'chart'],
            version: data.version
        };
        
        html += createChartCard(name, {
            ...config,
            version: data.version
        });
    });
    
    container.innerHTML = html || '<p>No charts available</p>';
}

// Fallback: render charts from static config
function renderChartsFromConfig() {
    const container = document.getElementById('charts-container');
    
    if (!container) {
        console.error('Charts container not found in renderChartsFromConfig');
        return;
    }
    
    console.log('Rendering from static config...');
    let html = '';
    
    Object.entries(chartConfig).forEach(([name, data]) => {
        console.log(`Adding chart: ${name}`);
        html += createChartCard(name, data);
    });
    
    if (html === '') {
        html = '<p>No charts available</p>';
        console.log('No charts found in static config');
    }
    
    container.innerHTML = html;
    console.log('Charts rendered from static config');
}

// Copy install command to clipboard
function copyInstallCommand(button, installName, chartName) {
    const commandText = `helm install ${installName} jeanlopezxyz/${chartName}`;
    
    navigator.clipboard.writeText(commandText).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        button.innerHTML = '<i class="fas fa-exclamation"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });
}

// Copy to clipboard functionality (general)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('button');
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => btn.innerHTML = original, 2000);
        }
    });
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Simple chart rendering - no async complexity
function renderChartsSimple() {
    const container = document.getElementById('charts-container');
    
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    console.log('Rendering charts...');
    
    const charts = [
        { name: 'helper-operator', version: '1.0.28', description: 'Meta-chart for installing operators', category: 'helper' },
        { name: 'helper-status-checker', version: '4.0.13', description: 'Health validation for deployments', category: 'helper' },
        { name: 'setup-rh-operator-pipelines', version: '1.0.1', description: 'Red Hat Pipelines (Tekton) for CI/CD', category: 'setup' },
        { name: 'setup-rh-operator-console', version: '1.0.3', description: 'Enhanced OpenShift Console operator', category: 'setup' },
        { name: 'setup-app-openshift-ai-asistant', version: '2.0.0', description: 'AI-powered assistant with OpenShift AI', category: 'setup' },
        { name: 'setup-rh-operator-developer-hub', version: '1.0.0', description: 'Red Hat Developer Hub (Backstage)', category: 'setup' },
        { name: 'setup-rh-operator-keycloak', version: '1.0.0', description: 'Red Hat Build of Keycloak', category: 'setup' },
        { name: 'setup-platform-bookstack', version: '1.0.0', description: 'Bookstack documentation platform', category: 'setup' },
        { name: 'setup-platform-gitea', version: '1.1.0', description: 'Gitea Git server with CI/CD', category: 'setup' }
    ];
    
    let html = '';
    charts.forEach(chart => {
        const installName = chart.name.replace(/^(setup-|helper-)/, '');
        html += `
            <div class="chart-card" style="background: white; border: 2px solid #e5e7eb; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 1.3rem;">${chart.name}</h3>
                <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.5;">${chart.description}</p>
                <div style="margin-bottom: 15px;">
                    <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">v${chart.version}</span>
                    <span style="background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; margin-left: 8px;">${chart.category}</span>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <a href="https://github.com/jeanlopezxyz/helm-charts/tree/main/charts/${chart.name}" target="_blank" style="padding: 8px 12px; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; text-decoration: none; color: #374151; font-size: 0.9rem;">GitHub</a>
                    <a href="https://jeanlopezxyz.github.io/helm-charts/${chart.name}-${chart.version}.tgz" style="padding: 8px 12px; background: #059669; color: white; border-radius: 6px; text-decoration: none; font-size: 0.9rem;">Download</a>
                </div>
                <div style="background: #f9fafb; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; color: #374151;">
                    helm install ${installName} jeanlopezxyz/${chart.name}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('Charts rendered successfully');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, rendering charts...');
    renderChartsSimple();
    
    // Scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollButton.className = 'scroll-top';
    scrollButton.onclick = scrollToTop;
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--secondary);
        color: white;
        border: none;
        border-radius: 50%;
        width: 55px;
        height: 55px;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        transition: all 0.3s ease;
        opacity: 0;
        pointer-events: none;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollButton.style.opacity = '1';
            scrollButton.style.pointerEvents = 'auto';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.pointerEvents = 'none';
        }
    });
    
    // Add loading animation to cards
    const cards = document.querySelectorAll('.chart-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
    });
});

// CSS for animations (injected)
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .chart-card {
        opacity: 0;
    }
`;
document.head.appendChild(animationStyles);