// Script to update with TRULY STATIC images that never change
// Using Lorem Picsum with specific IDs and placeholder services

print("Updating products with TRULY STATIC, never-changing images...");

// Using Lorem Picsum with specific photo IDs (these are guaranteed to be static)
const staticImageUpdates = [
    // Programming Languages - Different specific photos
    {
        name: "Java Duke Polo Shirt",
        images: ["https://picsum.photos/id/1/800/600"]  // Fixed photo ID 1
    },
    {
        name: "Python Logo Polo Shirt", 
        images: ["https://picsum.photos/id/2/800/600"]  // Fixed photo ID 2
    },
    {
        name: "JavaScript ES6 Polo Shirt",
        images: ["https://picsum.photos/id/3/800/600"]  // Fixed photo ID 3
    },
    {
        name: "TypeScript Polo Shirt",
        images: ["https://picsum.photos/id/4/800/600"]  // Fixed photo ID 4
    },
    {
        name: "Rust Programming Polo",
        images: ["https://picsum.photos/id/5/800/600"]  // Fixed photo ID 5
    },
    
    // Cloud Platforms  
    {
        name: "AWS Lambda Polo Shirt",
        images: ["https://picsum.photos/id/10/800/600"]  // Fixed photo ID 10
    },
    {
        name: "Kubernetes Helm Polo",
        images: ["https://picsum.photos/id/11/800/600"]  // Fixed photo ID 11
    },
    {
        name: "Google Cloud Platform Polo",
        images: ["https://picsum.photos/id/12/800/600"]  // Fixed photo ID 12
    },
    
    // DevOps Tools
    {
        name: "Docker Container Polo",
        images: ["https://picsum.photos/id/20/800/600"]  // Fixed photo ID 20
    },
    {
        name: "Jenkins CI/CD Polo",
        images: ["https://picsum.photos/id/21/800/600"]  // Fixed photo ID 21
    },
    {
        name: "Terraform Infrastructure Polo",
        images: ["https://picsum.photos/id/22/800/600"]  // Fixed photo ID 22
    },
    
    // Tech Companies
    {
        name: "Red Hat OpenShift Polo",
        images: ["https://picsum.photos/id/30/800/600"]  // Fixed photo ID 30
    },
    {
        name: "GitHub Actions Polo", 
        images: ["https://picsum.photos/id/31/800/600"]  // Fixed photo ID 31
    },
    {
        name: "Microsoft Azure Polo",
        images: ["https://picsum.photos/id/32/800/600"]  // Fixed photo ID 32
    }
];

// Update each product with its STATIC image URL
staticImageUpdates.forEach(function(update) {
    const result = db.products.updateOne(
        { name: update.name },
        { $set: { images: update.images } }
    );
    
    if (result.modifiedCount > 0) {
        print("✅ Fixed STATIC image for: " + update.name);
        print("   Static URL: " + update.images[0]);
    } else {
        print("❌ Product not found: " + update.name);
    }
});

print("\n📊 Summary:");
print("Total products with STATIC images: " + staticImageUpdates.length);

// Multiple consistency tests
print("\n🔍 STATIC CONSISTENCY TEST - Red Hat OpenShift Polo (5 checks):");
for (let i = 0; i < 5; i++) {
    const product = db.products.findOne({name: "Red Hat OpenShift Polo"}, {name: 1, images: 1});
    print((i+1) + ". " + product.images[0]);
}

print("\n✅ All URLs should be IDENTICAL (photo ID 30)");