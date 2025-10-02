// Script to update product images with fixed, relevant polo shirt images
// These are specifically curated polo shirt images that relate to each technology

print("Updating product images with fixed, tech-related polo shirt images...");

// Fixed polo shirt images (relevant to each technology)
const imageUpdates = [
    // Programming Languages
    {
        name: "Java Duke Polo Shirt",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Python Logo Polo Shirt", 
        images: ["https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "JavaScript ES6 Polo Shirt",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "TypeScript Polo Shirt",
        images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Rust Programming Polo",
        images: ["https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    
    // Cloud Platforms  
    {
        name: "AWS Lambda Polo Shirt",
        images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Kubernetes Helm Polo",
        images: ["https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Google Cloud Platform Polo",
        images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    
    // DevOps Tools
    {
        name: "Docker Container Polo",
        images: ["https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Jenkins CI/CD Polo",
        images: ["https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Terraform Infrastructure Polo",
        images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    
    // Tech Companies
    {
        name: "Red Hat OpenShift Polo",
        images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "GitHub Actions Polo", 
        images: ["https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    },
    {
        name: "Microsoft Azure Polo",
        images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"]
    }
];

// Update each product with its fixed image
imageUpdates.forEach(function(update) {
    const result = db.products.updateOne(
        { name: update.name },
        { $set: { images: update.images } }
    );
    
    if (result.modifiedCount > 0) {
        print("✅ Updated images for: " + update.name);
    } else {
        print("❌ Product not found: " + update.name);
    }
});

print("\n📊 Summary of image updates:");
print("Total products with updated images: " + imageUpdates.length);

// Verify a sample product
print("\n📷 Sample product with new image:");
db.products.findOne({name: "Red Hat OpenShift Polo"}, {name: 1, images: 1});