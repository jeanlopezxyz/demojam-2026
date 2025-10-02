// Script to update with embedded SVG data URIs (100% local, never fail)
// These work without internet connection and are completely static

print("Updating products with embedded SVG images (100% local, always work)...");

// Function to create SVG data URI
function createSvgDataUri(bgColor, textColor, text, width = 800, height = 600) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" dy=".3em" fill="${textColor}">${text}</text>
    </svg>`;
    
    return "data:image/svg+xml;base64," + btoa(svg);
}

// Local embedded SVG images with tech brand colors
const svgImageUpdates = [
    // Programming Languages
    {
        name: "Java Duke Polo Shirt",
        images: [createSvgDataUri("#ED8B00", "#FFFFFF", "Java Duke Polo")]
    },
    {
        name: "Python Logo Polo Shirt", 
        images: [createSvgDataUri("#3776AB", "#FFFFFF", "Python Logo Polo")]
    },
    {
        name: "JavaScript ES6 Polo Shirt",
        images: [createSvgDataUri("#F7DF1E", "#000000", "JavaScript ES6 Polo")]
    },
    {
        name: "TypeScript Polo Shirt",
        images: [createSvgDataUri("#3178C6", "#FFFFFF", "TypeScript Polo")]
    },
    {
        name: "Rust Programming Polo",
        images: [createSvgDataUri("#CE422B", "#FFFFFF", "Rust Programming Polo")]
    },
    
    // Cloud Platforms
    {
        name: "AWS Lambda Polo Shirt",
        images: [createSvgDataUri("#FF9900", "#FFFFFF", "AWS Lambda Polo")]
    },
    {
        name: "Kubernetes Helm Polo",
        images: [createSvgDataUri("#326CE5", "#FFFFFF", "Kubernetes Helm Polo")]
    },
    {
        name: "Google Cloud Platform Polo",
        images: [createSvgDataUri("#4285F4", "#FFFFFF", "Google Cloud Polo")]
    },
    
    // DevOps Tools
    {
        name: "Docker Container Polo",
        images: [createSvgDataUri("#2496ED", "#FFFFFF", "Docker Container Polo")]
    },
    {
        name: "Jenkins CI/CD Polo",
        images: [createSvgDataUri("#D33833", "#FFFFFF", "Jenkins CI/CD Polo")]
    },
    {
        name: "Terraform Infrastructure Polo",
        images: [createSvgDataUri("#623CE4", "#FFFFFF", "Terraform Infrastructure Polo")]
    },
    
    // Tech Companies
    {
        name: "Red Hat OpenShift Polo",
        images: [createSvgDataUri("#EE0000", "#FFFFFF", "Red Hat OpenShift Polo")]
    },
    {
        name: "GitHub Actions Polo", 
        images: [createSvgDataUri("#181717", "#FFFFFF", "GitHub Actions Polo")]
    },
    {
        name: "Microsoft Azure Polo",
        images: [createSvgDataUri("#0078D4", "#FFFFFF", "Microsoft Azure Polo")]
    }
];

// Update each product with embedded SVG
svgImageUpdates.forEach(function(update) {
    const result = db.products.updateOne(
        { name: update.name },
        { $set: { images: update.images } }
    );
    
    if (result.modifiedCount > 0) {
        print("✅ EMBEDDED SVG for: " + update.name);
        print("   Length: " + update.images[0].length + " chars (data URI)");
    } else {
        print("❌ Product not found: " + update.name);
    }
});

print("\n📊 Summary:");
print("Total products with EMBEDDED SVG images: " + svgImageUpdates.length);
print("✅ These images are 100% local and will NEVER fail!");

// Verification
print("\n🔍 Verification - Red Hat OpenShift Polo:");
const product = db.products.findOne({name: "Red Hat OpenShift Polo"}, {name: 1, images: 1});
print("Name: " + product.name);
print("Image type: " + (product.images[0].startsWith("data:image/svg") ? "✅ EMBEDDED SVG" : "❌ EXTERNAL URL"));
print("Image length: " + product.images[0].length + " characters");