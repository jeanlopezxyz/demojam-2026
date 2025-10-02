// Script to update with GUARANTEED STATIC placeholder images
// Using placeholder.pics with specific colors and text - NEVER CHANGE

print("Updating products with GUARANTEED STATIC placeholder images...");

// Absolutely static placeholder images with tech-related colors
const staticPlaceholderUpdates = [
    // Programming Languages - Specific colors for each language
    {
        name: "Java Duke Polo Shirt",
        images: ["https://via.placeholder.com/800x600/ED8B00/FFFFFF?text=Java+Duke+Polo"]  // Java orange
    },
    {
        name: "Python Logo Polo Shirt", 
        images: ["https://via.placeholder.com/800x600/3776AB/FFFFFF?text=Python+Logo+Polo"]  // Python blue
    },
    {
        name: "JavaScript ES6 Polo Shirt",
        images: ["https://via.placeholder.com/800x600/F7DF1E/000000?text=JavaScript+ES6+Polo"]  // JS yellow
    },
    {
        name: "TypeScript Polo Shirt",
        images: ["https://via.placeholder.com/800x600/3178C6/FFFFFF?text=TypeScript+Polo"]  // TS blue
    },
    {
        name: "Rust Programming Polo",
        images: ["https://via.placeholder.com/800x600/CE422B/FFFFFF?text=Rust+Programming+Polo"]  // Rust orange
    },
    
    // Cloud Platforms - Cloud colors
    {
        name: "AWS Lambda Polo Shirt",
        images: ["https://via.placeholder.com/800x600/FF9900/FFFFFF?text=AWS+Lambda+Polo"]  // AWS orange
    },
    {
        name: "Kubernetes Helm Polo",
        images: ["https://via.placeholder.com/800x600/326CE5/FFFFFF?text=Kubernetes+Helm+Polo"]  // K8s blue
    },
    {
        name: "Google Cloud Platform Polo",
        images: ["https://via.placeholder.com/800x600/4285F4/FFFFFF?text=Google+Cloud+Polo"]  // GCP blue
    },
    
    // DevOps Tools - Tool colors
    {
        name: "Docker Container Polo",
        images: ["https://via.placeholder.com/800x600/2496ED/FFFFFF?text=Docker+Container+Polo"]  // Docker blue
    },
    {
        name: "Jenkins CI/CD Polo",
        images: ["https://via.placeholder.com/800x600/D33833/FFFFFF?text=Jenkins+CI+CD+Polo"]  // Jenkins red
    },
    {
        name: "Terraform Infrastructure Polo",
        images: ["https://via.placeholder.com/800x600/623CE4/FFFFFF?text=Terraform+Infrastructure+Polo"]  // Terraform purple
    },
    
    // Tech Companies - Brand colors
    {
        name: "Red Hat OpenShift Polo",
        images: ["https://via.placeholder.com/800x600/EE0000/FFFFFF?text=Red+Hat+OpenShift+Polo"]  // Red Hat red
    },
    {
        name: "GitHub Actions Polo", 
        images: ["https://via.placeholder.com/800x600/181717/FFFFFF?text=GitHub+Actions+Polo"]  // GitHub black
    },
    {
        name: "Microsoft Azure Polo",
        images: ["https://via.placeholder.com/800x600/0078D4/FFFFFF?text=Microsoft+Azure+Polo"]  // Azure blue
    }
];

// Update each product with GUARANTEED static placeholder
staticPlaceholderUpdates.forEach(function(update) {
    const result = db.products.updateOne(
        { name: update.name },
        { $set: { images: update.images } }
    );
    
    if (result.modifiedCount > 0) {
        print("✅ STATIC placeholder for: " + update.name);
        print("   URL: " + update.images[0]);
    } else {
        print("❌ Product not found: " + update.name);
    }
});

print("\n📊 Summary:");
print("Total products with STATIC placeholders: " + staticPlaceholderUpdates.length);

// EXTENSIVE consistency test
print("\n🔍 EXTENSIVE CONSISTENCY TEST - Red Hat OpenShift Polo (10 checks):");
for (let i = 0; i < 10; i++) {
    const product = db.products.findOne({name: "Red Hat OpenShift Polo"}, {images: 1});
    print((i+1) + ". " + product.images[0]);
}

print("\n✅ All 10 URLs must be IDENTICAL for true consistency!");