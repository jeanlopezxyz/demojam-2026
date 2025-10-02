// Script to update product images with FIXED, non-changing URLs
// Using specific Unsplash photo IDs that won't change

print("Updating products with FIXED, consistent polo shirt images...");

// Fixed, specific polo shirt images (these URLs never change)
const fixedImageUpdates = [
    // Programming Languages - Dark colored polos
    {
        name: "Java Duke Polo Shirt",
        images: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Python Logo Polo Shirt", 
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "JavaScript ES6 Polo Shirt",
        images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "TypeScript Polo Shirt",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Rust Programming Polo",
        images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=600&fit=crop&auto=format"]
    },
    
    // Cloud Platforms - Light blue/white polos  
    {
        name: "AWS Lambda Polo Shirt",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Kubernetes Helm Polo",
        images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Google Cloud Platform Polo",
        images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop&auto=format"]
    },
    
    // DevOps Tools - Gray/professional polos
    {
        name: "Docker Container Polo",
        images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Jenkins CI/CD Polo",
        images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Terraform Infrastructure Polo",
        images: ["https://images.unsplash.com/photo-1493245558585-80bd3e0b4915?w=800&h=600&fit=crop&auto=format"]
    },
    
    // Tech Companies - Branded colored polos
    {
        name: "Red Hat OpenShift Polo",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "GitHub Actions Polo", 
        images: ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop&auto=format"]
    },
    {
        name: "Microsoft Azure Polo",
        images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format"]
    }
];

// Update each product with its FIXED image URL
fixedImageUpdates.forEach(function(update) {
    const result = db.products.updateOne(
        { name: update.name },
        { $set: { images: update.images } }
    );
    
    if (result.modifiedCount > 0) {
        print("✅ Fixed image for: " + update.name);
        print("   URL: " + update.images[0]);
    } else {
        print("❌ Product not found: " + update.name);
    }
});

print("\n📊 Summary:");
print("Total products with FIXED images: " + fixedImageUpdates.length);

// Verify the same product multiple times to ensure consistency
print("\n🔍 Consistency test - Red Hat OpenShift Polo (3 checks):");
for (let i = 0; i < 3; i++) {
    const product = db.products.findOne({name: "Red Hat OpenShift Polo"}, {name: 1, images: 1});
    print((i+1) + ". " + product.name + " - " + product.images[0]);
}